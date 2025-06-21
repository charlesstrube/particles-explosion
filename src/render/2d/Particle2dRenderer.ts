import { Context2dManager } from "../canvas/Context2dManager";
import { projectPoint } from "../helpers/projectPoint";
import type { ParticleRendererSchema, ParticleSchema, CanvasManagerSchema, ContextManagerSchema } from "../schemas";

export class Particle2dRenderer implements ParticleRendererSchema {
  private _contextManager: ContextManagerSchema<CanvasRenderingContext2D>
  constructor(
    private _canvasManager: CanvasManagerSchema,
    private _perspective: number
  ) {
    this._contextManager = new Context2dManager(this._canvasManager.canvas);
  }

  set perspective(perspective: number) {
    this._perspective = perspective;
  }

  get perspective() {
    return this._perspective;
  }

  private get width() {
    return this._canvasManager.width
  }

  private get height() {
    return this._canvasManager.height
  }

  private get context() {
    return this._contextManager.context
  }

  drawParticlesBatch(particles: ParticleSchema[]) {
    particles.forEach(particle => this.drawParticle(particle));
  }

  projectParticle(particle: ParticleSchema) {
    return projectPoint(
      particle.position,
      particle.size,
      this._perspective,
      this.width,
      this.height
    );
  }

  drawCloseParticle(particle: ParticleSchema) {
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

  drawFarParticle(particle: ParticleSchema) {
    const { projectedX, projectedY, size } = this.projectParticle(particle);
    this.context.beginPath();
    this.context.arc(projectedX, projectedY, size, 0, Math.PI * 2);
    this.context.closePath();
    this.context.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${particle.alpha})`;
    this.context.fill();
    this.context.restore();
  }

  drawParticle(particle: ParticleSchema) {
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
    this.context.restore();
  }
} 