import { variables, effects } from './config';

effects.default = { draw: drawDefault };
effects.round = { draw: drawRound };
effects.liquid = { draw: drawLiquid };
effects.spot = {
  draw: drawSpot,
  scenes: [
    {
      configMask: {
        isDark: () => true,
      },
      configScene: {
        data: variables.colorLight,
      },
    },
    {},
  ],
};

function drawDefault(contextData) {
  const {
    context, isDark, colorDark, qrdata: { cellSize },
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

function drawCells({ qrdata: { cellSize, count } }, drawEach) {
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
    context, effect, isDark, colorDark, qrdata: { cellSize },
  } = contextData;
  const radius = effect.value * cellSize / 2;
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
    context, isDark, colorDark, effect, qrdata: { cellSize },
  } = contextData;
  const radius = effect.value * cellSize / 2;
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

function drawSpot(contextData) {
  const {
    context, isDark, colorDark, effect, qrdata: { cellSize, count },
  } = contextData;
  drawCells(contextData, ({
    i, j, x, y,
  }) => {
    if (isDark(i, j)) {
      context.fillStyle = colorDark;
      let fillSize;
      if (
        i <= 7 && j <= 7 ||
        i <= 7 && count - j - 1 <= 7 ||
        count - i - 1 <= 7 && j <= 7 ||
        i + 5 <= count && i + 9 >= count && j + 5 <= count && j + 9 >= count ||
        i === 7 ||
        j === 7
      ) {
        fillSize = 1 - 0.1 * effect.value;
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
}
