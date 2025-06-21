import { getDistance } from "../helpers/getDistance";
import getInfluence from "../helpers/getInfluence";
import type { TurbulenceFieldSchema, TurbulencePoint, Position, Vector } from "../schemas";

export class TurbulenceField implements TurbulenceFieldSchema {
  private _points: TurbulencePoint[] = [];

  get points(): TurbulencePoint[] {
    return [...this._points];
  }

  addPoint(point: TurbulencePoint): void {
    this._points.push(point);
  }

  removePoint(index: number): void {
    if (index >= 0 && index < this._points.length) {
      this._points.splice(index, 1);
    }
  }

  clear(): void {
    this._points = [];
  }

  getTurbulenceAt(position: Position): Vector {
    const totalTurbulence: Vector = { x: 0, y: 0, z: 0 };

    for (const point of this._points) {
      const distance = getDistance(position, point.position);

      // Ignorer les points trop éloignés pour les performances
      if (distance > point.radius) continue;

      // Calculer l'influence avec une fonction gaussienne
      const influence = getInfluence(distance, point.radius);

      // Appliquer la direction du point avec l'influence
      totalTurbulence.x += point.direction.x * influence;
      totalTurbulence.y += point.direction.y * influence;
      totalTurbulence.z += point.direction.z * influence;
    }

    return totalTurbulence;
  }

  update(deltaTime: number): void {
    // Pour l'instant, les points sont statiques
    // On pourrait ajouter ici de l'animation des points si nécessaire
  }

  // Méthodes utilitaires pour créer des patterns de turbulence
  createGridPattern(
    centerX: number, centerY: number, centerZ: number,
    width: number, height: number, depth: number,
    spacing: number, force: number, radius: number
  ): void {
    for (let x = centerX - width / 2; x <= centerX + width / 2; x += spacing) {
      for (let y = centerY - height / 2; y <= centerY + height / 2; y += spacing) {
        for (let z = centerZ - depth / 2; z <= centerZ + depth / 2; z += spacing) {
          const direction: Vector = {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            z: (Math.random() - 0.5) * 2
          };

          // Normaliser et appliquer la force
          const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
          if (magnitude > 0) {
            direction.x = (direction.x / magnitude) * force;
            direction.y = (direction.y / magnitude) * force;
            direction.z = (direction.z / magnitude) * force;
          }

          this.addPoint({
            position: { x, y, z },
            direction,
            radius
          });
        }
      }
    }
  }

  createRandomPattern(
    centerX: number, centerY: number, centerZ: number,
    radius: number, count: number, force: number, pointRadius: number
  ): void {
    for (let i = 0; i < count; i++) {
      // Position aléatoire dans la sphère
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random()); // Distribution uniforme dans la sphère

      const x = centerX + r * Math.sin(angle2) * Math.cos(angle1);
      const y = centerY + r * Math.sin(angle2) * Math.sin(angle1);
      const z = centerZ + r * Math.cos(angle2);

      const direction: Vector = {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2
      };

      // Normaliser et appliquer la force
      const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
      if (magnitude > 0) {
        direction.x = (direction.x / magnitude) * force;
        direction.y = (direction.y / magnitude) * force;
        direction.z = (direction.z / magnitude) * force;
      }

      this.addPoint({
        position: { x, y, z },
        direction,
        radius: pointRadius
      });
    }
  }

  createVortexPattern(
    centerX: number, centerY: number, centerZ: number,
    radius: number, height: number, count: number, force: number, pointRadius: number
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = radius * (0.3 + 0.7 * Math.random()); // Rayon variable
      const h = (Math.random() - 0.5) * height;

      const x = centerX + r * Math.cos(angle);
      const y = centerY + h;
      const z = centerZ + r * Math.sin(angle);

      // Direction tangentielle pour créer un vortex avec la force appliquée
      const direction: Vector = {
        x: -Math.sin(angle) * force,
        y: 0,
        z: Math.cos(angle) * force
      };

      this.addPoint({
        position: { x, y, z },
        direction,
        radius: pointRadius
      });
    }
  }
} 