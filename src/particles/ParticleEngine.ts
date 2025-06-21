import type { ParticleSchema, ParticleEngineSchema, ParticleFactorySchema, TurbulenceFieldSchema } from "../schemas"
import { DefaultParticleFactory } from "./ParticleFactory"

export class ParticleEngine implements ParticleEngineSchema {

  private _particles: ParticleSchema[] = []
  private _particleFactory: ParticleFactorySchema
  private _lastSortTime: number = 0
  private _sortInterval: number = 100 // Trier seulement toutes les 100ms
  private _needsSort: boolean = false

  constructor(
    private _turbulenceField: TurbulenceFieldSchema
  ) {
    this._particleFactory = new DefaultParticleFactory()
  }

  get particles(): ParticleSchema[] {
    return this._particles
  }

  set particleFactory(factory: ParticleFactorySchema) {
    this._particleFactory = factory
  }

  spawnParticles(x: number, y: number, z: number, amount: number): void {
    // Pré-allouer l'espace si nécessaire
    const newParticles: ParticleSchema[] = []
    for (let i = 0; i < amount; i++) {
      newParticles.push(this._particleFactory.createParticle(x, y, z))
    }

    // Ajouter en lot pour éviter les reallocations multiples
    this._particles.push(...newParticles)
    this._needsSort = true
  }

  update(deltaTime: number): void {
    // Utiliser un filtre plus efficace
    const aliveParticles: ParticleSchema[] = []
    const currentTime = Date.now()

    for (let i = 0; i < this._particles.length; i++) {
      const particle = this._particles[i]

      // Appliquer la turbulence externe si disponible
      const turbulence = this._turbulenceField.getTurbulenceAt(particle.position)
      particle.applyTurbulence(turbulence)

      particle.update(deltaTime)
      if (particle.isAlive()) {
        aliveParticles.push(particle)
      }
    }

    this._particles = aliveParticles

    // Trier seulement si nécessaire et si assez de temps s'est écoulé
    if (this._needsSort && (currentTime - this._lastSortTime) > this._sortInterval) {
      this.sortParticles()
      this._lastSortTime = currentTime
      this._needsSort = false
    }
  }

  sortParticles(): void {
    // Tri optimisé pour les particules
    this._particles.sort((a, b) => b.position.z - a.position.z)
  }

  // Méthode pour forcer le tri si nécessaire
  forceSort(): void {
    this.sortParticles()
    this._needsSort = false
  }

  // Méthode pour nettoyer les particules mortes
  cleanup(): void {
    this._particles = this._particles.filter(particle => particle.isAlive())
  }
}