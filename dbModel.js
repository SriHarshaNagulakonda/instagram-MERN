const mongoose = require('mongoose');

const instance = mongoose.Schema({
    caption: String,
    user: String,
    image:String,
    comments: []
});
const Posts=mongoose.model('posts',instance);

export default Posts;