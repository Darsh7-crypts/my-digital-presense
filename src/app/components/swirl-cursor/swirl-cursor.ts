import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';

interface FluidConfig {
  TEXTURE_DOWNSAMPLE: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  PRESSURE_DISSIPATION: number;
  PRESSURE_ITERATIONS: number;
  CURL: number;
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
  private gl: WebGLRenderingContext | null = null;
  private animationFrameId: number = 0;
  private ext: WebGLExtensions | null = null;

  
  private config: FluidConfig = {
    TEXTURE_DOWNSAMPLE: 1,
    DENSITY_DISSIPATION: 0.98,
    VELOCITY_DISSIPATION: 0.99,
    PRESSURE_DISSIPATION: 0.8,
    PRESSURE_ITERATIONS: 25,
    CURL: 28,
    SPLAT_RADIUS: 0.004
  };

  private pointers: Pointer[] = [];
  private splatStack: number[] = [];
  
  // WebGL Programs
  private clearProgram: GLProgram | null = null;
  private displayProgram: GLProgram | null = null;
  private splatProgram: GLProgram | null = null;
  private advectionProgram: GLProgram | null = null;
  private divergenceProgram: GLProgram | null = null;
  private curlProgram: GLProgram | null = null;
  private vorticityProgram: GLProgram | null = null;
  private pressureProgram: GLProgram | null = null;
  private gradienSubtractProgram: GLProgram | null = null;
  
  // Framebuffers
  private textureWidth: number = 0;
  private textureHeight: number = 0;
  private density: DoubleFBO | null = null;
  private velocity: DoubleFBO | null = null;
  private divergence: FBO | null = null;
  private curl: FBO | null = null;
  private pressure: DoubleFBO | null = null;
  
  private lastTime: number = Date.now();
  private blit: ((destination: WebGLFramebuffer | null) => void) | null = null;

  ngAfterViewInit() {
    const canvas = this.swirlCanvas.nativeElement;
    // Set canvas to full viewport size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';

    const context = this.getWebGLContext(canvas);
    this.gl = context.gl;
    this.ext = context.ext;

    this.initPointers();
    this.initShaders();
    this.initFramebuffers();
    this.initBlit();

    // Listen to global mouse events instead of just canvas events
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('touchmove', this.onTouchMove);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('touchstart', this.onTouchStart);
    document.addEventListener('mouseleave', this.onMouseLeave);
    document.addEventListener('touchend', this.onTouchEnd);
    window.addEventListener('resize', this.onResize);

    this.update();
  }

