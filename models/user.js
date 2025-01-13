const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/testapp1');
// mongoose.connect('mongodb://127.0.0.1:27017/authtestapp');
// mongoose.connect('mongodb://127.0.0.1:27017/testing');
mongoose.connect('mongodb://127.0.0.1:27017/miniproject');

// const userSchema = mongoose.Schema({
//     name: String,
//     email: String,
//     image: String
// });

// const userSchema = mongoose.Schema({
//     username: String,
//     email: String,
//     password: String,
//     age: Number
// })

// const userSchema = mongoose.Schema({
//     username: String,
//     email: String,
//     age: {
//         type: Number
//     },
//     posts: [
//         { 
//             type : mongoose.Schema.Types.ObjectId,
//             ref: "post"
//         }
//     ]
// })

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: String,
    password: String,
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "post"
        }
    ]
})

module.exports = mongoose.model('user', userSchema);