const { User, Product, Post } = require('./../models');

// Basic text matching for Users & Products
const getSearchResults = (req, res) => {
  const query = req.query.q;
  const searchResults = {
    users: [],
    products: [],
    reviews: [],
  };

  User.fetch(`display_name LIKE '%${query}%'`)
    .then(userResults => {
      searchResults.users = userResults;
      return Product.fetch(`name LIKE '%${query}%' OR brand LIKE '%${query}%'`, ['upc', 'name', 'brand', 'energy']);
    })
    .then(productResults => {
      searchResults.products = productResults;
      return Post.fetch(`Product_upc IS NOT NULL AND comment LIKE '%${query}%'`);
    })
    .then(reviewResults => {
      searchResults.reviews = reviewResults;
      res.status(200).json(searchResults);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({
        description: 'Gobble DB - Search.getSearchResults',
        error: err,
      });
    });
};

module.exports = {
  getSearchResults,
};
