import type { IParticle, IParticleEngine, IParticleFactory } from "./interfaces"
import { DefaultParticleFactory } from "./ParticleFactory"

export class ParticleEngine implements IParticleEngine {

  private _particles: IParticle[] = []
  private _particleFactory: IParticleFactory

  constructor() {
    this._particleFactory = new DefaultParticleFactory()
  }

  get particles(): IParticle[] {
    return this._particles
  }

  set particleFactory(factory: IParticleFactory) {
    this._particleFactory = factory
  }

  spawnParticles(x: number, y: number, z: number, amount: number): void {
    for (let i = 0; i < amount; i++) {
      this._particles.push(this._particleFactory.createParticle(x, y, z))
    }
  }

  update(deltaTime: number): void {
    this._particles = this._particles.filter((particle) => {
      particle.update(deltaTime)
      return particle.isAlive()
    })
  }

  sortParticles(): void {
    this._particles.sort((a, b) => b.position.z - a.position.z)
  }
}