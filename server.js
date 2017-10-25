var express = require('express');
var exphbs  = require('express-handlebars');
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var methodOverride = require('method-override');

const PORT = process.env.PORT || 5050;
let app = express();
//app.engine('handlebars', exphbs({defaultLayout: 'main'}));
//app.set('view engine', 'handlebars');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

/*
app
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended:true }))
    .use(bodyParser.text())
    .use(bodyParser.json({ type: 'application/vnd.api+json' }))
    .use(methodOverride('_method'))
    .use(logger('dev'))
    .use(express.static("public"))
    .use(require('./controllers/artIndex.js'));
*/

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI ||"mongodb://localhost/news-scrape", {
  useMongoClient: true
});


// Routes

// A GET route for scraping the echojs website
app.get("/scrape", function(req, res) {
  axios.get("http://www.gamespot.com/").then(function(response) {

    var $ = cheerio.load(response.data);

    $("article.media").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .find("h3.media-title").text();
      result.summary = $(this)
        .find("p.media-deck").text();
      result.link = "https://www.gamespot.com" + $(this)
        .find("a").attr("href");
      db.Article
        .create(result)
        .then(function(dbArticle) {
          res.redirect("/");
        })
        .catch(function(err) {
          res.json(err);
        });
    });
  });
});

app.get("/articles", function(req, res) {
  db.Article
    .find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});


app.get("/articles/:id", function(req, res) {
  db.Article
    .findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});
//===================
/*
const db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
    // start the server, listen on port 3000
    app.listen(PORT, function() {
        console.log("App running on port: " + PORT);
    });
});

module.exports = app;*/

app.listen(PORT);
console.log("Listening on port: " + PORT);
