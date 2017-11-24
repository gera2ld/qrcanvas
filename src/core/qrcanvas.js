import qrcode from 'qrcode-generator';
import EventEmitter from './events';
import { variables, effects, plugins } from './config';

const defaultOptions = () => ({
  // typeNumber belongs to 1..40
  // otherwise it will be increased to the smallest valid number
  typeNumber: 0,

  // correctLevel can be 'L', 'M', 'Q' or 'H'
  correctLevel: 'L',

  // cellSize is preferred to size
  // if none is provided, use default values below
  // * cellSize: 2,
  // * size: cellSize * count,

  // foreground and background may be an image or a style string
  // or an array of objects with attributes below:
  // * row | x: default 0
  // * col | y: default 0
  // * cols | width: default size
  // * rows | height: default size
  // * style: default 'black'
  foreground: variables.colorDark,
  background: null,

  // data MUST be a string
  data: '',

  // effect: an object with optional key and value
  // - {key: 'round', value: 0-1}
  // - {key: 'liquid', value: 0-1}
  // - {key: 'image', value: 0-1}
  effect: {},

  // Avoid transparent pixels
  noAlpha: true,

  // Null or a canvas to be reused
  reuseCanvas: null,

  /**
   * an image or text can be used as a logo
   * logo: {
   *   // image
   *   image: Image,

   *   // text
   *   text: string,
   *   color: string, default 'black'
   *   fontStyle: string, e.g. 'italic bold'
   *   fontFamily: string, default 'Cursive'

   *   // common
   *   clearEdges: number, default 0
   *       0 - not clear, just margin
   *       1 - clear incomplete cells
   *       2 - clear a larger rectangle area
   *   margin: number, default 2 for text and 0 for image
   *   size: float, default .15 stands for 15% of the QRCode
   * }
   */
  // logo: {},
});

const defaultLogoOptions = () => ({
  color: variables.colorDark,
  fontFamily: 'Cursive',
  clearEdges: 0,
  margin: -1,
  size: 0.15,
});

export default class QRCanvas {
  constructor(options) {
    this.events = new EventEmitter();
    QRCanvas.plugins.forEach(plugin => plugin(this));
    this.setData(options || {});
  }

  setData(userOptions) {
    const options = {
      ...defaultOptions(),
      ...userOptions,
      effect: {
        ...userOptions.effect,
      },
    };
    if (userOptions.logo && (userOptions.logo.image || userOptions.logo.text)) {
      const logo = {
        ...defaultLogoOptions(),
        ...userOptions.logo,
      };
      if (logo.margin < 0) logo.margin = logo.image ? 0 : 2;
      options.logo = logo;
    } else {
      options.logo = {};
    }
    if (options.logo.text || options.logo.image || options.effect.key === 'image') {
      options.correctLevel = 'H';
    }
    if (!options.cellSize && !options.size) {
      options.cellSize = 2;
    }
    this.options = options;
    this.makeQR();
    this.initLogo();
  }

  makeQR() {
    const { typeNumber, correctLevel, data } = this.options;
    const qr = qrcode(typeNumber, correctLevel);
    qr.addData(data || '');
    qr.make();
    const count = qr.getModuleCount();
    let { cellSize, size } = this.options;
    if (cellSize) {
      size = cellSize * count;
    } else {
      cellSize = size / count;
    }
    this.qrdata = {
      cellSize,
      size,
      count,
      qr,
    };
  }

  isDark = (i, j) => {
    const { count, qr } = this.qrdata;
    return i >= 0 && i < count && j >= 0 && j < count
    && this.shouldTransclude(i + j * count)
    && qr.isDark(i, j);
  }

  /**
   * @desc Whether a cell should be transcluded by the foreground image.
   */
  shouldTransclude(index) { return true; }  // eslint-disable-line

