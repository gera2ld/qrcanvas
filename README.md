# QRCanvas

![NPM](https://img.shields.io/npm/v/qrcanvas.svg)
![License](https://img.shields.io/npm/l/qrcanvas.svg)
![Downloads](https://img.shields.io/npm/dt/qrcanvas.svg)

This is a QRCode generator written in pure javascript.

Based on [Kazuhiko Arase's QRCode](http://www.d-project.com/).

The only requirement is that the browser works with a `canvas`,
which is supported by most modern browsers.

## Installation

``` sh
$ yarn add qrcanvas
```

## Quick Start

* Use in modules

  ``` js
  import { qrcanvas } from 'qrcanvas';
  ```

* Use in browser

  ``` html
  <div id="qrcode"></div>

  <script src="https://cdn.jsdelivr.net/npm/qrcanvas@3"></script>
  ```

  ``` js
  const canvas = qrcanvas.qrcanvas({
    data: 'hello, world'
  });
  document.getElementById('qrcode').appendChild(canvas);
  ```

* Use in Node.js

  [node-canvas](https://github.com/Automattic/node-canvas) is required in Node.js.

  ``` js
  const fs = require('fs');
  const { qrcanvas } = require('qrcanvas/lib/qrcanvas.node.js');
  const canvas = qrcanvas({
    data: 'hello, world'
  });
  // canvas is an instance of `node-canvas`
  canvas.pngStream().pipe(fs.createWriteStream('qrcode.png'));
  ```

## More

- [Docs](https://github.com/gera2ld/qrcanvas/wiki)
- [Demo](https://gera2ld.github.io/qrcanvas/)
- [Examples](https://gera2ld.github.io/qrcanvas/examples/)
- Use with other libraries
  - [qrcanvas-vue](https://github.com/gera2ld/qrcanvas-vue)
  - [qrcanvas-react](https://github.com/gera2ld/qrcanvas-react)

## Snapshots

![1](https://user-images.githubusercontent.com/3139113/39859468-8acec31a-546c-11e8-83b6-10e889423e88.png)

![2](https://user-images.githubusercontent.com/3139113/39859482-9b6c0d68-546c-11e8-83cd-d03a148c3e70.png)
