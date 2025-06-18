import type { IParticleRenderer, IParticle } from "../interfaces";

export class ParticleGLRenderer implements IParticleRenderer {
  constructor(
    private context: WebGLRenderingContext,
    private width: number,
    private height: number,
    private _perspective: number
  ) {}

  set perspective(perspective: number) {
    this._perspective = perspective;
  }

  get perspective() {
    return this._perspective;
  }

  projectParticle(particle: IParticle) {
    const scale = this._perspective / (this._perspective + particle.position.z);

    const projectedX = (particle.position.x - this.width / 2) * scale + this.width / 2;
    const projectedY = (particle.position.y - this.height / 2) * scale + this.height / 2;

    const zFactor = Math.max(0, -particle.position.z / this._perspective);
    const size = particle.size * (1 + zFactor * 0.2) * scale;

    return {
      size,
      projectedX,
      projectedY,
      zFactor
    };
  }


  drawFarParticle(particle: IParticle) {
    const { projectedX, projectedY, size } = this.projectParticle(particle);

  }

  drawParticle(particle: IParticle) {

    this.drawFarParticle(particle);
  }

  clear() {

  }
} 