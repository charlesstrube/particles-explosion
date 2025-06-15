import type { IParticle } from "./interfaces";

export interface Position  {
  x: number;
  y: number;
  z: number;
}

export interface Velocity  {
  x: number;
  y: number;
  z: number;
}

export interface Turbulence  {
  x: number;
  y: number;
  z: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

export enum MESSAGE_TYPE {
  CREATE_CANVAS = 'CREATE_CANVAS',
  RENDER = 'RENDER',
  UPDATE_PERSPECTIVE = 'UPDATE_PERSPECTIVE',
}

export interface RenderMessage {
  type: MESSAGE_TYPE.RENDER;
  payload: {
    particles: IParticle[];
  };
}

export interface CreateCanvasMessage {
  type: MESSAGE_TYPE.CREATE_CANVAS;
  payload: {
    canvas: OffscreenCanvas;
    perspective: number;
    ratio: number;
    width: number;
    height: number;
  };
}

export interface UpdatePerspectiveMessage {
  type: MESSAGE_TYPE.UPDATE_PERSPECTIVE;
  payload: {
    perspective: number;
  };
}

export type Message = RenderMessage | CreateCanvasMessage | UpdatePerspectiveMessage;