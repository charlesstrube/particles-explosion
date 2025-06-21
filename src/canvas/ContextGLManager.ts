import type { ContextManagerSchema } from "../schemas";

export class ContextGLManager implements ContextManagerSchema<WebGLRenderingContext> {
  protected _context: WebGLRenderingContext;

  constructor(
    protected canvas: HTMLCanvasElement,
  ) {
    this._context = this.getContext();
  }

  private getContext(): WebGLRenderingContext {
    const context = this.canvas.getContext('webgl');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    return context;
  }

  get context(): WebGLRenderingContext {
    return this._context;
  }
} 