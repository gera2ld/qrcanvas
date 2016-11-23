/**
 * JSQRGen: QRCode Canvas Renderer
 * @author Gerald <i@gerald.top>
 * @license MIT
 */

var utils = function () {
  var createCanvas, isDrawable;
  if (process.env.BROWSER) {
    createCanvas = function () {return document.createElement('canvas');};
    isDrawable = function (e) {return e instanceof HTMLElement;};
  } else {
    var Canvas = require('canvas');
    createCanvas = function () {return new Canvas;};
    isDrawable = function (e) {return e instanceof Canvas;};
  }
  return {
    isDrawable: isDrawable,
    getCanvas: getCanvas,
    drawCanvas: drawCanvas,
    forEach: forEach,
    assign: assign,
    merge: merge,
  };

  /**
   * @desc Create a new canvas.
   * @param {Int} width Width of the canvas.
   * @param {Int} height Height of the canvas.
   * @return {Canvas}
   */
  function getCanvas(width, height) {
    var canvas = createCanvas();
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  /**
   * @desc Draw to the canvas with given image or colors.
   * @param {Canvas} canvas The canvas to initialize.
   * @param {Object} options
   *    data: {Image} or {String} or {Array}
   *    size: {Int}
   *    cellSize: {Int}
   */
  function drawCanvas(canvas, options) {
    var data = options.data;
    if (data) {
      var ctx = canvas.getContext('2d');
      if (!Array.isArray(data)) data = [data];
      forEach(data, function (item) {
        if (utils.isDrawable(item)) {
          ctx.drawImage(item, 0, 0, canvas.width, canvas.height);
        } else {
          var x, y, w, h;
          if (typeof item === 'string') item = {style: item};
          else item = item || {};
          x = (('col' in item) ? item.col * options.cellSize : item.x) || 0;
          y = (('row' in item) ? item.row * options.cellSize : item.y) || 0;
          w = (('cols' in item) ? item.cols * options.cellSize : item.width) || options.size;
          h = (('rows' in item) ? item.rows * options.cellSize : item.height) || options.size;
          if (x < 0) x += options.size;
          if (y < 0) y += options.size;
          ctx.fillStyle = item.style || 'black';
          ctx.fillRect(x, y, w, h);
        }
      });
    }
    return canvas;
  }

  function forEach(arr, cb, start) {
    var length = arr && arr.length || 0;
    for (var i = start || 0; i < length; i ++) cb.call(arr, arr[i], i);
  }

  function assign() {
    var obj = arguments[0];
    forEach(arguments, function (arg) {
      arg && forEach(Object.keys(arg), function (key) {
        obj[key] = arg[key];
      });
    }, 1);
    return obj;
  }

  function merge() {
    var res = [];
    forEach(arguments, function (arg) {
      if (arg) res = res.concat(arg);
    });
    return res;
  }
}();

function QRCanvas(options) {
  this.m_init(options);
}

// rendering functions
QRCanvas.m_effects = {
  square: {
    data: function (cell, options) {
      var context = options.context;
      var cellSize = options.cellSize;
      if (options.isDark(cell.i, cell.j)) {
        context.fillStyle = QRCanvas.m_colorDark;
        context.fillRect(cell.x, cell.y, cellSize, cellSize);
      }
    },
  },
};
QRCanvas.m_getEffect = function (key) {
  return QRCanvas.m_effects[key] || QRCanvas.m_effects.square;
};
QRCanvas.m_colorDark = 'black';
QRCanvas.m_colorLight = 'white';

QRCanvas.prototype.m_init = function (options) {
  var _this = this;
  options = _this.m_options = utils.assign({
    // typeNumber belongs to 1..40
    // will be increased to the smallest valid number if too small
    typeNumber: 1,

    // correctLevel can be 'L', 'M', 'Q' or 'H'
    correctLevel: 'M',

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
    foreground: QRCanvas.m_colorDark,
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
  }, options);
  var logo = _this.m_logo = {
    color: QRCanvas.m_colorDark,
    fontFamily: 'Cursive',
    clearEdges: 0,
    margin: -1,
    size: .15,
  };
  var optionLogo = options.logo;
  optionLogo && (optionLogo.image || optionLogo.text) && utils.assign(logo, optionLogo);
  if (logo.image || logo.text) {
    if (logo.margin < 0) logo.margin = logo.image ? 0 : 2;
  }

  if (logo.image || logo.text || options.effect.key === 'image') {
    options.correctLevel = 'H';
  }

  // Generate QRCode data with qrcode-light.js
  var qr = qrcode(options.typeNumber, options.correctLevel);  // eslint-disable-line no-undef
  qr.addData(options.data);
  qr.make();

  // calculate QRCode and cell sizes
  var count = qr.getModuleCount();
  var cellSize = options.cellSize;
  var size = options.size;
  if (!cellSize && !size) cellSize = 2;
  if (cellSize) {
    size = cellSize * count;
  } else {
    cellSize = size / count;
  }
  _this.m_cellSize = cellSize;
  _this.m_size = size;
  _this.m_count = count;
  _this.m_data = qr;
};
QRCanvas.prototype.m_isDark = function (i, j) {
  var _this = this;
  var count = _this.m_count;
  return i >= 0 && i < count && j >= 0 && j < count
    && _this.m_shouldTransclude(i * count + j)
    && _this.m_data.isDark(i, j);
};
QRCanvas.prototype.m_draw = function () {
  var _this = this;
  var options = _this.m_options;
  var count = _this.m_count;
  // ensure size and cellSize are integers
  // so that there will not be gaps between cells
  var cellSize = Math.ceil(_this.m_cellSize);
  var size = cellSize * count;
  var canvasData = utils.getCanvas(size, size);
  var optionsDraw = {
    cellSize: cellSize,
    size: size,
    count: count,
    effect: options.effect,
    foreground: options.foreground,
  };

  _this.m_initLogo(canvasData);
  _this.m_drawCells(canvasData, optionsDraw);
  _this.m_clearLogo(canvasData);

  var foreground = _this.m_drawForeground(optionsDraw);
  var contextFore = foreground.getContext('2d');
  contextFore.globalCompositeOperation = 'destination-in';
  contextFore.drawImage(canvasData, 0, 0);

  var canvas = utils.drawCanvas(utils.getCanvas(size, size), {
    cellSize: cellSize,
    size: size,
    data: utils.merge(
      options.noAlpha ? QRCanvas.m_colorLight : null,
      options.background,
      foreground
    ),
  });

  var logo = _this.m_logo;
  if (logo.canvas) canvas.getContext('2d').drawImage(logo.canvas, logo.x, logo.y);

  var destSize = _this.m_size;
  var canvasTarget = options.reuseCanvas;
  if (canvasTarget) {
    canvasTarget.width = canvasTarget.height = destSize;
  } else if (size != destSize) {
    // strech image if the size is not expected
    canvasTarget = utils.getCanvas(destSize, destSize);
  }
  if (canvasTarget) {
    var contextTarget = canvasTarget.getContext('2d');
    contextTarget.drawImage(canvas, 0, 0, destSize, destSize);
  } else {
    canvasTarget = canvas;
  }
  return canvasTarget;
};
QRCanvas.prototype.m_drawForeground = function (options) {
  var _this = this;
  var cellSize = options.cellSize;
  var size = options.size;
  var effect = options.effect || {};
  var draw = QRCanvas.m_getEffect(effect.key);
  if (draw.foreground) {
    return draw.foreground(utils.assign({
      mask: function () {
        // mask is a canvas with basic rendered QRCode
        var mask = utils.getCanvas(size, size);
        // draw mask without effects
        _this.m_drawCells(mask, {
          cellSize: cellSize,
          count: options.count,
        });
        return mask;
      },
    }, options));
  } else {
    return utils.drawCanvas(utils.getCanvas(size, size), {
      cellSize: cellSize,
      size: size,
      data: options.foreground,
    });
  }
};
QRCanvas.prototype.m_initLogo = function (canvas) {
  // limit the logo size
  var _this = this;
  var logo = _this.m_logo;
  var count = _this.m_count;
  var cellSize = _this.m_cellSize;
  var size = _this.m_size;
  var context = canvas.getContext('2d');
  var k, width, height;

  if (logo.image) {
    // if logo is an image
    k = logo.image;
    width = k.naturalWidth || k.width;
    height = k.naturalHeight || k.height;
  } else if (logo.text) {
    // if logo is text
    // get text width/height radio by assuming fontHeight=100px
    height = 100;
    k = '';
    if (logo.fontStyle) k += logo.fontStyle + ' ';
    k += height + 'px ' + logo.fontFamily;
    context.font = k;
    width = context.measureText(logo.text).width;
  } else {
    // otherwise do nothing
    return;
  }

  // calculate the number of cells to be broken or covered by the logo
  k = width / height;
  var numberHeight = ~~ (Math.sqrt(Math.min(width * height / size / size, logo.size) / k) * count);
  var numberWidth = ~~ (k * numberHeight);
  // (count - [numberWidth | numberHeight]) must be even if the logo is in the middle
  if ((count - numberWidth) % 2) numberWidth ++;
  if ((count - numberHeight) % 2) numberHeight ++;

  // calculate the final width and height of the logo
  k = Math.min((numberHeight * cellSize - 2 * logo.margin) / height, (numberWidth * cellSize - 2 * logo.margin) / width, 1);
  logo.width = ~~ (k * width);
  logo.height = ~~ (k * height);
  logo.x = ((size - logo.width) >> 1) - logo.margin;
  logo.y = ((size - logo.height) >> 1) - logo.margin;

  // draw logo to a canvas
  logo.canvas = utils.getCanvas(logo.width + 2 * logo.margin, logo.height + 2 * logo.margin);
  var ctx = logo.canvas.getContext('2d');
  if (logo.image) {
    ctx.drawImage(logo.image, logo.margin, logo.margin, logo.width, logo.height);
  } else {
    var font = '';
    if (logo.fontStyle) font += logo.fontStyle + ' ';
    font += logo.height + 'px ' + logo.fontFamily;
    ctx.font = font;
    // draw text in the middle
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = logo.color;
    ctx.fillText(logo.text, (logo.width >> 1) + logo.margin, (logo.height >> 1) + logo.margin);
  }
  _this.m_detectEdges();
};
QRCanvas.prototype.m_drawCells = function (canvas, options) {
  var _this = this;
  var cellSize = options.cellSize;
  var count = options.count;
  var effect = options.effect || {};
  var cellOptions = {
    cellSize: cellSize,
    count: count,
    context: canvas.getContext('2d'),
    value: effect.value || 0,
    isDark: _this.m_isDark.bind(_this),
  };
  // draw qrcode according to effect
  var draw = QRCanvas.m_getEffect(effect.key);
  // draw cells
  for (var i = 0; i < count; i ++) {
    for (var j = 0; j < count; j ++) {
      draw.data({
        i: i,
        j: j,
        x: j * cellSize,
        y: i * cellSize,
      }, cellOptions);
    }
  }
};
/**
 * @desc Transform color to remove alpha channel
 */
QRCanvas.prototype.m_transformColor = function (fg, bg, alpha) {
  return ~~ (fg * alpha / 255 + bg * (255 - alpha) / 255);
};
QRCanvas.prototype.m_detectEdges = function () {};
QRCanvas.prototype.m_clearLogo = function (_canvas) {};
QRCanvas.prototype.m_shouldTransclude = function (_index) {
  if (this.m_logo.clearEdges) {
    return false;
  } else {
    return true;
  }
};

function qrcanvas(options) {
  var qrcanvas = new QRCanvas(options);
  return qrcanvas.m_draw();
}

qrcanvas.effects = QRCanvas.m_effects;