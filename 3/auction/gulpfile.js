let gulp = require('gulp4')
let less = require('gulp-less')
let pug = require('gulp-pug')
let babel = require('gulp-babel')
let concat = require('gulp-concat')

let browsersync = require('browser-sync').create()

let auctionSettings = require('./app/JSON/auctionSettings.json')
let paintings = require('./app/JSON/paintings.json')
let participants = require('./app/JSON/participants.json')

function browserSync(params)
{
    browsersync.init({
        proxy: "https://localhost:3000",
        notify: false,
    })
}

gulp.task('less', () => {
    return gulp.src('app/less/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('app/css'))
})

gulp.task('participants-pug', () => {
    return gulp.src('app/pug/participants/participants.pug')
        .pipe(pug({
            data: {library: participants}
        }))
        .pipe(gulp.dest('app/html'))
})

gulp.task('index-pug', () => {
    return gulp.src('app/pug/index.pug')
        .pipe(pug({
            data: {library: paintings}
        }))
        .pipe(gulp.dest('app/html'))
})

gulp.task('auctionSettings-pug', () => {
    return gulp.src('app/pug/auctionSettings/auctionSettings.pug')
        .pipe(pug({
            data: {library: auctionSettings}
        }))
        .pipe(gulp.dest('app/html'))
})

let watch = gulp.parallel(browserSync);

exports.default = watch