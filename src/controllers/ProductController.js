const Product = require('../models').Product;
const User = require('../models').User;
const Rating = require('../models').Rating;

module.exports = {
  addProduct(req, res) {
    Product.save(req.body.json);
    res.send(xxx)
  },

};