/* global QRCanvas, utils */

/**
* @desc rendering functions for each cell
*/
!function () {
  function drawCorner(context, cornerX, cornerY, x, y, r) {
    if (r) {
      context.arcTo(cornerX, cornerY, x, y, r);
    } else {
      context.lineTo(cornerX, cornerY);
      context.lineTo(x, y);
    }
  }

  function drawRound(cell, options) {
    var x = cell.x;
    var y = cell.y;
    var cellSize = options.cellSize;
    var effect = options.value * cellSize / 2;
    var context = options.context;
    // draw cell if it should be dark
    if (options.isDark(cell.i, cell.j)) {
      context.fillStyle = QRCanvas.m_colorDark;
      context.beginPath();
      context.moveTo(x + .5 * cellSize, y);
      drawCorner(context, x + cellSize, y, x + cellSize, y + .5 * cellSize, effect);
      drawCorner(context, x + cellSize, y + cellSize, x + .5 * cellSize, y + cellSize, effect);
      drawCorner(context, x, y + cellSize, x, y + .5 * cellSize, effect);
      drawCorner(context, x, y, x + .5 * cellSize, y, effect);
      //context.closePath();
      context.fill();
    }
  }

  function fillCorner(context, startX, startY, cornerX, cornerY, destX, destY, effect) {
    context.beginPath();
    context.moveTo(startX, startY);
    drawCorner(context, cornerX, cornerY, destX, destY, effect);
    context.lineTo(cornerX, cornerY);
    context.lineTo(startX, startY);
    //context.closePath();
    context.fill();
  }

  function drawLiquid(cell, options) {
    var corners = [0, 0, 0, 0]; // NW, NE, SE, SW
    var i = cell.i;
    var j = cell.j;
    var x = cell.x;
    var y = cell.y;
    var cellSize = options.cellSize;
    var effect = options.value * cellSize / 2;
    var context = options.context;
    if (options.isDark(i-1, j)) {corners[0] ++; corners[1] ++;}
    if (options.isDark(i+1, j)) {corners[2] ++; corners[3] ++;}
    if (options.isDark(i, j-1)) {corners[0] ++; corners[3] ++;}
    if (options.isDark(i, j+1)) {corners[1] ++; corners[2] ++;}
    // draw cell
    context.fillStyle = QRCanvas.m_colorDark;
    if (options.isDark(i, j)) {
      if (options.isDark(i-1, j-1)) corners[0] ++;
      if (options.isDark(i-1, j+1)) corners[1] ++;
      if (options.isDark(i+1, j+1)) corners[2] ++;
      if (options.isDark(i+1, j-1)) corners[3] ++;
      context.beginPath();
      context.moveTo(x + .5 * cellSize, y);
      drawCorner(context, x + cellSize, y, x + cellSize, y + .5 * cellSize, corners[1] ? 0 : effect);
      drawCorner(context, x + cellSize, y + cellSize, x + .5 * cellSize, y + cellSize, corners[2] ? 0 : effect);
      drawCorner(context, x, y + cellSize, x, y + .5 * cellSize, corners[3] ? 0 : effect);
      drawCorner(context, x, y, x + .5 * cellSize, y, corners[0] ? 0 : effect);
      //context.closePath();
      context.fill();
    } else {
      if (corners[0] == 2) fillCorner(context, x, y + .5 * cellSize, x, y, x + .5 * cellSize, y, effect);
      if (corners[1] == 2) fillCorner(context, x + .5 * cellSize, y, x + cellSize, y, x + cellSize, y + .5 * cellSize, effect);
      if (corners[2] == 2) fillCorner(context, x + cellSize, y + .5 * cellSize, x + cellSize, y + cellSize, x + .5 * cellSize, y + cellSize, effect);
      if (corners[3] == 2) fillCorner(context, x + .5 * cellSize, y + cellSize, x, y + cellSize, x, y + .5 * cellSize, effect);
    }
  }

  function drawImage(cell, options) {
    var i = cell.i;
    var j = cell.j;
    var x = cell.x;
    var y = cell.y;
    var context = options.context;
    var cellSize = options.cellSize;
    var count = options.count;
    context.fillStyle = QRCanvas.m_colorDark;
    var fillSize = .25;
    if (i <= 7 && j <= 7
      || i <= 7 && count - j - 1 <= 7
      || count - i - 1 <= 7 && j <= 7
      || i + 5 <= count && i + 9 >= count && j + 5 <= count && j + 9 >= count
      || i === 7 || j === 7) fillSize = 1 - .1 * options.value;
    var offset = (1 - fillSize) / 2;
    context.fillRect(x + offset * cellSize, y + offset * cellSize, fillSize * cellSize, fillSize * cellSize);
  }

  function drawImageFore(options) {
    var cellSize = options.cellSize;
    var size = options.size;
    var mask = options.mask();
    var foreground = utils.drawCanvas(utils.getCanvas(size, size), {
      cellSize: cellSize,
      size: size,
      data: options.foreground,
    });
    var ctx = foreground.getContext('2d');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = QRCanvas.m_colorLight;
    ctx.fillRect(0, 0, size, size);
    return foreground;
  }

  utils.assign(QRCanvas.m_effects, {
    round: {data: drawRound},
    liquid: {data: drawLiquid},
    image: {data: drawImage, foreground: drawImageFore},
  });
}();
