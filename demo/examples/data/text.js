const canvas = qrcanvas.qrcanvas({
  cellSize: 8,
  correctLevel: 'H',
  data: 'hello, world',
  logo: {
    image: qrcanvas.helpers.drawText('QRCanvas'),
  },
});
container.appendChild(canvas);
