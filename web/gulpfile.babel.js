'use strict';

import source from 'vinyl-source-stream';
import gulp from 'gulp';
import browserify from 'browserify';
import babelify from 'babelify';
import run from 'run-sequence';
import del from 'del';
import shell from 'gulp-shell';
import server from 'gulp-live-server';
import babel from 'gulp-babel';
import bower from 'gulp-bower';
import copy from 'gulp-copy';

const paths = {
    src: './src',
    publicSrc: './public/js',
    views: './views',
    css: './public/css',
    img: './public/img',
    dest: './build',
    bundle: 'bundle.js',
    bundleDest: './build/public/js',
    mainJs: './public/js/index',
    common: '../common'
};

//Catch the server instance
let express;

gulp.task('default', cb => {
    run('server', 'clean-common', 'common', 'build', 'watch', cb);
});

gulp.task('bower', cb => {
    return bower('./bower_components')
        .pipe(gulp.dest(`${paths.dest}/public/vendors`))
});

gulp.task('build', cb => {
    run('clean', 'babel', 'bower', 'img', 'css', 'client', 'restart', cb);
});

//This task is to publish to our site
gulp.task('deploy-server', cb => {
    run('clean', 'babel', 'bower', 'img', 'css', 'client', cb);
});

//build when a file has changed
gulp.task('watch', cb => {
    gulp.watch([
        `${paths.views}/**.handlebars`,
        `${paths.src}/**/**`,
        `${paths.common}/src/**.js`
    ], ['common', 'build']);
});

/*
  Server
*/
gulp.task('server', () => {
    express = server.new(paths.dest);
});

gulp.task('restart', () => {
    express.start.bind(express)();
});

//Clean the app destination, to prepare for new files
gulp.task('clean', cb => {
    return del(paths.dest);
});

gulp.task('clean-common', cb => {
    return del(`${paths.common}/build`, {
        force: true
    });
});

//Transform back-end ES6 to ES5
//only transform features not supported by node v5
gulp.task('babel', cb => {
    return gulp.src(`${paths.src}/**/*.js`)
        .pipe(babel({
            presets: ['es2015-node5', 'stage-0']
        }))
        .pipe(gulp.dest(paths.dest));
});

/*
  Client
*/
//Transform client ES6 to ES5
//With react support
gulp.task('client', cb => {
    return browserify({
            entries: paths.mainJs,
            debug: true
        })
        .transform('babelify', {
            presets: ['es2015']
        })
        .bundle()
        .pipe(source(paths.bundle))
        .pipe(gulp.dest(paths.bundleDest));
});

gulp.task('css', cb => {
    return gulp.src(`${paths.css}/**`)
        .pipe(copy(paths.dest));
});

gulp.task('img', cb => {
    return gulp.src(`${paths.img}/**`)
        .pipe(copy(paths.dest));
});

/*
  Common
*/
gulp.task('common', cb => {
    return gulp.src(`${paths.common}/src/**/*.js`)
        .pipe(babel({
            presets: ['es2015', 'stage-0']
        }))
        .pipe(gulp.dest(`${paths.common}/build`));
});
