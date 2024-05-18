const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/news-cms");
// const uri = "mongodb+srv://anishkr2842003:hBgzTXe2hqlgHqSc@news-cms.c3ekan4.mongodb.net/?retryWrites=true&w=majority&appName=news-cms";
// mongoose.connect(uri);

const postSchema = mongoose.Schema({
    title: String,
    desc: String,
    photo: String,
    date: {
        type: Date,
        default: Date.now
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