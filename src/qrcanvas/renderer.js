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
    this.normalizeEffect();
    this.normalizeLogo();
    const { typeNumber, data, logo } = this.options;
    // L / M / Q / H
    let { correctLevel } = this.options;
    if (logo && ['Q', 'H'].indexOf(correctLevel) < 0) correctLevel = 'H';
    const qr = qrcode(typeNumber, correctLevel);
    qr.addData(data || '');
    qr.make();
    const count = qr.getModuleCount();
    this.cache = {
      qr,
      count,
    };
  }

  normalizeEffect() {
    let { effect } = this.options;
    if (typeof effect === 'string') {
      effect = { type: effect };
    }
    this.options.effect = effect || {};
  }

  normalizeLogo() {
    const { isDrawable } = helpers;
    let { logo } = this.options;
    if (logo) {
      if (isDrawable(logo)) {
        logo = { image: logo };
      } else if (!isDrawable(logo.image)) {
        logo = null;
      }
    }
    this.options.logo = logo;
  }

  render(canvas, config = {}) {
    const {
      background = 'white',
      foreground = 'black',
      effect,
      logo,
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
    let logoLayer;
    if (logo) {
      logoLayer = { ...logo };
      if (!logo.w && !logo.h && !logo.cols && !logo.rows) {
        const logoRatio = Math.min((count - 18) / count, 0.38);
        const { width, height } = logo.image;
        const ratio = width / height;
        const maxSize = size * logoRatio;
        const w = Math.min(maxSize, maxSize * ratio);
        const h = Math.min(maxSize, maxSize / ratio);
        const x = (size - w) / 2;
        const y = (size - h) / 2;
        logoLayer.w = w;
        logoLayer.h = h;
        logoLayer.x = x;
        logoLayer.y = y;
      }
    }
    // Combine the layers
    drawCanvas(canvasOut, [
      { image: canvasBg },
      { image: canvasFg },
      logoLayer,
    ].filter(Boolean), { clear: true });
    cacheCanvas(canvasBg, canvasFg);
    return canvasOut;
  }

  isDark = (i, j) => {
    const { qr, count } = this.cache;
    if (i < 0 || i >= count || j < 0 || j >= count) return false;
    return qr.isDark(i, j);
  }
}
