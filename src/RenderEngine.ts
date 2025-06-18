import { MouseHandler } from "./MouseHandler";
import { Particle2dRenderer } from "./Renderers/Particle2dRenderer";
import { GameLoop } from "./GameLoop";
import { Canvas2dManager } from "./CanvasManagers/Canvas2dManager";
import { CanvasGLManager } from "./CanvasManagers/CanvasGLManager";
import type { IContextManager, IParticle, IParticleRenderer } from "./interfaces";
import { ParticleGLRenderer } from "./Renderers/ParticleGLRenderer";
import type { CanvasManager } from "./CanvasManagers/CanvasManager";

export class RenderEngine<T extends '2d' | 'gl'> {
  private mouseHandler: MouseHandler;
  private particleRenderer: IParticleRenderer;
  private gameLoop: GameLoop;
  private contextManager: Canvas2dManager | CanvasGLManager;

  public onRender: ((elapsed: number) => IParticle[]) | undefined;
  public onMouseDown: ((x: number, y: number) => void) | undefined;
  public onMouseUp: ((x: number, y: number) => void) | undefined;
  public onMouseHold: ((x: number, y: number) => void) | undefined;

  constructor(
    canvas: HTMLCanvasElement,
    type: T,
    width: number,
    height: number,
    fps: number = 60,
    perspective: number = 1000
  ) {
    if (type === '2d') {
      this.contextManager = new Canvas2dManager(canvas, width, height);
      this.particleRenderer = new Particle2dRenderer(
        this.contextManager.context,
        this.contextManager.width,
        this.contextManager.height,
        perspective
      );
    } else if (type === 'gl') {
      this.contextManager = new CanvasGLManager(canvas, width, height);
      this.particleRenderer = new ParticleGLRenderer(
        this.contextManager.context,
        this.contextManager.width,
        this.contextManager.height,
        perspective
      );
    } else {
      throw new Error('Invalid type');
    }

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
    this.contextManager.width = width;
  }

  get width() {
    return this.contextManager.width;
  }

  set height(height: number) {
    this.contextManager.height = height;
  }

  get height() {
    return this.contextManager.height;
  }
}