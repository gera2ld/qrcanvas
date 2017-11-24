import QRCanvas from './qrcanvas';

const cache = [];

/**
 * @desc Create a new canvas.
 * @param {Int} width Width of the canvas.
 * @param {Int} height Height of the canvas.
 * @return {Canvas}
 */
function getCanvas({ width, height, canvas }) {
  const rCanvas = canvas || cache.pop() || QRCanvas.createCanvas();
  rCanvas.width = width;
  rCanvas.height = height == null ? width : height;
  return rCanvas;
}

function cacheCanvas(canvas) {
  if (Array.isArray(canvas)) cache.push(...canvas);
  else if (QRCanvas.isCanvas(canvas)) cache.push(canvas);
}

/**
 * @desc Draw to the canvas with given image or colors.
 * @param {Canvas} canvas The canvas to initialize.
 * @param {Object} options
 *    data: {Image} or {String} or {Array}
 *    cellSize: {Int}
 */
function drawCanvas(canvas, options) {
  const { data, cellSize, clear } = options;
  const size = canvas.width;
  let queue = [data];
  const ctx = canvas.getContext('2d');
  if (clear) ctx.clearRect(0, 0, canvas.width, canvas.height);
  while (queue.length) {
    const item = queue.shift();
    if (Array.isArray(item)) {
      queue = item.concat(queue);
    } else if (item) {
      let obj;
      if (QRCanvas.isDrawable(item)) {
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
        ctx.drawImage(obj.image, x, y, w, h);
      } else {
        ctx.fillStyle = obj.style || 'black';
        ctx.fillRect(x, y, w, h);
      }
    }
  }
  return canvas;
}

let canvasText;
function measureText(text, font) {
  if (!canvasText) canvasText = getCanvas({ width: 100 });
  const ctx = canvasText.getContext('2d');
  ctx.font = font;
  return ctx.measureText(text);
}

QRCanvas.getCanvas = getCanvas;
QRCanvas.cacheCanvas = cacheCanvas;
QRCanvas.drawCanvas = drawCanvas;
QRCanvas.measureText = measureText;
