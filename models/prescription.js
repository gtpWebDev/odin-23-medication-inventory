const constants = require("../utility/constants");

const mongoose = require("mongoose");

const { format } = require("date-fns");

const Schema = mongoose.Schema;

const PrescriptionSchema = new Schema(
  {
    patient: { type: Schema.Types.ObjectId, ref: "Patient" },
    medication: { type: Schema.Types.ObjectId, ref: "Medication" },
    regimen: { type: Schema.Types.ObjectId, ref: "Regimen" },
    inventory_update_date: { type: Date, required: true },
    inventory_update_quantity_endofday: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: constants.prescriptionStatusOptions,
    },
  },
  { collection: "prescriptions" }
);

// allows virtuals to show up in console - only for dev
PrescriptionSchema.set("toObject", { getters: true });

// Virtual for prescription's URL
PrescriptionSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/medications/prescription/${this._id}`;
});

PrescriptionSchema.virtual("inventory_update_date_formatted").get(function () {
  return this.inventory_update_date
    ? format(this.inventory_update_date, "PPP")
    : "";
});

// changes date to "YYY-MM-DD" for use by date input on form.
PrescriptionSchema.virtual("inventory_update_form_formatted").get(function () {
  return this.inventory_update_date
    ? formatDateForFormInput(this.inventory_update_date)
    : "";
});

// Receive date, output "YYY-MM-DD" form, for use by date input on form.
function formatDateForFormInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

PrescriptionSchema.virtual("placeholder").get(function () {
  return "";
});

/* Export model
    - The first argument is the singular name of the collection your model is for.
    - Mongoose automatically looks for the plural, lowercased version of your model name.
    - Thus, the model "Prescription" is for the "prescriptions" collection in the database.
*/
module.exports = mongoose.model("Prescription", PrescriptionSchema);
