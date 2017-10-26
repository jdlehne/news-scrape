var express = require('express');
var app = express.Router();

var request = require('request');
var cheerio = require('cheerio');

var Article = require('../models/Article');
var Note = require('../models/Note');

// get all articles from database
app.get('/', function(req, res) {
  Article
    .find({})
    .then(function(error, dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

/*    //get all saved articles
app.get('/saved', function(req, res) {
  Article
    .find({})
    .where('saved').equals(true)
    .where('deleted').equals(false)
    .populate('notes')
    .exec(function(error, docs) {
      if (error) {
        console.log(error);
        res.status(500);
      } else {
        res.status(200).json(docs);
      }
    });
});     */

/*  // get all deleted articles
app.get('/deleted', function(req, res) {
  Article
    .find({})
    .where('deleted').equals(true)
    .exec(function(error, docs) {
      if (error) {
        console.log(error);
        res.status(500);
      } else {
        res.status(200).json(docs);
      }
    });
});    */

// save an article
app.post('/save/:id', function(req, res) {
  Article.findByIdAndUpdate(req.params.id, {
      $set: {
        saved: true
      }
    }, {
      new: true
    },
    function(error, doc) {
      if (error) {
        console.log(error);
        res.status(500);
      } else {
        res.redirect('/');
      }
    });
});

/*  // dismiss a scraped article
app.delete('/dismiss/:id', function(req, res) {
  Article.findByIdAndUpdate(req.params.id, {
      $set: {
        deleted: true
      }
    }, {
      new: true
    },
    function(error, doc) {
      if (error) {
        console.log(error);
        res.status(500);
      } else {
        res.redirect('/');
      }
    });
});    */

/*   // delete a saved article
app.delete('/:id', function(req, res) {
  Article.findByIdAndUpdate(req.params.id, {
      $set: {
        deleted: true
      }
    }, {
      new: true
    },
    function(error, doc) {
      if (error) {
        console.log(error);
        res.status(500);
      } else {
        res.redirect('/saved');
      }
    }
  );
});   */

// scrape articles
app.get('/scrape', function(req, res, next) {
  request('https://www.gamespot.com', function(error, response, html) {

    var $ = cheerio.load(html);

    var results = [];

    $('article.media').each(function(i, element) {
      var title = $(element).find("h3.media-title").text();
      var summary = $(element).find("p.media-deck").text();
      var link = $(element).find("a").attr("href");

      newArticle = {};

      if (link !== undefined && link.includes('https') && title !== '') {
        newArticle = {
          title: title,
          summary: summary,
          link: link
        };
        // create new article
        var entry = new Article(newArticle);
        // save to database
        entry.save(function(err, doc) {
          if (err) {
            if (!err.errors.link) {
              console.log(err);
            }
          } else {
            console.log('New article added');
          }
        });
      }
    });
    next();
  });
}, function(req, res) {
  res.redirect('/');
});
