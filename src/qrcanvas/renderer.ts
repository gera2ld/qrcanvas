import qrcode from 'qrcode-generator';
import helpers from '../util/helpers';
import effects from '../util/effects';
import {
  QRCanvasOptions, QRCanvasRenderConfig, QRCanvasTextLayer, QRCanvasImageLayer, QRCanvasLayerValue,
} from '../types';

// Enable UTF_8 support
qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];

const DEFAULTS: QRCanvasOptions = {
  background: 'white',
  foreground: 'black',
  typeNumber: 0,
  correctLevel: 'L',
  data: '',
  padding: 0,
  resize: true,
};

interface QRCanvasRendererCache {
  qr?: ReturnType<typeof qrcode>;
  count?: number;
}

export default class QRCanvasRenderer {
  private options: QRCanvasOptions = { ...DEFAULTS };

  private cache: QRCanvasRendererCache = {};

  private logo?: QRCanvasImageLayer;

  constructor(options: Partial<QRCanvasOptions>) {
    this.setOptions(options);
  }

  public render(canvas: HTMLCanvasElement | undefined, config: QRCanvasRenderConfig = {}) {
    const {
      background,
      foreground,
      padding,
      effect,
      resize,
    } = this.options;
    const onRender = effects[effect.type] || effects.default;
    const {
      count,
    } = this.cache;
    const { drawCanvas } = helpers;
    let { size } = config;
    let canvasOut: HTMLCanvasElement;
    let canvasBg: HTMLCanvasElement;
    let canvasFg: HTMLCanvasElement;
    // Prepare output canvas, resize it if cellSize or size is provided.
    {
      let { cellSize } = config;
      if (!canvas && !cellSize && !size) cellSize = 6;
      if (cellSize) size = count * cellSize + padding + padding;
      if (size) {
        canvasOut = resize || !canvas ? helpers.updateCanvas(canvas, size) : canvas;
      } else {
        size = canvas.width;
        canvasOut = canvas;
      }
    }
    const contentSize = size - padding - padding;
    // Create foreground and background layers on canvas
    {
      const cellSize = Math.ceil(contentSize / count);
      const sketchSize = cellSize * count;
      canvasBg = helpers.getCanvas(cellSize * count);
      drawCanvas(canvasBg, background, { cellSize });
      canvasFg = onRender({
        foreground,
        cellSize,
        isDark: this.isDark,
        ...this.cache,
      }, this.options.effect);
      // draw logo
      if (this.logo) {
        const logo: QRCanvasImageLayer = { ...this.logo };
        if (!logo.w && !logo.h && !logo.cols && !logo.rows) {
          const { width, height } = logo.image as { width: number; height: number };
          const imageRatio = width / height;
          const posRatio = Math.min((count - 18) / count, 0.38);
          const h = Math.min(
            height,
            sketchSize * posRatio,
            sketchSize * posRatio / imageRatio,
          );
          const w = h * imageRatio;
          const x = (sketchSize - w) / 2;
          const y = (sketchSize - h) / 2;
          logo.w = w;
          logo.h = h;
          logo.x = x;
          logo.y = y;
        }
        drawCanvas(canvasFg, logo, { clear: false });
      }
    }
    // Combine the layers
    drawCanvas(canvasOut, [
      { image: canvasBg },
      {
        image: canvasFg,
        x: padding,
        y: padding,
        w: contentSize,
        h: contentSize,
      },
    ]);
    return canvasOut;
  }

  private setOptions(options: Partial<QRCanvasOptions>) {
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
    const { logo } = this.options;
    if (logo) {
      if (isDrawable(logo as QRCanvasLayerValue)) {
        this.logo = { image: logo as CanvasImageSource };
      } else if ((logo as QRCanvasImageLayer).image) {
        this.logo = logo as QRCanvasImageLayer;
      } else {
        let textLogo: QRCanvasTextLayer;
        if (typeof logo === 'string') {
          textLogo = { text: logo };
        } else if ((logo as QRCanvasTextLayer).text) {
          textLogo = logo as QRCanvasTextLayer;
        }
        if (textLogo?.text) {
          this.logo = { image: drawText(textLogo.text, textLogo.options) };
        } else {
          this.logo = null;
        }
      }
    }
  }

  private isDark = (i: number, j: number) => {
    const { qr, count } = this.cache;
    if (i < 0 || i >= count || j < 0 || j >= count) return false;
    return qr.isDark(i, j);
  };
}
