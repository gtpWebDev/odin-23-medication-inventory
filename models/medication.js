const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MedicationSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  dose: { type: Number, required: true },
  alias: { type: String, required: false, maxLength: 100 },
  quantity: { type: Number, required: true, default: 0 },
  conditions: [{ type: Schema.Types.ObjectId, ref: "Condition" }],
});

// Virtual for medication's URL
MedicationSchema.virtual("dose_with_unit").get(function () {
  return `${this.dose}mg`;
});

// Virtual for medication's URL
MedicationSchema.virtual("name_and_dose").get(function () {
  return `${this.name} ${this.dose}mg`;
});

// Virtual for medication's URL
MedicationSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/medications/medication/${this._id}`;
});

/* Export model
    - The first argument is the singular name of the collection your model is for.
    - Mongoose automatically looks for the plural, lowercased version of your model name.
    - Thus, the model "Medication" is for the "medications" collection in the database.
*/
module.exports = mongoose.model("Medication", MedicationSchema);
