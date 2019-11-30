import { Canvas, Image, createCanvas as internalCreateCanvas } from 'canvas';
import helpers from './helpers';
import effects from './effects';

helpers.createCanvas = createCanvas;
helpers.isCanvas = isCanvas;
helpers.isDrawable = isDrawable;
export { helpers, effects };

function createCanvas() {
  return internalCreateCanvas(1, 1);
}

function isCanvas(el) {
  return el instanceof Canvas;
}

function isDrawable(el) {
  return isCanvas(el) || el instanceof Image;
}
