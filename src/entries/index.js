import qrcanvas from '../core/index';

const { QRCanvas } = qrcanvas;
QRCanvas.createCanvas = () => document.createElement('canvas');
QRCanvas.isCanvas = el => el instanceof HTMLCanvasElement;
QRCanvas.isDrawable = el => QRCanvas.isCanvas(el) || el instanceof HTMLImageElement;

export default qrcanvas;
