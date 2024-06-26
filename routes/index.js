var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // main index page will redirect to /medications
  res.redirect("/medications");
});

module.exports = router;
