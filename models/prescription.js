const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PrescriptionSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: "Patient" },
  medication: { type: Schema.Types.ObjectId, ref: "Medication" },
  regimen: { type: Schema.Types.ObjectId, ref: "Regimen" },
  status: { type: String, required: true, enum: ["Active", "Inactive"] },
});

// Virtual for prescription's URL
PrescriptionSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/medications/prescription/${this._id}`;
});

/* Export model
    - The first argument is the singular name of the collection your model is for.
    - Mongoose automatically looks for the plural, lowercased version of your model name.
    - Thus, the model "Prescription" is for the "prescriptions" collection in the database.
*/
module.exports = mongoose.model("Prescription", PrescriptionSchema);
