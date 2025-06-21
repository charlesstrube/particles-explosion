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

export interface CameraSchema {
  get position(): Position;
  get target(): Position;
  get fov(): number;
  get near(): number;
  get far(): number;
  set positionX(position: number);
  set positionY(position: number);
  set positionZ(position: number);
  set targetX(target: number);
  set targetY(target: number);
  set targetZ(target: number);
  set fov(fov: number);
  set near(near: number);
  set far(far: number);
  projectPointCamera(
    itemPosition: Position,
    itemSize: number,
    containerWidth: number,
    containerHeight: number
  ): { size: number, projectedX: number, projectedY: number, zFactor: number, distanceToCamera: number };
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
  drawParticlesBatch(particles: ParticleSchema[]): void;
}

export interface TurbulenceRendererSchema {
  drawTurbulencePoints(points: TurbulencePoint[]): void;
  clear(): void;
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
  addVelocity(x: number, y: number, z: number): void;
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