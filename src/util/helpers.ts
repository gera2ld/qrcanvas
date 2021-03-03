import { COLOR_BLACK, COLOR_WHITE } from './consts';
import {
  QRCanvasLayerValue, QRCanvasDrawTextOptions, QRCanvasLayer, QRCanvasImageLayer, QRCanvasFillLayer,
} from '../types';

const helpers = {
  createCanvas,
  isCanvas,
  isDrawable,
  getCanvas,
  updateCanvas,
  drawCanvas,
  drawText,
};
export type QRCanvasHelpers = typeof helpers;
export default helpers;

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function isCanvas(el: QRCanvasLayerValue): boolean {
  return el instanceof HTMLCanvasElement;
}

function isDrawable(el: QRCanvasLayerValue): boolean {
  return isCanvas(el) || el instanceof HTMLImageElement;
}

function getCanvas(width: number, height?: number): HTMLCanvasElement {
  return helpers.createCanvas(width, height == null ? width : height);
}

function updateCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height?: number,
): HTMLCanvasElement {
  if (canvas) {
    canvas.width = width;
    canvas.height = height == null ? width : height;
    return canvas;
  }
  return getCanvas(width, height);
}

interface DrawCanvasOptions {
  cellSize?: number;
  context?: any;
  clear?: boolean;
}

/**
 * Paint to a canvas with given image or colors.
 * @param canvas The canvas to paint.
 */
function drawCanvas(
  canvas: HTMLCanvasElement,
  data: QRCanvasLayerValue,
  options: DrawCanvasOptions = {},
): HTMLCanvasElement {
  const { cellSize, context, clear = true } = options;
  const { width, height } = canvas;
  let queue: QRCanvasLayerValue[] = [data];
  const ctx = context || canvas.getContext('2d');
  if (clear) ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'source-over';
  while (queue.length) {
    const item = queue.shift();
    if (Array.isArray(item)) {
      queue = item.concat(queue);
    } else if (item) {
      let obj: QRCanvasLayer;
      if (helpers.isDrawable(item)) {
        obj = { image: item as CanvasImageSource };
      } else if (typeof item === 'string') {
        obj = { style: item };
      } else {
        obj = item as QRCanvasLayer;
      }
      let x = (obj.col == null ? obj.x : obj.col * cellSize) || 0;
      let y = (obj.row == null ? obj.y : obj.row * cellSize) || 0;
      if (x < 0) x += width;
      if (y < 0) y += width;
      const w = ('cols' in obj ? obj.cols * cellSize : obj.w) || width;
      const h = ('rows' in obj ? obj.rows * cellSize : obj.h) || width;
      if ((obj as QRCanvasImageLayer).image) {
        ctx.drawImage((obj as QRCanvasImageLayer).image, x, y, w, h);
      } else if ((obj as QRCanvasFillLayer).style) {
        ctx.fillStyle = (obj as QRCanvasFillLayer).style || 'black';
        ctx.fillRect(x, y, w, h);
      }
    }
  }
  return canvas;
}

function drawText(text: string, options?: QRCanvasDrawTextOptions): HTMLCanvasElement {
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
  const canvas = getCanvas(1);
  const ctx = canvas.getContext('2d');
  let padColorArr: Uint8ClampedArray;
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
  const resetContext = (): void => {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = font;
  };
  resetContext();
  const width = Math.ceil(ctx.measureText(text).width) + 2 * pad;
  canvas.width = width;
  canvas.height = height;
  resetContext();
  const fillText = (): void => {
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
