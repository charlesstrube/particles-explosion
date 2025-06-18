import type { IContextManager } from "../interfaces";
import { CanvasManager } from "./CanvasManager";

export class Canvas2dManager extends CanvasManager implements IContextManager<CanvasRenderingContext2D> {
  private _context: CanvasRenderingContext2D;
  
  constructor(
    protected canvas: HTMLCanvasElement,
    width: number,
    height: number
  ) {
    super(canvas, width, height);
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