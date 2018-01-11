var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('default', function () {
	return gulp.src('lib/*.js')
		.pipe(babel({
			presets: ['env']
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('watch', function(){
	gulp.watch('lib/*.js', ['default']);
});
