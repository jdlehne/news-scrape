
var express = require('express');
var router = express.Router();

var request = require('request');
var cheerio = require('cheerio');

var Article = require('../models/Article');
var Note = require('../models/Note');


// get all articles from database
router.get('/', function(req, res) {
  Article
    .find({})
    .exec(function(error, docs) {
      if (error) {
        console.log(error);
        res.status(500);
      } else {
        res.status(200).json(docs);
      }
    });
});

/*    //get all saved articles
router.get('/saved', function(req, res) {
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
router.get('/deleted', function(req, res) {
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
router.post('/save/:id', function(req, res) {
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
router.delete('/dismiss/:id', function(req, res) {
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
router.delete('/:id', function(req, res) {
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
router.get('/scrape', function(req, res, next) {
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

module.exports = router;
