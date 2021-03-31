var express = require('express');
var router = express.Router();
const fs = require('fs');
var stocks = require('../JSON/stocks');
var person = require('../JSON/person');

router.get('/get_stocks', function(req,res,next) {
  res.json(stocks);
});

module.exports = router;
