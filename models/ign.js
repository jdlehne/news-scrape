var cheerio = require("cheerio");
var request = require("request");
///===========Log to be removed when plugged in===========////
console.log("\n***********************************\n" +
            "Grabbing every titles, summaries and \n" +
            "links from gamespot main page:" +
            "\n***********************************\n");

request("https://www.gamespot.com", function(error, response, html) {

  var $ = cheerio.load(html);

  var results = [];

  $("article.media").each(function(i, element) {

    var title = $(element).find("h3.media-title").text();
    var summary = $(element).find("p.media-deck").text();
    var link = $(element).find("a").attr("href");

    results.push({
      title: title,
      summary: summary,
      link: link
    });
  });
  console.log(results);
});
