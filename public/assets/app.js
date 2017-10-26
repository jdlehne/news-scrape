$.getJSON("/articles", function(data) {
  //for (var i = 0; i < data.length; i++) {
  for (var i = 0; i < 10; i++) {
    $("#articles").append('<div class="panel panel-default">' +
      '<div class="panel-heading" ><h3 class="panel-title" data-target="#myModal"' +
      'data-toggle="modal" data-id="' + data[i]._id + '">' + data[i].title + '</h3>' +
      '</div><div class="panel-body"><p>' + data[i].summary + '</p><a href="' +
      data[i].link + '">' + data[i].link + '</a></div><br><button class="btn btn-success"' +
      ' data-id="' + data[i]._id + '"id="saveArt">Save Article</button></div>');
  }
});

$(document).on("click", "#saveArt", function() {
  console.log("saving article");
  var articleIdToSave = $(this).attr("data-id");
  console.log(articleIdToSave);
  $.ajax({
    method: "POST",
    url: "/saved/" + articleIdToSave,
    saved: {saved: true}
  }).then(function(saved) {
    console.log(saved)
  });
});

// Whenever someone clicks an h3 tag
$(document).on("click", "h3", function() {

  $("#modalBody").empty();

  var thisId = $(this).attr("data-id");

  $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
    .done(function(data) {
      console.log(data);
      $("#modalTitle").html("<h4>" + data.title + "</h4>");
      $("#modalBody").append("<input id='titleinput' name='title' >");
      $("#modalBody").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#savenote").attr("data-id", data._id);
      if (data.note) {
        $("#titleinput").val(data.note.title);
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
    .done(function(data) {
      console.log(data);
      $("#myModal").modal('hide');
    });

  $("#titleinput").val("");
  $("#bodyinput").val("");
});
