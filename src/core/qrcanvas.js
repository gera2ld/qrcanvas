import qrcode from 'qrcode-generator';
import EventEmitter from './events';
import { variables, effects, plugins } from './config';

const defaultOptions = () => ({
  // typeNumber belongs to 1..40
  // otherwise it will be increased to the smallest valid number
  typeNumber: 0,

  // correctLevel can be 'L', 'M', 'Q' or 'H'
  correctLevel: 'L',

  // size of each cell in pixel
  cellSize: 2,

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
   *   clearEdges: number 0-3, default 0
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
    this.cache = {};
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
    this.options = options;
  }

  makeAll() {
    this.makeQR();
    this.makeBackground();
    this.makeLogo();
    this.makeForeground();
    this.make();
  }

  makeQR() {
    const {
      typeNumber, correctLevel, data, cellSize,
    } = this.options;
    const qr = qrcode(typeNumber, correctLevel);
    qr.addData(data || '');
    qr.make();
    const count = qr.getModuleCount();
    this.qrdata = {
      cellSize,
      count,
      qr,
      size: count * cellSize,
    };
  }

  makeBackground() {
    const { noAlpha, background } = this.options;
    this.cache.background = [
      noAlpha && variables.colorLight,
      background,
    ];
  }

  makeForeground() {
    const { foreground, effect } = this.options;
    const { cellSize, size } = this.qrdata;
    const effectInfo = effect && effects[effect.key] || effects.default;
    QRCanvas.cacheCanvas(this.cache.foreground);
    this.cache.foreground = (effectInfo.scenes || [{}]).map(scene => {
      const mask = QRCanvas.getCanvas({ width: size });
      effectInfo.draw({
        effect,
        canvas: mask,
        isDark: this.isDark,
        qrdata: this.qrdata,
        context: mask.getContext('2d'),
        colorDark: 'black',
        ...applyConfig(scene.configMask, this.options),
      });
      const canvas = QRCanvas.drawCanvas(
        QRCanvas.getCanvas({ width: size }),
        {
          cellSize,
          data: foreground,
          ...applyConfig(scene.configScene, this.options),
        },
      );
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mask, 0, 0);
      QRCanvas.cacheCanvas(mask);
      this.events.emit('clearLogo', canvas);
      return canvas;
    });
  }

  /**
   * @desc Initialize logo data, find out the proper width and height and draw
   * it to a canvas for later use.
   */
  makeLogo() {
    const { logo } = this.options;
    const { count, cellSize, size } = this.qrdata;
    let width;
    let height;
    let canvas = this.cache.logo && this.cache.logo.image;
    if (canvas) {
      QRCanvas.cacheCanvas(canvas);
      canvas = null;
    }
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
      canvas = QRCanvas.getCanvas({
        width: logo.width + 2 * logo.margin,
        height: logo.height + 2 * logo.margin,
      });
    };
    if (logo.image) {
      const { image } = logo;
      width = image.naturalWidth || image.width;
      height = image.naturalHeight || image.height;
      normalize();
      const ctx = canvas.getContext('2d');
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
      const ctx = canvas.getContext('2d');
      ctx.font = [
        logo.fontStyle,
        `${logo.height}px`,
        logo.fontFamily,
      ].filter(Boolean).join(' ');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = logo.color;
      ctx.fillText(logo.text, (logo.width >> 1) + logo.margin, (logo.height >> 1) + logo.margin);
    }
    if (canvas) {
      this.events.emit('detectEdges', canvas);
    }
    this.cache.logo = canvas && {
      image: canvas,
      x: logo.x,
      y: logo.y,
      width: logo.width + 2 * logo.margin,
      height: logo.height + 2 * logo.margin,
    };
  }

  make() {
    const { cellSize, size } = this.qrdata;
    const { background, foreground, logo } = this.cache;
    QRCanvas.cacheCanvas(this.cache.result);
    const canvas = QRCanvas.drawCanvas(
      QRCanvas.getCanvas({ width: size }),
      {
        cellSize,
        data: [
          background,
          foreground,
          logo,
        ],
      },
    );
    this.cache.result = canvas;
  }

  output({ size, canvas } = {}) {
    const { size: iSize } = this.qrdata;
    const computedSize = size || iSize;
    const outputCanvas = QRCanvas.getCanvas({ canvas, width: computedSize });
    const ctx = outputCanvas.getContext('2d');
    ctx.drawImage(this.cache.result, 0, 0, computedSize, computedSize);
    return outputCanvas;
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
}

function applyConfig(config, options) {
  if (typeof config === 'function') return config(options);
  return config;
}

QRCanvas.variables = variables;
QRCanvas.effects = effects;
QRCanvas.plugins = plugins;
