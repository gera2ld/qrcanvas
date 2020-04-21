export type TypeNumber =
  | 0 // Automatic type number
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40
  ;

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRCanvasOptions {
  typeNumber?: TypeNumber;
  correctLevel?: ErrorCorrectionLevel;
  data?: string;
  canvas?: HTMLCanvasElement;
  size?: number;
  cellSize?: number;
  background?: QRCanvasLayerValue;
  foreground?: QRCanvasLayerValue;
  padding?: number;
  effect?: QRCanvasEffect;
  logo?: QRCanvasLayer;
}

export interface QRCanvasRenderConfig {
  size?: number;
  cellSize?: number;
}

export interface QRCanvasEffect {
  type?: string;
  value?: number;
  foregroundLight?: string;
}

export interface QRCanvasLayer {
  w?: number;
  h?: number;
  cols?: number;
  rows?: number;
  x?: number;
  y?: number;
  col?: number;
  row?: number;
  image?: CanvasImageSource;
  text?: string;
  style?: string;
  options?: QRCanvasDrawTextOptions;
}

export interface QRCanvasDrawTextOptions {
  fontSize?: number;
  fontStyle?: string;
  fontFamily?: string;
  color?: string;
  pad?: number;
  padColor?: string;
  mode?: number;
}

export type QRCanvasLayerValue = string | CanvasImageSource | QRCanvasLayer | QRCanvasLayerArray;
type QRCanvasLayerArray = QRCanvasLayerValue[];
