export function createCanvas() {
  return document.createElement('canvas');
}

export function isDrawable(el) {
  return el instanceof HTMLElement;
}
