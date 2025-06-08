import { Engine } from './Engine'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
const FPS = 60
const AMOUNT = 1000
const PERSPECTIVE = 400

if (app) {
  const canvas = document.createElement('canvas')

  app.appendChild(canvas)

  const ratio = window.devicePixelRatio

  canvas.width = WIDTH * ratio;
  canvas.height = HEIGHT * ratio;
  canvas.style.width = `${WIDTH}px`
  canvas.style.height = `${HEIGHT}px`


  let x: undefined | number = undefined
  let y: undefined | number = undefined
  let holding = false
  let hasSpawned = false

  canvas.addEventListener('mousedown', () => {
    holding = true
  })

  canvas.addEventListener('mouseup', () => {
    holding = false
    hasSpawned = false
  })

  canvas.addEventListener('mousemove', (event) => {
    x = Math.floor(event.offsetX)
    y = Math.floor(event.offsetY)
  })


  const fpsInterval = 1000 / FPS
  let now = Date.now()
  let then = now
  let elapsed;



  const context = canvas.getContext('2d')
  if (context) {
    context.scale(ratio, ratio)

    const engine = new Engine(WIDTH, HEIGHT)

    const loop = () => {

      window.requestAnimationFrame(loop)
      // calc elapsed time since last loop

      now = Date.now();
      elapsed = now - then;

      // if enough time has elapsed, draw the next frame

      if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        // Put your drawing code here

        engine.update(elapsed)



        if (holding && !hasSpawned && x !== undefined && y !== undefined) {
          engine.spawnParticles(x, y, 0, AMOUNT)
          hasSpawned = true
        }


        context.clearRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = 'black'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.restore()

        // Trier les particules par Z pour un rendu correct de la profondeur
        const sortedParticles = [...engine.particles].sort((a, b) => b.position.z - a.position.z);

        sortedParticles.forEach((particle) => {
          const alpha = 1 - particle.lifeTimePercentage();
          const scale = PERSPECTIVE / (PERSPECTIVE + particle.position.z);

          // Calculer la position projetée
          const projectedX = (particle.position.x - WIDTH / 2) * scale + WIDTH / 2;
          const projectedY = (particle.position.y - HEIGHT / 2) * scale + HEIGHT / 2;

          // Taille de la particule qui varie avec la profondeur
          const baseSize = 3;
          const zFactor = Math.max(0, -particle.position.z / PERSPECTIVE);
          const size = baseSize * (1 + zFactor * 0.2) * scale;

          if (particle.position.z < 0) {
            // Dessiner un hexagone pour les particules proches de la caméra
            context.beginPath();
            const sides = 6;
            const angle = (Math.PI * 2) / sides;
            
            for (let i = 0; i < sides; i++) {
              const x = projectedX + size * Math.cos(angle * i);
              const y = projectedY + size * Math.sin(angle * i);
              if (i === 0) {
                context.moveTo(x, y);
              } else {
                context.lineTo(x, y);
              }
            }
            context.closePath();

            // Ajuster l'alpha en fonction de la profondeur pour les particules proches
            const depthAlpha = Math.max(0.2, 0.8 - zFactor * 0.6);
            const finalAlpha = alpha * depthAlpha;
            context.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${finalAlpha})`;
          } else {
            // Dessiner un cercle pour les particules éloignées
            context.beginPath();
            context.arc(projectedX, projectedY, size, 0, Math.PI * 2);
            context.closePath();
            context.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${alpha})`;
          }
          context.fill();
          context.restore();
        })
      }
    }

    loop();

  }

}