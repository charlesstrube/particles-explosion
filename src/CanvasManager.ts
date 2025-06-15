import type { ICanvasManager } from "./interfaces";

export class CanvasManager implements ICanvasManager {
  private _context: OffscreenCanvasRenderingContext2D;
  private _width: number = 0;
  private _height: number = 0;
  private _ratio: number = 1;

  constructor(
    private canvas: OffscreenCanvas,
    width: number,
    height: number
  ) {
    this._context = this.getContext();
    this.width = width;
    this.height = height;
    this._context.scale(this._ratio, this._ratio);

  }

  set width(width: number) {
    this._width = width;
    this.canvas.width = width * this._ratio;
  }
  
  set height(height: number) {
    this._height = height;
    this.canvas.height = height * this._ratio;
  }

  get ratio(): number {
    return this._ratio;
  }

  private getContext(): OffscreenCanvasRenderingContext2D {
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    return context;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get context(): OffscreenCanvasRenderingContext2D {
    return this._context;
  }
} 