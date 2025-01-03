const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.set("view engine", "ejs"); 
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));

app.get('/', function(req, res){
    // res.send("Running");
    // res.render("index");
    fs.readdir('./files', function(err, files){
        res.render('index', {files: files});
    })
});

app.get('/file/:filename', function (req, res) {
    const filename = req.params.filename;
    fs.readFile(`./files/${filename}`, 'utf-8', function (err, filedata) {        
        console.log(`File content: ${filedata}`);
        res.render("show", {filename: req.params.filename, filedata: filedata})
    });
});

app.get('/edit/:filename', function(req, res){
    res.render('edit', {filename: req.params.filename});
});

app.post('/edit', function(req, res){
    console.log(req.body);
    fs.rename(`./files/${req.body.previous}`, `./files/${req.body.new}`.split(' ').join(''), function(err){
        res.redirect("/");
    });
});

app.post('/create', function(req, res){
    console.log(req.body);
    fs.writeFile(`./files/${req.body.title.split(' ').join('')}`, req.body.details, function(err){
        res.redirect('/');
    });
});


app.listen(3000, ()=>{
    console.log("its running");
});