import QRCanvas from './qrcanvas';
import { variables, effects } from './config';

effects.default = { data: drawDefault };
effects.round = { data: drawRound };
effects.liquid = { data: drawLiquid };
effects.image = { data: drawImage, foreground: drawImageFore };

function drawDefault(contextData) {
  const {
    context, cellSize, isDark, colorDark,
  } = contextData;
  drawCells(contextData, ({
    i, j, x, y,
  }) => {
    if (isDark(i, j)) {
      context.fillStyle = colorDark;
      context.fillRect(x, y, cellSize, cellSize);
    }
  });
}

function drawCells({ cellSize, count }, drawEach) {
  for (let i = 0; i < count; i += 1) {
    for (let j = 0; j < count; j += 1) {
      const x = i * cellSize;
      const y = j * cellSize;
      drawEach({
        i, j, x, y,
      });
    }
  }
}

function drawCorner(context, cornerX, cornerY, x, y, r) {
  if (r) {
    context.arcTo(cornerX, cornerY, x, y, r);
  } else {
    context.lineTo(cornerX, cornerY);
    context.lineTo(x, y);
  }
}

function drawRound(contextData) {
  const {
    cellSize, context, options, isDark, colorDark,
  } = contextData;
  const radius = options.effect.value * cellSize / 2;
  drawCells(contextData, ({
    i, j, x, y,
  }) => {
    if (isDark(i, j)) {
      context.fillStyle = colorDark;
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

function drawLiquid(contextData) {
  const {
    cellSize, context, isDark, colorDark, options,
  } = contextData;
  const radius = options.effect.value * cellSize / 2;
  drawCells(contextData, ({
    i, j, x, y,
  }) => {
    const corners = [0, 0, 0, 0]; // NW, NE, SE, SW
    if (isDark(i - 1, j)) {
      corners[0] += 1;
      corners[3] += 1;
    }
    if (isDark(i + 1, j)) {
      corners[1] += 1;
      corners[2] += 1;
    }
    if (isDark(i, j - 1)) {
      corners[0] += 1;
      corners[1] += 1;
    }
    if (isDark(i, j + 1)) {
      corners[2] += 1;
      corners[3] += 1;
    }
    // draw cell
    context.fillStyle = colorDark;
    if (isDark(i, j)) {
      if (isDark(i - 1, j - 1)) corners[0] += 1;
      if (isDark(i + 1, j - 1)) corners[1] += 1;
      if (isDark(i + 1, j + 1)) corners[2] += 1;
      if (isDark(i - 1, j + 1)) corners[3] += 1;
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
}

function drawImage(contextData) {
  const {
    context, cellSize, count, colorDark, options,
  } = contextData;
  drawCells(contextData, ({
    i, j, x, y,
  }) => {
    context.fillStyle = colorDark;
    let fillSize = 0.25;
    if (i <= 7 && j <= 7
      || i <= 7 && count - j - 1 <= 7
      || count - i - 1 <= 7 && j <= 7
      || i + 5 <= count && i + 9 >= count && j + 5 <= count && j + 9 >= count
      || i === 7 || j === 7) fillSize = 1 - 0.1 * options.effect.value;
    const offset = (1 - fillSize) / 2;
    context.fillRect(
      x + offset * cellSize,
      y + offset * cellSize,
      fillSize * cellSize,
      fillSize * cellSize,
    );
  });
}

function drawImageFore(contextData) {
  const {
    cellSize, size, mask, options,
  } = contextData;
  const maskLayer = mask();
  const foreground = QRCanvas.drawCanvas(QRCanvas.getCanvas(size), {
    cellSize,
    size,
    data: options.foreground,
  });
  const ctx = foreground.getContext('2d');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(maskLayer, 0, 0);
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = variables.colorLight;
  ctx.fillRect(0, 0, size, size);
  return foreground;
}
