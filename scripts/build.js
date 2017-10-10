const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const alias = require('rollup-plugin-alias');

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
          ['transform-object-rest-spread', {
            useBuiltIns: true,
          }],
        ],
        ignore: 'node_modules/**',
      }),
    ],
    external: [
      'canvas',
    ],
  },
  {
    input: 'src/entries/browser.js',
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
    ],
  },
  {
    input: 'src/entries/browser.js',
    file: 'dist/qrcanvas.slim.js',
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
      alias({
        './plugins/index': './plugins/slim',
      }),
    ],
  }
].forEach(item => {
  rollup.rollup(item)
  .then(bundle => bundle.write(item))
  .catch(err => console.error(err));
});
