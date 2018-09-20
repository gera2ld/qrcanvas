const canvas = qrcanvas.qrcanvas({
  cellSize: 8,
  data: 'hello, world',
});
container.appendChild(canvas);
