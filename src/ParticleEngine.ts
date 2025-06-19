import type { ParticleSchema, ParticleEngineSchema, ParticleFactorySchema } from "./interfaces"
import { DefaultParticleFactory } from "./ParticleFactory"

export class ParticleEngine implements ParticleEngineSchema {

  private _particles: ParticleSchema[] = []
  private _particleFactory: ParticleFactorySchema

  constructor() {
    this._particleFactory = new DefaultParticleFactory()
  }

  get particles(): ParticleSchema[] {
    return this._particles
  }

  set particleFactory(factory: ParticleFactorySchema) {
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