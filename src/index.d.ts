declare module 'canvas';

interface QRCanvasOptions {
  typeNumber?: TypeNumber;
  correctLevel?: ErrorCorrectionLevel;
  data?: string;
  canvas?: any;
  size?: number;
  cellSize?: number;
  background?: string;
  foreground?: string;
  padding?: number;
  effect?: QRCanvasEffect;
  logo?: QRCanvasLayer;
}

interface QRCanvasRenderConfig {
  size?: number;
  cellSize?: number;
}

interface QRCanvasEffect {
  type?: string;
  value?: number;
  foregroundLight?: string;
}

interface QRCanvasLayer {
  w?: number;
  h?: number;
  cols?: number;
  rows?: number;
  x?: number;
  y?: number;
  image?: any;
  text?: string;
  options?: QRCanvasDrawTextOptions;
}

interface QRCanvasDrawTextOptions {
  fontSize?: number;
  fontStyle?: string;
  fontFamily?: string;
  color?: string;
  pad?: number;
  padColor?: string;
  mode?: number;
}

type QRCanvasLayerValue = string | QRCanvasLayer | QRCanvasLayerArray;
interface QRCanvasLayerArray extends Array<QRCanvasLayerValue> {}
