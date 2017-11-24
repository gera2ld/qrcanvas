import QRCanvas from './qrcanvas';
import './effects';
import './utils';
import './plugins/edger';

export default function qrcanvas(options) {
  const canvas = new QRCanvas(options);
  canvas.makeAll();
  return canvas.output(options);
}

qrcanvas.QRCanvas = QRCanvas;
