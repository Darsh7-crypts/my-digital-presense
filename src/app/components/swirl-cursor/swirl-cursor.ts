import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';

interface Fluid_config {
  TEXTURE_DOWNSAMPLE: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  PRESSURE_DISSIPATION: number;
  PRESSURE_ITERATIONS: number;
  _curl: number;
  SPLAT_RADIUS: number;
}

interface Pointer {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  down: boolean;
  moved: boolean;
  color: number[];
}

interface WebGLExtensions {
  formatRGBA: any;
  formatRG: any;
  formatR: any;
  halfFloatTexType: number;
  supportLinearFiltering: boolean;
}

interface FBO {
  0: WebGLTexture;
  1: WebGLFramebuffer;
  2: number;
}

interface DoubleFBO {
  read: FBO;
  write: FBO;
  swap(): void;
}

class GLProgram {
  uniforms: { [key: string]: WebGLUniformLocation | null } = {};
  program: WebGLProgram;

  constructor(private gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.program);
    }

    const uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const uniformName = gl.getActiveUniform(this.program, i)!.name;
      this.uniforms[uniformName] = gl.getUniformLocation(this.program, uniformName);
    }
  }

  bind() {
    this.gl.useProgram(this.program);
  }
}

@Component({
  selector: 'app-swirl-cursor',
  templateUrl: './swirl-cursor.html',
  styleUrls: ['./swirl-cursor.css'],
})
export class SwirlCursorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('swirlCanvas', { static: true }) swirlCanvas!: ElementRef<HTMLCanvasElement>;
  private _gl: WebGLRenderingContext | null = null;
  private _animationFrameId: number = 0;
  private _ext: WebGLExtensions | null = null;

  // Add mobile detection and auto-animation properties
  private _isMobile: boolean = false;
  private _autoAnimationTimer: number = 0;
  private _lastAutoSplat: number = 0;

  
  private _config: Fluid_config = {
    TEXTURE_DOWNSAMPLE: 1,
    DENSITY_DISSIPATION: 0.98,
    VELOCITY_DISSIPATION: 0.99,
    PRESSURE_DISSIPATION: 0.8,
    PRESSURE_ITERATIONS: 25,
    _curl: 28,
    SPLAT_RADIUS: 0.004
  };

  /**
   * Adjusts configuration based on device capabilities
   */
  private adjustConfigForDevice(): void {
    if (this._isMobile) {
      // Optimize for mobile performance
      this._config = {
        TEXTURE_DOWNSAMPLE: 2, // Reduce texture resolution for better performance
        DENSITY_DISSIPATION: 0.96, // Slightly faster dissipation
        VELOCITY_DISSIPATION: 0.98,
        PRESSURE_DISSIPATION: 0.7,
        PRESSURE_ITERATIONS: 15, // Reduce iterations for better performance
        _curl: 20, // Reduce curl for better performance
        SPLAT_RADIUS: 0.006 // Slightly larger splat radius for mobile
      };
    }
  }

  private _pointers: Pointer[] = [];
  private _splatStack: number[] = [];
  
  // WebGL Programs
  private _clearProgram: GLProgram | null = null;
  private _displayProgram: GLProgram | null = null;
  private _splatProgram: GLProgram | null = null;
  private _advectionProgram: GLProgram | null = null;
  private _divergenceProgram: GLProgram | null = null;
  private _curlProgram: GLProgram | null = null;
  private _vorticityProgram: GLProgram | null = null;
  private _pressureProgram: GLProgram | null = null;
  private _gradienSubtractProgram: GLProgram | null = null;
  
  // Framebuffers
  private _textureWidth: number = 0;
  private _textureHeight: number = 0;
  private _density: DoubleFBO | null = null;
  private _velocity: DoubleFBO | null = null;
  private _divergence: FBO | null = null;
  private _curl: FBO | null = null;
  private _pressure: DoubleFBO | null = null;
  
  private _lastTime: number = Date.now();
  private _blit: ((destination: WebGLFramebuffer | null) => void) | null = null;

  private touchMoveOptions = { passive: false };

  /**
   * Initializes the component, sets up WebGL context, and prepares shaders and framebuffers.
   * This method is called after the view has been initialized.
   * @returns {void}
   * @memberof SwirlCursorComponent
   * @throws {Error} If WebGL context cannot be created or shaders fail to compile.
   */
  public ngAfterViewInit() {
    // Detect mobile devices
    this._isMobile = this.detectMobile();
    
    const canvas = this.swirlCanvas.nativeElement;
    // Set canvas to full viewport size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';

    try {
      const context = this._getWebGLContext(canvas);
      this._gl = context.gl;
      this._ext = context.ext;

      // Adjust configuration based on device
      this.adjustConfigForDevice();

      this.initPointers();
      this.initShaders();
      this.initFramebuffers();
      this.initBlit();

      // Listen to global mouse events instead of just canvas events
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('touchmove', this.onTouchMove, this.touchMoveOptions);
      document.addEventListener('mousedown', this.onMouseDown);
      document.addEventListener('touchstart', this.onTouchStart);
      document.addEventListener('mouseleave', this.onMouseLeave);
      document.addEventListener('touchend', this.onTouchEnd);
      window.addEventListener('resize', this.onResize);
      
      // Additional mobile event listeners
      if (this._isMobile) {
        window.addEventListener('orientationchange', this.onOrientationChange);
        screen.orientation?.addEventListener('change', this.onOrientationChange);
      }

      // Start automatic animation for mobile or add periodic splats
      if (this._isMobile) {
        this.startAutoAnimation();
      }

      this._update();
    } catch (error) {
      console.warn('WebGL not supported or failed to initialize:', error);
      // Fallback: Create CSS animation instead of hiding canvas
      this.createFallbackAnimation();
    }
  }

    /**
     * Cleans up the component by removing event listeners and canceling the animation frame.
     * This method is called when the component is destroyed.
     * @returns {void}
     * @memberof SwirlCursorComponent
     */
  public ngOnDestroy() {
    // Remove global event listeners
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('touchmove', this.onTouchMove, this.touchMoveOptions as any);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('mouseleave', this.onMouseLeave);
    document.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('resize', this.onResize);
    
    // Remove mobile-specific listeners
    if (this._isMobile) {
      window.removeEventListener('orientationchange', this.onOrientationChange);
      screen.orientation?.removeEventListener('change', this.onOrientationChange);
    }
    
    // Clean up animations
    cancelAnimationFrame(this._animationFrameId);
    this.stopAutoAnimation();
  }

    /**
     * Initializes the WebGL context and sets up the canvas for rendering.
     * @param canvas The HTML canvas element to initialize.
     * @returns An object containing the WebGL context and extensions.
     */
  private _getWebGLContext(canvas: HTMLCanvasElement) {
    const params = { 
      alpha: false, 
      depth: false, 
      stencil: false, 
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: 'default' // Better for mobile battery
    };

    let gl = canvas.getContext('webgl2', params) as WebGLRenderingContext;
    const isWebGL2 = !!gl;
    if (!isWebGL2) {
      gl = (canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params)) as WebGLRenderingContext;
    }

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    let halfFloat: any;
    let supportLinearFiltering: boolean;
    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = !!gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const halfFloatTexType = isWebGL2 ? (gl as any).HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
    let formatRGBA: any;
    let formatRG: any;
    let formatR: any;

    if (isWebGL2) {
      formatRGBA = this._getSupportedFormat(gl, (gl as any).RGBA16F, gl.RGBA, halfFloatTexType);
      formatRG = this._getSupportedFormat(gl, (gl as any).RG16F, (gl as any).RG, halfFloatTexType);
      formatR = this._getSupportedFormat(gl, (gl as any).R16F, (gl as any).RED, halfFloatTexType);
    } else {
      formatRGBA = this._getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG = this._getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR = this._getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    return {
      gl,
      ext: {
        formatRGBA,
        formatRG,
        formatR,
        halfFloatTexType,
        supportLinearFiltering
      }
    };
  }

    /**
     * Creates a framebuffer with a texture attachment.
     * @param id The ID of the framebuffer.
     * @param width The width of the texture.
     * @param height The height of the texture.
     * @param internalFormat The internal format of the texture.
     * @param format The format of the texture.
     * @param type The type of the texture data.
     * @param filter The filtering mode for the texture.
     * @returns A framebuffer object with a texture attachment.
     */
  private _getSupportedFormat(gl: WebGLRenderingContext, internalFormat: number, format: number, type: number): any {
    if (!this._supportRenderTextureFormat(gl, internalFormat, format, type)) {
      switch (internalFormat) {
        case (gl as any).R16F:
          return this._getSupportedFormat(gl, (gl as any).RG16F, (gl as any).RG, type);
        case (gl as any).RG16F:
          return this._getSupportedFormat(gl, (gl as any).RGBA16F, gl.RGBA, type);
        default:
          return null;
      }
    }

    return {
      internalFormat,
      format
    };
  }

  /**
   * Checks if the WebGL context supports rendering to a texture with the specified parameters.
   * @param gl The WebGL rendering context.
   * @param internalFormat The internal format of the texture.
   * @param format The format of the texture.
   * @param type The type of the texture data.
   * @return {boolean} True if the format is supported, false otherwise.
   */
  private _supportRenderTextureFormat(gl: WebGLRenderingContext, internalFormat: number, format: number, type: number): boolean {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status === gl.FRAMEBUFFER_COMPLETE;
  }

    /**
     * Initializes the pointers used for tracking mouse and touch events.
     * This method sets up the initial state of the pointers array.
     */
  private initPointers() {
    this._pointers.push({
      id: -1,
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      down: false,
      moved: false,
      color: [30, 0, 300]
    });
  }

    /**
     * Initializes the shaders used for rendering the fluid simulation.
     * This method compiles the vertex and fragment shaders and creates WebGL programs.
     */
  private compileShader(type: number, source: string): WebGLShader {
    const shader = this._gl!.createShader(type)!;
    this._gl!.shaderSource(shader, source);
    this._gl!.compileShader(shader);

    if (!this._gl!.getShaderParameter(shader, this._gl!.COMPILE_STATUS)) {
      throw this._gl!.getShaderInfoLog(shader);
    }

    return shader;
  }

  /**
*
* Initializes the shaders used for rendering the fluid simulation.
* This method compiles the vertex and fragment shaders and creates WebGL programs.
* @param {WebGLRenderingContext} gl The WebGL rendering context.
* @return {void}
* @throws {Error} If shader compilation fails.
*/
  private initShaders() {
    const gl = this._gl!;
    
    const baseVertexShader = this.compileShader(gl.VERTEX_SHADER, `
      precision highp float;
      precision mediump sampler2D;

      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `);

    const clearShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;

      void main () {
          gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `);

    const displayShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      uniform sampler2D uTexture;

      void main () {
          gl_FragColor = texture2D(uTexture, vUv);
      }
    `);

    const splatShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;

      void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat, 1.0);
      }
    `);

    const advectionManualFilteringShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;

      vec4 bilerp (in sampler2D sam, in vec2 p) {
          vec4 st;
          st.xy = floor(p - 0.5) + 0.5;
          st.zw = st.xy + 1.0;
          vec4 uv = st * texelSize.xyxy;
          vec4 a = texture2D(sam, uv.xy);
          vec4 b = texture2D(sam, uv.zy);
          vec4 c = texture2D(sam, uv.xw);
          vec4 d = texture2D(sam, uv.zw);
          vec2 f = p - st.xy;
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main () {
          vec2 coord = gl_FragCoord.xy - dt * texture2D(uVelocity, vUv).xy;
          gl_FragColor = dissipation * bilerp(uSource, coord);
          gl_FragColor.a = 1.0;
      }
    `);

    const advectionShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;

      void main () {
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
          gl_FragColor = dissipation * texture2D(uSource, coord);
          gl_FragColor.a = 1.0;
      }
    `);

    const divergenceShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;

      vec2 sampleVelocity (in vec2 uv) {
          vec2 multiplier = vec2(1.0, 1.0);
          if (uv.x < 0.0) { uv.x = 0.0; multiplier.x = -1.0; }
          if (uv.x > 1.0) { uv.x = 1.0; multiplier.x = -1.0; }
          if (uv.y < 0.0) { uv.y = 0.0; multiplier.y = -1.0; }
          if (uv.y > 1.0) { uv.y = 1.0; multiplier.y = -1.0; }
          return multiplier * texture2D(uVelocity, uv).xy;
      }

      void main () {
          float L = sampleVelocity(vL).x;
          float R = sampleVelocity(vR).x;
          float T = sampleVelocity(vT).y;
          float B = sampleVelocity(vB).y;
          float div = 0.5 * (R - L + T - B);
          gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `);

    const _curlShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;

      void main () {
          float L = texture2D(uVelocity, vL).y;
          float R = texture2D(uVelocity, vR).y;
          float T = texture2D(uVelocity, vT).x;
          float B = texture2D(uVelocity, vB).x;
          float vorticity = R - L - T + B;
          gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
      }
    `);

    const vorticityShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D u_curl;
      uniform float _curl;
      uniform float dt;

      void main () {
          float T = texture2D(u_curl, vT).x;
          float B = texture2D(u_curl, vB).x;
          float C = texture2D(u_curl, vUv).x;
          vec2 force = vec2(abs(T) - abs(B), 0.0);
          force *= 1.0 / length(force + 0.00001) * _curl * C;
          vec2 vel = texture2D(uVelocity, vUv).xy;
          gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
      }
    `);

    const pressureShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;

      vec2 boundary (in vec2 uv) {
          uv = min(max(uv, 0.0), 1.0);
          return uv;
      }

      void main () {
          float L = texture2D(uPressure, boundary(vL)).x;
          float R = texture2D(uPressure, boundary(vR)).x;
          float T = texture2D(uPressure, boundary(vT)).x;
          float B = texture2D(uPressure, boundary(vB)).x;
          float C = texture2D(uPressure, vUv).x;
          float divergence = texture2D(uDivergence, vUv).x;
          float pressure = (L + R + B + T - divergence) * 0.25;
          gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `);

    const gradientSubtractShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision mediump sampler2D;

      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;

      vec2 boundary (in vec2 uv) {
          uv = min(max(uv, 0.0), 1.0);
          return uv;
      }

      void main () {
          float L = texture2D(uPressure, boundary(vL)).x;
          float R = texture2D(uPressure, boundary(vR)).x;
          float T = texture2D(uPressure, boundary(vT)).x;
          float B = texture2D(uPressure, boundary(vB)).x;
          vec2 velocity = texture2D(uVelocity, vUv).xy;
          velocity.xy -= vec2(R - L, T - B);
          gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `);

    this._clearProgram = new GLProgram(gl, baseVertexShader, clearShader);
    this._displayProgram = new GLProgram(gl, baseVertexShader, displayShader);
    this._splatProgram = new GLProgram(gl, baseVertexShader, splatShader);
    this._advectionProgram = new GLProgram(gl, baseVertexShader, this._ext!.supportLinearFiltering ? advectionShader : advectionManualFilteringShader);
    this._divergenceProgram = new GLProgram(gl, baseVertexShader, divergenceShader);
    this._curlProgram = new GLProgram(gl, baseVertexShader, _curlShader);
    this._vorticityProgram = new GLProgram(gl, baseVertexShader, vorticityShader);
    this._pressureProgram = new GLProgram(gl, baseVertexShader, pressureShader);
    this._gradienSubtractProgram = new GLProgram(gl, baseVertexShader, gradientSubtractShader);
  }

    /**
     * Initializes the framebuffers used for rendering the fluid simulation.
     * This method creates textures and framebuffers for density, velocity, divergence, curl, and pressure.
     */
  private initFramebuffers() {
    const gl = this._gl!;
    this._textureWidth = gl.drawingBufferWidth >> this._config.TEXTURE_DOWNSAMPLE;
    this._textureHeight = gl.drawingBufferHeight >> this._config.TEXTURE_DOWNSAMPLE;

    const texType = this._ext!.halfFloatTexType;
    const rgba = this._ext!.formatRGBA;
    const rg = this._ext!.formatRG;
    const r = this._ext!.formatR;

    this._density = this.createDoubleFBO(2, this._textureWidth, this._textureHeight, rgba.internalFormat, rgba.format, texType, this._ext!.supportLinearFiltering ? gl.LINEAR : gl.NEAREST);
    this._velocity = this.createDoubleFBO(0, this._textureWidth, this._textureHeight, rg.internalFormat, rg.format, texType, this._ext!.supportLinearFiltering ? gl.LINEAR : gl.NEAREST);
    this._divergence = this.createFBO(4, this._textureWidth, this._textureHeight, r.internalFormat, r.format, texType, gl.NEAREST);
    this._curl = this.createFBO(5, this._textureWidth, this._textureHeight, r.internalFormat, r.format, texType, gl.NEAREST);
    this._pressure = this.createDoubleFBO(6, this._textureWidth, this._textureHeight, r.internalFormat, r.format, texType, gl.NEAREST);
  }

    /**
     * Resizes the canvas and updates the texture dimensions.
     * This method is called when the window is resized.
     */
  private createFBO(texId: number, w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
    const gl = this._gl!;
    gl.activeTexture(gl.TEXTURE0 + texId);
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return [texture, fbo, texId] as any;
  }

  /**
   * Creates a double framebuffer object for ping-pong rendering.
   * This allows for efficient rendering by swapping between two framebuffers.
   * @param texId The base texture ID for the framebuffer.
   * @param w The width of the framebuffer.
   *    @param h The height of the framebuffer.
   * @param internalFormat The internal format of the texture.
   * @param format The format of the texture.
   * @param type The type of the texture data.
   * @param param The filtering parameter for the texture.
   * @returns A DoubleFBO object containing two framebuffers for reading and writing.
   */
  private createDoubleFBO(texId: number, w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO {
    let fbo1 = this.createFBO(texId, w, h, internalFormat, format, type, param);
    let fbo2 = this.createFBO(texId + 1, w, h, internalFormat, format, type, param);

    return {
      get read() {
        return fbo1;
      },
      get write() {
        return fbo2;
      },
      swap() {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      }
    };
  }

    /**
     * Resizes the canvas and updates the texture dimensions.
     * This method is called when the window is resized.
     */
  private initBlit() {
    const gl = this._gl!;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    this._blit = (destination: WebGLFramebuffer | null) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  }

    /**
     * Resizes the canvas and updates the texture dimensions.
     * This method is called when the window is resized.
     */
  private _update = () => {
    this.resizeCanvas();

    const dt = Math.min((Date.now() - this._lastTime) / 1000, 0.016);
    this._lastTime = Date.now();

    const gl = this._gl!;
    gl.viewport(0, 0, this._textureWidth, this._textureHeight);

    if (this._splatStack.length > 0) {
      this.multipleSplats(this._splatStack.pop()!);
    }

    this._advectionProgram!.bind();
    gl.uniform2f(this._advectionProgram!.uniforms['texelSize'] as WebGLUniformLocation, 1.0 / this._textureWidth, 1.0 / this._textureHeight);
    gl.uniform1i(this._advectionProgram!.uniforms['uVelocity'] as WebGLUniformLocation, this._velocity!.read[2]);
    gl.uniform1i(this._advectionProgram!.uniforms['uSource'] as WebGLUniformLocation, this._velocity!.read[2]);
    gl.uniform1f(this._advectionProgram!.uniforms['dt'] as WebGLUniformLocation, dt);
    gl.uniform1f(this._advectionProgram!.uniforms['dissipation'] as WebGLUniformLocation, this._config.VELOCITY_DISSIPATION);
    this._blit!(this._velocity!.write[1]);
    this._velocity!.swap();

    gl.uniform1i(this._advectionProgram!.uniforms['uVelocity'] as WebGLUniformLocation, this._velocity!.read[2]);
    gl.uniform1i(this._advectionProgram!.uniforms['uSource'] as WebGLUniformLocation, this._density!.read[2]);
    gl.uniform1f(this._advectionProgram!.uniforms['dissipation'] as WebGLUniformLocation, this._config.DENSITY_DISSIPATION);
    this._blit!(this._density!.write[1]);
    this._density!.swap();

    for (let i = 0; i < this._pointers.length; i++) {
      const pointer = this._pointers[i];
      if (pointer.moved) {
        this.splat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color);
        pointer.moved = false;
      }
    }

    this._curlProgram!.bind();
    gl.uniform2f(this._curlProgram!.uniforms['texelSize'] as WebGLUniformLocation, 1.0 / this._textureWidth, 1.0 / this._textureHeight);
    gl.uniform1i(this._curlProgram!.uniforms['uVelocity'] as WebGLUniformLocation, this._velocity!.read[2]);
    this._blit!(this._curl![1]);

    this._vorticityProgram!.bind();
    gl.uniform2f(this._vorticityProgram!.uniforms['texelSize'] as WebGLUniformLocation, 1.0 / this._textureWidth, 1.0 / this._textureHeight);
    gl.uniform1i(this._vorticityProgram!.uniforms['uVelocity'] as WebGLUniformLocation, this._velocity!.read[2]);
    gl.uniform1i(this._vorticityProgram!.uniforms['u_curl'] as WebGLUniformLocation, this._curl![2]);
    gl.uniform1f(this._vorticityProgram!.uniforms['_curl'] as WebGLUniformLocation, this._config._curl);
    gl.uniform1f(this._vorticityProgram!.uniforms['dt'] as WebGLUniformLocation, dt);
    this._blit!(this._velocity!.write[1]);
    this._velocity!.swap();

    this._divergenceProgram!.bind();
    gl.uniform2f(this._divergenceProgram!.uniforms['texelSize'] as WebGLUniformLocation, 1.0 / this._textureWidth, 1.0 / this._textureHeight);
    gl.uniform1i(this._divergenceProgram!.uniforms['uVelocity'] as WebGLUniformLocation, this._velocity!.read[2]);
    this._blit!(this._divergence![1]);

    this._clearProgram!.bind();
    let pressureTexId = this._pressure!.read[2];
    gl.activeTexture(gl.TEXTURE0 + pressureTexId);
    gl.bindTexture(gl.TEXTURE_2D, this._pressure!.read[0]);
    gl.uniform1i(this._clearProgram!.uniforms['uTexture'] as WebGLUniformLocation, pressureTexId);
    gl.uniform1f(this._clearProgram!.uniforms['value'] as WebGLUniformLocation, this._config.PRESSURE_DISSIPATION);
    this._blit!(this._pressure!.write[1]);
    this._pressure!.swap();

    this._pressureProgram!.bind();
    gl.uniform2f(this._pressureProgram!.uniforms['texelSize'] as WebGLUniformLocation, 1.0 / this._textureWidth, 1.0 / this._textureHeight);
    gl.uniform1i(this._pressureProgram!.uniforms['uDivergence'] as WebGLUniformLocation, this._divergence![2]);
    pressureTexId = this._pressure!.read[2];
    gl.uniform1i(this._pressureProgram!.uniforms['uPressure'] as WebGLUniformLocation, pressureTexId);
    gl.activeTexture(gl.TEXTURE0 + pressureTexId);
    for (let i = 0; i < this._config.PRESSURE_ITERATIONS; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this._pressure!.read[0]);
      this._blit!(this._pressure!.write[1]);
      this._pressure!.swap();
    }

    this._gradienSubtractProgram!.bind();
    gl.uniform2f(this._gradienSubtractProgram!.uniforms['texelSize'] as WebGLUniformLocation, 1.0 / this._textureWidth, 1.0 / this._textureHeight);
    gl.uniform1i(this._gradienSubtractProgram!.uniforms['uPressure'] as WebGLUniformLocation, this._pressure!.read[2]);
    gl.uniform1i(this._gradienSubtractProgram!.uniforms['uVelocity'] as WebGLUniformLocation, this._velocity!.read[2]);
    this._blit!(this._velocity!.write[1]);
    this._velocity!.swap();

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    this._displayProgram!.bind();
    gl.uniform1i(this._displayProgram!.uniforms['uTexture'] as WebGLUniformLocation, this._density!.read[2]);
    this._blit!(null);

    this._animationFrameId = requestAnimationFrame(this._update);
  };

    /**
     * Applies a splat effect at the specified coordinates with the given velocity and color.
     * This method updates both the velocity and density textures based on the splat parameters.
     * @param x The x-coordinate of the splat in canvas space.
     * @param y The y-coordinate of the splat in canvas space.
     * @param dx The x-component of the velocity applied by the splat.
     * @param dy The y-component of the velocity applied by the splat.
     * @param color The color to apply to the density texture.
     */
  private splat(x: number, y: number, dx: number, dy: number, color: number[]) {
    const gl = this._gl!;
    const canvas = this.swirlCanvas.nativeElement;

    this._splatProgram!.bind();
    gl.uniform1i(this._splatProgram!.uniforms['uTarget'] as WebGLUniformLocation, this._velocity!.read[2]);
    gl.uniform1f(this._splatProgram!.uniforms['aspectRatio'] as WebGLUniformLocation, canvas.width / canvas.height);
    gl.uniform2f(this._splatProgram!.uniforms['point'] as WebGLUniformLocation, x / canvas.width, 1.0 - y / canvas.height);
    gl.uniform3f(this._splatProgram!.uniforms['color'] as WebGLUniformLocation, dx, -dy, 1.0);
    gl.uniform1f(this._splatProgram!.uniforms['radius'] as WebGLUniformLocation, this._config.SPLAT_RADIUS);
    this._blit!(this._velocity!.write[1]);
    this._velocity!.swap();

    gl.uniform1i(this._splatProgram!.uniforms['uTarget'] as WebGLUniformLocation, this._density!.read[2]);
    gl.uniform3f(this._splatProgram!.uniforms['color'] as WebGLUniformLocation, color[0] * 0.3, color[1] * 0.3, color[2] * 0.3);
    this._blit!(this._density!.write[1]);
    this._density!.swap();
  }

  /**
   * 
   * @param amount The number of splats to create.
   * This method generates multiple splats with random positions, velocities, and colors.
   */
  private multipleSplats(amount: number) {
    const canvas = this.swirlCanvas.nativeElement;
    for (let i = 0; i < amount; i++) {
      const color = [Math.random() * 10, Math.random() * 10, Math.random() * 10];
      const x = canvas.width * Math.random();
      const y = canvas.height * Math.random();
      const dx = 1000 * (Math.random() - 0.5);
      const dy = 1000 * (Math.random() - 0.5);
      this.splat(x, y, dx, dy, color);
    }
  }

  /**
   * Resizes the canvas to match the window dimensions.
   * This method ensures that the canvas covers the entire viewport and updates the framebuffers accordingly.
   */
  private resizeCanvas() {
    const canvas = this.swirlCanvas.nativeElement;
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      this.initFramebuffers();
    }
  }

  /**
   * Detects if the current device is a mobile device
   * @returns {boolean} True if mobile device detected
   */
  private detectMobile(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase()) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
  }

  /**
   * Starts automatic animation for mobile devices to ensure the effect is visible
   */
  private startAutoAnimation(): void {
    // Add initial splats for mobile
    this._splatStack.push(3);
    
    // Set up periodic auto-splats for mobile devices
    this._autoAnimationTimer = window.setInterval(() => {
      if (Date.now() - this._lastAutoSplat > 2000) { // Every 2 seconds
        this._splatStack.push(1);
        this._lastAutoSplat = Date.now();
      }
    }, 2000);
  }

  /**
   * Stops automatic animation
   */
  private stopAutoAnimation(): void {
    if (this._autoAnimationTimer) {
      clearInterval(this._autoAnimationTimer);
      this._autoAnimationTimer = 0;
    }
  }

  /**
   * Creates a fallback CSS animation when WebGL is not available
   */
  private createFallbackAnimation(): void {
    const canvas = this.swirlCanvas.nativeElement;
    canvas.style.background = `
      radial-gradient(circle at 20% 50%, rgba(30, 0, 300, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 20, 147, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(0, 191, 255, 0.3) 0%, transparent 50%),
      linear-gradient(45deg, rgba(30, 0, 300, 0.1), rgba(255, 20, 147, 0.1))
    `;
    canvas.style.animation = 'fallbackSwirl 10s ease-in-out infinite alternate';
    
    // Add CSS keyframes for fallback animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fallbackSwirl {
        0% {
          background-position: 0% 50%, 100% 0%, 50% 100%, 0% 0%;
          filter: hue-rotate(0deg);
        }
        100% {
          background-position: 100% 50%, 0% 100%, 50% 0%, 100% 100%;
          filter: hue-rotate(90deg);
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 
   * @param e The mouse event to handle.
   * This method updates the pointer state based on mouse movement, allowing for interactive effects.
   */
  private onMouseMove = (e: MouseEvent) => {
    // Only trigger effect when mouse actually moves
    this._pointers[0].moved = true;
    this._pointers[0].down = false; // Remove continuous effect
    this._pointers[0].dx = (e.clientX - this._pointers[0].x) * 10.0;
    this._pointers[0].dy = (e.clientY - this._pointers[0].y) * 10.0;
    this._pointers[0].x = e.clientX;
    this._pointers[0].y = e.clientY;
    // Update color for beautiful effects only on movement
    this._pointers[0].color = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2];
  };

  /**
   * Handles touch move events to update pointer positions and states.
   * This method allows for touch interactions to affect the fluid simulation.
   * @param e The touch event to handle.
   */
  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touches = e.targetTouches;
    for (let i = 0; i < touches.length; i++) {
      const pointer = this._pointers[i];
      if (pointer) {
        pointer.moved = true; // Always set moved for touch
        pointer.dx = (touches[i].pageX - pointer.x) * 15.0; // Increased sensitivity for mobile
        pointer.dy = (touches[i].pageY - pointer.y) * 15.0;
        pointer.x = touches[i].pageX;
        pointer.y = touches[i].pageY;
        // Update color for mobile touch effects
        pointer.color = [Math.random() + 0.3, Math.random() + 0.3, Math.random() + 0.3];
      }
    }
    // Reset auto-splat timer when user interacts
    this._lastAutoSplat = Date.now();
  };

  /**
   * Handles mouse down events to initiate interaction with the fluid simulation.
   * This method sets the pointer state to indicate that the mouse button is pressed.
   */
  private onMouseDown = () => {
    this._pointers[0].down = true;
    this._pointers[0].color = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2];
  };

  /**
   * 
   * @param e The touch start event to handle.
   * This method initializes pointers for touch interactions, allowing for multiple touch points to affect the fluid
   */
  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const touches = e.targetTouches;
    for (let i = 0; i < touches.length; i++) {
      if (i >= this._pointers.length) {
        this._pointers.push({
          id: touches[i].identifier,
          x: touches[i].pageX,
          y: touches[i].pageY,
          dx: 0,
          dy: 0,
          down: true,
          moved: true, // Set moved to true for immediate effect on touch
          color: [Math.random() + 0.3, Math.random() + 0.3, Math.random() + 0.3]
        });
      } else {
        this._pointers[i].id = touches[i].identifier;
        this._pointers[i].down = true;
        this._pointers[i].moved = true; // Set moved to true for immediate effect
        this._pointers[i].x = touches[i].pageX;
        this._pointers[i].y = touches[i].pageY;
        this._pointers[i].color = [Math.random() + 0.3, Math.random() + 0.3, Math.random() + 0.3];
      }
    }
    // Reset auto-splat timer when user interacts
    this._lastAutoSplat = Date.now();
  };

    /**
     * Handles mouse leave events to reset the pointer state.
     * This method stops the interaction with the fluid simulation when the mouse leaves the canvas area.
     */
  private onMouseLeave = () => {
    this._pointers[0].down = false;
  };

    /**
     * Handles touch end events to update pointer states when touches are released.
     * This method allows for touch interactions to stop affecting the fluid simulation.
     * @param e The touch event to handle.
     */
  private onTouchEnd = (e: TouchEvent) => {
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      for (let j = 0; j < this._pointers.length; j++) {
        if (touches[i].identifier === this._pointers[j].id) {
          this._pointers[j].down = false;
        }
      }
    }
  };

    /**
     * Handles window resize events to adjust the canvas size and update the fluid simulation.
     * This method ensures that the canvas always fits the viewport and updates the framebuffers accordingly.
     */
  private onResize = () => {
    this.resizeCanvas();
  };

  /**
   * Handles orientation change events on mobile devices
   */
  private onOrientationChange = () => {
    // Add a small delay to allow the viewport to settle after orientation change
    setTimeout(() => {
      this.resizeCanvas();
      // Trigger some animation after orientation change
      if (this._isMobile) {
        this._splatStack.push(2);
      }
    }, 100);
  };
}
