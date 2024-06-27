const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/*
  Note, this database assumes every day has the same regimen.
  I am also using strings for the time.

  Regimen consists of:
    summary: simple description of regimen - e.g. "1 per day in morning"
    dosages: an array of objects with times and quantities - e.g.:
      {
        time: "8am",
        quantity: 1
      }
*/

// Option: dosages: { type: [Schema.Types.Mixed], required: true },

const RegimenSchema = new Schema({
  summary: { type: String, required: true, maxLength: 100 },
  dosages: [
    {
      time: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
});

// Virtual for author's URL
RegimenSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/medications/regimen/${this._id}`;
});

/* Export model
    - The first argument is the singular name of the collection your model is for.
    - Mongoose automatically looks for the plural, lowercased version of your model name.
    - Thus, the model "Patient"" is for the "patients" collection in the database.
*/
module.exports = mongoose.model("Regimen", RegimenSchema);
