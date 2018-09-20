import qrcode from 'qrcode-generator';
import helpers from '../util/helpers';
import effects from '../util/effects';

// Enable UTF_8 support
qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];

const DEFAULT_PROPS = {
  typeNumber: 0,
  correctLevel: 'L',
  data: '',
};

export default class QRCanvasRenderer {
  options = { ...DEFAULT_PROPS };

  cache = {};

  constructor(options) {
    this.setOptions(options);
  }

  setOptions(options) {
    this.options = {
      ...this.options,
      ...options,
    };
    let { effect } = this.options;
    if (typeof effect === 'string') {
      effect = { type: effect };
    }
    this.options.effect = effect || {};
    const {
      typeNumber, correctLevel, data,
    } = this.options;
    const qr = qrcode(typeNumber, correctLevel);
    qr.addData(data || '');
    qr.make();
    const count = qr.getModuleCount();
    this.cache = {
      qr,
      count,
    };
  }

  render(canvas, config = {}) {
    const {
      background = 'white',
      foreground = 'black',
      effect,
    } = this.options;
    const onRender = effects[effect.type] || effects.default;
    const {
      count,
    } = this.cache;
    const { getCanvas, drawCanvas, cacheCanvas } = helpers;
    let { size } = config;
    let canvasOut;
    let canvasBg;
    let canvasFg;
    // Prepare output canvas, resize it if cellSize or size is provided.
    {
      let { cellSize } = config;
      if (!canvas && !cellSize && !size) cellSize = 6;
      if (cellSize) size = count * cellSize;
      if (size) {
        canvasOut = getCanvas({ canvas, width: size });
      } else {
        size = canvas.width;
        canvasOut = canvas;
      }
    }
    // Create foreground and background layers on canvas
    {
      const cellSize = Math.ceil(size / count);
      const width = cellSize * count;
      canvasBg = getCanvas({ width });
      drawCanvas(canvasBg, background, { cellSize });
      canvasFg = onRender({
        foreground,
        cellSize,
        isDark: this.isDark,
        ...this.cache,
      }, this.options.effect);
    }
    // Combine the layers
    drawCanvas(canvasOut, [
      { image: canvasBg },
      { image: canvasFg },
    ], { clear: true });
    cacheCanvas(canvasBg, canvasFg);
  }

  isDark = (i, j) => {
    const { qr, count } = this.cache;
    if (i < 0 || i >= count || j < 0 || j >= count) return false;
    return qr.isDark(i, j);
  }
}
