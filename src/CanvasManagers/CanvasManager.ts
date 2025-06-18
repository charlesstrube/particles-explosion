import type { ICanvasManager } from "../interfaces";

export class CanvasManager implements ICanvasManager {
  protected _width: number = 0;
  protected _height: number = 0;
  protected _ratio: number = window.devicePixelRatio;

  constructor(
    protected canvas: HTMLCanvasElement,
    width: number,
    height: number
  ) {
    this.width = width;
    this.height = height;
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

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }
} 