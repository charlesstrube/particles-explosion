import { ContextGLManager } from "../CanvasManagers/ContextGLManager";
import { projectPoint } from "../helpers/projectPoint";
import { ShaderManager } from "../Shaders";
import type { CanvasManagerSchema, ParticleRendererSchema, ContextManagerSchema, ParticleSchema } from "../interfaces";

export class ParticleGLRenderer implements ParticleRendererSchema {
  private _contextManager: ContextManagerSchema<WebGLRenderingContext>;
  private _shaderManager: ShaderManager;
  private _positionBuffer: WebGLBuffer | null = null;
  private _colorBuffer: WebGLBuffer | null = null;
  private _sizeBuffer: WebGLBuffer | null = null;

  constructor(
    private _canvasManager: CanvasManagerSchema,
    private _perspective: number
  ) {
    this._contextManager = new ContextGLManager(this._canvasManager.canvas);
    this._shaderManager = new ShaderManager(this.context);
    this.initializeBuffers();
  }

  private initializeBuffers(): void {
    this._positionBuffer = this.context.createBuffer();
    this._colorBuffer = this.context.createBuffer();
    this._sizeBuffer = this.context.createBuffer();
  }

  set perspective(perspective: number) {
    this._perspective = perspective;
  }

  get perspective() {
    return this._perspective;
  }

  private get width () {
    return this._canvasManager.width
  }

  private get height () {
    return this._canvasManager.height
  }

  private get context() {
    return this._contextManager.context
  }

  projectParticle(particle: ParticleSchema) {
    return projectPoint(
      particle.position, 
      particle.size, 
      this._perspective, 
      this.width, 
      this.height
    );
  }

  drawParticle(particle: ParticleSchema) {
    const { projectedX, projectedY, size } = this.projectParticle(particle);
    
    // Utiliser le shader de cercle
    const circleShader = this._shaderManager.useShader('circle');
    
    // Définir la résolution et l'alpha
    circleShader.setResolution(this.width, this.height);
    circleShader.setAlpha(particle.alpha);
    
    // Préparer les données pour un seul point
    const positions = new Float32Array([projectedX, projectedY]);
    const colors = new Float32Array([
      particle.color.r / 255, 
      particle.color.g / 255, 
      particle.color.b / 255
    ]);
    const sizes = new Float32Array([size]);
    
    // Configurer les attributs
    this.context.enableVertexAttribArray(circleShader.getPositionLocation());
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this._positionBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, positions, this.context.STATIC_DRAW);
    this.context.vertexAttribPointer(
      circleShader.getPositionLocation(), 
      2, 
      this.context.FLOAT, 
      false, 
      0, 
      0
    );
    
    this.context.enableVertexAttribArray(circleShader.getColorLocation());
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this._colorBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, colors, this.context.STATIC_DRAW);
    this.context.vertexAttribPointer(
      circleShader.getColorLocation(), 
      3, 
      this.context.FLOAT, 
      false, 
      0, 
      0
    );
    
    this.context.enableVertexAttribArray(circleShader.getSizeLocation());
    this.context.bindBuffer(this.context.ARRAY_BUFFER, this._sizeBuffer);
    this.context.bufferData(this.context.ARRAY_BUFFER, sizes, this.context.STATIC_DRAW);
    this.context.vertexAttribPointer(
      circleShader.getSizeLocation(), 
      1, 
      this.context.FLOAT, 
      false, 
      0, 
      0
    );
    
    // Activer le blending pour la transparence
    this.context.enable(this.context.BLEND);
    this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA);
    
    // Dessiner le point
    this.context.drawArrays(this.context.POINTS, 0, 1);
    
    // Désactiver les attributs
    this.context.disableVertexAttribArray(circleShader.getPositionLocation());
    this.context.disableVertexAttribArray(circleShader.getColorLocation());
    this.context.disableVertexAttribArray(circleShader.getSizeLocation());
  }

  clear() {
    this.context.clearColor(0.0, 0.0, 0.0, 1.0);
    this.context.clear(this.context.COLOR_BUFFER_BIT);
  }

  cleanup(): void {
    this._shaderManager.cleanup();
    if (this._positionBuffer) {
      this.context.deleteBuffer(this._positionBuffer);
    }
    if (this._colorBuffer) {
      this.context.deleteBuffer(this._colorBuffer);
    }
    if (this._sizeBuffer) {
      this.context.deleteBuffer(this._sizeBuffer);
    }
  }
} 