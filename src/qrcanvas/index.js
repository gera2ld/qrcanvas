import QRCanvasRenderer from './renderer';

export default function qrcanvas(options) {
  const {
    canvas,
    size,
    cellSize,
    ...rest
  } = options;
  const renderer = new QRCanvasRenderer(rest);
  return renderer.render(canvas, { size, cellSize });
}
