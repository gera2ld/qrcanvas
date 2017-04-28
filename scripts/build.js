const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const alias = require('rollup-plugin-alias');
const replace = require('rollup-plugin-replace');

[
  {
    entry: 'src/index.js',
    dest: 'dist/qrcanvas.node.js',
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
    entry: 'src/index.js',
    dest: 'dist/qrcanvas.js',
    format: 'umd',
    moduleName: 'qrcanvas',
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
        './node': './browser',
      }),
      replace({
        'global.Uint8Array' : 'window.Uint8Array || window.Array',
      }),
    ],
  },
  {
    entry: 'src/index.js',
    dest: 'dist/qrcanvas.slim.js',
    format: 'umd',
    moduleName: 'qrcanvas',
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
        './node': './browser',
        './plugins/index': './plugins/slim',
      }),
      replace({
        'global.Uint8Array': 'window.Uint8Array || window.Array',
      }),
    ],
  }
].forEach(item => {
  rollup.rollup(item)
  .then(bundle => bundle.write(item))
  .catch(err => console.error(err));
});
