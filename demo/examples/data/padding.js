const canvas = qrcanvas.qrcanvas({
  cellSize: 8,
  data: 'hello, world',
  padding: 8,
});
container.appendChild(canvas);
