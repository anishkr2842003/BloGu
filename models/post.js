const mongoose = require('mongoose');

// mongoose.connect("mongodb://127.0.0.1:27017/news-cms");

const postSchema = mongoose.Schema({
    title: String,
    desc: String,
    photo: String,
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'false'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
});

module.exports = mongoose.model('post', postSchema);