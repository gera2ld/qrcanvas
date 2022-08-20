export type TypeNumber =
  | 0 // Automatic type number
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40;

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRCanvasOptions {
  /**
   * The type number of the QRCode. If too small to contain the data, the smallest valid type number will be used instead.
   * Default as `0`.
   */
  typeNumber?: TypeNumber;
  /**
   * The correct level of QRCode. When `logo` is assigned, `correctLevel` will be set to `H`.
   */
  correctLevel?: ErrorCorrectionLevel;
  /**
   * The data to be encoded in the QRCode, text will be encoded in UTF-8. Default as `''`.
   */
  data?: string;
  /**
   * The final image will be painted to `canvas` if provided.
   */
  canvas?: HTMLCanvasElement;
  /**
   * The pixel width or height of the entire image, ignored if cellSize is specified. Default as `undefined`.
   */
  size?: number;
  /**
   * The pixel width or height of a cell. Default value is used only if neither `cellSize` nor `size` is provided. Default as `2`.
   */
  cellSize?: number;
  /**
   * The background color or image of the QRCode. Default as `'white'`.
   */
  background?: QRCanvasLayerValue;
  /**
   * The foreground color or image of the QRCode. Default as `'black'`.
   */
  foreground?: QRCanvasLayerValue;
  /**
   * Padding space around the QRCode. Default as `0`.
   */
  padding?: number;
  /**
   * Add a logo in the middle of the QRCode.
   */
  logo?: QRCanvasLogo;
  /**
   * Whether to resize the canvas to size of QRCode on render
   */
  resize?: boolean;
  effect?: QRCanvasEffect;
}

export interface QRCanvasRenderConfig {
  size?: number;
  cellSize?: number;
}

export interface QRCanvasEffect {
  /**
   * Built-in effects are `round`, `fusion` and `spot`.
   */
  type?: string;
  /**
   * A ratio between 0..1.
   */
  value?: number;
  /**
   * The foreground color for `spot` effect.
   */
  foregroundLight?: string;
}

export interface QRCanvasBaseLayer {
  /**
   * Width of the layer in pixels. Default as the width of QRCode.
   */
  w?: number;
  /**
   * Height of the layer in pixels. Default as the height of QRCode.
   */
  h?: number;
  /**
   * Width of the layer in columns. If not provided, {@link w} will be used instead.
   */
  cols?: number;
  /**
   * Height of the layer in rows. If not provided, {@link h} will be used instead.
   */
  rows?: number;
  /**
   * X of start position. Default as `0`.
   */
  x?: number;
  /**
   * Y of start position. Default as `0`.
   */
  y?: number;
  /**
   * Column index of the start position. If not provided, {@link x} will be used instead.
   */
  col?: number;
  /**
   * Row index of the start position. If not provided, {@link y} will be used instead.
   */
  row?: number;
}

export interface QRCanvasFillLayer extends QRCanvasBaseLayer {
  /**
   * CSS style to fill the area defined by other attributes. Default as `'black'`.
   */
  style: string;
}

export interface QRCanvasTextLayer extends QRCanvasBaseLayer {
  text: string;
  options?: QRCanvasDrawTextOptions;
}

export interface QRCanvasImageLayer extends QRCanvasBaseLayer {
  image: CanvasImageSource;
}

/**
 * A layer defines what to paint to a canvas.
 */
export type QRCanvasLayer = QRCanvasFillLayer | QRCanvasImageLayer;

/**
 * Examples:
 *
 * - text logo
 *
 * ```js
 * logo = 'hello, world';
 * logo = {
 *   text: 'hello, world',
 *   options: {
 *     color: 'green',
 *   },
 * };
 * ```
 *
 * - image logo
 *
 * ```js
 * logo = { image: loadedImageElementOrCanvas };
 * ```
 *
 * - another {@link QRCanvasLayer}
 *
 * ```js
 * logo = { style: 'red' };
 * ```
 */
export type QRCanvasLogo =
  | QRCanvasLayer
  | QRCanvasTextLayer
  | CanvasImageSource
  | string;

export interface QRCanvasDrawTextOptions {
  fontSize?: number;
  fontStyle?: string;
  fontFamily?: string;
  color?: string;
  pad?: number;
  padColor?: string;
  mode?: number;
}

export type QRCanvasLayerValue =
  | string
  | CanvasImageSource
  | QRCanvasLayer
  | QRCanvasLayerValue[];

export interface DrawCanvasOptions {
  cellSize?: number;
  context?: CanvasRenderingContext2D;
  clear?: boolean;
}
