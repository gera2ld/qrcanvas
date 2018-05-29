const path = require('path');
const gulp = require('gulp');
const log = require('fancy-log');
const rollup = require('rollup');
const del = require('del');
const rename = require('gulp-rename');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const { uglify } = require('rollup-plugin-uglify');
const pkg = require('./package.json');

const DIST = 'dist';
const IS_PROD = process.env.NODE_ENV === 'production';
const values = {
  'process.env.VERSION': pkg.version,
  'process.env.NODE_ENV': process.env.NODE_ENV || 'development',
};


const rollupPlugins = [
  resolve(),
  commonjs(),
  replace({ values }),
];
const commonConfig = {
  input: {
    plugins: [
      babel({
        exclude: 'node_modules/**',
        externalHelpers: true,
      }),
      ...rollupPlugins,
    ],
  },
};
const rollupConfig = [
  {
    input: {
      ...commonConfig.input,
      input: 'src/entries/index.js',
    },
    output: {
      ...commonConfig.output,
      format: 'umd',
      name: 'qrcanvas',
      file: `${DIST}/qrcanvas.js`,
    },
    minify: true,
  },
  {
    input: {
      ...commonConfig.input,
      input: 'src/entries/index.js',
      external: [
        'canvas',
        'qrcode-generator',
        path.resolve('src/entries/qrcanvas.common.js'),
      ],
    },
    output: {
      ...commonConfig.output,
      format: 'cjs',
      file: `${DIST}/qrcanvas.common.js`,
    },
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

function buildRollup() {
  return Promise.all(rollupConfig.map(config => {
    return rollup.rollup(config.input)
    .then(bundle => bundle.write(config.output))
    .catch(err => {
      log(err.toString());
    });
  }));
}

function buildNode() {
  return gulp.src('src/entries/node.js')
  .pipe(rename('qrcanvas.node.js'))
  .pipe(gulp.dest(DIST));
}

function watch() {
  gulp.watch('src/**', buildJs);
}

const buildJs = gulp.parallel(buildRollup, buildNode);

exports.clean = clean;
exports.build = buildJs;
exports.dev = gulp.series(buildJs, watch);
