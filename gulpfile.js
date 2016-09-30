var gulp = require("gulp");
var livereload = require("gulp-livereload");

gulp.task("reload",function(){
    livereload.listen();
    gulp.watch(["./build/pages/*.*","./build/pages/**/*.*"],function(file){
        livereload.reload(file)
    });
});

gulp.task("default",["reload"]);


