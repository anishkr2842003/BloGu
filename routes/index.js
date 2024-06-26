var express = require("express");
var router = express.Router();

const cookieParser = require("cookie-parser");
const path = require("path");
const userModel = require("../models/user");
const categoryModel = require("../models/category");
const postModel = require("../models/post");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { request } = require("http");
const upload = require("../utils/multer");

/* GET home page. */
router.get("/", async function (req, res) {
  var currentPage = req.query.page || 1;
  var perPage = 10;

  var posts = await postModel
    .find({status: 'true'}).skip((currentPage - 1)* perPage).limit(perPage)
    .populate("user")
    .populate("category")
    .sort({ date: -1 });
  var categories = await categoryModel.find();
  var limitedPosts = await postModel
    .find({status: 'true'})
    .limit(5)
    .sort({ date: -1 })
    .populate("user")
    .populate("category");
  var cookie = req.cookies;

  var totalPosts = posts;
  var runLoop = Math.ceil(totalPosts.length / perPage)


  res.render("index", { cookie, posts, categories, limitedPosts, currentPage, runLoop });
});

/* GET login page. */
router.get("/login", function (req, res) {
  res.render("admin/login", { message: req.flash("message") });
});

/* GET signup page. */
router.get("/signup", function (req, res) {
  res.render("admin/signup",{message: req.flash("message") });
});

/* GET single page. */
router.get("/post/:postId", async function (req, res) {
  var postId = req.params.postId;
  var categories = await categoryModel.find();
  var post = await postModel
    .findOne({ _id: postId })
    .populate("category")
    .populate("user");
  var limitedPosts = await postModel
    .find({status: 'false'})
    .limit(5)
    .sort({ date: -1 })
    .populate("user")
    .populate("category");
  var cookie = req.cookies;
  res.render("single", { cookie, post, categories, limitedPosts });
});

/* GET admin post page. */
router.get("/admin/post", isLoggedIn, async function (req, res) {
  var currentPage = req.query.page || 1;
  var perPage = 10;

  var username = req.cookies.username;
  var user = await userModel.findOne({username: username});
  var posts = await postModel.find({user: user._id}).skip((currentPage - 1)* perPage).limit(perPage).populate('category').populate('user');
  var totalPosts = await postModel.find({user: user._id});
  var runLoop = Math.ceil(totalPosts.length / perPage)

  res.render("admin/post", { posts,runLoop, currentPage, perPage });
});

/* GET admin category page. */
router.get("/admin/category", isLoggedIn, async function (req, res) {
  var currentPage = req.query.page || 1;
  var perPage = 10;

  var categories = await categoryModel.find().skip((currentPage - 1)* perPage).limit(perPage);
  var totalCategory = await categoryModel.find();
  var runLoop = Math.ceil(totalCategory.length / perPage)

  res.render("admin/category", { categories, runLoop, currentPage, perPage });
});

/* GET admin post page. */
router.get("/admin/user", isLoggedIn, async function (req, res) {
  var currentPage = req.query.page || 1;
  var perPage = 10;

  var users = await userModel.find().skip((currentPage - 1)* perPage).limit(perPage);
  var totalUsers = await userModel.find();
  var runLoop = Math.ceil(totalUsers.length / perPage);

  res.render("admin/users", { users, runLoop, currentPage, perPage });
});

/* GET admin post-create page. */
router.get("/admin/create-post", isLoggedIn, async function (req, res) {
  var categories = await categoryModel.find();
  res.render("admin/add-post", { categories });
});

/* GET admin category-create page. */
router.get("/admin/create-category", isLoggedIn, async function (req, res) {
  res.render("admin/add-category");
});

/* POST signup page. */
router.post("/signup", async function (req, res) {
  var fname = req.body.firstname;
  var lname = req.body.lastname;
  var username = req.body.username;
  var password = req.body.password;
  var role = req.body.role;

  var user = await userModel.findOne({username: username});
  if(user){
    req.flash("message", "This username is already taken. Chooese another");
    res.redirect('/signup')
  }else{
    // Password ko encrypt karna
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      await userModel.create({
        fname: fname,
        lname: lname,
        username: username,
        password: hash,
        role: role,
      });
      res.redirect("/login");
    });
  });
  }



  
});

