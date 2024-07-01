const { format } = require("date-fns");

// would benefit from testing!

/* 
    External function "calculateStockData" requires a prescription object
    in the following form (non-relevant data omitted)
  
  {
    patient: new ObjectId('66826c344f9d62c6aff41689'),
    inventory_update_date: 2024-06-30T00:00:00.000Z,
    inventory_update_quantity_endofday: 10,
    medication: {
      name: 'Ibuprofen 500mg'
    },
    regimen: {
      summary: '3 per day meal times',
      doses: [
        {
          time: '08:00 am',
          quantity: 1,
        },
        {
          time: '13:00 pm',
          quantity: 1,
        },
      ]
    },
  }

*/

exports.calculateNewPrescriptionInfo = (
  patientPrescriptionsViewInfo,
  preOrderDuration
) => {
  // for a collection of patient prescriptions, calculate:
  // - minimum days stock
  // - earliest final day of full stock
  // - orderDay, applying preOrderDuration

  const minimumDaysInventory = patientPrescriptionsViewInfo.reduce(
    (min, obj) => {
      const newVal = obj.stockData.fullDaysInventoryAfterToday;
      return newVal < min ? newVal : min;
    },
    100000
  ); // how to avoid putting an arbitrary large number?

  const earliestFinalFullDay = calcDaysFromToday(minimumDaysInventory);
  const earliestFinalFullDay_formatted = format(earliestFinalFullDay, "PPP");

  const orderDaysFromNow =
    minimumDaysInventory <= preOrderDuration
      ? 0
      : minimumDaysInventory - preOrderDuration;

  const orderDay = calcDaysFromToday(orderDaysFromNow);
  const orderDay_formatted = format(orderDay, "PPP");
  return {
    minimumDaysInventory,
    earliestFinalFullDay_formatted,
    orderDay_formatted,
  };
};

exports.calculateStockData = (prescription) => {
  const inventoryUpdateDate = prescription.inventory_update_date;
  const inventoryUpdateQuantityEndofday =
    prescription.inventory_update_quantity_endofday;
  const regimen = prescription.regimen;
  const doses = regimen.doses;

  const regimenDailyQty = calcRegimenDailyQty(regimen);

  const inventoryEndOfToday = calcInventoryEndOfToday(
    inventoryUpdateDate,
    inventoryUpdateQuantityEndofday,
    regimenDailyQty
  );

  const fullDaysInventoryAfterToday = calcFullDaysInventory(
    inventoryEndOfToday,
    regimenDailyQty
  );

  const finalFullDay = calcDaysFromToday(fullDaysInventoryAfterToday);
  const finalFullDay_formatted = format(finalFullDay, "PPP");

  return {
    inventoryEndOfToday,
    fullDaysInventoryAfterToday,
    finalFullDay_formatted,
  };
};

const calcDaysFromToday = (daysToAdd) => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + daysToAdd);
  return futureDate;
};

const calcFullDaysInventory = (inventory, dailyRequirement) => {
  return Math.floor(inventory / dailyRequirement);
};

const calcRegimenDailyQty = (regimen) => {
  const doseArray = regimen.doses;
  return doseArray.reduce(
    (accumulator, element) => accumulator + element.quantity,
    0
  );
};

const calcInventoryEndOfToday = (
  inventoryUpdateDate,
  inventoryUpdateQty,
  regimenDailyQty
) => {
  const today = new Date();
  const numDays = calcDifferenceInDays(inventoryUpdateDate, today);

  return inventoryUpdateQty - numDays * regimenDailyQty;
};

const calcDifferenceInDays = (date1, date2) => {
  // Ensure both inputs are Date objects
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  // Get the difference in milliseconds
  const diffInMs = Math.abs(d2 - d1);

  // Convert milliseconds to days, hours, minutes, and seconds
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  return diffInDays;
};
