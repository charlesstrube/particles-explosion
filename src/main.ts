import { Camera } from './core/Camera';
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
const centerX = WIDTH / 2
const centerY = HEIGHT / 2
const params = {
  amount: AMOUNT,
  fps: FPS,
}
const turbulenceParams = {
  force: 10,
  radius: 100,
  count: 50,
}
const cameraParams = {
  x: 90,
  y: 90,
  fov: 90,
  near: 100,
  far: 500,
}

let x = 0
let y = 0
let willSpawn = false

if (app) {
  const canvas = document.createElement('canvas')
  app.appendChild(canvas)


  const cameraPosition = { x: centerX, y: centerY, z: 500 }
  const cameraTarget = { x: centerX, y: centerY, z: 0 }

  const camera = new Camera(
    cameraPosition,
    cameraTarget,
    cameraParams.fov,
    cameraParams.near,
    cameraParams.far
  )
  const turbulenceField = new TurbulenceField()
  const Particular = new ParticleEngine(turbulenceField)

  // Configuration initiale du champ de turbulence
  turbulenceField.createRandomPattern(
    centerX, centerY, 0,           // Centre
    300,                // Rayon de la zone
    turbulenceParams.count, // Nombre de points
    turbulenceParams.force, // Force
    turbulenceParams.radius    // Rayon d'influence de chaque point
  )

  const Render = new RenderEngine(
    canvas,
    WIDTH,
    HEIGHT,
    FPS,
    camera
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

    // Dessiner les points de turbulence
    Render.drawTurbulencePoints(turbulenceField.points)
    // Dessiner les particules
    Render.drawParticles(Particular.particles)
  }

  const gui = new GUI({
    name: 'Particular Explosion',
  })
  gui.add(params, 'amount', 1, 10000)
  gui.add(params, 'fps', 1, 120).onChange((value) => {
    Render.fps = value
  })

  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(cameraParams, 'x', 0, 359).onChange((value) => {
    camera.positionX = value
  })
  cameraFolder.add(cameraParams, 'y', 0, 359).onChange((value) => {
    camera.positionY = value
  })
  cameraFolder.add(cameraParams, 'fov', 0, 180).onChange((value) => {
    camera.fov = value
  })
  cameraFolder.add(cameraParams, 'near', 0, 1000).onChange((value) => {
    camera.near = value
  })
  cameraFolder.add(cameraParams, 'far', 0, 1000).onChange((value) => {
    camera.far = value
  })
  cameraFolder.open()
  // Contrôles pour la turbulence
  const turbulenceFolder = gui.addFolder('Turbulence')
  turbulenceFolder.open()
  turbulenceFolder.add(turbulenceParams, 'force', 0, 50).onChange((value) => {
    // Recréer le champ avec les nouveaux paramètres
    turbulenceField.createRandomPattern(
      centerX, centerY, 0,
      300,
      turbulenceParams.count,
      value,
      turbulenceParams.radius
    )
  })
  turbulenceFolder.add(turbulenceParams, 'radius', 10, 200).onChange((value) => {
    turbulenceField.createRandomPattern(
      centerX, centerY, 0,
      300,
      turbulenceParams.count,
      turbulenceParams.force,
      value
    )
  })
  turbulenceFolder.add(turbulenceParams, 'count', 10, 200).onChange((value) => {
    turbulenceField.createRandomPattern(
      centerX, centerY, 0,
      300,
      value,
      turbulenceParams.force,
      turbulenceParams.radius
    )
  })
}