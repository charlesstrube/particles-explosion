import { MouseHandler } from "./MouseHandler";
import { GameLoop } from "./GameLoop";
import type { IParticle } from "./interfaces";
import { MESSAGE_TYPE, type Message } from "./types";

export class RenderEngine {
  private mouseHandler: MouseHandler;
  private gameLoop: GameLoop;

  private worker: Worker;

  public onRender: ((elapsed: number) => IParticle[]) | undefined;
  public onMouseDown: ((x: number, y: number) => void) | undefined;
  public onMouseUp: ((x: number, y: number) => void) | undefined;
  public onMouseHold: ((x: number, y: number) => void) | undefined;

  constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    fps: number = 60,
    perspective: number = 1000
  ) {
    const ratio = window.devicePixelRatio;


    const offscreenCanvas = canvas.transferControlToOffscreen();
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    this.postMessage({
      type: MESSAGE_TYPE.CREATE_CANVAS,
      payload: {
        canvas: offscreenCanvas,
        perspective,
        ratio,
        width,
        height
      }
    }, [offscreenCanvas]);

    this.mouseHandler = new MouseHandler(canvas, {
      onMouseDown: (x, y) => this.onMouseDown?.(x, y),
      onMouseUp: (x, y) => this.onMouseUp?.(x, y),
      onMouseHold: (x, y) => this.onMouseHold?.(x, y)
    });

    this.gameLoop = new GameLoop(fps, this.update.bind(this));
    this.setup();
  }

  set fps(fps: number) {
    this.gameLoop.fps = fps;
  }

  private setup() {
    this.gameLoop.start();
  }

  set perspective(perspective: number) {
    this.postMessage({
      type: MESSAGE_TYPE.UPDATE_PERSPECTIVE,
      payload: { perspective }
    });
  }

  private update(elapsed: number) {
    if (this.mouseHandler.isHolding) {
      this.onMouseHold?.(this.mouseHandler.x, this.mouseHandler.y);
    }

    const particles = this.onRender?.(elapsed);
    if (!particles) return;

    this.postMessage({
      type: MESSAGE_TYPE.RENDER,
      payload: { particles }
    });
  }

  postMessage(message: Message, options?: any) {
    this.worker.postMessage(message, options);
  }
}