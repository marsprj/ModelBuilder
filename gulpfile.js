var gulp = require("gulp"),
	concat = require("gulp-concat"),
	minifycss = require('gulp-minify-css'),
	uglify = require("gulp-uglify"),
	clean = require('gulp-clean');


/********************GRAPH****************/
gulp.task("graph-task",['graph','graph-css']);

gulp.task('graph-clean',function () {
	return  gulp.src('static/lib/graph.min.js')
		.pipe(clean({force: true}))
});

var graphList = ["static/lib/*.js",
		"static/lib/Dialog/*.js",
		"static/lib/Dialog/*/*.js",
		"static/lib/Dialog/*/*/*.js",
		"static/lib/Node/*.js",
		"static/lib/Node/*/*.js",
		"static/lib/Node/*/*/*.js",
		"static/lib/shape/*.js",
		'!static/lib/graph.min.js'
];
var graphDest = "static/lib/";
gulp.task("graph",['graph-clean'],function(){
	gulp.src(graphList)
		.pipe(uglify())
		.pipe(concat('graph.min.js'))
		.pipe(gulp.dest(graphDest));
});


gulp.task('graph-css-clean', function () {
	return gulp.src('static/lib/css/graph.min.css')
		.pipe(clean({force: true}));

});


var graphCssList = ["static/lib/css/dialog.css",
		"static/lib/css/tooltip.css",
		"static/lib/css/dataText.css"];
var graphCssDest = "static/lib/css/";
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


var indexList = ['static/js/init.js',
		'static/js/models.js',
		'static/js/graph.js',
		'static/js/CreateModelDialog.js',
		'static/js/createTaskDialog.js',
		'static/js/funCatalog.js',
		'static/js/beginnerHelper.js',
		'static/js/monitorDialog.js',
];
var indexDest = 'static/js';
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

var indexCssList = ["static/css/commom.css",
			"static/css/user-dialog.css",
		    "static/css/webuploader.css",
		    "static/css/workflow.css",
];
var indexCssDest = "static/css/";
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

var userCssList = ["static/css/commom.css",
					"static/css/user.css"];
var userCssDest = "static/css/";
gulp.task('user-css',['user-css-clean'],function(){
	gulp.src(userCssList)
		.pipe(minifycss())
		.pipe(concat('user.min.css'))
		.pipe(gulp.dest(userCssDest));
	});



/********************Montior****************/
gulp.task("monitor-task",["monitor","monitor-css"]);

gulp.task("monitor-clean",function(){
	return gulp.src('static/js/monitor.min.js')
	.pipe(clean({force:true}));
});

var monitorList = ["static/js/monitor.js",
	"static/js/monitor-task.js"];
var monitorDest = "static/js"
gulp.task("monitor",["monitor-clean"],function(){
	gulp.src(monitorList)
	.pipe(uglify())
	.pipe(concat("monitor.min.js"))
	.pipe(gulp.dest(monitorDest));
});

gulp.task("monitor-css-clean",function(){
	return gulp.src('Model/static/css/monitor.min.css')
		.pipe(clean({force: true}));
});
var monitorCssList = ["static/css/commom.css",
					"static/css/monitor.css"];
var monitorCssDest = "static/css/";
gulp.task('monitor-css',['monitor-css-clean'],function(){
	gulp.src(monitorCssList)
		.pipe(minifycss())
		.pipe(concat('monitor.min.css'))
		.pipe(gulp.dest(monitorCssDest));
});

/********************Task****************/
gulp.task("task-task",["task","task-css"]);

gulp.task("task-clean",function(){
	return gulp.src('static/js/task.min.js')
	.pipe(clean({force:true}));
});

var taskList = ["static/js/task.js",
	"static/js/model.js"];
var taskDest = "static/js"
gulp.task("task",["task-clean"],function(){
	gulp.src(taskList)
	.pipe(uglify())
	.pipe(concat("task.min.js"))
	.pipe(gulp.dest(taskDest));
});

gulp.task("task-css-clean",function(){
	return gulp.src('Model/static/css/task.min.css')
		.pipe(clean({force: true}));
});
var taskCssList = ["static/css/commom.css",
					"static/css/task.css"];
var taskCssDest = "static/css/";
gulp.task('task-css',['task-css-clean'],function(){
	gulp.src(taskCssList)
		.pipe(minifycss())
		.pipe(concat('task.min.css'))
		.pipe(gulp.dest(taskCssDest));
});


/********************File****************/
gulp.task("file-task",["file","file-css"]);

gulp.task("file-clean",function(){
	return gulp.src('static/js/file.min.js')
	.pipe(clean({force:true}));
});

var fileList = ["static/js/file.js"];
var fileDest = "static/js"
gulp.task("file",["file-clean"],function(){
	gulp.src(fileList)
	.pipe(uglify())
	.pipe(concat("file.min.js"))
	.pipe(gulp.dest(fileDest));
});

gulp.task("file-css-clean",function(){
	return gulp.src('Model/static/css/file.min.css')
		.pipe(clean({force: true}));
});
var fileCssList = ["static/css/commom.css",
					"static/css/file.css"];
var fileCssDest = "static/css/";
gulp.task('file-css',['file-css-clean'],function(){
	gulp.src(fileCssList)
		.pipe(minifycss())
		.pipe(concat('file.min.css'))
		.pipe(gulp.dest(fileCssDest));
});



/********************DEFAULT****************/
gulp.task('default',['graph-task',
	'index-task',
	'user-task',
	'monitor-task',
	'task-task',
	'file-task']);


/********************AUTO****************/
gulp.task('auto',function(){
	gulp.watch(graphList,['graph']);
	gulp.watch(graphCssList,['graph-css']);
	gulp.watch(indexList,['index-js']);
	gulp.watch(indexCssList,['index-css']);
	gulp.watch(userCssList,['user-css']);
	gulp.watch(monitorList,['monitor']);
	gulp.watch(monitorCssList,['monitor-css']);
	gulp.watch(taskList,['task']);
	gulp.watch(taskCssList,['task-css']);
	gulp.watch(fileList,['file']);
	gulp.watch(fileCssList,['file-css']);
});
