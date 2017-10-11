import { drawCells } from './utils/index';

const effects = {
  default: {
    data(contextData) {
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
    },
  },
};

export function getEffect(key) {
  return effects[key] || effects.default;
}

export function setEffect(key, val) {
  effects[key] = val;
}

export function setEffects(obj) {
  Object.keys(obj).forEach(key => setEffect(key, obj[key]));
}
