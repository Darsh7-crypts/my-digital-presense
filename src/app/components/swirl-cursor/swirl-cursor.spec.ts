import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { SwirlCursorComponent } from './swirl-cursor';

describe('SwirlCursorComponent', () => {
  let component: SwirlCursorComponent;
  let fixture: ComponentFixture<SwirlCursorComponent>;
  let mockCanvas: HTMLCanvasElement;
  let mockGL: Partial<WebGLRenderingContext>;
  let mockContext: any;

  // Mock WebGL context and related objects
  beforeEach(() => {
    // Create mock WebGL context
    mockGL = {
      createShader: jasmine.createSpy('createShader').and.returnValue({} as WebGLShader),
      shaderSource: jasmine.createSpy('shaderSource'),
      compileShader: jasmine.createSpy('compileShader'),
      getShaderParameter: jasmine.createSpy('getShaderParameter').and.returnValue(true),
      getShaderInfoLog: jasmine.createSpy('getShaderInfoLog').and.returnValue(''),
      createProgram: jasmine.createSpy('createProgram').and.returnValue({} as WebGLProgram),
      attachShader: jasmine.createSpy('attachShader'),
      linkProgram: jasmine.createSpy('linkProgram'),
      getProgramParameter: jasmine.createSpy('getProgramParameter').and.returnValue(true),
      getProgramInfoLog: jasmine.createSpy('getProgramInfoLog').and.returnValue(''),
      getActiveUniform: jasmine.createSpy('getActiveUniform').and.returnValue({ name: 'test' }),
      getUniformLocation: jasmine.createSpy('getUniformLocation').and.returnValue({} as WebGLUniformLocation),
      useProgram: jasmine.createSpy('useProgram'),
      createTexture: jasmine.createSpy('createTexture').and.returnValue({} as WebGLTexture),
      createFramebuffer: jasmine.createSpy('createFramebuffer').and.returnValue({} as WebGLFramebuffer),
      createBuffer: jasmine.createSpy('createBuffer').and.returnValue({} as WebGLBuffer),
      bindTexture: jasmine.createSpy('bindTexture'),
      bindFramebuffer: jasmine.createSpy('bindFramebuffer'),
      bindBuffer: jasmine.createSpy('bindBuffer'),
      texParameteri: jasmine.createSpy('texParameteri'),
      texImage2D: jasmine.createSpy('texImage2D'),
      framebufferTexture2D: jasmine.createSpy('framebufferTexture2D'),
      checkFramebufferStatus: jasmine.createSpy('checkFramebufferStatus').and.returnValue(36053), // FRAMEBUFFER_COMPLETE
      bufferData: jasmine.createSpy('bufferData'),
      vertexAttribPointer: jasmine.createSpy('vertexAttribPointer'),
      enableVertexAttribArray: jasmine.createSpy('enableVertexAttribArray'),
      activeTexture: jasmine.createSpy('activeTexture'),
      viewport: jasmine.createSpy('viewport'),
      clear: jasmine.createSpy('clear'),
      clearColor: jasmine.createSpy('clearColor'),
      uniform2f: jasmine.createSpy('uniform2f'),
      uniform1i: jasmine.createSpy('uniform1i'),
      uniform1f: jasmine.createSpy('uniform1f'),
      uniform3f: jasmine.createSpy('uniform3f'),
      drawElements: jasmine.createSpy('drawElements'),
      getExtension: jasmine.createSpy('getExtension').and.returnValue({ HALF_FLOAT_OES: 36193 }),
      // WebGL constants
      VERTEX_SHADER: 35633,
      FRAGMENT_SHADER: 35632,
      COMPILE_STATUS: 35713,
      LINK_STATUS: 35714,
      ACTIVE_UNIFORMS: 35718,
      TEXTURE_2D: 3553,
      TEXTURE_MIN_FILTER: 10241,
      TEXTURE_MAG_FILTER: 10240,
      TEXTURE_WRAP_S: 10242,
      TEXTURE_WRAP_T: 10243,
      NEAREST: 9728,
      LINEAR: 9729,
      CLAMP_TO_EDGE: 33071,
      FRAMEBUFFER: 36160,
      COLOR_ATTACHMENT0: 36064,
      FRAMEBUFFER_COMPLETE: 36053,
      ARRAY_BUFFER: 34962,
      ELEMENT_ARRAY_BUFFER: 34963,
      STATIC_DRAW: 35044,
      FLOAT: 5126,
      TRIANGLES: 4,
      UNSIGNED_SHORT: 5123,
      COLOR_BUFFER_BIT: 16384,
      RGBA: 6408,
      TEXTURE0: 33984,
      drawingBufferWidth: 800,
      drawingBufferHeight: 600
    };

    // Create mock canvas
    mockCanvas = {
      getContext: jasmine.createSpy('getContext').and.returnValue(mockGL),
      width: 800,
      height: 600,
      style: {
        width: '100vw',
        height: '100vh'
      }
    } as any;

    // Mock global objects
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
    spyOn(window, 'requestAnimationFrame').and.callFake((callback: FrameRequestCallback) => {
      setTimeout(callback, 16);
      return 1;
    });
    spyOn(window, 'cancelAnimationFrame');
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SwirlCursorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SwirlCursorComponent);
    component = fixture.componentInstance;

    // Mock the canvas element reference
    component.swirlCanvas = new ElementRef(mockCanvas);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize WebGL context successfully', () => {
      spyOn(component as any, 'initPointers');
      spyOn(component as any, 'initShaders');
      spyOn(component as any, 'initFramebuffers');
      spyOn(component as any, 'initBlit');
      spyOn(component as any, '_update');

      component.ngAfterViewInit();

      expect(mockCanvas.getContext).toHaveBeenCalled();
      expect((component as any).initPointers).toHaveBeenCalled();
      expect((component as any).initShaders).toHaveBeenCalled();
      expect((component as any).initFramebuffers).toHaveBeenCalled();
      expect((component as any).initBlit).toHaveBeenCalled();
      expect((component as any)._update).toHaveBeenCalled();
    });

    it('should set canvas dimensions to window size', () => {
      spyOn(component as any, 'initPointers');
      spyOn(component as any, 'initShaders');
      spyOn(component as any, 'initFramebuffers');
      spyOn(component as any, 'initBlit');
      spyOn(component as any, '_update');

      component.ngAfterViewInit();

      expect(mockCanvas.width).toBe(window.innerWidth);
      expect(mockCanvas.height).toBe(window.innerHeight);
      expect(mockCanvas.style.width).toBe('100vw');
      expect(mockCanvas.style.height).toBe('100vh');
    });

    it('should add global event listeners', () => {
      spyOn(document, 'addEventListener');
      spyOn(window, 'addEventListener');
      spyOn(component as any, 'initPointers');
      spyOn(component as any, 'initShaders');
      spyOn(component as any, 'initFramebuffers');
      spyOn(component as any, 'initBlit');
      spyOn(component as any, '_update');

      component.ngAfterViewInit();

      expect(document.addEventListener).toHaveBeenCalledWith('mousemove', jasmine.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('touchmove', jasmine.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('mousedown', jasmine.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('touchstart', jasmine.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('mouseleave', jasmine.any(Function));
      expect(document.addEventListener).toHaveBeenCalledWith('touchend', jasmine.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('resize', jasmine.any(Function));
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners and cancel animation frame on destroy', () => {
      spyOn(document, 'removeEventListener');
      spyOn(window, 'removeEventListener');

      component.ngOnDestroy();

      expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', jasmine.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith('touchmove', jasmine.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith('mousedown', jasmine.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith('touchstart', jasmine.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith('mouseleave', jasmine.any(Function));
      expect(document.removeEventListener).toHaveBeenCalledWith('touchend', jasmine.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('resize', jasmine.any(Function));
      expect(window.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('WebGL Context', () => {
    it('should try WebGL2 first, then fallback to WebGL1', () => {
      const getContextSpy = jasmine.createSpy('getContext')
        .and.returnValues(null, mockGL); // First call returns null (WebGL2), second returns WebGL1

      const canvas = { getContext: getContextSpy } as any;
      
      const result = (component as any)._getWebGLContext(canvas);

      expect(getContextSpy).toHaveBeenCalledWith('webgl2', jasmine.any(Object));
      expect(getContextSpy).toHaveBeenCalledWith('webgl', jasmine.any(Object));
      expect(result.gl).toBe(mockGL);
    });

    it('should check render texture format support', () => {
      const result = (component as any)._supportRenderTextureFormat(mockGL, 6408, 6408, 5126);
      
      expect(mockGL.createTexture).toHaveBeenCalled();
      expect(mockGL.bindTexture).toHaveBeenCalled();
      expect(mockGL.texParameteri).toHaveBeenCalled();
      expect(mockGL.texImage2D).toHaveBeenCalled();
      expect(mockGL.createFramebuffer).toHaveBeenCalled();
      expect(mockGL.bindFramebuffer).toHaveBeenCalled();
      expect(mockGL.framebufferTexture2D).toHaveBeenCalled();
      expect(mockGL.checkFramebufferStatus).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Shader Management', () => {
    beforeEach(() => {
      (component as any)._gl = mockGL;
    });

    it('should compile shaders successfully', () => {
      const shader = (component as any).compileShader(mockGL.VERTEX_SHADER, 'shader source');
      
      expect(mockGL.createShader).toHaveBeenCalledWith(mockGL.VERTEX_SHADER);
      expect(mockGL.shaderSource).toHaveBeenCalled();
      expect(mockGL.compileShader).toHaveBeenCalled();
      expect(mockGL.getShaderParameter).toHaveBeenCalled();
      expect(shader).toBeDefined();
    });

    it('should throw error if shader compilation fails', () => {
      (mockGL.getShaderParameter as jasmine.Spy).and.returnValue(false);
      (mockGL.getShaderInfoLog as jasmine.Spy).and.returnValue('Compilation error');

      expect(() => {
        (component as any).compileShader(mockGL.VERTEX_SHADER, 'invalid shader');
      }).toThrow('Compilation error');
    });
  });

  describe('Framebuffer Management', () => {
    beforeEach(() => {
      (component as any)._gl = mockGL;
      (component as any)._ext = {
        formatRGBA: { internalFormat: 6408, format: 6408 },
        formatRG: { internalFormat: 6408, format: 6408 },
        formatR: { internalFormat: 6408, format: 6408 },
        halfFloatTexType: 5126,
        supportLinearFiltering: true
      };
    });

    it('should create FBO with proper texture setup', () => {
      const fbo = (component as any).createFBO(0, 512, 512, 6408, 6408, 5126, mockGL.LINEAR);
      
      expect(mockGL.activeTexture).toHaveBeenCalled();
      expect(mockGL.createTexture).toHaveBeenCalled();
      expect(mockGL.bindTexture).toHaveBeenCalled();
      expect(mockGL.texParameteri).toHaveBeenCalled();
      expect(mockGL.texImage2D).toHaveBeenCalled();
      expect(mockGL.createFramebuffer).toHaveBeenCalled();
      expect(mockGL.bindFramebuffer).toHaveBeenCalled();
      expect(mockGL.framebufferTexture2D).toHaveBeenCalled();
      expect(fbo).toBeDefined();
      expect(fbo.length).toBe(3); // [texture, framebuffer, texId]
    });

    it('should create double FBO with swap functionality', () => {
      const doubleFBO = (component as any).createDoubleFBO(0, 512, 512, 6408, 6408, 5126, mockGL.LINEAR);
      
      expect(doubleFBO).toBeDefined();
      expect(doubleFBO.read).toBeDefined();
      expect(doubleFBO.write).toBeDefined();
      expect(typeof doubleFBO.swap).toBe('function');
      
      const originalRead = doubleFBO.read;
      const originalWrite = doubleFBO.write;
      
      doubleFBO.swap();
      
      expect(doubleFBO.read).toBe(originalWrite);
      expect(doubleFBO.write).toBe(originalRead);
    });
  });

  describe('Pointer Management', () => {
    beforeEach(() => {
      (component as any)._pointers = [];
      (component as any).initPointers();
    });

    it('should initialize with one pointer', () => {
      expect((component as any)._pointers.length).toBe(1);
      expect((component as any)._pointers[0]).toEqual({
        id: -1,
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        down: false,
        moved: false,
        color: [30, 0, 300]
      });
    });
  });

  describe('Mouse Events', () => {
    beforeEach(() => {
      (component as any)._pointers = [{
        id: -1,
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        down: false,
        moved: false,
        color: [30, 0, 300]
      }];
    });

    it('should handle mouse move events', () => {
      const mouseEvent = new MouseEvent('mousemove', { clientX: 100, clientY: 150 });
      
      (component as any).onMouseMove(mouseEvent);
      
      const pointer = (component as any)._pointers[0];
      expect(pointer.moved).toBe(true);
      expect(pointer.down).toBe(false);
      expect(pointer.x).toBe(100);
      expect(pointer.y).toBe(150);
      expect(pointer.dx).toBe(1000); // (100 - 0) * 10
      expect(pointer.dy).toBe(1500); // (150 - 0) * 10
      expect(pointer.color).toBeDefined();
    });

    it('should handle mouse down events', () => {
      (component as any).onMouseDown();
      
      const pointer = (component as any)._pointers[0];
      expect(pointer.down).toBe(true);
      expect(pointer.color).toBeDefined();
    });

    it('should handle mouse leave events', () => {
      (component as any)._pointers[0].down = true;
      
      (component as any).onMouseLeave();
      
      expect((component as any)._pointers[0].down).toBe(false);
    });
  });

  describe('Touch Events', () => {
    beforeEach(() => {
      (component as any)._pointers = [{
        id: -1,
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        down: false,
        moved: false,
        color: [30, 0, 300]
      }];
    });

    it('should handle touch start events', () => {
      const touchEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        targetTouches: [
          { identifier: 1, pageX: 100, pageY: 150 }
        ]
      } as any;
      
      (component as any).onTouchStart(touchEvent);
      
      expect(touchEvent.preventDefault).toHaveBeenCalled();
      const pointer = (component as any)._pointers[0];
      expect(pointer.id).toBe(1);
      expect(pointer.x).toBe(100);
      expect(pointer.y).toBe(150);
      expect(pointer.down).toBe(true);
    });

    it('should handle touch move events', () => {
      (component as any)._pointers[0].down = true;
      
      const touchEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        targetTouches: [
          { pageX: 200, pageY: 250 }
        ]
      } as any;
      
      (component as any).onTouchMove(touchEvent);
      
      expect(touchEvent.preventDefault).toHaveBeenCalled();
      const pointer = (component as any)._pointers[0];
      expect(pointer.moved).toBe(true);
      expect(pointer.x).toBe(200);
      expect(pointer.y).toBe(250);
    });

    it('should handle touch end events', () => {
      (component as any)._pointers[0].id = 1;
      (component as any)._pointers[0].down = true;
      
      const touchEvent = {
        changedTouches: [
          { identifier: 1 }
        ]
      } as any;
      
      (component as any).onTouchEnd(touchEvent);
      
      expect((component as any)._pointers[0].down).toBe(false);
    });
  });

  describe('Canvas Resizing', () => {
    beforeEach(() => {
      (component as any)._gl = mockGL;
      spyOn(component as any, 'initFramebuffers');
    });

    it('should resize canvas when window dimensions change', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
      
      (component as any).resizeCanvas();
      
      expect(mockCanvas.width).toBe(1024);
      expect(mockCanvas.height).toBe(768);
      expect(mockCanvas.style.width).toBe('100vw');
      expect(mockCanvas.style.height).toBe('100vh');
      expect((component as any).initFramebuffers).toHaveBeenCalled();
    });

    it('should not resize if dimensions are unchanged', () => {
      mockCanvas.width = window.innerWidth;
      mockCanvas.height = window.innerHeight;
      
      (component as any).resizeCanvas();
      
      expect((component as any).initFramebuffers).not.toHaveBeenCalled();
    });

    it('should handle resize events', () => {
      spyOn(component as any, 'resizeCanvas');
      
      (component as any).onResize();
      
      expect((component as any).resizeCanvas).toHaveBeenCalled();
    });
  });

  describe('Splat Effects', () => {
    beforeEach(() => {
      (component as any)._gl = mockGL;
      (component as any)._splatProgram = {
        bind: jasmine.createSpy('bind'),
        uniforms: {
          'uTarget': {},
          'aspectRatio': {},
          'point': {},
          'color': {},
          'radius': {}
        }
      };
      (component as any)._velocity = {
        read: [{}, {}, 0],
        write: [{}, {}, 1],
        swap: jasmine.createSpy('swap')
      };
      (component as any)._density = {
        read: [{}, {}, 2],
        write: [{}, {}, 3],
        swap: jasmine.createSpy('swap')
      };
      (component as any)._blit = jasmine.createSpy('_blit');
      (component as any)._config = { SPLAT_RADIUS: 0.004 };
    });

    it('should apply splat effects correctly', () => {
      (component as any).splat(100, 150, 10, -5, [1, 0.5, 0.2]);
      
      expect((component as any)._splatProgram.bind).toHaveBeenCalledTimes(1);
      expect(mockGL.uniform1i).toHaveBeenCalled();
      expect(mockGL.uniform1f).toHaveBeenCalled();
      expect(mockGL.uniform2f).toHaveBeenCalled();
      expect(mockGL.uniform3f).toHaveBeenCalled();
      expect((component as any)._blit).toHaveBeenCalledTimes(2);
      expect((component as any)._velocity.swap).toHaveBeenCalled();
      expect((component as any)._density.swap).toHaveBeenCalled();
    });

    it('should generate multiple splats', () => {
      spyOn(component as any, 'splat');
      spyOn(Math, 'random').and.returnValues(0.5, 0.3, 0.8, 0.2, 0.6, 0.4, 0.1, 0.9, 0.7);
      
      (component as any).multipleSplats(2);
      
      expect((component as any).splat).toHaveBeenCalledTimes(2);
      expect(Math.random).toHaveBeenCalledTimes(14); 
        });
  });

  describe('Configuration', () => {
    it('should have default fluid configuration', () => {
      const config = (component as any)._config;
      
      expect(config.TEXTURE_DOWNSAMPLE).toBe(1);
      expect(config.DENSITY_DISSIPATION).toBe(0.98);
      expect(config.VELOCITY_DISSIPATION).toBe(0.99);
      expect(config.PRESSURE_DISSIPATION).toBe(0.8);
      expect(config.PRESSURE_ITERATIONS).toBe(25);
      expect(config._curl).toBe(28);
      expect(config.SPLAT_RADIUS).toBe(0.004);
    });
  });

  describe('Error Handling', () => {

    it('should handle shader compilation errors', () => {
      (component as any)._gl = mockGL;
      (mockGL.getShaderParameter as jasmine.Spy).and.returnValue(false);
      (mockGL.getShaderInfoLog as jasmine.Spy).and.returnValue('Shader compilation failed');
      
      expect(() => {
        (component as any).compileShader(mockGL.VERTEX_SHADER, 'invalid shader');
      }).toThrow('Shader compilation failed');
    });
  });
});
