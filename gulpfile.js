const fs = require('fs');
const gulp = require('gulp');
const clone = require('gulp-clone');
const wrap = require('gulp-wrap');
const replace = require('gulp-replace');
const concat = require('gulp-concat');
const header = require('gulp-header');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint');
const merge = require('merge2');
const pkg = require('./package.json');
const banner = `\
/**
 * <%= pkg.title %> - <%= pkg.description %>
 * @version v<%= pkg.version %>
 * @license <%= pkg.license %>
 * @author <%= pkg.author %>
 */
`;

gulp.task('build', () => {
  const script = gulp.src('src/**/*.js')
  .pipe(concat('qrcanvas.js'))
  .pipe(wrap({src: 'scripts/exports.js'}));
  const nodeVersion = script.pipe(clone())
  .pipe(replace(/process\.env\.BROWSER/g, 'false'))
  .pipe(rename('qrcanvas.node.js'));
  const browserVersion = script
  .pipe(replace(/process\.env\.BROWSER/g, 'true'));
  const slimVersion = gulp.src([
    'src/**/*.js',
    '!src/plugins/**',
  ])
  .pipe(concat('qrcanvas.slim.js'))
  .pipe(wrap({src: 'scripts/exports.js'}))
  .pipe(replace(/process\.env\.BROWSER/g, 'true'));
  let stream = merge(nodeVersion, browserVersion, slimVersion);
  if (process.env.NODE_ENV === 'production') stream = stream
  .pipe(uglify({
    mangleProperties: {
      regex: /^m_/,
    },
  }))
  .pipe(header(banner, {pkg: pkg}));
  return stream
  .pipe(gulp.dest('dist/'));
});

gulp.task('demo', () => {
  return gulp.src('scripts/demo/**')
  .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['build', 'demo']);

gulp.task('lint', () => {
  return gulp.src([
    'src/**/*.js',
    '!src/qrcode-light.js',
  ])
  .pipe(eslint())
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
});

gulp.task('watch', ['default'], () => {
  gulp.watch('src/**/*.js', ['build']);
  gulp.watch('scripts/demo/**', ['demo']);
});
