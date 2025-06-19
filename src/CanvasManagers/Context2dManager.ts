import type { ContextManagerSchema } from "../interfaces";

export class Context2dManager implements ContextManagerSchema<CanvasRenderingContext2D> {
  private _context: CanvasRenderingContext2D;
  private _ratio: number = window.devicePixelRatio;
  
  constructor(
    protected canvas: HTMLCanvasElement,
  ) {
    this._context = this.getContext();
    this._context.scale(this._ratio, this._ratio);
  }

  private getContext() {
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    return context;
  }

  get context(): CanvasRenderingContext2D {
    return this._context;
  }
} 