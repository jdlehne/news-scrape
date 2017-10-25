// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  //for (var i = 0; i < data.length; i++) {
  for (var i = 0; i < 10; i++) {
    // Display the apropos information on the page
    //$("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    $("#articles").append('<div class="panel panel-default"><div class="panel-heading" ><h3 class="panel-title" data-target="#myModal" data-toggle="modal" data-id="'+ data[i]._id +'">'+ data[i].title +'</h3></div><div class="panel-body">'+ data[i].link +'</div></div>');
  }
});


// Whenever someone clicks an h3 tag
$(document).on("click", "h3", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  $("#modalBody").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      $("#modalTitle").html("<h4>" + data.title + "</h4>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      $("#modalBody").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#modalBody").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      $("#savenote").attr("data-id",data._id);

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
      $("#myModal").modal('hide');
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
