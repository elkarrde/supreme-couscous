/* jshint strict:false, node:true */
/*
   _____                 __          __ __________                __
  /     \   ____   _____/  |______ _/  |\______   \_____    ____ |  | __
 /  \ /  \_/ __ \ /    \   __\__  \\   __\    |  _/\__  \  /    \|  |/ /
/    Y    \  ___/|   |  \  |  / __ \|  | |    |   \ / __ \|   |  \    <
\____|__  /\___  >___|  /__| (____  /__| |______  /(____  /___|  /__|_ \
        \/     \/     \/          \/            \/      \/     \/     \/

List of possible actions:
  empty          - will recompile Less files and minify JavaScript files,
  script         - will minify and concatenate all JavaScript files,
  style          - will recompile Less files, and concatenate CSS files,
  lint           - will lint JavaScript files,
  server         - will start server on port 17766,
  server:kill    - will kill all Node processes running on port 17766,
  watch          - will watch for changes in JavaScript and Less files, and will recompile/minify them as they change,
  clean          - will remove JavaScript and CSS files,
  help           - will output this list.
*/

var gulp = require('gulp');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var server = require('gulp-express');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var shell = require('gulp-shell');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var del = require('del');
var pkg = require('./package.json');


console.log(util.colors.yellow(
  '#----------> ' +
  pkg.name + util.colors.green(' v' + pkg.version) + ' ' + util.colors.blue('development') +
  ' <----------#'));

// ----- task: style -----
gulp.task('style', function() {
  return gulp.src(['style/style.less', 'style/print.less', 'style/font-*.less'])
  .pipe(changed('public/static/css'))
  .pipe(less())
  .pipe(gulp.dest('public/static/css'))
  .pipe(rename({ suffix: '.min' }))
  .pipe(minifycss())
  .pipe(gulp.dest('public/static/css'));
});

// ----- task: script -----
gulp.task('script', function() {
  return gulp.src('controllers/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(changed('public/static/js'))
  .pipe(jscs({ fix: true }))
  .pipe(gulp.dest('public/static/js'))
  .pipe(rename({ suffix: '.min' }))
  .pipe(uglify())
  .pipe(gulp.dest('public/static/js'));
});

// ----- task: lintjson -----
gulp.task('lint', function() {
  return gulp.src(['routes/**/*.js', 'models/**/*.js', 'app.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jscs({ fix: false }));
});

// ----- task: clean -----
gulp.task('clean', function(cb) {
  del(['public/static/js/*', 'public/static/css/*'], cb);
});

// ----- task: server -----
gulp.task('server', function() {
  server.run(['./bin/www']);

  // Restart the server when file changes
  gulp.watch(['views/**/*.hbs'], ['--rerun']);
  gulp.watch(['app.js', 'gulpfile.js', 'routes/**/*.js', 'models/**/*.js'], ['lint', '--rerun']);
  gulp.watch(['controllers/*.js'], ['script', '--rerun']);
});

// ----- task: server:kill -----
gulp.task('server:kill', function() {
  // FIXME: does not work on Windows machines.
  console.log('[' + util.colors.yellow('××') + '] Killing all instances of running server at port ' + util.colors.magenta('17766') + '...');
  console.log('     ' + util.colors.yellow('Take care!') + ' This won\'t stop gulp processes attached to server!');
  return gulp.src('')
  .pipe(shell(['lsof -i:17766 | grep \'node\' | awk \'{print $2}\' | xargs kill -9']));
});


// ----- internal task only -----
gulp.task('--rerun', function() {
  server.stop();
  server.run(['bin/www']);
});

// ----- task: watch -----
gulp.task('watch', function() {
  gulp.watch('style/*.less', ['style']);
  gulp.watch('controllers/*.js', ['script']);
  gulp.watch('data/*.json', ['lint:json']);
});


// ----- task: help -----
gulp.task('help', function() {
  console.log('');
  console.log('    _____                 __          __ __________                __');
  console.log('   /     \\   ____   _____/  |______ _/  |\\______   \_____    ____ |  | __');
  console.log('  /  \\ /  \\_/ __ \\ /    \\   __\\__  \\\\   __\\    |  _/\\__  \\  /    \\|  |/ /');
  console.log(' /    Y    \\  ___/|   |  \\  |  / __ \\|  | |    |   \\ / __ \\|   |  \\    <');
  console.log(' \\____|__  /\\___  >___|  /__| (____  /__| |______  /(____  /___|  /__|_ \\');
  console.log('         \\/     \\/     \\/          \\/            \\/      \\/     \\/     \\/');
  console.log('');
  console.log(pkg.description + ' v' + pkg.version + ' Gulp project builder.');
  console.log('----------------------------------------------------------------');
  console.log('');
  console.log('Repository: ' + pkg.repository.url);
  console.log('');
  console.log('Usage:');
  console.log('  gulp ' + util.colors.cyan('<action>') + '');
  console.log('');
  console.log('List of possible actions:');
  console.log('  ' + util.colors.gray('empty') + '    - will recompile Less files and minify public JavaScript files,');
  console.log('  script   - will will minify all public JavaScript files,');
  console.log('  style    - will recompile Less files,');
  console.log('  lint     - will lint JavaScript files,');
  console.log('  server   - will start server on port ' + util.colors.magenta('9964') + ',');
  console.log('  watch    - will watch for changes in JavaScript and Less files, and will ' +
              'recompile/minify them as they change,');
  console.log('  clean    - will remove public JavaScript and CSS files,');
  console.log('  help     - will output this list.');
  console.log('');
  console.log('Use ' + util.colors.cyan('--prod') + ' argument to enforce usage of concatenated assets in HTML.');
  console.log('');
});

// ----- task: default -----
gulp.task('default', ['clean'], function() {
  gulp.start('style', 'script', 'lint');
});
