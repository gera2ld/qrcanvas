const canvas = qrcanvas.qrcanvas({
  cellSize: 8,
  correctLevel: 'H',
  data: 'hello, world',
  logo: {
    text: 'QRCanvas',
    options: {
      color: 'dodgerblue',
    },
  },
});
container.appendChild(canvas);
