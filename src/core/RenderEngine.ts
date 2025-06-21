import { MouseHandler } from "../MouseHandler";
import { TurbulenceRenderer } from "../render/gl/TurbulenceGLRenderer";
import { GameLoop } from "./GameLoop";
import type { CanvasManagerSchema, ParticleSchema, ParticleRendererSchema, TurbulencePoint } from "../schemas";
import { ParticleGLRenderer } from "../render/gl/ParticleGLRenderer";
import { CanvasManager } from "../canvas/CanvasManager";
import { ContextGLManager } from "../canvas/ContextGLManager";
export class RenderEngine {
  private mouseHandler: MouseHandler;
  private particleRenderer: ParticleRendererSchema;
  private turbulenceRenderer: TurbulenceRenderer;
  private gameLoop: GameLoop;
  private canvasManager: CanvasManagerSchema;
  private _contextManager: ContextGLManager;

  public onRender: ((elapsed: number) => void) | undefined;
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

    this._contextManager = new ContextGLManager(this.canvasManager.canvas);

    this.particleRenderer = new ParticleGLRenderer(
      this.canvasManager,
      this._contextManager,
      perspective
    );


    this.turbulenceRenderer = new TurbulenceRenderer(
      this.canvasManager,
      this._contextManager,
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
    this.turbulenceRenderer.perspective = perspective;
  }

  private update(elapsed: number) {
    if (this.mouseHandler.isHolding) {
      this.onMouseHold?.(this.mouseHandler.x, this.mouseHandler.y);
    }

    this.particleRenderer.clear();
    this.turbulenceRenderer.clear();

    this.onRender?.(elapsed);
  }

  drawParticles(particles: ParticleSchema[]): void {
    this.particleRenderer.drawParticlesBatch(particles);
  }

  drawTurbulencePoints(points: TurbulencePoint[]): void {
    this.turbulenceRenderer.drawTurbulencePoints(points);
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