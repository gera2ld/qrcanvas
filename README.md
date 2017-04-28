QRCanvas
===

![NPM](https://img.shields.io/npm/v/qrcanvas.svg)
![License](https://img.shields.io/npm/l/qrcanvas.svg)
![Downloads](https://img.shields.io/npm/dt/qrcanvas.svg)

This is a QRCode generator written in pure javascript.

Based on [Kazuhiko Arase's QRCode](http://www.d-project.com/).

The only requirement is that the browser works with a `canvas`,
which is supported by most modern browsers.

Installation
---

``` sh
$ npm i qrcanvas
```

Quick Start
---

* Use in browser

  ``` html
  <div id="qrcode"></div>
  <script src="lib/qrcanvas.js"></script>
  ```

  ``` js
  var canvas = qrcanvas({
    data: 'hello, world'
  });
  document.getElementById('qrcode').appendChild(canvas);
  ```

* Use in Node.js

  [node-canvas](https://github.com/Automattic/node-canvas) is required in Node.js.

  ``` js
  const fs = require('fs');
  const qrcanvas = require('qrcanvas');
  const canvas = qrcanvas({
    data: 'hello, world'
  });
  // canvas is an instance of `node-canvas`
  canvas.pngStream().pipe(fs.createWriteStream('qrcode.png'));
  ```

More
---
* [Demo](https://gera2ld.github.io/qrcanvas/)
* [Docs](https://github.com/gera2ld/qrcanvas/wiki)

Snapshots
---

![1](snapshots/1.png)

![2](snapshots/2.png)
