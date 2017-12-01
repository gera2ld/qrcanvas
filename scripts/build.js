const path = require('path');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const alias = require('rollup-plugin-alias');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');

[
  {
    input: 'src/entries/node.js',
    file: 'dist/qrcanvas.node.js',
    format: 'cjs',
    plugins: [
      babel({
        presets: [
          ['env', {
            modules: false,
            targets: {
              node: 'current',
            },
          }],
          'stage-2',
        ],
        plugins: [
          'external-helpers',
        ],
        ignore: 'node_modules/**',
      }),
    ],
    external: [
      'canvas',
      'qrcode-generator',
      path.resolve('src/entries/qrcanvas.common.js'),
    ],
  },
  // common js
  {
    input: 'src/entries/index.js',
    file: 'dist/qrcanvas.common.js',
    format: 'cjs',
    name: 'qrcanvas',
    plugins: [
      babel({
        presets: [
          ['env', { modules: false }],
          'stage-2',
        ],
        plugins: [
          'external-helpers',
        ],
        ignore: 'node_modules/**',
      }),
    ],
    external: [
      'qrcode-generator',
    ],
  },
  // for unpkg
  {
    input: 'src/entries/index.js',
    file: 'dist/qrcanvas.js',
    format: 'umd',
    name: 'qrcanvas',
    plugins: [
      babel({
        presets: [
          ['env', { modules: false }],
          'stage-2',
        ],
        plugins: [
          'external-helpers',
        ],
        ignore: 'node_modules/**',
      }),
      resolve(),
      commonjs(),
      // uglify(),
    ],
  },
  // for unpkg
  {
    input: 'src/entries/index.js',
    file: 'dist/qrcanvas.min.js',
    format: 'umd',
    name: 'qrcanvas',
    plugins: [
      babel({
        presets: [
          ['env', { modules: false }],
          'stage-2',
        ],
        plugins: [
          'external-helpers',
        ],
        ignore: 'node_modules/**',
      }),
      resolve(),
      commonjs(),
      uglify(),
    ],
  },
].forEach(item => {
  rollup.rollup(item)
  .then(bundle => bundle.write(item))
  .catch(err => console.error(err));
});
