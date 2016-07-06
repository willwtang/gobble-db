const { User } = require('./../models');

// Basic text matching for Users & Products
const getSearchResults = (req, res) => {
  const query = req.query.q;
  User.fetch(`display_name LIKE '%${query}%'`)
    .then(results => {
      res.status(200).json(results);
    });
};

module.exports = {
  getSearchResults,
};
