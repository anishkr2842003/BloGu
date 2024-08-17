// index.js in the root folder
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config()

// Initialize Express app
const app = express();
// Connect to MongoDB
const dbURI = process.env.DBURI;
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'yourSecret',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: dbURI })
}));
app.use(flash());

// Set EJS as the templating engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Import and use routes
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
