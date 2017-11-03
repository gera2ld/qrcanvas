import qrcanvas from '../core/index';

const { QRCanvas } = qrcanvas;
QRCanvas.createCanvas = () => document.createElement('canvas');
QRCanvas.isDrawable = el => el instanceof HTMLCanvasElement;

export default qrcanvas;
