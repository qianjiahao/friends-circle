var gulp = require('gulp');
var minifyCSS = require('gulp-minify-css');
var less = require('gulp-less');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var jslint  = require('gulp-jslint');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');

var guitl = require('gulp-util');
var plumber = require('gulp-plumber');
var combine = require('stream-combiner2');



var path = {
	lessPath: 'front-end/assets/styles/**.less',
	angularJSPath: 'front-end/api/**.js',
	viewsPath: 'front-end/views/**.html',
	
	cleanPath: 'front-end/dist/**',
	destLessPath: 'front-end/dist/assets/styles',
	destAngularJSPath : 'front-end/dist/api'
}

function error(err) {
	var colors = guitl.colors;
	console.log('\n');
	guitl.log(colors.red('Error'));
	guitl.log('fileName : ' + colors.red(err.fileName));
	guitl.log('lineNumber : ' + colors.red(err.lineNumber));
	guitl.log('message : ' + colors.red(err.message));
	guitl.log('plugin : ' + colors.red(err.plugin));
	console.log('\n');
}

gulp.task('clean', function () {
	gulp.src(path.cleanPath, {read: false})
		.pipe(clean())
});

gulp.task('watch', function () {
	livereload.listen();

	gulp.watch(path.lessPath, ['lessCSS']);

	gulp.watch(path.angularJSPath, ['uglifyAngularJS']);
		
	gulp.watch(path.viewsPath)
		.on('change', function (file) {
			livereload.changed(file);
		});
});

gulp.task('lessCSS', function () {
	var combined = combine.obj([
		gulp.src(path.lessPath),
		plumber(),
		sourcemaps.init(),
		less({
			plugin: [autoprefix, cleanCSS]
		}),
		minifyCSS(),
		sourcemaps.write('./maps'),
		gulp.dest(path.destLessPath),
		livereload()
	]);

	combined.on('error',error);
});

gulp.task('uglifyAngularJS', function () {
	var combined = combine.obj([
		gulp.src(path.angularJSPath),
		plumber(),
		sourcemaps.init(),
		concat('all.js'),
		gulp.dest(path.destAngularJSPath),
		rename('all.min.js'),
		uglify(),
		sourcemaps.write('./maps'),
		gulp.dest(path.destAngularJSPath),
		livereload()
	]);

	combined.on('error',error);
});

gulp.task('default',['uglifyAngularJS','lessCSS','watch']);