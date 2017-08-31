var path = require('path');
var gulp = require('gulp');
var less = require('gulp-less');
var cleanCSS = require('gulp-clean-css');
var del = require('del');
var imagemin = require('gulp-imagemin');
var runSequence = require('run-sequence');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
var revReplace = require('gulp-rev-replace');

var lessFiles = 'src/style/main.less';
var jsFiles = 'src/js/**.js'
var imgs = 'src/img/*';
var distCss = 'dist/css';
var distJs = 'dist/js';
var distImg = 'dist/img';
var revPath = 'dist/rev';

gulp.task('clean', function() {
  return del.sync([
    'dist/'
  ]);
});

gulp.task('less', function () {
  return gulp.src(lessFiles)
      .pipe(less())
      .pipe(cleanCSS({compatibility: 'ie8'}))
      .pipe(rev())   // 这里不能忘了
      .pipe(gulp.dest(distCss))
      .pipe( rev.manifest('rev-css-manifest.json') )
      .pipe( gulp.dest(revPath) );
});

gulp.task('imagemin', function() {
  return gulp.src(imgs)
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({plugins: [{removeViewBox: true}]})
    ]))
    .pipe(gulp.dest(distImg))
});

gulp.task('buildJs', function() {
  return gulp.src(jsFiles)
      .pipe(uglify())
      .pipe(rev())   // 这里不能忘了
      .pipe(gulp.dest(distJs))
      .pipe( rev.manifest('rev-js-manifest.json') )
      .pipe( gulp.dest(revPath) );
});

gulp.task('rev', function() {
  return setTimeout(function() {
    return gulp.src([path.join(revPath, '*.json'), './src/index.html'])
    .pipe(revCollector())
    .pipe(gulp.dest('./'))
  }, 100);
});

gulp.task('default', function() {
  runSequence(
    [ 'clean', 'less', 'buildJs', 'imagemin' ],
    'rev'  // 必须等前面执行完毕
  );
});