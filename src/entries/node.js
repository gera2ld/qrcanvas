/* eslint-disable import/no-unresolved */
const Canvas = require('canvas');
const qrcanvas = require('./qrcanvas.common');

const { QRCanvas } = qrcanvas;
QRCanvas.createCanvas = () => new Canvas();
QRCanvas.isCanvas = el => el instanceof Canvas;
QRCanvas.isDrawable = QRCanvas.isCanvas;

module.exports = qrcanvas;
