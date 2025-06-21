export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Vector {
  x: number;
  y: number;
  z: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface TurbulencePoint {
  readonly position: Position;
  readonly direction: Vector;
  readonly radius: number;
}

export interface TurbulenceFieldSchema {
  readonly points: TurbulencePoint[];
  getTurbulenceAt(position: Position): Vector;
  createRandomPattern(
    centerX: number, centerY: number, centerZ: number,
    radius: number, count: number, force: number, pointRadius: number
  ): void;
}

export interface MouseHandlerSchema {
  readonly isHolding: boolean;
  readonly x: number;
  readonly y: number;
}

export interface ParticleRendererSchema {
  drawParticle(particle: ParticleSchema): void;
  clear(): void;
  set perspective(perspective: number);
  drawParticlesBatch(particles: ParticleSchema[]): void;
}

export interface TurbulenceRendererSchema {
  drawTurbulencePoints(points: TurbulencePoint[]): void;
  clear(): void;
  set perspective(perspective: number);
}

export interface GameLoopSchema {
  start(): void;
  stop(): void;
  set fps(fps: number);
}

export interface CanvasManagerSchema {
  get width(): number;
  get height(): number;
  get canvas(): HTMLCanvasElement;
  set width(width: number);
  set height(height: number);
}

export interface ContextManagerSchema<T extends (CanvasRenderingContext2D | WebGLRenderingContext)> {
  get context(): T;
}

export interface ParticleSchema {
  readonly position: Position;
  readonly color: Color;
  readonly alpha: number;
  readonly size: number;
  update(deltaTime: number): void;
  isAlive(): boolean;
  setVelocity(x: number, y: number, z: number): void;
  addForce(x: number, y: number, z: number): void;
  applyTurbulence(turbulence: Vector): void;
}

export interface ParticleFactorySchema {
  createParticle(x: number, y: number, z: number): ParticleSchema;
}

export interface ParticleEngineSchema {
  particles: ParticleSchema[];
  spawnParticles(x: number, y: number, z: number, amount: number): void;
  update(deltaTime: number): void;
  sortParticles(): void;
  set particleFactory(factory: ParticleFactorySchema);
}