/* POST login page. */
router.post("/login", async function (req, res) {
  let username = req.body.username;
  let password = req.body.password;

  let user = await userModel.findOne({ username: username });
  if (user) {
    let userPassword = user.password;
    // check password is right or wrong
    bcrypt.compare(password, userPassword, function (err, result) {
      if (result == true) {
        let token = jwt.sign({ username: username }, "secret");
        
        res.cookie("token", token);
        res.cookie("username", username);
        res.redirect("/admin/post");
      } else {
        req.flash("message", "You entred wrong password");
        res.redirect("/login");
      }
    });
  } else {
    req.flash("message", "You entred wrong username");
    res.redirect("/login");
  }
});

/* POST admin category-create page. */
router.post("/admin/create-category", isLoggedIn, async function (req, res) {
  var categoryName = req.body.cat;
  var username = req.cookies.username;
  let user = await userModel.findOne({ username: username });
  var category = await categoryModel.create({
    name: categoryName,
    user: user._id,
  });

  user.category.push(category._id);
  await user.save();
  res.redirect("/admin/category");
});

/* POST admin post-create page. */
router.post("/admin/create-post",isLoggedIn,upload.single("photo"),async function (req, res) {
    var title = req.body.title;
    var desc = req.body.desc;
    var category = req.body.category;
    var photo = req.file.filename;

    var username = req.cookies.username;
    var user = await userModel.findOne({ username: username });
    var categories = await categoryModel.findOne({ _id: category });

    var post = await postModel.create({
      title: title,
      desc: desc,
      photo: photo,
      category: category,
      user: user._id,
    });

    user.posts.push(post._id);
    categories.posts.push(post._id);

    await user.save();
    await categories.save();

    res.redirect("/admin/post");
  }
);

/* GET admin post delete page. */
router.get("/post/delete/:postId", isLoggedIn, async function (req, res) {
  var postId = req.params.postId;
  var post = await postModel.findOne({ _id: postId });
  var user = await userModel.findOne({ _id: post.user });
  var category = await categoryModel.findOne({ _id: post.category });

  await postModel.deleteOne({ _id: postId });

  let posts = user.posts;
  var indexToRemove = posts.indexOf(postId);
  if (indexToRemove !== -1) {
    posts.splice(indexToRemove, 1);
  }

  let categories = category.posts
  var indexToRemoveCategory = categories.indexOf(postId)
  if (indexToRemove !== -1) {
    categories.splice(indexToRemoveCategory, 1);
  }

  await user.save();
  await category.save();
  res.redirect("/admin/post");
});



/* GET edit post page */
router.get('/post/edit/:postId', async function(req,res){
  var postId = req.params.postId;
  var post = await postModel.findOne({_id: postId}).populate('category');
  var catId = post.category
  var category = await categoryModel.find();
  res.render('./admin/update-post', {post, category})
});

/* POST edit post page */
router.post('/post/update',isLoggedIn,upload.single("new-image"), async function(req,res){

  var postId = req.body.post_id
  var title = req.body.post_title
  var desc = req.body.postdesc
  var photo = req.file
  
  if(photo == undefined){
    photo = req.body.oldimage
  }else{
    photo = req.file.filename
  }

  const post = await postModel.findOneAndUpdate({_id: postId},{
    title: title,
    desc: desc,
    photo: photo,
  },{new: true});

  res.redirect('/admin/post')

});

/* GET category page. */
router.get("/category/:catId", async function (req, res) {
  
  var catId = req.params.catId;
  var categories = await categoryModel.find();

  var limitedPosts = await postModel
    .find({status: 'false'})
    .limit(5)
    .sort({ date: -1 })
    .populate("user")
    .populate("category");
  var cookie = req.cookies;

  var catPosts = await categoryModel.findOne({ _id: catId }).populate({path: 'posts',populate: { path: 'user' }});
  res.render("category", { cookie, categories, limitedPosts, catPosts });
});

