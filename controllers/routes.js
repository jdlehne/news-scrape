// Routes

var db = require("../models");

module.exports = function(app) {
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
    res.redirect("/saved");
		if (err) {
			console.log(err);
		} else {
			res.send(deleted);
		}
	});
});

};
