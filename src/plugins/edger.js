import { getCanvas } from '../utils/index';
import { register } from './base';

// IE 9- does not support Uint8Array.
// `global` will be replaced by `window` when compiled for browsers.
const Uint8Array = global.Uint8Array;

/**
 * @desc Read image data from a canvas and find the edges of the image.
 */
function initBgData({ canvas, isBackgroundColor, margin }) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const total = width * height;
  const imageData = ctx.getImageData(0, 0, width, height);

  /**
   * Whether the pixel should be background taking margin into account.
   * 0 - not checked
   * 1 - background
   * 2 - edge of the image
   */
  const bgData = new Uint8Array(total);
  /**
   * Whether the pixel itself is a background color.
   * 0 - not checked
   * 1 - background
   * 2 - edge of the image
   */
  const pixelData = new Uint8Array(total);

  const queue = [];
  const slice = queue.slice;
  const isBgPixel = index => {
    let value = pixelData[index];
    if (!value) {
      const offset = index * 4;
      const colorArr = slice.call(imageData.data, offset, offset + 4);
      if (isBackgroundColor(colorArr)) {
        value = 1;
      } else {
        value = 2;
      }
      pixelData[index] = value;
    }
    return value === 1;
  };
  const checkSurroundings = index => {
    if (bgData[index]) return;
    const x0 = index % width;
    const y0 = (index / width) | 0;
    const R = margin + 1;
    for (let x = Math.max(0, x0 - R + 1); x < x0 + R && x < width; x += 1) {
      for (let y = Math.max(0, y0 - R + 1); y < y0 + R && y < height; y += 1) {
        const dx = x - x0;
        const dy = y - y0;
        if (dx * dx + dy * dy < R * R) {
          if (!isBgPixel(x + y * width)) {
            bgData[index] = 2;
            return;
          }
        }
      }
    }
    bgData[index] = 1;
    queue.push(index);
  };
  const checkRow = (index, excludeSelf) => {
    if (index % width) checkSurroundings(index - 1);
    if (!excludeSelf) checkSurroundings(index);
    if ((index + 1) % width) checkSurroundings(index + 1);
  };

  // BFS
  for (let i = 0; i < width; i += 1) {
    checkSurroundings(i);
    checkSurroundings(total - 1 - i);
  }
  for (let i = 0; i < height; i += 1) {
    checkSurroundings(i * width);
    checkSurroundings((i + 1) * width - 1);
  }
  let head = 0;
  while (head < queue.length) {
    const index = queue[head];
    if (index > width) checkRow(index - width);
    checkRow(index, true);
    if (index + width < total) checkRow(index + width);
    head += 1;
  }

  return bgData;
}

/**
 * @desc The callback to tell whether a pixel or an area is outside the edges.
 */
function bgChecker(bgData, width, height, level) {
  const isBackground = (...args) => {
    let index;
    if (args.length === 1) {
      [index] = args;
    } else if (args.length === 2) {
      const [x, y] = args;
      index = x + y * width;
    } else if (args.length === 4) {
      const [x0, y0, w, h] = args;
      const x1 = Math.max(0, x0);
      const y1 = Math.max(0, y0);
      const x2 = Math.min(width, x0 + w);
      const y2 = Math.min(height, y0 + h);
      for (let x = x1; x < x2; x += 1) {
        for (let y = y1; y < y2; y += 1) {
          if (!isBackground(x, y)) return false;
        }
      }
      return true;
    } else {
      throw Error('Invalid index');
    }
    if (level === 3) return false;
    return bgData[index] === 1;
  };
  return isBackground;
}

/**
 * @desc Clear the background so that the shadow can be filled with custom styles.
 */
function bgClearer(isBackground, width, height) {
  const total = width * height;
  const clearBackground = canvas => {
    if (canvas.width !== width || canvas.height !== height) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < total; i += 1) {
      if (isBackground(i)) {
        const offset = i * 4;
        imageData.data[offset] = 0;
        imageData.data[offset + 1] = 0;
        imageData.data[offset + 2] = 0;
        imageData.data[offset + 3] = 0;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };
  return clearBackground;
}

/**
* @desc Detect image edge based on canvas
*/
function getEdger({ canvas, margin = 0, level }) {
  /**
   * @desc The default isBackgroundColor callback to decide
   * whether a color is background by its Alpha value.
   */
  const isBackgroundColor = colorArr => !colorArr[3]; // alpha is 0

  const bgData = initBgData({ canvas, margin, isBackgroundColor });
  const { width, height } = canvas;
  const isBackground = bgChecker(bgData, width, height, level);
  const clearBackground = bgClearer(isBackground, width, height);

  return { isBackground, clearBackground };
}

/**
 * clearEdges:
 * - 0: do nothing
 * - 1: clear pixels covered by logo pixels
 * - 2: clear cells covered by logo pixels
 * - 3: clear a square area covered by logo image
 */
const plugin = qrcanvas => {
  const {
    events,
    options: { logo },
    qrdata: { count, cellSize },
  } = qrcanvas;
  let transclude = {};
  let edger;
  events.on('detectEdges', () => {
    edger = getEdger({
      canvas: logo.canvas,
      margin: logo.margin,
      level: logo.clearEdges,
    });

    // Clear cells broken by the logo (incomplete cells)
    if (logo.clearEdges > 1) {
      /**
       * Whether the cell is overlapped by logo.
       * 0 - partially or completely overlapped.
       * 1 - clear.
       */
      transclude = new Uint8Array(count * count);
      for (let i = 0; i < count; i += 1) {
        for (let j = 0; j < count; j += 1) {
          transclude[i * count + j] = edger.isBackground(
            j * cellSize - logo.x, i * cellSize - logo.y, cellSize, cellSize);
        }
      }
    }
  });
  events.on('clearLogo', ({ canvas }) => {
    if (!logo.clearEdges) return;
    if ((logo.image || logo.text) && logo.clearEdges === 1) {
      const canvasLogo = getCanvas(logo.width + 2 * logo.margin, logo.height + 2 * logo.margin);
      const ctxLogo = canvasLogo.getContext('2d');
      ctxLogo.fillStyle = 'white';
      ctxLogo.fillRect(0, 0, canvasLogo.width, canvasLogo.height);
      edger.clearBackground(canvasLogo);
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.drawImage(canvasLogo, logo.x, logo.y);
    }
  });
  qrcanvas.shouldTransclude = index => {
    if (logo.clearEdges > 1) return transclude[index];
    return true;
  };
};

register(plugin);
