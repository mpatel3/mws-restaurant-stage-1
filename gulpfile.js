'use strict';

let autoprefixer = require('gulp-autoprefixer');
let minify = require('gulp-clean-css');
let del = require('del');
let concat = require('gulp-concat');
let gulp = require('gulp');
let htmlmin = require('gulp-htmlmin');
let runSequence = require('run-sequence');
let uglify = require('gulp-uglify-es').default;
let usemin = require('gulp-usemin');

// Set the browser that you want to support
const AUTOPREFIXER_BROWSERS = [
    'ie >= 11',
    'ie_mob >= 11',
    'ff >= 30',
    'chrome >= 40',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

const vendorJSfiles  = ['./node_modules/leaflet/leaflet.js','./node_modules/picturefill/dist/picturefill.min.js','./node_modules/idb/lib/idb.js'];
const vendorCSSfiles = ['./node_modules/leaflet/leaflet.css','./assets/fonts/fonts.css'];
const userCSSfiles = ['./css/styles.css'];
const indexJSfiles = ['./js/dbhelper.js','./js/main.js','!./js/picturefill.min.js','./js/idb-app.js'];
const restaurnatJSfiles = ['./js/dbhelper.js','./js/restaurant_info.js','!./js/picturefill.min.js','./js/idb-app.js'];

// Gulp task to minify CSS files
gulp.task('minifyVendorCSS', ['clean'], () => {
    return gulp.src(vendorCSSfiles)
    // concat the JS files   
    .pipe(concat('vendor.css'))
    // Auto-prefix css styles for cross browser compatibility
    .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    // Minify the file
    .pipe(minify())
    // Output
    .pipe(gulp.dest('./build/css'))
});

// Gulp task to minify CSS files
gulp.task('minifyUserCSS', ['clean'], () => {
    return gulp.src(userCSSfiles)
    // concat the JS files   
    .pipe(concat('app.css'))
    // Auto-prefix css styles for cross browser compatibility
    .pipe(autoprefixer({browsers: AUTOPREFIXER_BROWSERS}))
    // Minify the file
    .pipe(minify())
    // Output
    .pipe(gulp.dest('./build/css'))
});

// Gulp task to minify JavaScript files
gulp.task('minifyVendorJS', ['clean'], () => {
    return gulp.src(vendorJSfiles)
    // concat the JS files   
    .pipe(concat('vendor.js'))
    // Minify the file
    .pipe(uglify(({ mangle: false })))
    // Output
    .pipe(gulp.dest('./build/js'))
});

// Gulp task to minify JavaScript files
gulp.task('minifyIndexJS', ['clean'],() => {
    return gulp.src(indexJSfiles)
    // concat the JS files   
    .pipe(concat('app_main.js'))
    // Minify the file
    .pipe(uglify())
    // Output
    .pipe(gulp.dest('./build/js'))
});

// Gulp task to minify JavaScript files
gulp.task('minifyRestaurantInfoJS', ['clean'],() => {
    return gulp.src(restaurnatJSfiles)
    // concat the JS files   
    .pipe(concat('app_restaurant_info.js'))
    // Minify the file
    .pipe(uglify())
    // Output
    .pipe(gulp.dest('./build/js'))
});

// Gulp task to minify HTML files
gulp.task('pages', ['clean'],() => {
    return gulp.src(['./index.html','./restaurant.html'])
      .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true
      }))
      .pipe(gulp.dest('./build'));
});

gulp.task('copyServiceWorker',()=>{
    return gulp.src(['./service-worker.js','./manifest.json'])
    .pipe(gulp.dest('./build'))
});

//gulp task to copy the images.
gulp.task('copyImages', ['clean'],() => {
    return gulp.src(['./node_modules/leaflet/dist/images/**/*.png','./img/**/*.*'])
    .pipe(gulp.dest('./build/css/images'));
});

gulp.task('usemin',['pages'],() => {
    return gulp.src(['./index.html','./restaurant.html'])
    .pipe(usemin({
        css: [minify()],
        js:  [uglify()]
    }))
    .pipe(gulp.dest('build/'));
});


// Clean output directory
gulp.task('clean', () => del(['build']));

gulp.task('default', ['clean'], () => {
    gulp.start('usemin','copyImages','copyServiceWorker','minifyVendorCSS','minifyUserCSS','minifyVendorJS','minifyIndexJS','minifyRestaurantInfoJS');
});

//GULP - V4 -migration
/* gulp.task('default',
  gulp.series('clean', gulp.parallel('minifyVendorCSS', 'minifyUserCSS','minifyVendorJS','minifyUSerJS','pages'))); */

// Gulp V4
/* gulp.task('default', ['clean'], function () {
  runSequence(
    'minifyVendorCSS',
    'minifyUserCSS',
    'minifyVendorJS',
    'minifyUSerJS',
    'pages'
  );
}); */
