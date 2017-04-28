import Canvas from 'canvas';  // eslint-disable-line

export function createCanvas() {
  return new Canvas();
}

export function isDrawable(el) {
  return el instanceof Canvas;
}
