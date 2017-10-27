//==============================================//
//============  INDEX PAGE LOGIC  =============//
//============================================//

$.getJSON("/articles", function(data) {
  //for (var i = 0; i < data.length; i++) {
  for (var i = 1; i < 20; i++) { ///---currently limiting results to 20 articles---
    $("#articles").append('<div class="panel panel-default">' +
      '<div class="panel-heading" ><h3 class="panel-title" data-target="#myModal"' +
      'data-toggle="modal" id="artTitle" data-id="' + data[i]._id + '">' + data[i].title + '</h3>' +
      '</div><hr><div class="panel-body"><p id="artSummary">' + data[i].summary + '</p><a href="' +
      data[i].link + '" id="artLink" target="blank">' + data[i].link + '</a></div><br><button class="btn btn-success"' +
      ' data-id="' + data[i]._id + '"id="saveArt">Save Article</button></div>');
  }
});

//=====    FUNCTION TO SAVE AN ARTICLE ===//
$(document).on("click", "#saveArt", function() {
  $("#modalBodyA").empty();
  var articleIdToSave = $(this).attr("data-id");
  $("#myModal").modal('show');
  $("#modalBodyA").append("<h4> Article Saved </h4>");
  $.ajax({
    method: "POST",
    url: "/saved/" + articleIdToSave,
  }).done(function(saved) {
    console.log(saved)
  });
});

//============================================//
//=======   SAVED ARTICLE PAGE LOGIC =========//
//============================================//

//======  GET TO RETURN ALL ARTICLES FROM SAVED LIST w/ SAVED:TRUE FROM DB =====//

$.getJSON("/saved", function(data) {
  for (var i = 0; i < data.length; i++) {
    $("#savedArticles").append('<div class="panel panel-default">' +
      '<div class="panel-heading" ><h3 class="panel-title" data-target="#myModal"' +
      'data-toggle="modal" id="artTitle" data-id="' + data[i]._id + '">' + data[i].title + '</h3>' +
      '</div><hr><div class="panel-body"><p id="artSummary">' + data[i].summary + '</p><a href="' +
      data[i].link + '" id="artLink" target="blank">' + data[i].link + '</a></div><br><button class="btn btn-danger"' +
      ' data-id="' + data[i]._id + '"id="deleteArt">Unsave Article</button><button class="btn btn-primary"' +
      ' id="noteBtn" data-id="' + data[i]._id + '">Article Notes</button></div>');
  }
});

//===  FUNCTION TO PROMPT MODAL FOR REQUESTED ARTICLE ===//

$(document).on("click", "#noteBtn", function() {
  $("#modalBody").empty();
  var thisId = $(this).attr("data-id");
  $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
    .done(function(data) {
      console.log(data);
      $("#myModal").modal('show');
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

//===  FUNCTION TO SAVE note TO DATABASE ===//
$(document).on("click", "#savenote", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#titleinput").val(),
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

//====   FUNCTION TO DELETE ARTICLE FROM SAVED LIST ==//

$(document).on("click", "#deleteArt", function() {
  var thisId = $(this).attr("data-id");
  console.log("deleting article");
  $.ajax({
      method: "POST",
      url: "/delete/" + thisId,
      saved:{
        saved:false
      },
    })
    .then(function(deleted) {
      console.log("Removing entry below");
      console.log(deleted);
      window.location.reload();
    });
});
