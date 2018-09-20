import helpers from './helpers';
import effects from './effects';

helpers.createCanvas = createCanvas;
helpers.isCanvas = isCanvas;
helpers.isDrawable = isDrawable;
export { helpers, effects };

function createCanvas() {
  return document.createElement('canvas');
}

function isCanvas(el) {
  return el instanceof HTMLCanvasElement;
}

function isDrawable(el) {
  return isCanvas(el) || el instanceof HTMLImageElement;
}
