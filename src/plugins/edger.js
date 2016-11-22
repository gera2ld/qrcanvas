/* global window, QRCanvas, utils */

// IE 9- does not support Uint8Array
var Uint8Array = window.Uint8Array || window.Array;

/**
* @desc detect image edge based on canvas
*/
function Edger(canvas, options) {
  var _this = this;
  options = options || {};
  _this.margin = options.margin || 0;
  _this.nobg = !!options.nobg;
  _this.isBackgroundColor = options.isBackgroundColor || _this.isBackgroundColor;
  _this.prepare(canvas);
}

Edger.prototype = {
  /**
   * @desc Read image data from a canvas and find the edges of the image.
   */
  prepare: function (canvas) {
    var _this = this;
    var ctx = canvas.getContext('2d');
    _this.width = canvas.width;
    _this.height = canvas.height;
    _this.total = _this.width * _this.height;
    if (_this.nobg) return;
    var imageData = ctx.getImageData(0, 0, _this.width, _this.height);
    /*_this._rect = {
      top: -1,
      right: -1,
      bottom: -1,
      left: -1,
    };*/

    /**
     * Whether the pixel should be background taking margin into account.
     * 0 - not checked
     * 1 - background
     * 2 - edge of the image
     */
    var bgData = _this.data = new Uint8Array(_this.total);
    /**
     * Whether the pixel itself is a background color.
     * 0 - not checked
     * 1 - background
     * 2 - edge of the image
     */
    var pixelData = new Uint8Array(_this.total);

    // BFS
    var queue = [], i;
    var slice = [].slice;
    for (i = 0; i < _this.width; i ++) {
      checkSurroundings(i);
      checkSurroundings(_this.total - 1 - i);
    }
    for (i = 0; i < _this.height; i ++) {
      checkSurroundings(i * _this.width);
      checkSurroundings((i + 1) * _this.width - 1);
    }
    var head = 0;
    while (head < queue.length) {
      var index = queue[head];
      if (index > _this.width) checkRow(index - _this.width);
      checkRow(index, true);
      if (index + _this.width < _this.total) checkRow(index + _this.width);
      head ++;
    }
    _this.totalBackground = head;

    function isBgPixel(index) {
      var value = pixelData[index];
      if (!value) {
        var offset = index * 4;
        var colorArr = slice.call(imageData.data, offset, offset + 4);
        if (_this.isBackgroundColor(colorArr)) {
          value = pixelData[index] = 1;
        } else {
          value = pixelData[index] = 2;
        }
      }
      return value === 1;
    }
    function checkSurroundings(index) {
      if (bgData[index]) return;
      var x0 = index % _this.width;
      var y0 = ~~ (index / _this.width);
      var R = _this.margin + 1;
      for (var x = Math.max(0, x0 - R + 1); x < x0 + R && x < _this.width; x ++) {
        for (var y = Math.max(0, y0 - R + 1); y < y0 + R && y < _this.height; y ++) {
          var dx = x - x0;
          var dy = y - y0;
          if (dx * dx + dy * dy < R * R) {
            if (!isBgPixel(x + y * _this.width)) {
              bgData[index] = 2;
              return;
            }
          }
        }
      }
      bgData[index] = 1;
      queue.push(index);
      /*var rect = _this._rect;
      if (rect.top < 0 || rect.top > y0) rect.top = y0;
      if (rect.right < 0 || rect.right < x0) rect.right = x0;
      if (rect.bottom < 0 || rect.bottom < y0) rect.bottom = y0;
      if (rect.left < 0 || rect.left > x0) rect.left = x0;*/
    }
    function checkRow(index, excludeSelf) {
      if (index % _this.width) checkSurroundings(index - 1);
      if (!excludeSelf) checkSurroundings(index);
      if ((index + 1) % _this.width) checkSurroundings(index + 1);
    }
  },
  /**
   * @desc The default isBackgroundColor callback to decide
   * whether a color is background by its Alpha value.
   */
  isBackgroundColor: function (colorArr) {
    return !colorArr[3]; // alpha is 0
  },
  /**
   * @desc The callback to tell whether a pixel or an area is outside the edges.
   */
  isBackground: function () {
    var args = arguments;
    var _this = this;
    var index;
    if (args.length == 1) {
      index = args[0];
    } else if (args.length == 2) {
      index = args[0] + args[1] * _this.width;
    } else if (args.length == 4) {
      var x0 = args[0];
      var y0 = args[1];
      var x1 = x0 + args[2];
      var y1 = y0 + args[3];
      if (x0 < 0) x0 = 0;
      if (y0 < 0) y0 = 0;
      if (x1 > _this.width) x1 = _this.width;
      if (y1 > _this.height) y1 = _this.height;
      for (var x = x0; x < x1; x ++) for (var y = y0; y < y1; y ++) {
        if (!_this.isBackground(x, y)) return false;
      }
      return true;
    } else {
      throw Error('Invalid index');
    }
    return _this.nobg ? false : _this.data[index] === 1;
  },
  /**
   * @desc Tranform a color number to a RGBA array.
   */
  /*getColorArr: function (color) {
    color = color || 255;
    return Array.isArray(color)
      ? [
        color[0] || 0,
        color[1] || 0,
        color[2] || 0,
        color[3] || 255,
      ] : [
        color >>> 24,
        color >>> 16 & 255,
        color >>> 8 & 255,
        color & 255,
      ];
  },*/
  /**
   * @desc To get a shadow with pure color
   */
  /*getShadow: function (color) {
    var _this = this;
    var canvas = getCanvas(_this.width, _this.height);
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, _this.width, _this.height);
    color = _this.getColorArr(color);
    for (var i = 0; i < _this.total; i ++)
      if (!_this.isBackground(i)) {
        var offset = i * 4;
        imageData.data[offset] = color[0];
        imageData.data[offset + 1] = color[1];
        imageData.data[offset + 2] = color[2];
        imageData.data[offset + 3] = color[3];
      }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  },*/
  /**
   * @desc To clear the background so that the shadow can be filled with custom styles.
   */
  clearBackground: function (canvas) {
    var _this = this;
    if (canvas.width != _this.width || canvas.height != _this.height) return;
    var ctx = canvas.getContext('2d');
    var imageData = ctx.getImageData(0, 0, _this.width, _this.height);
    for (var i = 0; i < _this.total; i ++)
      if (_this.isBackground(i)) {
        var offset = i * 4;
        imageData.data[offset] = 0;
        imageData.data[offset + 1] = 0;
        imageData.data[offset + 2] = 0;
        imageData.data[offset + 3] = 0;
      }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  },
  /**
   * @desc Get the real edges of the image excluding the background part.
   */
  /*getRect: function () {
    var rect = this._rect;
    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
      width: rect.right - rect.left + 1,
      height: rect.bottom - rect.top + 1,
    };
  },*/
};

