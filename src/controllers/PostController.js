const { Product, User, Review, Post } = require('../models');

const getAllPostsByDate = function(date, limit) {
  Post
  .selectJoin(
    '*',
    `date(T1.created_at) < date('${date}')`,
    'created_at',
    limit,
    { table: Review, on: { 'T1.id': 'Review.Post_id' } },
    { table: Product, on: { 'Review.Product_upc': 'Product.upc' } },
    { table: User, on: { 'T1.User_facebookId': 'User.facebookId' } }
  )
  .then()
  .catch(err => {
    const error = `You have an error in getAllPostsByDate function in gobble-db/src/controller/PostController.js. The error is \n ${err}`;
    console.log(error);
  });
};


// getAllPostsByDate('2016-07-30 00:00:00', 20);
module.exports = { getAllPostsByDate };
