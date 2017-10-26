var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ArticleSchema = new Schema({

  title: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    //required: true
  },

  saved: {
    type: Boolean,
    required: true,
    default: false
  },

  deleted: {
    type: Boolean,
    required: true,
    default: false
  },

  link: {
    type: String,
    required: true
  },

  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
