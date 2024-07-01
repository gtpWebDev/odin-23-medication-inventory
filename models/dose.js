const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DoseSchema = new Schema(
  {
    time: { type: String, required: true, maxLength: 20 },
    quantity: { type: Number, required: true },
  },
  { collection: "doses" }
);

// Virtual for author's URL
DoseSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/medications/dose/${this._id}`;
});

module.exports = mongoose.model("Dose", DoseSchema);
