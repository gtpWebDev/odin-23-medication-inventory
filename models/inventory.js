const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InventorySchema = new Schema(
  {
    medication: [{ type: Schema.Types.ObjectId, ref: "Medication" }],
    patient: [{ type: Schema.Types.ObjectId, ref: "Patient" }],
    quantity_held: { type: Number, required: true, default: 0 },
  },
  { collection: "inventory" }
);

// Virtual for medication's URL
InventorySchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/medications/inventory/${this._id}`;
});

/* Export model
    - The first argument is the singular name of the collection your model is for.
    - Mongoose automatically looks for the plural, lowercased version of your model name.
    - Thus, the model "Medication" is for the "medications" collection in the database.
*/
module.exports = mongoose.model("Inventory", InventorySchema);
