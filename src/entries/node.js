/* eslint-disable */
import Canvas from 'canvas';
import qrcanvas from './qrcanvas.common.js';
/* eslint-enable */

const { QRCanvas } = qrcanvas;
QRCanvas.createCanvas = () => new Canvas();
QRCanvas.isCanvas = el => el instanceof Canvas;
QRCanvas.isDrawable = QRCanvas.isCanvas;

export default qrcanvas;
