var gulp = require('gulp');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var minify = require('gulp-minify-css');
var jslint  = require('gulp-jslint');
var guitl = require('gulp-util');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var combine = require('stream-combiner2');

function errorHandle(err) {
	var colors = guitl.colors;
	console.log('\n');
	guitl.log(colors.red('Error'));
	guitl.log('fileName : ' + colors.red(err.fileName));
	guitl.log('lineNumber : ' + colors.red(err.lineNumber));
	guitl.log('message : ' + colors.red(err.message));
	guitl.log('plugin : ' + colors.red(err.plugin));
	console.log('\n');
}

gulp.task('watch', function () {
	livereload.listen();

	gulp.watch('front-end/**').on('change', function (file) {
		livereload.changed(file);
	});
	gulp.watch('back-end/**').on('change', function (file) {
		livereload.changed(file);
	});

});

gulp.task('uglifyJS', function () {
	var combined = combine.obj([
		gulp.src('front-end/assets/js/**'),
		jslint(),
		uglify(),
		gulp.dest('front-end/dist/assets/js')
	]);

	combined.on('error',errorHandle);
});

gulp.task('lessCSS', function () {
	var combined = combine.obj([
		gulp.src('front-end/assets/styles/**'),
		less(),
		minify(),
		gulp.dest('front-end/dist/assets/styles')
	]);

	combined.on('error',errorHandle);
});

gulp.task('uglifyAngularJS', function () {
	var combined = combine.obj([

		gulp.src('front-end/api/**.js'),
		concat('all.js'),
		gulp.dest('front-end/dist/api'),
		rename('all.min.js'),
		uglify(),
		gulp.dest('front-end/dist/api')
	]);

	combined.on('error',errorHandle);
});

gulp.task('default',['watch','uglifyJS','uglifyAngularJS','lessCSS'],function () {
	gulp.watch('front-end/assets/js/**.js',['uglifyJS']);
	gulp.watch('front-end/assets/styles/**.less',['lessCSS']);
	gulp.watch('front-end/api/**.js',['uglifyAngularJS']);
});