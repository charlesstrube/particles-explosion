import type { IContextManager } from "../interfaces";
import { CanvasManager } from "./CanvasManager";

export class CanvasGLManager extends CanvasManager implements IContextManager<WebGLRenderingContext> {
  protected _context: WebGLRenderingContext;

  constructor(
    protected canvas: HTMLCanvasElement,
    width: number,
    height: number
  ) {
    super(canvas, width, height);
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