const QueryBuilder = require('../orm/querybuilder');
const { Post } = require('../models');

const getAllUserRatings = function() {
  // const qb = new QueryBuilder();
  // const qb2 = new QueryBuilder();
//   qb2.select({ what: '*', from: 'Post', where: 'rating IS NOT NULL', as: 'T1' });
//   return qb
//     .select({ what: ['T1.User_facebook_id', 'T1.rating', 'Product.name', 'Product.upc'], from: qb2.materialize() })
//     .fire();
  return Post.fetch('rating IS NOT NULL', ['User_facebook_id', 'rating', 'Product_upc']);
};

const sendAllUserRatings = function(req, res) {
  getAllUserRatings()
    .then(results => res.status(200).send(results))
    .catch(err => res.status(400).send(err));
};

module.exports = { sendAllUserRatings };
