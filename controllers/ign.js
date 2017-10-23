var cheerio = require("cheerio");
var request = require("request");


console.log("\n***********************************\n" +
            "Grabbing every titles and link\n" +
            "from gamsepot main page:" +
            "\n***********************************\n");

request("https://www.gamespot.com", function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  // An empty array to save the data that we'll scrape
  var results = [];

  // With cheerio, find each p-tag with the "title" class
  // (i: iterator. element: the current element)
  $("article.media").each(function(i, element) {

    //var title = $("a.listElmnt-storyHeadline").text();
    //var title = $(element).find("a.listElmnt-storyHeadline").text();
    var title = $(element).find("h3.media-title").text();
    var summary = $(element).find("p.media-deck").text();
    //var link = $(element).find("h3.media-title").text();
    // In the currently selected element, look at its child elements (i.e., its a-tags),
    // then save the values for any "href" attributes that the child elements may have

    var link = $(element).find("a").attr("href");
    // Save these results in an object that we'll push into the results array we defined earlier
    results.push({
      title: title,
      summary: summary,
      link: link
    });
  });

  // Log the results once you've looped through each of the elements found with cheerio
  console.log(results);
});
