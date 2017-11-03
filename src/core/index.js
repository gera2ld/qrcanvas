import QRCanvas from './qrcanvas';
import './effects';
import './utils';
import './plugins/edger';

export default function qrcanvas(options) {
  const canvas = new QRCanvas(options);
  return canvas.draw();
}

qrcanvas.QRCanvas = QRCanvas;
