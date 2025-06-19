import { ContextGLManager } from "../CanvasManagers/ContextGLManager";
import { projectPoint } from "../helpers/projectPoint";
import type { CanvasManagerSchema, ParticleRendererSchema, ContextManagerSchema, ParticleSchema } from "../interfaces";

export class ParticleGLRenderer implements ParticleRendererSchema {
  private _contextManager: ContextManagerSchema<WebGLRenderingContext>;
  constructor(
    private _canvasManager: CanvasManagerSchema,
    private _perspective: number
  ) {
    this._contextManager = new ContextGLManager(this._canvasManager.canvas);
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


  }

  clear() {
    this.context.clearColor(0.0, 0.0, 0.0, 1.0);
    this.context.clear(this.context.COLOR_BUFFER_BIT);
  }
} 