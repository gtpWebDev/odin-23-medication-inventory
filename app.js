const createError = require("http-errors");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

require("dotenv").config();

const apiKey = process.env.API_KEY;

/*
To do list:
  - testing, particularly on utility functions
  - easier updating of inventory when new prescription comes in
    - on patient detail, rather than having to go to prescription detail many times


*/

// Set up mongoose connection
const mongoose = require("mongoose");

// import the routers that will be used in the app
const indexRouter = require("./routes/index");
const medicationsRouter = require("./routes/medications");

const app = express();

// globally opts into filtering by properties that aren't in the schema
mongoose.set("strictQuery", false);

const dev_db_url = apiKey;

// will apply process.env later
// const mongoDB = process.env.MONGODB_URI || dev_db_url;
const mongoDB = dev_db_url;

// Wait for database to connect, logging an error if there is a problem
dbConnect().catch((err) => console.log(err));
async function dbConnect() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set("views", path.join(__dirname, "views"));

app.use(expressLayouts);
// This assigns a variable, accessible here as app.settings.layout, and in callbacks using req.app.settings.layout
app.set("layout", "./layouts/mainLayout");
app.set("view engine", "ejs");

// add the middleware libraries
app.use(logger("dev"));

// middleware required to populate req.body with form fields
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// enales express serving all the static files in the public directory
app.use(express.static(path.join(__dirname, "public")));

// add the imported route handlers
app.use("/", indexRouter);
app.use("/medications", medicationsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler - recognises it as such because it has 4 parameters
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
