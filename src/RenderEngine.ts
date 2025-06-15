import { MouseHandler } from "./MouseHandler";
import { ParticleRenderer } from "./ParticleRenderer";
import { GameLoop } from "./GameLoop";
import { CanvasManager } from "./CanvasManager";
import type { IParticle } from "./interfaces";

export class RenderEngine {
  private mouseHandler: MouseHandler;
  private particleRenderer: ParticleRenderer;
  private gameLoop: GameLoop;
  private canvasManager: CanvasManager;

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
    this.canvasManager = new CanvasManager(canvas, width, height);
    this.particleRenderer = new ParticleRenderer(
      this.canvasManager.context,
      this.canvasManager.width,
      this.canvasManager.height,
      perspective
    );

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
    this.particleRenderer.perspective = perspective;
  }

  private update(elapsed: number) {
    if (this.mouseHandler.isHolding) {
      this.onMouseHold?.(this.mouseHandler.x, this.mouseHandler.y);
    }

    const particles = this.onRender?.(elapsed);
    if (!particles) return;

    this.particleRenderer.clear();
    particles.forEach(particle => this.particleRenderer.drawParticle(particle));
  }

  set width(width: number) {
    this.canvasManager.width = width;
  }

  get width() {
    return this.canvasManager.width;
  }

  set height(height: number) {
    this.canvasManager.height = height;
  }

  get height() {
    return this.canvasManager.height;
  }
}