  /**
   * @desc Initialize logo data, find out the proper width and height and draw
   * it to a canvas for later use.
   */
  initLogo() {
    const { logo } = this.options;
    const { count, cellSize, size } = this.qrdata;
    let width;
    let height;
    const normalize = () => {
      const k = width / height;
      const margin2 = 2 * logo.margin;
      let iHeight = Math.min(
        Math.sqrt(Math.min(
          (width + margin2) * (height + margin2) / size / size,
          logo.size,
        ) / k) * count,
        count / k,
      ) | 0;
      let iWidth = (k * iHeight) | 0;
      // (count - [iWidth | iHeight]) must be even if the logo is in the middle
      if ((count - iWidth) % 2) iWidth -= 1;
      if ((count - iHeight) % 2) iHeight -= 1;

      const kl = Math.min(
        (iHeight * cellSize - margin2) / height,
        (iWidth * cellSize - margin2) / width,
        1,
      );
      logo.width = (kl * width) | 0;
      logo.height = (kl * height) | 0;
      logo.x = ((size - logo.width) >> 1) - logo.margin;
      logo.y = ((size - logo.height) >> 1) - logo.margin;
      logo.canvas = QRCanvas.getCanvas(logo.width + 2 * logo.margin, logo.height + 2 * logo.margin);
    };
    if (logo.image) {
      const { image } = logo;
      width = image.naturalWidth || image.width;
      height = image.naturalHeight || image.height;
      normalize();
      const ctx = logo.canvas.getContext('2d');
      ctx.drawImage(logo.image, logo.margin, logo.margin, logo.width, logo.height);
    } else if (logo.text) {
      // get text width/height radio by assuming fontHeight=100px
      height = 100;
      const font = [
        logo.fontStyle,
        `${height}px`,
        logo.fontFamily,
      ].filter(Boolean).join(' ');
      ({ width } = QRCanvas.measureText(logo.text, font));
      normalize();
      const ctx = logo.canvas.getContext('2d');
      ctx.font = [
        logo.fontStyle,
        `${logo.height}px`,
        logo.fontFamily,
      ].filter(Boolean).join(' ');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = logo.color;
      ctx.fillText(logo.text, (logo.width >> 1) + logo.margin, (logo.height >> 1) + logo.margin);
    } else {
      return;
    }
    this.events.emit('detectEdges');
  }

  draw() {
    const { count, cellSize, size } = this.qrdata;
    const {
      foreground, background, noAlpha, logo, reuseCanvas,
    } = this.options;
    const iCellSize = Math.ceil(cellSize);
    const iSize = iCellSize * count;
    const canvas = QRCanvas.getCanvas(iSize);
    const contextData = {
      count,
      canvas,
      context: canvas.getContext('2d'),
      cellSize: iCellSize,
      size: iSize,
      colorDark: variables.colorDark,
      isDark: this.isDark,
      effect: effects[this.options.effect.key] || effects.default,
      options: this.options,
    };
    this.drawCells(contextData);

    // Allow plugins to clear some cells before drawing logo
    this.events.emit('clearLogo', contextData);

    // Draw foreground image within dark cells
    const canvasFore = this.getForegroundArea(contextData, foreground);
    const ctxFore = canvasFore.getContext('2d');
    ctxFore.globalCompositeOperation = 'destination-in';
    ctxFore.drawImage(contextData.canvas, 0, 0);

    // 1. Draw white backgroud layer for non-transparent QR image
    // 2. Draw background layer according to options
    // 3. Draw foreground image with QRCode data
    // 4. Draw logo
    const canvasComplex = QRCanvas.drawCanvas(QRCanvas.getCanvas(iSize), {
      cellSize: iCellSize,
      size: iSize,
      data: [
        noAlpha && variables.colorLight,
        background,
        canvasFore,
        logo.canvas && {
          image: logo.canvas,
          x: logo.x,
          y: logo.y,
          width: logo.width + 2 * logo.margin,
          height: logo.height + 2 * logo.margin,
        },
      ].filter(Boolean),
    });

    // Stretch canvas if size is not equal to iSize
    let canvasTarget = reuseCanvas;
    if (canvasTarget) {
      canvasTarget.width = size;
      canvasTarget.height = size;
    } else if (size !== iSize) {
      canvasTarget = QRCanvas.getCanvas(size, size);
    }
    if (canvasTarget) {
      const ctx = canvasTarget.getContext('2d');
      ctx.drawImage(canvasComplex, 0, 0, size, size);
    } else {
      canvasTarget = canvasComplex;
    }
    return canvasTarget;
  }

  drawCells(contextData) { // eslint-disable-line class-methods-use-this
    const { effect } = contextData;
    effect.data(contextData);
  }

  /**
   * @desc Create a canvas with original foreground image.
   * The image will be shown only within dark cells at last.
   */
  getForegroundArea(contextData, data) {
    const { cellSize, size, effect } = contextData;
    if (effect.foreground) {
      return effect.foreground({
        ...contextData,
        mask: () => {
          const canvas = QRCanvas.getCanvas(size);
          const defaultEffect = effects.default;
          this.drawCells({
            ...contextData,
            canvas,
            context: canvas.getContext('2d'),
            colorDark: 'black',
            effect: defaultEffect,
          });
          return canvas;
        },
      });
    }
    return QRCanvas.drawCanvas(QRCanvas.getCanvas(size), {
      cellSize,
      size,
      data,
    });
  }
}

QRCanvas.variables = variables;
QRCanvas.effects = effects;
QRCanvas.plugins = plugins;
