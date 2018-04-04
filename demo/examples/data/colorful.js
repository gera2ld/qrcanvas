const colorFore = '#55a';
const colorOut = '#c33';
const colorIn = '#621';
const canvas = qrcanvas({
  cellSize: 8,
  correctLevel: 'H',
  data: 'hello, world',
  foreground: [
    // foreground color
    { style: colorFore },
    // outer squares of the positioner
    { row: 0, rows: 7, col: 0, cols: 7, style: colorOut },
    { row: -7, rows: 7, col: 0, cols: 7, style: colorOut },
    { row: 0, rows: 7, col: -7, cols: 7, style: colorOut },
    // inner squares of the positioner
    { row: 2, rows: 3, col: 2, cols: 3, style: colorIn },
    { row: -5, rows: 3, col: 2, cols: 3, style: colorIn },
    { row: 2, rows: 3, col: -5, cols: 3, style: colorIn },
  ],
});
container.appendChild(canvas);
