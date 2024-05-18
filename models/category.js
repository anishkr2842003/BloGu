const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/news-cms");
// const uri = "mongodb+srv://anishkr2842003:hBgzTXe2hqlgHqSc@news-cms.c3ekan4.mongodb.net/?retryWrites=true&w=majority&appName=news-cms";
// mongoose.connect(uri);

const categorySchema = mongoose.Schema({
    name: String,
    user: mongoose.Schema.Types.ObjectId,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }]
});

module.exports = mongoose.model('category', categorySchema);