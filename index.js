const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const userSchema = require('./userModel');
const userSchema1 = require('./models/user');
const postSchema = require('./models/post');
const cookieParser = require('cookie-parser');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const post = require('./models/post');
const multer = require('multer');
const crypto = require('crypto');
const multerconfig = require('./config/multerconfig');
const user = require('./models/user');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser()) // use to read cookies on another routes

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12, function (err, bytes) {
            const fn = bytes.toString("hex") + path.extname(file.originalname);
            cb(null, fn)
        })
    }
})

const upload = multer({ storage: storage })

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
    // console.log(req.body);
    fs.rename(`./files/${req.body.previous}`, `./files/${req.body.new}`.split(' ').join(''), function (err) {
        res.redirect("/");
    });
});

app.post('/create', function (req, res) {
    // console.log(req.body);
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
    console.log(name, email, image, req.params.id)
    await userSchema1.findOneAndUpdate(
        { _id: req.params.id },
        {
            name, email, image
        },
        { new: true }
    )
    res.redirect('/read');
});

app.get("/auth", function (req, res) {
    // res.cookie("name","samarth")
    //Encryption
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash("123", salt, function (err, hash) {
            console.log("hash:", hash);
        })
    })

    //Decryption
    bcrypt.compare("123", "$2b$10$jkxcHSqReGfdSt5D7xudHeS52BgZD9C2JxntfagSzcIpkBuosVAKG", function (err, result) {
        console.log("Result:", result);
    })

    //JWT
    let token = jwt.sign({ email: "samarth@gmail.com" }, "secret")
    console.log(token);
    res.cookie("token", token);

    res.send("Authentication & Authorization");
})

app.get("/auth1", function (req, res) {
    console.log(req.cookies);
    res.send("Done")
})

app.get("/auth2", function (req, res) {
    res.render('index2');
    console.log("cookie", req.cookies)
})

app.post('/createAuthUser', function (req, res) {
    let { username, email, password, age } = req.body;
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            if (err) return err;
            else {
                await userSchema1.create({
                    username,
                    email,
                    password: hash,
                    age
                });
                const token = jwt.sign({ email }, "secret");
                res.cookie("token", token);
                res.redirect('/auth2');
            }
        })
    })
})

app.get('/login', function (req, res) {
    // console.log(req.cookies);
    res.render("login");
})

app.post('/loginUser', async function (req, res) {
    let { username, password } = req.body;
    let user = await userSchema1.findOne({ username: username })
    if (!user) return res.send("Something went wrong");
    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            const token = jwt.sign({ email: user.email }, "secret");
            res.cookie("token", token);
            res.send("Logged In Successfully");
        }
        else return res.send("Something went wront")
    })
})

app.get('/logout', function (req, res) {
    res.clearCookie("token");
    res.redirect('/login');
})

app.get('/data', async function (req, res) {
    let user = await userSchema1.create({
        username: "samarth",
        email: "samarth@gmail.com",
        age: 21,
    })
    res.send(user)
});

app.get('/post', async function (req, res) {
    let post = await postSchema.create({
        postdata: "hello this is nodejs",
        user: "678154cb06116ef3630d217e",
    })
    let user = await userSchema1.findOne({ _id: "678154cb06116ef3630d217e" })
    user.posts.push(post._id);
    user.save();

    res.send({ user, post })
})

app.get('/auth3', function (req, res) {
    // console.log(req.cookies)
    res.render("index3")
})

app.post('/insertUser', async function (req, res) {
    let { username, name, email, password, age } = req.body;

    let user = await userSchema1.findOne({ email: email });
    if (user) return res.send("Something went wrong");
    else {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                let user = await userSchema1.create({
                    username,
                    name,
                    email,
                    password: hash,
                    age
                })
                const token = jwt.sign({ email: email }, "secret");
                res.cookie("token", token);
                res.redirect('/auth3');
            })
        })
    }
})

app.get('/auth4', function (req, res) {
    res.render('loginUser');
})

app.post('/fetchUser', async function (req, res) {
    let { username, password } = req.body;
    let user = await userSchema1.findOne({ username: username })
    if (!user) return res.send("Something went wrong");
    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            const token = jwt.sign({ email: user.email, userid: user._id }, "secret");
            res.cookie("token", token);
            res.redirect("profile");
        }
        else return res.send("Something went wront")
    })
})

app.get('/profile', isLoggedIn, async function (req, res) {
    // console.log(req.user.email)
    let user = await userSchema1.findOne({ email: req.user.email }).populate('posts')
    res.render('profile', { users: user })
})

app.get('/like/:id', isLoggedIn, async function (req, res) {
    let post = await postSchema.findOne({ _id: req.params.id }).populate('user')
    // console.log(req.user);

    if (post.likes.indexOf(req.user.userid) == -1) {
        post.likes.push(req.user.userid);
    }
    else {
        post.likes.splice(post.likes.indexOf(req.user.userid), 1)
    }

    await post.save();
    res.redirect('/profile');
})

app.get('/editPost/:id', async function (req, res) {
    let post = await postSchema.findOne({ _id: req.params.id }).populate('user')
    res.render('editPost', { post: post });

})

app.post('/updatePost/:id', async function (req, res) {
    console.log(req.body)
    console.log(req.params.id)
    await postSchema.findOneAndUpdate(
        { _id: req.params.id },
        {
            content: req.body.content
        },
        { new: true }
    )
    res.redirect('/profile');

})

app.post('/createPost', isLoggedIn, async function (req, res) {
    let user = await userSchema1.findOne({ email: req.user.email });
    let post = await postSchema.create({
        user: user._id,
        content: req.body.content,
    })
    // console.log("user: ", user);
    // console.log("post: ", post);
    user.posts.push(post._id);
    await user.save();
    res.redirect('profile')
})

app.get('/test', function (req, res) {
    res.render('file')
})

app.post('/uploadFile', isLoggedIn, multerconfig.single('image'), async function (req, res) {
    let user = await userSchema1.findOne({email: req.user.email});
    user.profilePic = req.file.filename;
    await user.save(); 
    res.redirect('profile')
})

function isLoggedIn(req, res, next) {
    if (!req.cookies.token) return res.redirect('auth4');
    else {
        let data = jwt.verify(req.cookies.token, "secret");
        req.user = data;
        next();
    }
}

app.listen(3000, () => {
    console.log("its running");
});