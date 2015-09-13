var gulp = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');

gulp.task('default', function () {
	return gulp.src('lib/*.js')
		.pipe(babel())
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

gulp.task('watch', function(){
	gulp.watch('lib/*.js', ['default']);
});