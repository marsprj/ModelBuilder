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
		"ModelFlow/static/lib/Dialog/*/*.js",
		"ModelFlow/static/lib/Dialog/*/*/*.js",
		"ModelFlow/static/lib/Node/*.js",
		"ModelFlow/static/lib/Node/*/*.js",
		"ModelFlow/static/lib/Node/*/*/*.js",
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


var graphCssList = ["ModelFlow/static/lib/css/dialog.css",
		"ModelFlow/static/lib/css/tooltip.css",
		"ModelFlow/static/lib/css/dataText.css"];
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
		'ModelFlow/static/js/funCatalog.js',
		'ModelFlow/static/js/beginnerHelper.js',
		'ModelFlow/static/js/monitorDialog.js',
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

var indexCssList = ["ModelFlow/static/css/commom.css",
			"ModelFlow/static/css/user-dialog.css",
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

var userCssList = ["ModelFlow/static/css/commom.css",
					"ModelFlow/static/css/user.css"];
var userCssDest = "ModelFlow/static/css/";
gulp.task('user-css',['user-css-clean'],function(){
	gulp.src(userCssList)
		.pipe(minifycss())
		.pipe(concat('user.min.css'))
		.pipe(gulp.dest(userCssDest));		
	});



/********************Montior****************/
gulp.task("monitor-task",["monitor","monitor-css"]);

gulp.task("monitor-clean",function(){
	return gulp.src('ModelFlow/static/js/monitor.min.js')
	.pipe(clean({force:true}));
});

var monitorList = ["ModelFlow/static/js/monitor.js",
	"ModelFlow/static/js/monitor-task.js"];
var monitorDest = "ModelFlow/static/js"
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
var monitorCssList = ["ModelFlow/static/css/commom.css",
					"ModelFlow/static/css/monitor.css"];
var monitorCssDest = "ModelFlow/static/css/";
gulp.task('monitor-css',['monitor-css-clean'],function(){
	gulp.src(monitorCssList)
		.pipe(minifycss())
		.pipe(concat('monitor.min.css'))
		.pipe(gulp.dest(monitorCssDest));		
});

/********************Task****************/
gulp.task("task-task",["task","task-css"]);

gulp.task("task-clean",function(){
	return gulp.src('ModelFlow/static/js/task.min.js')
	.pipe(clean({force:true}));
});

var taskList = ["ModelFlow/static/js/task.js",
	"ModelFlow/static/js/model.js"];
var taskDest = "ModelFlow/static/js"
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
var taskCssList = ["ModelFlow/static/css/commom.css",
					"ModelFlow/static/css/task.css"];
var taskCssDest = "ModelFlow/static/css/";
gulp.task('task-css',['task-css-clean'],function(){
	gulp.src(taskCssList)
		.pipe(minifycss())
		.pipe(concat('task.min.css'))
		.pipe(gulp.dest(taskCssDest));		
});

/********************DEFAULT****************/
gulp.task('default',['graph-task','index-task','user-task','monitor-task','task-task']);


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
});
