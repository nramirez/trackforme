'use strict';

import source from 'vinyl-source-stream';
import gulp from 'gulp';
import run from 'run-sequence';
import del from 'del';
import babelify from 'babelify';
import browserify from 'browserify';

const paths = {
  src: './lib',
  dest: './build',
  scripts: [
    'background',
    'foreground',
    'popup',
    'options'
  ]
};

gulp.task('default', cb => {
  run('build', 'watch', cb);
});

gulp.task('build', cb => {
  run('clean', 'scripts', 'img', 'css', 'views', 'manifest', cb);
});

gulp.task('scripts', cb => {
  paths.scripts.forEach(file => jsBrowserifyer(file));
  cb();
});

//Transform ES6 to ES5
const jsBrowserifyer = (fileName) => {
  return browserify({entries: `${paths.src}/scripts/${fileName}.js`, debug: true})
      .transform('babelify', { presets: ['es2015'] })
      .bundle()
      .pipe(source(`${fileName}.js`))
      .pipe(gulp.dest(`${paths.dest}/scripts`));
};

//build when a file has changed
gulp.task('watch', cb => {
  gulp.watch([
    `${paths.src}/lib/**/**`
  ], ['build']);
});

//Clean the app destination, to prepare for new files
gulp.task('clean', () => {
  return del(paths.dest);
});

gulp.task('img', () => {
  return gulp.src(`${paths.src}/img/**`)
    .pipe(gulp.dest(`${paths.dest}/img`));
});

gulp.task('css', () => {
  return gulp.src(`${paths.src}/css/**`)
    .pipe(gulp.dest(`${paths.dest}/css`));
});

gulp.task('views', () => {
  return gulp.src(`${paths.src}/views/**`)
    .pipe(gulp.dest(`${paths.dest}/views`));
});

gulp.task('manifest', () => {
  return gulp.src(`${paths.src}/manifest.json`)
    .pipe(gulp.dest(`${paths.dest}`));
});