  ngOnDestroy() {
    // Remove global event listeners
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('mouseleave', this.onMouseLeave);
    document.removeEventListener('touchend', this.onTouchEnd);
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.animationFrameId);
  }

  private getWebGLContext(canvas: HTMLCanvasElement) {
    const params = { alpha: false, depth: false, stencil: false, antialias: false };

    let gl = canvas.getContext('webgl2', params) as WebGLRenderingContext;
    const isWebGL2 = !!gl;
    if (!isWebGL2) {
      gl = (canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params)) as WebGLRenderingContext;
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
      formatRGBA = this.getSupportedFormat(gl, (gl as any).RGBA16F, gl.RGBA, halfFloatTexType);
      formatRG = this.getSupportedFormat(gl, (gl as any).RG16F, (gl as any).RG, halfFloatTexType);
      formatR = this.getSupportedFormat(gl, (gl as any).R16F, (gl as any).RED, halfFloatTexType);
    } else {
      formatRGBA = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
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

  private getSupportedFormat(gl: WebGLRenderingContext, internalFormat: number, format: number, type: number): any {
    if (!this.supportRenderTextureFormat(gl, internalFormat, format, type)) {
      switch (internalFormat) {
        case (gl as any).R16F:
          return this.getSupportedFormat(gl, (gl as any).RG16F, (gl as any).RG, type);
        case (gl as any).RG16F:
          return this.getSupportedFormat(gl, (gl as any).RGBA16F, gl.RGBA, type);
        default:
          return null;
      }
    }

    return {
      internalFormat,
      format
    };
  }

  private supportRenderTextureFormat(gl: WebGLRenderingContext, internalFormat: number, format: number, type: number): boolean {
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

  private initPointers() {
    this.pointers.push({
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

  private compileShader(type: number, source: string): WebGLShader {
    const shader = this.gl!.createShader(type)!;
    this.gl!.shaderSource(shader, source);
    this.gl!.compileShader(shader);

    if (!this.gl!.getShaderParameter(shader, this.gl!.COMPILE_STATUS)) {
      throw this.gl!.getShaderInfoLog(shader);
    }

    return shader;
  }

  private initShaders() {
    const gl = this.gl!;
    
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

    const curlShader = this.compileShader(gl.FRAGMENT_SHADER, `
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
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;

      void main () {
          float T = texture2D(uCurl, vT).x;
          float B = texture2D(uCurl, vB).x;
          float C = texture2D(uCurl, vUv).x;
          vec2 force = vec2(abs(T) - abs(B), 0.0);
          force *= 1.0 / length(force + 0.00001) * curl * C;
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

    this.clearProgram = new GLProgram(gl, baseVertexShader, clearShader);
    this.displayProgram = new GLProgram(gl, baseVertexShader, displayShader);
    this.splatProgram = new GLProgram(gl, baseVertexShader, splatShader);
    this.advectionProgram = new GLProgram(gl, baseVertexShader, this.ext!.supportLinearFiltering ? advectionShader : advectionManualFilteringShader);
    this.divergenceProgram = new GLProgram(gl, baseVertexShader, divergenceShader);
    this.curlProgram = new GLProgram(gl, baseVertexShader, curlShader);
    this.vorticityProgram = new GLProgram(gl, baseVertexShader, vorticityShader);
    this.pressureProgram = new GLProgram(gl, baseVertexShader, pressureShader);
    this.gradienSubtractProgram = new GLProgram(gl, baseVertexShader, gradientSubtractShader);
  }

  private initFramebuffers() {
    const gl = this.gl!;
    this.textureWidth = gl.drawingBufferWidth >> this.config.TEXTURE_DOWNSAMPLE;
    this.textureHeight = gl.drawingBufferHeight >> this.config.TEXTURE_DOWNSAMPLE;

    const texType = this.ext!.halfFloatTexType;
    const rgba = this.ext!.formatRGBA;
    const rg = this.ext!.formatRG;
    const r = this.ext!.formatR;

    this.density = this.createDoubleFBO(2, this.textureWidth, this.textureHeight, rgba.internalFormat, rgba.format, texType, this.ext!.supportLinearFiltering ? gl.LINEAR : gl.NEAREST);
    this.velocity = this.createDoubleFBO(0, this.textureWidth, this.textureHeight, rg.internalFormat, rg.format, texType, this.ext!.supportLinearFiltering ? gl.LINEAR : gl.NEAREST);
    this.divergence = this.createFBO(4, this.textureWidth, this.textureHeight, r.internalFormat, r.format, texType, gl.NEAREST);
    this.curl = this.createFBO(5, this.textureWidth, this.textureHeight, r.internalFormat, r.format, texType, gl.NEAREST);
    this.pressure = this.createDoubleFBO(6, this.textureWidth, this.textureHeight, r.internalFormat, r.format, texType, gl.NEAREST);
  }

  private createFBO(texId: number, w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
    const gl = this.gl!;
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

  private initBlit() {
    const gl = this.gl!;
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    this.blit = (destination: WebGLFramebuffer | null) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, destination);
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };
  }

  private update = () => {
    this.resizeCanvas();

    const dt = Math.min((Date.now() - this.lastTime) / 1000, 0.016);
    this.lastTime = Date.now();

    const gl = this.gl!;
    gl.viewport(0, 0, this.textureWidth, this.textureHeight);

    if (this.splatStack.length > 0) {
      this.multipleSplats(this.splatStack.pop()!);
    }

    this.advectionProgram!.bind();
    gl.uniform2f(this.advectionProgram!.uniforms['texelSize'] as WebGLUniformLocation, 1.0 / this.textureWidth, 1.0 / this.textureHeight);
    gl.uniform1i(this.advectionProgram!.uniforms['uVelocity'] as WebGLUniformLocation, this.velocity!.read[2]);
    gl.uniform1i(this.advectionProgram!.uniforms['uSource'] as WebGLUniformLocation, this.velocity!.read[2]);
    gl.uniform1f(this.advectionProgram!.uniforms['dt'] as WebGLUniformLocation, dt);
    gl.uniform1f(this.advectionProgram!.uniforms['dissipation'] as WebGLUniformLocation, this.config.VELOCITY_DISSIPATION);
    this.blit!(this.velocity!.write[1]);
    this.velocity!.swap();

    gl.uniform1i(this.advectionProgram!.uniforms['uVelocity'] as WebGLUniformLocation, this.velocity!.read[2]);
    gl.uniform1i(this.advectionProgram!.uniforms['uSource'] as WebGLUniformLocation, this.density!.read[2]);
    gl.uniform1f(this.advectionProgram!.uniforms['dissipation'] as WebGLUniformLocation, this.config.DENSITY_DISSIPATION);
    this.blit!(this.density!.write[1]);
    this.density!.swap();

    for (let i = 0; i < this.pointers.length; i++) {
      const pointer = this.pointers[i];
      if (pointer.moved) {
        this.splat(pointer.x, pointer.y, pointer.dx, pointer.dy, pointer.color);
        pointer.moved = false;
      }
    }

    this.curlProgram!.bind();
    gl.uniform2f(this.curlProgram!.uniforms['texelSize'] as WebGLUniformLocation, 1.0 / this.textureWidth, 1.0 / this.textureHeight);
    gl.uniform1i(this.curlProgram!.uniforms['uVelocity'] as WebGLUniformLocation, this.velocity!.read[2]);
    this.blit!(this.curl![1]);

    this.vorticityProgram!.bind();
    gl.uniform2f(this.vorticityProgram!.uniforms['texelSize'] as WebGLUniformLocation, 1.0 / this.textureWidth, 1.0 / this.textureHeight);
    gl.uniform1i(this.vorticityProgram!.uniforms['uVelocity'] as WebGLUniformLocation, this.velocity!.read[2]);
    gl.uniform1i(this.vorticityProgram!.uniforms['uCurl'] as WebGLUniformLocation, this.curl![2]);
    gl.uniform1f(this.vorticityProgram!.uniforms['curl'] as WebGLUniformLocation, this.config.CURL);
    gl.uniform1f(this.vorticityProgram!.uniforms['dt'] as WebGLUniformLocation, dt);
    this.blit!(this.velocity!.write[1]);
    this.velocity!.swap();

    this.divergenceProgram!.bind();
    gl.uniform2f(this.divergenceProgram!.uniforms['texelSize'] as WebGLUniformLocation, 1.0 / this.textureWidth, 1.0 / this.textureHeight);
    gl.uniform1i(this.divergenceProgram!.uniforms['uVelocity'] as WebGLUniformLocation, this.velocity!.read[2]);
    this.blit!(this.divergence![1]);

    this.clearProgram!.bind();
    let pressureTexId = this.pressure!.read[2];
    gl.activeTexture(gl.TEXTURE0 + pressureTexId);
    gl.bindTexture(gl.TEXTURE_2D, this.pressure!.read[0]);
    gl.uniform1i(this.clearProgram!.uniforms['uTexture'] as WebGLUniformLocation, pressureTexId);
    gl.uniform1f(this.clearProgram!.uniforms['value'] as WebGLUniformLocation, this.config.PRESSURE_DISSIPATION);
    this.blit!(this.pressure!.write[1]);
    this.pressure!.swap();

    this.pressureProgram!.bind();
    gl.uniform2f(this.pressureProgram!.uniforms['texelSize'] as WebGLUniformLocation, 1.0 / this.textureWidth, 1.0 / this.textureHeight);
    gl.uniform1i(this.pressureProgram!.uniforms['uDivergence'] as WebGLUniformLocation, this.divergence![2]);
    pressureTexId = this.pressure!.read[2];
    gl.uniform1i(this.pressureProgram!.uniforms['uPressure'] as WebGLUniformLocation, pressureTexId);
    gl.activeTexture(gl.TEXTURE0 + pressureTexId);
    for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
      gl.bindTexture(gl.TEXTURE_2D, this.pressure!.read[0]);
      this.blit!(this.pressure!.write[1]);
      this.pressure!.swap();
    }

    this.gradienSubtractProgram!.bind();
    gl.uniform2f(this.gradienSubtractProgram!.uniforms['texelSize'] as WebGLUniformLocation, 1.0 / this.textureWidth, 1.0 / this.textureHeight);
    gl.uniform1i(this.gradienSubtractProgram!.uniforms['uPressure'] as WebGLUniformLocation, this.pressure!.read[2]);
    gl.uniform1i(this.gradienSubtractProgram!.uniforms['uVelocity'] as WebGLUniformLocation, this.velocity!.read[2]);
    this.blit!(this.velocity!.write[1]);
    this.velocity!.swap();

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    this.displayProgram!.bind();
    gl.uniform1i(this.displayProgram!.uniforms['uTexture'] as WebGLUniformLocation, this.density!.read[2]);
    this.blit!(null);

    this.animationFrameId = requestAnimationFrame(this.update);
  };

  private splat(x: number, y: number, dx: number, dy: number, color: number[]) {
    const gl = this.gl!;
    const canvas = this.swirlCanvas.nativeElement;

    this.splatProgram!.bind();
    gl.uniform1i(this.splatProgram!.uniforms['uTarget'] as WebGLUniformLocation, this.velocity!.read[2]);
    gl.uniform1f(this.splatProgram!.uniforms['aspectRatio'] as WebGLUniformLocation, canvas.width / canvas.height);
    gl.uniform2f(this.splatProgram!.uniforms['point'] as WebGLUniformLocation, x / canvas.width, 1.0 - y / canvas.height);
    gl.uniform3f(this.splatProgram!.uniforms['color'] as WebGLUniformLocation, dx, -dy, 1.0);
    gl.uniform1f(this.splatProgram!.uniforms['radius'] as WebGLUniformLocation, this.config.SPLAT_RADIUS);
    this.blit!(this.velocity!.write[1]);
    this.velocity!.swap();

    gl.uniform1i(this.splatProgram!.uniforms['uTarget'] as WebGLUniformLocation, this.density!.read[2]);
    gl.uniform3f(this.splatProgram!.uniforms['color'] as WebGLUniformLocation, color[0] * 0.3, color[1] * 0.3, color[2] * 0.3);
    this.blit!(this.density!.write[1]);
    this.density!.swap();
  }

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

  private onMouseMove = (e: MouseEvent) => {
    // Only trigger effect when mouse actually moves
    this.pointers[0].moved = true;
    this.pointers[0].down = false; // Remove continuous effect
    this.pointers[0].dx = (e.clientX - this.pointers[0].x) * 10.0;
    this.pointers[0].dy = (e.clientY - this.pointers[0].y) * 10.0;
    this.pointers[0].x = e.clientX;
    this.pointers[0].y = e.clientY;
    // Update color for beautiful effects only on movement
    this.pointers[0].color = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2];
  };

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touches = e.targetTouches;
    for (let i = 0; i < touches.length; i++) {
      const pointer = this.pointers[i];
      if (pointer) {
        pointer.moved = pointer.down;
        pointer.dx = (touches[i].pageX - pointer.x) * 10.0;
        pointer.dy = (touches[i].pageY - pointer.y) * 10.0;
        pointer.x = touches[i].pageX;
        pointer.y = touches[i].pageY;
      }
    }
  };

  private onMouseDown = () => {
    this.pointers[0].down = true;
    this.pointers[0].color = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2];
  };

  private onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const touches = e.targetTouches;
    for (let i = 0; i < touches.length; i++) {
      if (i >= this.pointers.length) {
        this.pointers.push({
          id: touches[i].identifier,
          x: touches[i].pageX,
          y: touches[i].pageY,
          dx: 0,
          dy: 0,
          down: true,
          moved: false,
          color: [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2]
        });
      } else {
        this.pointers[i].id = touches[i].identifier;
        this.pointers[i].down = true;
        this.pointers[i].x = touches[i].pageX;
        this.pointers[i].y = touches[i].pageY;
        this.pointers[i].color = [Math.random() + 0.2, Math.random() + 0.2, Math.random() + 0.2];
      }
    }
  };

  private onMouseLeave = () => {
    this.pointers[0].down = false;
  };

  private onTouchEnd = (e: TouchEvent) => {
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      for (let j = 0; j < this.pointers.length; j++) {
        if (touches[i].identifier === this.pointers[j].id) {
          this.pointers[j].down = false;
        }
      }
    }
  };

  private onResize = () => {
    this.resizeCanvas();
  };
}
