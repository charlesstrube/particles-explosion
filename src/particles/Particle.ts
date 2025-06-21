import additionVector from "../helpers/additionVector";
import type { Position, Vector, Color } from "../schemas";
import type { ParticleSchema } from "../schemas";

const RED_VARIANTS: Color[] = [
  { r: 255, g: 0, b: 0 },      // Rouge vif
  { r: 255, g: 50, b: 50 },    // Rouge clair
  { r: 200, g: 0, b: 0 },      // Rouge foncé
  { r: 255, g: 100, b: 100 },  // Rouge pâle
  { r: 180, g: 0, b: 0 }       // Rouge bordeaux
];

const DEFAULT_CONFIG = {
  SIZE: 3,
  MAX_LIFETIME: 4000,
  LIFETIME_VARIATION: 2000,
  AIR_RESISTANCE: 0.00008,
  RED_PARTICLE_CHANCE: 0.3,
  INITIAL_FORCE: 200
};

export class Particle implements ParticleSchema {
  private readonly _size: number = DEFAULT_CONFIG.SIZE;
  private lifetime: number = 0;
  private readonly maxLifetime: number;
  private velocity: Vector;
  readonly position: Position;
  private readonly airResistance: number = DEFAULT_CONFIG.AIR_RESISTANCE;
  readonly color: Color;

  constructor(x: number, y: number, z: number) {
    this.position = { x, y, z };
    this.velocity = this.normalizeVelocity(DEFAULT_CONFIG.INITIAL_FORCE);
    this.maxLifetime = DEFAULT_CONFIG.MAX_LIFETIME + (Math.random() - 0.5) * DEFAULT_CONFIG.LIFETIME_VARIATION;
    this.color = this.generateColor();
  }

  get alpha(): number {
    return 1 - this.lifeTimePercentage();
  }

  get size(): number {
    return this._size;
  }

  private generateColor(): Color {
    if (Math.random() < DEFAULT_CONFIG.RED_PARTICLE_CHANCE) {
      return RED_VARIANTS[Math.floor(Math.random() * RED_VARIANTS.length)];
    }
    return { r: 255, g: 255, b: 255 };
  }

  private normalizeVelocity(force: number): Vector {
    const x = (Math.random() - 0.5) * 2;
    const y = (Math.random() - 0.5) * 2;
    const z = (Math.random() - 0.5) * 2;
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    if (magnitude === 0) {
      return { x: 0, y: 0, z: 0 };
    }

    return {
      x: (x / magnitude) * force,
      y: (y / magnitude) * force,
      z: (z / magnitude) * force
    };
  }

  private getVelocityMagnitude(): number {
    return Math.sqrt(
      this.velocity.x * this.velocity.x +
      this.velocity.y * this.velocity.y +
      this.velocity.z * this.velocity.z
    );
  }

  private applyAirResistance(deltaTime: number): void {
    const speed = this.getVelocityMagnitude();
    if (speed === 0) return;

    const dragForce = this.airResistance * speed * speed;
    const reductionFactor = 1 - (dragForce * deltaTime / 1000);

    this.velocity.x *= reductionFactor;
    this.velocity.y *= reductionFactor;
    this.velocity.z *= reductionFactor;
  }

  update(deltaTime: number): void {
    this.applyAirResistance(deltaTime);

    this.position.x += this.velocity.x * (deltaTime / 1000);
    this.position.y += this.velocity.y * (deltaTime / 1000);
    this.position.z += this.velocity.z * (deltaTime / 1000);

    this.lifetime += deltaTime;
  }

  // Nouvelle méthode pour appliquer la turbulence externe
  applyTurbulence(turbulence: Vector): void {
    this.velocity.x += turbulence.x;
    this.velocity.y += turbulence.y;
    this.velocity.z += turbulence.z;
  }

  isAlive(): boolean {
    return this.lifetime < this.maxLifetime;
  }

  private lifeTimePercentage(): number {
    return this.lifetime / this.maxLifetime;
  }

  addVelocity(x: number, y: number, z: number): void {
    this.velocity = additionVector(this.velocity, { x, y, z });
  }

  addForce(x: number, y: number, z: number): void {
    this.velocity.x += x;
    this.velocity.y += y;
    this.velocity.z += z;
  }
}