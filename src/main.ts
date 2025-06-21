import { RenderEngine } from './core/RenderEngine'
import { ParticleEngine } from './particles/ParticleEngine';
import { DefaultParticleFactory, FireParticleFactory, WaterParticleFactory } from './particles/ParticleFactory'
import { TurbulenceField } from './particles/TurbulenceField'
import type { ParticleFactorySchema } from './schemas';
import './style.css'

import { GUI } from 'dat.gui';

const app = document.querySelector<HTMLDivElement>('#app')

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const FPS = 60
const AMOUNT = 2000
const PERSPECTIVE = 400
const centerX = WIDTH / 2
const centerY = HEIGHT / 2
const params = {
  amount: AMOUNT,
  fps: FPS,
  perspective: PERSPECTIVE,
  turbulenceForce: 10,
  turbulenceRadius: 100,
  turbulenceCount: 50,
}

let x = 0
let y = 0
let willSpawn = false

if (app) {
  const canvas = document.createElement('canvas')
  app.appendChild(canvas)

  const turbulenceField = new TurbulenceField()
  const Particular = new ParticleEngine(turbulenceField)

  // Configuration initiale du champ de turbulence
  turbulenceField.createRandomPattern(
    centerX, centerY, 0,           // Centre
    300,                // Rayon de la zone
    params.turbulenceCount, // Nombre de points
    params.turbulenceForce, // Force
    params.turbulenceRadius    // Rayon d'influence de chaque point
  )

  const Render = new RenderEngine(
    canvas,
    'gl',
    WIDTH,
    HEIGHT,
    FPS,
    PERSPECTIVE
  )

  // Création des boutons pour changer le type de particules
  const createButton = (text: string, factory: ParticleFactorySchema) => {
    const button = document.createElement('button')
    button.textContent = text
    button.style.margin = '5px'
    button.addEventListener('click', () => {
      Particular.particleFactory = factory
    })
    return button
  }

  const buttonContainer = document.createElement('div')
  buttonContainer.style.position = 'fixed'
  buttonContainer.style.top = '10px'
  buttonContainer.style.left = '10px'
  buttonContainer.style.zIndex = '1000'

  buttonContainer.appendChild(createButton('Default', new DefaultParticleFactory()))
  buttonContainer.appendChild(createButton('Fire', new FireParticleFactory()))
  buttonContainer.appendChild(createButton('Water', new WaterParticleFactory()))

  app.appendChild(buttonContainer)

  Render.onMouseUp = (xCoord, yCoord) => {
    x = xCoord
    y = yCoord
    willSpawn = true
  }

  Render.onRender = (elapsed) => {
    Particular.update(elapsed)
    if (willSpawn) {
      Particular.spawnParticles(x, y, 0, params.amount)
      willSpawn = false
    }
    return Particular.particles
  }

  const gui = new GUI({
    name: 'Particular Explosion',
  })
  gui.add(params, 'amount', 1, 100000)
  gui.add(params, 'fps', 1, 120).onChange((value) => {
    Render.fps = value
  })
  gui.add(params, 'perspective', 100, 1000).onChange((value) => {
    Render.perspective = value
  })

  // Contrôles pour la turbulence
  const turbulenceFolder = gui.addFolder('Turbulence')
  turbulenceFolder.add(params, 'turbulenceForce', 0, 50).onChange((value) => {
    // Recréer le champ avec les nouveaux paramètres
    turbulenceField.clear()
    turbulenceField.createRandomPattern(
      centerX, centerY, 0,
      300,
      params.turbulenceCount,
      value,
      params.turbulenceRadius
    )
  })
  turbulenceFolder.add(params, 'turbulenceRadius', 10, 200).onChange((value) => {
    turbulenceField.clear()
    turbulenceField.createRandomPattern(
      centerX, centerY, 0,
      300,
      params.turbulenceCount,
      params.turbulenceForce,
      value
    )
  })
  turbulenceFolder.add(params, 'turbulenceCount', 10, 200).onChange((value) => {
    turbulenceField.clear()
    turbulenceField.createRandomPattern(
      centerX, centerY, 0,
      300,
      value,
      params.turbulenceForce,
      params.turbulenceRadius
    )
  })
}