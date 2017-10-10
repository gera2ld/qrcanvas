import Canvas from 'canvas';  // eslint-disable-line
import { methods } from '../utils/index';

methods.createCanvas = () => new Canvas();
methods.isDrawable = el => el instanceof Canvas;

export { default } from '../core';
