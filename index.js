const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const userSchema = require('./userModel');
const userSchema1 = require('./models/user');
const cookieParser = require('cookie-parser');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser()) // use to read cookies on another routes

app.get('/', function (req, res) {
    // res.send("Running");
    // res.render("index");

    // fs.readdir('./files', function(err, files){
    //     res.render('index', {files: files});
    // });

    res.render('index1')
});

app.get('/file/:filename', function (req, res) {
    const filename = req.params.filename;
    fs.readFile(`./files/${filename}`, 'utf-8', function (err, filedata) {
        console.log(`File content: ${filedata}`);
        res.render("show", { filename: req.params.filename, filedata: filedata })
    });
});

app.get('/edit/:filename', function (req, res) {
    res.render('edit', { filename: req.params.filename });
});

app.post('/edit', function (req, res) {
    console.log(req.body);
    fs.rename(`./files/${req.body.previous}`, `./files/${req.body.new}`.split(' ').join(''), function (err) {
        res.redirect("/");
    });
});

app.post('/create', function (req, res) {
    console.log(req.body);
    fs.writeFile(`./files/${req.body.title.split(' ').join('')}`, req.body.details, function (err) {
        res.redirect('/');
    });
});


//MongoDb - CRUD
app.get('/add', async function (req, res) {
    const addUser = await userSchema.create({
        name: "samarth",
        username: "samarth28",
        email: "samarth@gmail.com"
    })
    console.log(addUser);
    res.send(addUser);
});

app.get('/update', async function (req, res) {
    const updatedUser = await userSchema.findOneAndUpdate(
        { username: "samarth28" }, { name: "codewithsam" }, { new: true }
    );
    console.log(updatedUser);
    res.send(updatedUser);
});

app.get('/user', async function (req, res) {
    // get all users
    const fetchedUsers = await userSchema.find({})

    // get first user
    // const fetchedUsers = await userSchema.findOne({})

    //get user with name samarth
    // const fetchedUsers = await userSchema.findOne({name: "samarth"})

    console.log(fetchedUsers);
    res.send(fetchedUsers)
});

app.get('/delete', async function (req, res) {
    const deletedUser = await userSchema.findOneAndDelete(
        { name: "samarth" }
    )
    console.log(deletedUser);
    res.send(deletedUser);
})

//EJS - CRUD
app.get('/read', async function (req, res) {
    const allUsers = await userSchema1.find({});
    // console.log(allUsers);
    res.render('read', { users: allUsers });
});

app.post('/createUser', async function (req, res) {
    const { name, email, image } = req.body;
    const createUser = await userSchema1.create({
        name,
        email,
        image
    });
    res.redirect("/read");
});

app.get('/deleteUser/:id', async function (req, res) {
    const id = req.params.id;
    await userSchema1.findOneAndDelete({ _id: id });
    // console.log(deletedUser);
    res.redirect("/read");
});

app.get('/editUser/:id', async function (req, res) {
    const id = req.params.id;
    const fetchedUser = await userSchema1.findOne({ _id: id });
    console.log(fetchedUser);
    res.render('editUser', { user: fetchedUser });
});

app.post('/updateUser/:id', async function (req, res) {
    const { name, email, image } = req.body;    
    console.log(name,email,image,req.params.id)
    await userSchema1.findOneAndUpdate(
        { _id : req.params.id },
        {
            name, email, image
        },
        { new: true }
    )
    res.redirect('/read');
});

app.get("/auth", function(req, res){
    // res.cookie("name","samarth")
    //Encryption
    bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash("123", salt, function(err, hash){
            console.log("hash:",hash);
        })
    })

    //Decryption
    bcrypt.compare("123", "$2b$10$jkxcHSqReGfdSt5D7xudHeS52BgZD9C2JxntfagSzcIpkBuosVAKG", function(err, result){
        console.log("Result:", result);
    })
    
    //JWT
    let token = jwt.sign({email: "samarth@gmail.com"}, "secret")
    console.log(token);
    res.cookie("token",token);
    
    res.send("Authentication & Authorization");
})

app.get("/auth1", function(req, res){
    console.log(req.cookies);
    res.send("Done")
})

app.listen(3000, () => {
    console.log("its running");
});