/* GET author page. */
router.get("/author/:authId", async function (req, res) {
  
  var authId = req.params.authId;
  var categories = await categoryModel.find();

  var limitedPosts = await postModel
    .find()
    .limit(5)
    .sort({ date: -1 })
    .populate("user")
    .populate("category");
  var cookie = req.cookies;

  var authPosts = await userModel.findOne({ _id: authId }).populate({path: 'posts',populate: { path: 'category' }});
  res.render("author", { cookie, categories, limitedPosts, authPosts });
});

// Main Admin page

/* GET admin post page. */
router.get("/main-admin/post", async function (req, res) {


  var posts = await postModel.find({status: 'true'}).populate('category').populate('user');

  res.render("main-admin/post", { posts });
});

/* GET admin post page. */
router.get("/main-admin/new-post", async function (req, res) {


  var posts = await postModel.find({status: false}).populate('category').populate('user');

  res.render("main-admin/new-post", { posts });
});

/* GET admin single page */
router.get("/main-admin/post/:postId", async function (req, res) {
  var postId = req.params.postId;
  var post = await postModel
    .findOne({ _id: postId })
    .populate("category")
    .populate("user");
  var cookie = req.cookies;
  res.render("main-admin/single", { cookie, post });
});

/* Approve post */
router.get("/main-admin/approve:postId", async function(req,res){
  var postId = req.params.postId;
  const post = await postModel.findOneAndUpdate({_id: postId},{
    status: true,
  },{new: true});
  res.redirect('/main-admin/post');

})

/* Main-admin delete post */
router.get("/main-admin/post/delete/:postId", async function(req,res){
  var postId = req.params.postId;
  var post = await postModel.findOne({ _id: postId });
  var user = await userModel.findOne({ _id: post.user });
  var category = await categoryModel.findOne({ _id: post.category });

  await postModel.deleteOne({ _id: postId });

  let posts = user.posts;
  var indexToRemove = posts.indexOf(postId);
  if (indexToRemove !== -1) {
    posts.splice(indexToRemove, 1);
  }

  let categories = category.posts
  var indexToRemoveCategory = categories.indexOf(postId)
  if (indexToRemove !== -1) {
    categories.splice(indexToRemoveCategory, 1);
  }

  await user.save();
  await category.save();
  res.redirect("/main-admin/post");
})

/* GET admin category page. */
router.get("/main-admin/category", async function (req, res) {
  var currentPage = req.query.page || 1;
  var perPage = 10;

  var categories = await categoryModel.find().skip((currentPage - 1)* perPage).limit(perPage);
  var totalCategory = await categoryModel.find();
  var runLoop = Math.ceil(totalCategory.length / perPage)

  res.render("main-admin/category", { categories, runLoop, currentPage, perPage });
});

/* GET admin post page. */
router.get("/main-admin/user", async function (req, res) {
  var currentPage = req.query.page || 1;
  var perPage = 10;

  var users = await userModel.find().skip((currentPage - 1)* perPage).limit(perPage);
  var totalUsers = await userModel.find();
  var runLoop = Math.ceil(totalUsers.length / perPage);

  res.render("main-admin/users", { users, runLoop, currentPage, perPage });
});

router.get('/category/delete/:categoryId', async function(req,res){

  var categoryId = req.params.categoryId;
  var totalPost = await categoryModel.find({ _id: categoryId });
  var posts = totalPost[0].posts
  posts.forEach((e)=>{
    console.log(e.toHexString());
  })

})




/* GET logout page. */
router.get("/logout", function (req, res) {
  res.cookie("token", "", { maxAge: 0 });
  res.cookie("username", "", { maxAge: 0 });
  res.redirect("/");
});

/* GET error page. */
router.get("*", function (req, res) {
  res.render("error");
});

/* FUNCTION check user is login or not */
function isLoggedIn(req, res, next) {
  if (req.cookies.token == "") {
    res.redirect("/");
  } else {
    let data = jwt.verify(req.cookies.token, "secret");
    req.user = data;
    next();
  }
}

module.exports = router;
