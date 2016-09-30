var express= require("express");
var path = require("path");
var app = express();

app.use(express.static(path.resolve(".")));
var server = app.listen(9001,function(req,res){
    console.log("listening on port %d",server.address().port);
});

app.get("/",function(req,res){
    res.redirect('./build/page/index.html');
});
