const mongoose = require("mongoose");

const { format } = require("date-fns");

const Schema = mongoose.Schema;

const PatientSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date, required: true, max: new Date() },
  conditions: [{ type: Schema.Types.ObjectId, ref: "Condition" }],
});

// Virtual for patient's full name which does not need to be stored in the db
PatientSchema.virtual("name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullName = "";
  if (this.first_name && this.family_name) {
    fullName = `${this.family_name}, ${this.first_name}`;
  }
  return fullName;
});

// Virtual for patient's age
PatientSchema.virtual("age").get(function () {
  return calculateAge(this.date_of_birth);
});

// Virtual for author's URL
PatientSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/medications/patient/${this._id}`;
});

// check this, possibly use my preferred datetime library
PatientSchema.virtual("date_of_birth_formatted").get(function () {
  return this.date_of_birth ? format(this.date_of_birth, "PPP") : "";
});

// Receive birth date in date format, output current age
function calculateAge(birthDate) {
  const rightNow = new Date();

  let age = rightNow.getFullYear() - birthDate.getFullYear();

  // Adjust age if the birth date has not occurred yet this year
  const monthDifference = rightNow.getMonth() - birthDate.getMonth();
  const dayDifference = rightNow.getDate() - birthDate.getDate();

  if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
    age--;
  }

  return age;
}

/* Export model
    - The first argument is the singular name of the collection your model is for.
    - Mongoose automatically looks for the plural, lowercased version of your model name.
    - Thus, the model "Patient"" is for the "patients" collection in the database.
*/
module.exports = mongoose.model("Patient", PatientSchema);
