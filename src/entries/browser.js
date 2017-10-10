import { methods } from '../utils/index';

methods.createCanvas = () => document.createElement('canvas');
methods.isDrawable = el => el instanceof HTMLCanvasElement;

export { default } from '../core';
