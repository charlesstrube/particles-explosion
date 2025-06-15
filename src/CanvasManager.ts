import type { ICanvasManager } from "./interfaces";

export class CanvasManager implements ICanvasManager {
  private _context: CanvasRenderingContext2D;
  private _width: number = 0;
  private _height: number = 0;
  private _ratio: number = window.devicePixelRatio;

  constructor(
    private canvas: HTMLCanvasElement,
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
    this.canvas.style.width = `${width}px`;
  }
  
  set height(height: number) {
    this._height = height;
    this.canvas.height = height * this._ratio;
    this.canvas.style.height = `${height}px`;
  }

  private getContext(): CanvasRenderingContext2D {
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

  get context(): CanvasRenderingContext2D {
    return this._context;
  }
} 