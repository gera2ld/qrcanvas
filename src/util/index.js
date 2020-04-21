import helpers from './helpers';

export { helpers };
export effects from './effects';

export function setCanvasModule(canvasModule) {
  const { Canvas, Image, createCanvas } = createCanvas;
  const isCanvas = el => el instanceof Canvas;
  const isDrawable = el => isCanvas(el) || el instanceof Image;
  helpers.createCanvas = createCanvas;
  helpers.isCanvas = isCanvas;
  helpers.isDrawable = isDrawable;
}
