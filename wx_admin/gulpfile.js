/**
 * Created by Administrator on 2016/12/21/021.
 */
var gulp = require('gulp');
// 获取 uglify 模块（用于压缩 JS）
var uglify = require('gulp-uglify');
// 获取 minify-css 模块（用于压缩 CSS）
var minifyCSS = require('gulp-minify-css');
// 获取 gulp-imagemin 模块（用于压缩 IMG）
var imagemin = require('gulp-imagemin');
//自动加前缀
var autoprefixer = require('gulp-autoprefixer')
//源路径
var src = 'src';
var dist = 'dist'
// 通一管理文件路径
var paths = {
    js: {
        src:src+'/js/*.js',
        dist:dist+'/js'
    },
    css:{
        src:src+'/css/*.css',
        dist:dist+'/css'
    },
    images:{
        src:src+'/images/**/*',
        dist:dist+'/images'
    },
    html:{
        src:src+'/*.html',
        dist:dist
    }
};
// 压缩 js 文件
gulp.task('script',function () {

    return gulp.src(paths.js.src)
        .pipe(uglify())
        .pipe(gulp.dest(paths.js.dist))
});
//压缩 css文件
gulp.task('css',function () {

    return gulp.src(paths.css.src)
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest(paths.css.dist))
})
// 压缩图片任务
gulp.task('images',function () {
    return gulp.src(paths.images.src)
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(paths.images.dist))
})
//复制html
gulp.task('html',function () {
    return gulp.src(paths.html.src)
        .pipe(gulp.dest(paths.html.dist))
})

//复制其他文件夹
gulp.task('copy',function(){
    return gulp.src('src/**/*')
        .pipe(gulp.dest('dist'))
})

// 使用 gulp.task('default') 定义默认任务
// 先复制全部在编译对应
gulp.task('default',['copy'],function(){
    gulp.start('css','script','images','html');
})