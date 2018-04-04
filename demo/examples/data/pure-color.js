const canvas = qrcanvas({
  cellSize: 8,
  correctLevel: 'H',
  data: 'hello, world',
  foreground: 'blue',
});
container.appendChild(canvas);
