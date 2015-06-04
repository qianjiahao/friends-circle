var gulp = require('gulp');
var livereload = require('gulp-livereload');


gulp.task('watch', function () {
	livereload.listen();

	gulp.watch('front-end/**').on('change', function (file) {
		livereload.changed(file);
		console.log('------   front-end is changing   --------');
	});
	gulp.watch('back-end/**').on('change', function (file) {
		livereload.changed(file);
		console.log('------   back-end is changing   ---------');
	});


});

gulp.task('default',['watch'],function () {
	console.log(' the front-end and back-end were under watching');
});