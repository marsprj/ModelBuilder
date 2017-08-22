var gulp = require("gulp"),
	concat = require("gulp-concat"),
	minifycss = require('gulp-minify-css'),
	uglify = require("gulp-uglify"),
	clean = require('gulp-clean');


/********************GRAPH****************/
gulp.task("graph-task",['graph','graph-css']);

gulp.task('graph-clean',function () {
	return  gulp.src('ModelFlow/static/lib/graph.min.js')
		.pipe(clean({force: true}))
});

var graphList = ["ModelFlow/static/lib/*.js",
		"ModelFlow/static/lib/Dialog/*.js",
		"ModelFlow/static/lib/Node/*.js",
		"ModelFlow/static/lib/Node/*/*.js",
		"ModelFlow/static/lib/shape/*.js",
		'!ModelFlow/static/lib/graph.min.js'
];
var graphDest = "ModelFlow/static/lib/";
gulp.task("graph",['graph-clean'],function(){
	gulp.src(graphList)
		.pipe(uglify())
		.pipe(concat('graph.min.js'))
		.pipe(gulp.dest(graphDest));
});


gulp.task('graph-css-clean', function () {
	return gulp.src('ModelFlow/static/lib/css/graph.min.css')
		.pipe(clean({force: true}));
    
});


var graphCssList = ["ModelFlow/static/lib/css/dialog.css"];
var graphCssDest = "ModelFlow/static/lib/css/";
gulp.task('graph-css',['graph-css-clean'],function(){
	gulp.src(graphCssList)
		.pipe(minifycss())
		.pipe(concat('graph.min.css'))
		.pipe(gulp.dest(graphCssDest));		
	});


/********************INDEX****************/
gulp.task('index-task',['index-js','index-css']);

gulp.task('index-js-clean', function () {
	return gulp.src('Model/static/js/index.min.js')
		.pipe(clean({force: true}));
});


var indexList = ['ModelFlow/static/js/init.js',
		'ModelFlow/static/js/models.js',
		'ModelFlow/static/js/graph.js',
		'ModelFlow/static/js/CreateModelDialog.js',
		'ModelFlow/static/js/createTaskDialog.js',
];
var indexDest = 'ModelFlow/static/js';
gulp.task('index-js',['index-js-clean'],function(){
	gulp.src(indexList)
		.pipe(uglify())
		.pipe(concat('index.min.js'))
		.pipe(gulp.dest(indexDest));
});

gulp.task('index-css-clean', function () {
	return gulp.src('Model/static/js/index.min.css')
		.pipe(clean({force: true}));
});

var indexCssList = ["ModelFlow/static/css/user-dialog.css",
		    "ModelFlow/static/css/webuploader.css",
		    "ModelFlow/static/css/workflow.css",
];
var indexCssDest = "ModelFlow/static/css/";
gulp.task('index-css',['index-css-clean'],function(){
	gulp.src(indexCssList)
		.pipe(minifycss())
		.pipe(concat('index.min.css'))
		.pipe(gulp.dest(indexCssDest));		
	});

/********************USER****************/
gulp.task('user-task',['user-css']);

gulp.task('user-css-clean', function () {
	return gulp.src('Model/static/css/user.min.css')
		.pipe(clean({force: true}));
});

var userCssList = ["ModelFlow/static/css/user.css"];
var userCssDest = "ModelFlow/static/css/";
gulp.task('user-css',['user-css-clean'],function(){
	gulp.src(userCssList)
		.pipe(minifycss())
		.pipe(concat('user.min.css'))
		.pipe(gulp.dest(userCssDest));		
	});

/********************DEFAULT****************/
gulp.task('default',['graph-task','index-task','user-task']);


/********************AUTO****************/
gulp.task('auto',function(){
	gulp.watch(graphList,['graph']);
	gulp.watch(graphCssList,['graph-css']);
	gulp.watch(indexList,['index-js']);
	gulp.watch(indexCssList,['index-css']);
	gulp.watch(userCssList,['user-css']);
});
