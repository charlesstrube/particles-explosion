import { Particle } from "./Particle";

export interface IMouseHandler {
  readonly isHolding: boolean;
  readonly x: number;
  readonly y: number;
}

export interface IParticleRenderer {
  drawParticle(particle: Particle): void;
  clear(): void;
}

export interface IGameLoop {
  start(): void;
  stop(): void;
  set fps(fps: number);
}

export interface ICanvasManager {
  get context(): CanvasRenderingContext2D;
  get width(): number;
  get height(): number;
} 