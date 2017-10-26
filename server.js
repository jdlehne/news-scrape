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

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(process.cwd() + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(methodOverride('_method'));

app.use(bodyParser.urlencoded({
    extended: false
}));

//require('./controllers/artIndex.js');

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI ||"mongodb://localhost/news-scrape", {
  useMongoClient: true
});


// Routes

// A GET route for scraping
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

//----get saved articles----/articles/saved will show as JSON--//
app.get('/saved', function(req, res) {
    db.Article
        .find({})
        .where('saved').equals(true)
        .where('deleted').equals(false)
        .populate('notes')
        .exec(function(error, entries) {
            if (error) {
                console.log(error);
                res.status(500);
            } else {
                res.status(200).json(entries);
            }
        });
});

//----get one article by id----//
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

//----working route to change saved db boolean to true---//
app.post("/saved/:id", function(req, res) {
  console.log("save route hit");
	db.Article.findOneAndUpdate({"_id": req.params.id}, {"saved": true}, {new:true})
	.then(function(error, saved) {
		if (error) {
			console.log(error);
		} else {
			res.send(saved);
		}
	});
});



app.post("/delete/:id", function(req, res) {
  console.log("delete route hit");
	db.Article.findOneAndUpdate({"_id": req.params.id}, {"saved":false}, {new:true})
	.then(function(err, deleted) {
		if (err) {
			console.log(err);
		} else {
			res.send(deleted);
      res.redirect("/");
		}
	});
});
//===================
/*
//const db = mongoose.connection;

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
});*/

module.exports = app;

app.listen(PORT);
console.log("Listening on port: " + PORT);
