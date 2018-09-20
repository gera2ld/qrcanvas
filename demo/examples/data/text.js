const canvas = qrcanvas.qrcanvas({
  cellSize: 8,
  correctLevel: 'H',
  data: 'hello, world',
  logo: {
    text: 'QRCanvas',
    clearEdges: 2,
    size: .3,
  },
});
container.appendChild(canvas);
