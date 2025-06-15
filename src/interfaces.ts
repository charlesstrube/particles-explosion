import type { Position, Color } from "./types";

export interface IMouseHandler {
  readonly isHolding: boolean;
  readonly x: number;
  readonly y: number;
}

export interface IParticleRenderer {
  drawParticle(particle: IParticle): void;
  clear(): void;
}

export interface IGameLoop {
  start(): void;
  stop(): void;
  set fps(fps: number);
}

export interface ICanvasManager {
  get width(): number;
  get height(): number;
}

export interface IParticle {
  readonly position: Position;
  readonly color: Color;
  alpha: number;
  readonly size: number;
  update(deltaTime: number): void;
  isAlive(): boolean;
  setVelocity(x: number, y: number, z: number): void;
  addForce(x: number, y: number, z: number): void;
}

export interface IParticleFactory {
  createParticle(x: number, y: number, z: number): IParticle;
}

export interface IParticleEngine {
  particles: IParticle[];
  spawnParticles(x: number, y: number, z: number, amount: number): void;
  update(deltaTime: number): void;
  sortParticles(): void;
  set particleFactory(factory: IParticleFactory);
} 