import qrcode from 'qrcode-generator';
import helpers from '../util/helpers';
import effects from '../util/effects';

// Enable UTF_8 support
qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];

const DEFAULTS: QRCanvasOptions = {
  typeNumber: 0,
  correctLevel: 'L',
  data: '',
};

interface QRCanvasRendererCache {
  qr?: any;
  count?: number;
}

export default class QRCanvasRenderer {
  private options: QRCanvasOptions = { ...DEFAULTS };

  private cache: QRCanvasRendererCache = {};

  constructor(options) {
    this.setOptions(options);
  }

  public render(canvas, config: QRCanvasRenderConfig = {}) {
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
      const sketchSize = cellSize * count;
      canvasBg = getCanvas({ width: cellSize * count });
      drawCanvas(canvasBg, background, { cellSize });
      canvasFg = onRender({
        foreground,
        cellSize,
        isDark: this.isDark,
        ...this.cache,
      }, this.options.effect);
      // draw logo
      if (logo) {
        const logoLayer: QRCanvasLayer = { ...logo };
        if (!logo.w && !logo.h && !logo.cols && !logo.rows) {
          const { width, height } = logo.image;
          const imageRatio = width / height;
          const posRatio = Math.min((count - 18) / count, 0.38);
          const h = Math.min(
            sketchSize * posRatio,
            sketchSize * posRatio / imageRatio,
          );
          const w = h * imageRatio;
          const x = (sketchSize - w) / 2;
          const y = (sketchSize - h) / 2;
          logoLayer.w = w;
          logoLayer.h = h;
          logoLayer.x = x;
          logoLayer.y = y;
        }
        drawCanvas(canvasFg, logoLayer, { clear: false });
      }
    }
    // Combine the layers
    drawCanvas(canvasOut, [
      { image: canvasBg },
      { image: canvasFg },
    ]);
    cacheCanvas(canvasBg, canvasFg);
    return canvasOut;
  }

  private setOptions(options) {
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

  private normalizeEffect() {
    let { effect } = this.options;
    if (typeof effect === 'string') {
      effect = { type: effect };
    }
    this.options.effect = effect || {};
  }

  private normalizeLogo() {
    const { isDrawable, drawText } = helpers;
    let { logo } = this.options;
    if (logo) {
      if (isDrawable(logo)) {
        logo = { image: logo };
      } else if (!isDrawable(logo.image)) {
        if (typeof logo === 'string') {
          logo = { text: logo };
        }
        if (typeof logo.text === 'string') {
          logo = { image: drawText(logo.text, logo.options) };
        } else {
          logo = null;
        }
      }
    }
    this.options.logo = logo;
  }

  private isDark = (i, j) => {
    const { qr, count } = this.cache;
    if (i < 0 || i >= count || j < 0 || j >= count) return false;
    return qr.isDark(i, j);
  }
}
