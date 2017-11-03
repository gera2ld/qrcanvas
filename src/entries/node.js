/* eslint-disable */
import Canvas from 'canvas';
import qrcanvas from './qrcanvas.common.js';
/* eslint-enable */

const { QRCanvas } = qrcanvas;
QRCanvas.createCanvas = () => new Canvas();
QRCanvas.isDrawable = el => el instanceof Canvas;

export default qrcanvas;
