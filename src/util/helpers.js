import { COLOR_BLACK, COLOR_WHITE } from './consts';

const cache = [];
const notImplemented = () => {
  throw new Error('Not implemented');
};
const helpers = {
  createCanvas: notImplemented,
  isCanvas: notImplemented,
  isDrawable: notImplemented,
  getCanvas,
  cacheCanvas,
  drawCanvas,
  drawText,
};
export default helpers;

/**
 * @desc Create a new canvas.
 * @param {Int} width Width of the canvas.
 * @param {Int} height Height of the canvas.
 * @return {Canvas}
 */
function getCanvas({ width, height, canvas } = {}) {
  const rCanvas = canvas || cache.pop() || helpers.createCanvas();
  if (width) {
    rCanvas.width = width;
    rCanvas.height = height == null ? width : height;
  }
  return rCanvas;
}

function cacheCanvas(...args) {
  cache.push(...args);
}

/**
 * @desc Draw to the canvas with given image or colors.
 * @param {Canvas} canvas The canvas to initialize.
 * @param {Image | String | Array} data
 * @param {Object} options
 *    cellSize: {Int}
 *    clear: {Boolean}
 */
function drawCanvas(canvas, data, options) {
  const { cellSize, context, clear = true } = options || {};
  const { width, height } = canvas;
  let queue = [data];
  const ctx = context || canvas.getContext('2d');
  if (clear) ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
  while (queue.length) {
    const item = queue.shift();
    if (Array.isArray(item)) {
      queue = item.concat(queue);
    } else if (item) {
      let obj;
      if (helpers.isDrawable(item)) {
        obj = { image: item };
      } else if (typeof item === 'string') {
        obj = { style: item };
      } else {
        obj = item;
      }
      let x = ('col' in obj ? obj.col * cellSize : obj.x) || 0;
      let y = ('row' in obj ? obj.row * cellSize : obj.y) || 0;
      if (x < 0) x += width;
      if (y < 0) y += width;
      const w = ('cols' in obj ? obj.cols * cellSize : obj.w) || width;
      const h = ('rows' in obj ? obj.rows * cellSize : obj.h) || width;
      if (obj.image) {
        ctx.drawImage(obj.image, x, y, w, h);
      } else {
        ctx.fillStyle = obj.style || 'black';
        ctx.fillRect(x, y, w, h);
      }
    }
  }
  return canvas;
}

function drawText(text, options) {
  const {
    fontSize = 32,
    fontStyle = '', // italic bold
    fontFamily = 'Cursive',
    paddingX = 8,
    paddingY = 8,
    color,
    background = COLOR_WHITE,
  } = options || {};
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  const height = fontSize + 2 * paddingY;
  const font = [
    fontStyle,
    `${fontSize}px`,
    fontFamily,
  ].filter(Boolean).join(' ');
  const resetContext = () => {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = font;
  };
  resetContext();
  const width = ctx.measureText(text).width + 2 * paddingX;
  canvas.width = width;
  canvas.height = height;
  resetContext();
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.fillStyle = color || COLOR_BLACK;
  ctx.fillText(text, width / 2, height / 2);
  return canvas;
}
