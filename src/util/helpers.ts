import { COLOR_BLACK, COLOR_WHITE } from './consts';
import { QRCanvasLayerValue, QRCanvasDrawTextOptions } from '../types';

const cache = [];
const notImplemented: any = (...args: any[]) => {
  throw new Error('Not implemented');
};

const helpers = {
  createCanvas: notImplemented as () => any,
  isCanvas: notImplemented as (el) => boolean,
  isDrawable: notImplemented as (el) => boolean,
  getCanvas,
  cacheCanvas,
  drawCanvas,
  drawText,
};
export default helpers;

interface GetCanvasOptions {
  width?: number;
  height?: number;
  canvas?: any;
}

/**
 * @desc Create a new canvas.
 * @param {Int} width Width of the canvas.
 * @param {Int} height Height of the canvas.
 * @return {Canvas}
 */
function getCanvas({ width, height, canvas }: GetCanvasOptions = {}) {
  const rCanvas = canvas || helpers.createCanvas();
  if (width) {
    rCanvas.width = width;
    rCanvas.height = height == null ? width : height;
  }
  return rCanvas;
}

function cacheCanvas(...args) {
  cache.push(...args);
}

interface DrawCanvasOptions {
  cellSize?: number;
  context?: any;
  clear?: boolean;
}

/**
 * @desc Draw to the canvas with given image or colors.
 * @param {Canvas} canvas The canvas to initialize.
 * @param {Image | String | Array} data
 * @param {Object} options
 *    cellSize: {Int}
 *    clear: {Boolean}
 */
function drawCanvas(canvas, data: QRCanvasLayerValue, options: DrawCanvasOptions = {}) {
  const { cellSize, context, clear = true } = options;
  const { width, height } = canvas;
  let queue: QRCanvasLayerValue = [data];
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

function drawText(text, options: QRCanvasDrawTextOptions = {}) {
  const {
    fontSize = 64,
    fontStyle = '', // italic bold
    fontFamily = 'Cursive',
    color = null,
    pad = 8,
    padColor = COLOR_WHITE,
    // mode = 0: add outline with padColor to pixels
    // mode = 1: make a rect with padColor as background
    mode = 1,
  } = options || {};
  const canvas = getCanvas();
  const ctx = canvas.getContext('2d');
  let padColorArr;
  if (padColor) {
    ctx.fillStyle = padColor;
    ctx.fillRect(0, 0, 1, 1);
    ({ data: padColorArr } = ctx.getImageData(0, 0, 1, 1));
    if (!padColorArr[3]) padColorArr = null;
  }
  const height = fontSize + 2 * pad;
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
  const width = Math.ceil(ctx.measureText(text).width) + 2 * pad;
  canvas.width = width;
  canvas.height = height;
  resetContext();
  const fillText = () => {
    ctx.fillStyle = color || COLOR_BLACK;
    ctx.fillText(text, width / 2, height / 2);
  };
  if (mode === 1) {
    ctx.fillStyle = padColor;
    ctx.fillRect(0, 0, width, height);
    fillText();
  } else {
    fillText();
    if (padColorArr) {
      const imageData = ctx.getImageData(0, 0, width, height);
      const { data } = imageData;
      const total = width * height;
      const padded = [];
      let offset = 0;
      for (let loop = 0; loop < pad; loop += 1) {
        const current = [];
        const unique = {};
        padded[offset] = current;
        offset = 1 - offset;
        let last = padded[offset];
        if (!last) {
          last = [];
          for (let i = 0; i < total; i += 1) last.push(i);
        }
        last.forEach(i => {
          if (data[4 * i + 3]) {
            [
              i % width ? i - 1 : -1,
              (i + 1) % width ? i + 1 : -1,
              i - width,
              i + width,
            ].forEach(j => {
              const k = 4 * j;
              if (k >= 0 && k <= data.length && !unique[j]) {
                unique[j] = 1;
                current.push(j);
              }
            });
          }
        });
        current.forEach(i => {
          const j = 4 * i;
          if (!data[j + 3]) {
            for (let k = 0; k < 4; k += 1) {
              data[j + k] = padColorArr[k];
            }
          }
        });
      }
      ctx.putImageData(imageData, 0, 0);
    }
  }
  return canvas;
}
