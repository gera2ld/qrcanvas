import helpers from './helpers';
import { COLOR_BLACK, COLOR_WHITE } from './consts';

export default {
  default: renderDefault,
  round: renderRound,
  fusion: renderFusion,
  spot: renderSpot,
};

function renderDefault({
  foreground,
  cellSize,
  isDark,
  count,
}) {
  const { getCanvas, drawCanvas, cacheCanvas } = helpers;
  const width = cellSize * count;
  const canvasMask = getCanvas({ width });
  const context = canvasMask.getContext('2d');
  context.fillStyle = COLOR_BLACK;
  drawCells({ cellSize, count }, ({
    i, j, x, y,
  }) => {
    if (isDark(i, j)) {
      context.fillRect(x, y, cellSize, cellSize);
    }
  });
  const canvasFg = getCanvas({ width });
  drawCanvas(canvasFg, foreground, { cellSize });
  const ctx = canvasFg.getContext('2d');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(canvasMask, 0, 0);
  cacheCanvas(canvasMask);
  return canvasFg;
}

function renderRound({
  foreground,
  cellSize,
  isDark,
  count,
}, maskOptions) {
  const { getCanvas, drawCanvas, cacheCanvas } = helpers;
  const width = cellSize * count;
  const canvasMask = getCanvas({ width });
  const {
    value = 1,
  } = maskOptions;
  const radius = value * cellSize / 2;
  const context = canvasMask.getContext('2d');
  context.fillStyle = COLOR_BLACK;
  drawCells({ cellSize, count }, ({
    i, j, x, y,
  }) => {
    if (isDark(i, j)) {
      context.beginPath();
      context.moveTo(x + 0.5 * cellSize, y);
      drawCorner(context, x + cellSize, y, x + cellSize, y + 0.5 * cellSize, radius);
      drawCorner(context, x + cellSize, y + cellSize, x + 0.5 * cellSize, y + cellSize, radius);
      drawCorner(context, x, y + cellSize, x, y + 0.5 * cellSize, radius);
      drawCorner(context, x, y, x + 0.5 * cellSize, y, radius);
      // context.closePath();
      context.fill();
    }
  });
  const canvasFg = getCanvas({ width });
  drawCanvas(canvasFg, foreground, { cellSize });
  const ctx = canvasFg.getContext('2d');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(canvasMask, 0, 0);
  cacheCanvas(canvasMask);
  return canvasFg;
}

function renderFusion({
  foreground,
  cellSize,
  isDark,
  count,
}, maskOptions) {
  const { getCanvas, drawCanvas, cacheCanvas } = helpers;
  const width = cellSize * count;
  const canvasMask = getCanvas({ width });
  const context = canvasMask.getContext('2d');
  context.fillStyle = COLOR_BLACK;
  const {
    value = 1,
  } = maskOptions;
  const radius = value * cellSize / 2;
  drawCells({ cellSize, count }, ({
    i, j, x, y,
  }) => {
    const corners = [0, 0, 0, 0]; // NW, NE, SE, SW
    if (isDark(i - 1, j)) {
      corners[0] += 1;
      corners[1] += 1;
    }
    if (isDark(i + 1, j)) {
      corners[2] += 1;
      corners[3] += 1;
    }
    if (isDark(i, j - 1)) {
      corners[0] += 1;
      corners[3] += 1;
    }
    if (isDark(i, j + 1)) {
      corners[1] += 1;
      corners[2] += 1;
    }
    if (isDark(i, j)) {
      if (isDark(i - 1, j - 1)) corners[0] += 1;
      if (isDark(i - 1, j + 1)) corners[1] += 1;
      if (isDark(i + 1, j + 1)) corners[2] += 1;
      if (isDark(i + 1, j - 1)) corners[3] += 1;
      context.beginPath();
      context.moveTo(x + 0.5 * cellSize, y);
      drawCorner(
        context,
        x + cellSize,
        y,
        x + cellSize,
        y + 0.5 * cellSize,
        corners[1] ? 0 : radius,
      );
      drawCorner(
        context,
        x + cellSize,
        y + cellSize,
        x + 0.5 * cellSize,
        y + cellSize,
        corners[2] ? 0 : radius,
      );
      drawCorner(context, x, y + cellSize, x, y + 0.5 * cellSize, corners[3] ? 0 : radius);
      drawCorner(context, x, y, x + 0.5 * cellSize, y, corners[0] ? 0 : radius);
      // context.closePath();
      context.fill();
    } else {
      if (corners[0] === 2) {
        fillCorner(context, x, y + 0.5 * cellSize, x, y, x + 0.5 * cellSize, y, radius);
      }
      if (corners[1] === 2) {
        fillCorner(
          context,
          x + 0.5 * cellSize,
          y,
          x + cellSize,
          y,
          x + cellSize,
          y + 0.5 * cellSize,
          radius,
        );
      }
      if (corners[2] === 2) {
        fillCorner(
          context,
          x + cellSize,
          y + 0.5 * cellSize,
          x + cellSize,
          y + cellSize,
          x + 0.5 * cellSize,
          y + cellSize,
          radius,
        );
      }
      if (corners[3] === 2) {
        fillCorner(
          context,
          x + 0.5 * cellSize,
          y + cellSize,
          x,
          y + cellSize,
          x,
          y + 0.5 * cellSize,
          radius,
        );
      }
    }
  });
  const canvasFg = getCanvas({ width });
  drawCanvas(canvasFg, foreground, { cellSize });
  const ctx = canvasFg.getContext('2d');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(canvasMask, 0, 0);
  cacheCanvas(canvasMask);
  return canvasFg;
}

