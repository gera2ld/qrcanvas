import QRCanvasRenderer from './renderer';

export function qrcanvas(options: QRCanvasOptions) {
  const {
    canvas,
    size,
    cellSize,
    ...rest
  } = options;
  const renderer = new QRCanvasRenderer(rest);
  return renderer.render(canvas, { size, cellSize });
}
