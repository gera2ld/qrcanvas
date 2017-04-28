import { createCanvas, isDrawable } from './node';

/**
 * @desc Create a new canvas.
 * @param {Int} width Width of the canvas.
 * @param {Int} height Height of the canvas.
 * @return {Canvas}
 */
export function getCanvas(width, height) {
  const canvas = createCanvas();
  canvas.width = width;
  canvas.height = height == null ? width : height;
  return canvas;
}

/**
 * @desc Draw to the canvas with given image or colors.
 * @param {Canvas} canvas The canvas to initialize.
 * @param {Object} options
 *    data: {Image} or {String} or {Array}
 *    size: {Int}
 *    cellSize: {Int}
 */
export function drawCanvas(canvas, options) {
  const { data, cellSize, size } = options;
  let queue = [data];
  while (queue.length) {
    const item = queue.shift();
    if (Array.isArray(item)) {
      queue = item.concat(queue);
    } else if (item) {
      const ctx = canvas.getContext('2d');
      let obj;
      if (isDrawable(item)) {
        obj = { image: item };
      } else if (typeof item === 'string') {
        obj = { style: item };
      } else {
        obj = item;
      }
      let x = (('col' in obj) ? obj.col * cellSize : obj.x) || 0;
      let y = (('row' in obj) ? obj.row * cellSize : obj.y) || 0;
      if (x < 0) x += size;
      if (y < 0) y += size;
      const w = (('cols' in obj) ? obj.cols * cellSize : obj.width) || size;
      const h = (('rows' in obj) ? obj.rows * cellSize : obj.height) || size;
      if (obj.image) {
        ctx.drawImage(item, x, y, w, h);
      } else {
        ctx.fillStyle = obj.style || 'black';
        ctx.fillRect(x, y, w, h);
      }
    }
  }
  return canvas;
}

let canvasText;
export function measureText(text, font) {
  if (!canvasText) canvasText = getCanvas(100);
  const ctx = canvasText.getContext('2d');
  ctx.font = font;
  return ctx.measureText(text);
}

export function drawCells({ cellSize, count }, drawEach) {
  for (let i = 0; i < count; i += 1) {
    for (let j = 0; j < count; j += 1) {
      const x = i * cellSize;
      const y = j * cellSize;
      drawEach({ i, j, x, y });
    }
  }
}
