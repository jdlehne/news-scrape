const mongoose = require("mongoose");
      Schema = mongoose.Schema;

const NoteSchema = new Schema({
  title: String,
  body: String
});

// This creates our model from the above schema, using mongoose's model method
const Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;
