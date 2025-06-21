import type { MouseHandlerSchema } from "./schemas";

export class MouseHandler implements MouseHandlerSchema {
  private _holding: boolean = false;
  private _x: number = 0;
  private _y: number = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    private callbacks: {
      onMouseDown?: (x: number, y: number) => void;
      onMouseUp?: (x: number, y: number) => void;
      onMouseHold?: (x: number, y: number) => void;
    }
  ) {
    this.registerEvents();
  }

  private registerEvents() {
    this.canvas.addEventListener('mousedown', (event) => {
      this._x = Math.floor(event.offsetX);
      this._y = Math.floor(event.offsetY);
      this._holding = true;
      this.callbacks.onMouseDown?.(this._x, this._y);
    });

    this.canvas.addEventListener('mouseup', (event) => {
      this._x = Math.floor(event.offsetX);
      this._y = Math.floor(event.offsetY);
      this._holding = false;
      this.callbacks.onMouseUp?.(this._x, this._y);
    });

    this.canvas.addEventListener('mousemove', (event) => {
      this._x = Math.floor(event.offsetX);
      this._y = Math.floor(event.offsetY);
    });
  }

  get isHolding(): boolean {
    return this._holding;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }
} 