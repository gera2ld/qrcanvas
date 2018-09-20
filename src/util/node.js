/* eslint-disable-next-line */
import Canvas from 'canvas';
import helpers from './helpers';
import effects from './effects';

helpers.createCanvas = createCanvas;
helpers.isCanvas = isCanvas;
helpers.isDrawable = isCanvas;
export { helpers, effects };

function createCanvas() {
  return new Canvas();
}

function isCanvas(el) {
  return el instanceof Canvas;
}