QRCanvas.prototype.m_detectEdges = function () {
  var _this = this;
  var logo = _this.m_logo;
  var count = _this.m_count;
  var cellSize = _this.m_cellSize;
  var edger = logo.edger = new Edger(logo.canvas, {
    margin: logo.margin,
    nobg: logo.clearEdges == 2,
  });

  // whether to clear cells broken by the logo (incomplete cells)
  if (logo.clearEdges) {
    /**
     * Whether the cell is overlapped by logo.
     * 0 - partially or completely overlapped.
     * 1 - clear.
     */
    var transclude = _this.m_transclude = new Uint8Array(count * count);
    for (var i = 0; i < count; i ++) for (var j = 0; j < count; j ++) {
      transclude[i * count + j] = edger.isBackground(j * cellSize - logo.x, i * cellSize - logo.y, cellSize, cellSize);
    }
  }
};
QRCanvas.prototype.m_clearLogo = function (canvas) {
  var _this = this;
  var logo = _this.m_logo;
  if ((logo.image || logo.text) && !logo.clearEdges) {
    var canvasLogo = utils.getCanvas(logo.width + 2 * logo.margin, logo.height + 2 * logo.margin);
    var ctx = canvasLogo.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasLogo.width, canvasLogo.height);
    logo.edger.clearBackground(canvasLogo);
    var context = canvas.getContext('2d');
    context.globalCompositeOperation = 'destination-out';
    context.drawImage(canvasLogo, logo.x, logo.y);
  }
};
QRCanvas.prototype.m_shouldTransclude = function (index) {
  var _this = this;
  return _this.m_logo.clearEdges ? _this.m_transclude[index] : true;
};
