const mongoose = require('mongoose');

// mongoose.connect("mongodb://127.0.0.1:27017/news-cms");

const categorySchema = mongoose.Schema({
    name: String,
    user: mongoose.Schema.Types.ObjectId,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }]
});

module.exports = mongoose.model('category', categorySchema);