function renderSpot({
  foreground,
  cellSize,
  isDark,
  count,
}, maskOptions) {
  const { getCanvas, drawCanvas, cacheCanvas } = helpers;
  const width = cellSize * count;
  const canvasMask = getCanvas({ width });
  const {
    value,
    foregroundLight = COLOR_WHITE,
  } = maskOptions;
  const context = canvasMask.getContext('2d');
  const canvasLayer = getCanvas({ width });
  const canvasFg = getCanvas({ width });
  const ctxLayer = canvasLayer.getContext('2d');
  [
    { dark: true, foreground },
    { dark: false, foreground: foregroundLight },
  ].forEach(item => {
    context.fillStyle = COLOR_BLACK;
    context.clearRect(0, 0, width, width);
    drawCells({ cellSize, count }, ({
      i, j, x, y,
    }) => {
      if (isDark(i, j) ^ !item.dark) {
        let fillSize;
        if (
          i <= 7 && j <= 7
          || i <= 7 && count - j - 1 <= 7
          || count - i - 1 <= 7 && j <= 7
          || i + 5 <= count && i + 9 >= count && j + 5 <= count && j + 9 >= count
          || i === 7
          || j === 7
        ) {
          fillSize = 1 - 0.1 * value;
        } else {
          fillSize = 0.25;
        }
        const offset = (1 - fillSize) / 2;
        context.fillRect(
          x + offset * cellSize,
          y + offset * cellSize,
          fillSize * cellSize,
          fillSize * cellSize,
        );
      }
    });
    drawCanvas(canvasLayer, item.foreground, { cellSize, context: ctxLayer });
    ctxLayer.globalCompositeOperation = 'destination-in';
    ctxLayer.drawImage(canvasMask, 0, 0);
    drawCanvas(canvasFg, canvasLayer, { cellSize, clear: false });
  });
  cacheCanvas(canvasMask, canvasLayer);
  return canvasFg;
}

function drawCells({ cellSize, count }, drawEach) {
  for (let i = 0; i < count; i += 1) {
    for (let j = 0; j < count; j += 1) {
      const x = j * cellSize;
      const y = i * cellSize;
      drawEach({
        i, j, x, y,
      });
    }
  }
}

function drawCorner(ctx, cornerX, cornerY, x, y, r) {
  if (r) {
    ctx.arcTo(cornerX, cornerY, x, y, r);
  } else {
    ctx.lineTo(cornerX, cornerY);
    ctx.lineTo(x, y);
  }
}

function fillCorner(context, startX, startY, cornerX, cornerY, destX, destY, radius) {
  context.beginPath();
  context.moveTo(startX, startY);
  drawCorner(context, cornerX, cornerY, destX, destY, radius);
  context.lineTo(cornerX, cornerY);
  context.lineTo(startX, startY);
  // context.closePath();
  context.fill();
}
