const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ConditionSchema = new Schema(
  {
    name: { type: String, required: true, maxLength: 100 },
    detail: { type: String, required: true, maxLength: 200 },
  },
  { collection: "conditions" }
);

// Virtual for author's URL
ConditionSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/medications/condition/${this._id}`;
});

/* Export model
    - The first argument is the singular name of the collection your model is for.
    - Mongoose automatically looks for the plural, lowercased version of your model name.
    - Thus, the model "Patient"" is for the "patients" collection in the database.
*/
module.exports = mongoose.model("Condition", ConditionSchema);
