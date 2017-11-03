/* eslint-disable */
import Canvas from 'canvas';
import qrcanvas from './qrcanvas.common.js';
/* eslint-enable */

const { methods } = qrcanvas;
methods.createCanvas = () => new Canvas();
methods.isDrawable = el => el instanceof Canvas;

export default qrcanvas;
