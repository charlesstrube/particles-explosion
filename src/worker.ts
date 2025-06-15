// worker.ts
import { CanvasManager } from './CanvasManager';
import { ParticleRenderer } from './ParticleRenderer';
import { MESSAGE_TYPE, type Message } from './types';

let offscreenCanvas: OffscreenCanvas;
let context: OffscreenCanvasRenderingContext2D | null;
let particleRenderer: ParticleRenderer;
let Canvas: CanvasManager;

self.onmessage = (e: MessageEvent<Message>) => {
  switch (e.data.type) {
    case MESSAGE_TYPE.CREATE_CANVAS:{
      const { canvas, width, height, ratio, perspective } = e.data.payload;
      Canvas = new CanvasManager(canvas, width, height);

      if (!Canvas.context) {
        throw new Error('Impossible de créer le contexte 2D dans le worker');
      }
      particleRenderer = new ParticleRenderer(
        Canvas.context,
        width,
        height,
        perspective,
      );
      break;
    } 
    case MESSAGE_TYPE.RENDER:{
      const { particles } = e.data.payload;
      particleRenderer.clear();

      particles.forEach(particle => particleRenderer.drawParticle(particle));
      break;
    }
    case MESSAGE_TYPE.UPDATE_PERSPECTIVE:{
      const { perspective } = e.data.payload;
      particleRenderer.perspective = perspective;
      break;
    }
  }
};