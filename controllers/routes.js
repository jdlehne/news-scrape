// Routes
const express = require('express'),
  router = express.Router(),
  request = require('request'),
  cheerio = require('cheerio'),
  db = require("../models"),
  Article = require('../models/Article');

  //==== Scrape route ===//

  router.get('/scrape', function(req, res, next) {
      request('https://www.gamespot.com', function(error, response, html) {
          let $ = cheerio.load(html);
          let results = [];
          $('article.media').each(function(i, element) {
              let title =  $(this).find("h3.media-title").text(),
                  link = "https://www.gamespot.com" + $(this).find("a").attr("href"),
                  summary = $(this).find("p.media-deck").text();
                  result = {};
              if (link !== undefined && link.includes('http') &&  title !== '') {
                  result = {
                      title: title,
                      link: link,
                      summary:summary
                  };
                  let newArticle = new Article(result);
                  newArticle.save(function(err, entry) {
                      if (err) {
                          if (!err.errors.link) {
                              console.log(err);
                          }
                      } else {
                          console.log('New Entry Added to DB');
                      }
                  });
              }
          });
          next();
      });
  }, function(req, res) {
      res.redirect('/');
  });

  // router.get('/scrape', function(req, res, next) {
  //   request('https://www.gamespot.com', function(error, response, html) {
  //     let $ = cheerio.load(html);
  //     let results = [];
  //     $('article.media').each(function(i, element) {
  //       let title = $(this).find("h3.media-title").text(),
  //         link = "https://www.gamespot.com" + $(this).find("a").attr("href"),
  //         summary = $(this).find("p.media-deck").text();
  //       result = {};
  //       db.Article
  //         .create(result)
  //         .then(function(dbArticle) {
  //           return res.redirect("/");
  //         })
  //         .catch(function(err) {
  //           res.json(err);
  //         });
  //     });
  //     next();
  //
  //   }, function(req, res) {
  //     res.redirect('/');
  //   });
  // });

//====route to grab and display articles===//

router.get("/articles", function(req, res) {
  db.Article
    .find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//===  get saved articles----/articles/saved will show as JSON  ===//

router.get('/saved', function(req, res) {
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

//===   get one article by id to grab notes ===//

router.get("/articles/:id", function(req, res) {
  db.Article
    .findOne({
      _id: req.params.id
    })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//===  Route for saving/updating an Article's associated Note ===//

router.post("/articles/:id", function(req, res) {
  db.Note
    .create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//==== working route to change saved db boolean to true ===//

router.post("/saved/:id", function(req, res) {
  console.log("save route hit");
  db.Article.findOneAndUpdate({
      "_id": req.params.id
    }, {
      "saved": true
    }, {
      new: true
    })
    .then(function(error, saved) {
      if (error) {
        console.log(error);
      } else {
        res.send(saved);
      }
    });
});

//==== Route to change saved to false and remove from saved articles ===//

router.post("/delete/:id", function(req, res) {
  console.log("delete route hit");
  db.Article.findOneAndUpdate({
      "_id": req.params.id
    }, {
      "saved": false
    }, {
      new: true
    })
    .then(function(err, deleted) {
      res.redirect("/saved");
      if (err) {
        console.log(err);
      } else {
        res.send(deleted);
      }
    });
});

module.exports = router;
