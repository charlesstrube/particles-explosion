import type { IParticleRenderer, IParticle } from "./interfaces";

export class ParticleRenderer implements IParticleRenderer {
  constructor(
    private context: OffscreenCanvasRenderingContext2D,
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

  drawCloseParticle(particle: IParticle) {
    const { projectedX, projectedY, size, zFactor } = this.projectParticle(particle);

    this.context.beginPath();
    const sides = 6;
    const angle = (Math.PI * 2) / sides;

    for (let i = 0; i < sides; i++) {
      const x = projectedX + size * Math.cos(angle * i);
      const y = projectedY + size * Math.sin(angle * i);
      if (i === 0) {
        this.context.moveTo(x, y);
      } else {
        this.context.lineTo(x, y);
      }
    }
    this.context.closePath();

    const depthAlpha = Math.max(0.2, 0.8 - zFactor * 0.6);
    const finalAlpha = particle.alpha * depthAlpha;
    this.context.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${finalAlpha})`;
    this.context.fill();
    this.context.restore();
  }

  drawFarParticle(particle: IParticle) {
    const { projectedX, projectedY, size } = this.projectParticle(particle);

    this.context.save();
    this.context.beginPath();
    this.context.arc(projectedX, projectedY, size, 0, Math.PI * 2);
    this.context.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
    this.context.closePath();
    this.context.fill();
    this.context.restore();
  }

  drawParticle(particle: IParticle) {
    if (particle.position.z < 0) {
      this.drawCloseParticle(particle);
      return;
    }
    this.drawFarParticle(particle);
  }

  clear() { 
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.width, this.height);
  }
} 