const path = require('path');
const gulp = require('gulp');
const log = require('fancy-log');
const rollup = require('rollup');
const del = require('del');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const { uglify } = require('rollup-plugin-uglify');
const pkg = require('./package.json');

const DIST = 'lib';
const IS_PROD = process.env.NODE_ENV === 'production';
const values = {
  'process.env.VERSION': pkg.version,
  'process.env.NODE_ENV': process.env.NODE_ENV || 'development',
};

const getRollupPlugins = ({ babelConfig, browser } = {}) => [
  babel({
    exclude: 'node_modules/**',
    ...browser ? {
      // Combine all helpers at the top of the bundle
      externalHelpers: true,
    } : {
      // Require helpers from '@babel/runtime'
      runtimeHelpers: true,
      plugins: [
        '@babel/plugin-transform-runtime',
      ],
    },
    ...babelConfig,
  }),
  replace({ values }),
  resolve(),
  commonjs(),
];
const getExternal = (externals = []) => id => {
  return id.startsWith('@babel/runtime/') || externals.includes(id);
};

const rollupConfig = [
  {
    input: {
      input: 'src/index.js',
      plugins: getRollupPlugins(),
      external: getExternal([
        'qrcode-generator',
      ]),
    },
    output: {
      format: 'cjs',
      file: `${DIST}/index.common.js`,
    },
  },
  {
    input: {
      input: 'src/index.js',
      plugins: getRollupPlugins({ browser: true }),
    },
    output: {
      format: 'umd',
      file: `${DIST}/index.js`,
      name: 'qrcanvas',
    },
    minify: true,
  },
];
// Generate minified versions
Array.from(rollupConfig)
.filter(({ minify }) => minify)
.forEach(config => {
  rollupConfig.push({
    input: {
      ...config.input,
      plugins: [
        ...config.input.plugins,
        uglify(),
      ],
    },
    output: {
      ...config.output,
      file: config.output.file.replace(/\.js$/, '.min.js'),
    },
  });
});

function clean() {
  return del(DIST);
}

function buildJs() {
  return Promise.all(rollupConfig.map(config => {
    return rollup.rollup(config.input)
    .then(bundle => bundle.write(config.output));
  }));
}

function wrapError(handle) {
  const wrapped = () => handle()
  .catch(err => {
    log(err.toString());
  });
  wrapped.displayName = handle.name;
  return wrapped;
}

function watch() {
  gulp.watch('src/**', safeBuildJs);
}

const safeBuildJs = wrapError(buildJs);

exports.clean = clean;
exports.build = buildJs;
exports.dev = gulp.series(safeBuildJs, watch);
