import { MouseHandler } from "./MouseHandler";
import { Particle2dRenderer } from "./Renderers/Particle2dRenderer";
import { GameLoop } from "./GameLoop";
import type { CanvasManagerSchema, ParticleSchema, ParticleRendererSchema } from "./interfaces";
import { ParticleGLRenderer } from "./Renderers/ParticleGLRenderer";
import { CanvasManager } from "./CanvasManagers/CanvasManager";

type ContextType = '2d' | 'gl';

export class RenderEngine {
  private mouseHandler: MouseHandler;
  private particleRenderer: ParticleRendererSchema;
  private gameLoop: GameLoop;
  private canvasManager: CanvasManagerSchema;

  public onRender: ((elapsed: number) => ParticleSchema[]) | undefined;
  public onMouseDown: ((x: number, y: number) => void) | undefined;
  public onMouseUp: ((x: number, y: number) => void) | undefined;
  public onMouseHold: ((x: number, y: number) => void) | undefined;

  constructor(
    canvas: HTMLCanvasElement,
    type: ContextType,
    width: number,
    height: number,
    fps: number = 60,
    perspective: number = 1000
  ) {
    this.canvasManager = new CanvasManager(canvas, width, height);
    if (type === '2d') {
      this.particleRenderer = new Particle2dRenderer(
        this.canvasManager,
        perspective
      );
    } else if (type === 'gl') {
      this.particleRenderer = new ParticleGLRenderer(
        this.canvasManager,
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

  switchContext(type: ContextType) {
    if (type === '2d') {
      this.particleRenderer = new Particle2dRenderer(
        this.canvasManager,
        this.perspective
      );
    } else if (type === 'gl') {
      this.particleRenderer = new ParticleGLRenderer(
        this.canvasManager,
        this.perspective
      );
    } else {
      throw new Error('Invalid type');
    }
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