const { Product, User, Review, Post, Follow } = require('../models');
const QueryBuilder = require('../orm/querybuilder');

const getPostsByDate = function(date, limit) {
  return (Post
  .selectJoinChain(
    '*',
    `date(T1.created_at) < date('${date}')`,
    'created_at',
    limit,
    { table: Review, on: { 'T1.id': 'Review.Post_id' } },
    { table: Product, on: { 'Review.Product_upc': 'Product.upc' } },
    { table: User, on: { 'T1.User_facebookId': 'User.facebookId' } }
  )
  .catch(err => {
    const error = `You have an error in getAllPostsByDate function in gobble-db/src/controller/PostController.js. The error is \n ${err}`;
    console.log(error);
  }));
};

const getPostsByFriends = function(date, limit, user) {
  // Follow
  // .selectJoinChain(
  //   'followed',
  //   `T1.follower = ${user} AND date(Post.created_at < date('${date}')`,
  //   'created_at',
  //   limit,
  //   { table: User, on: { 'T1.followed': 'User.facebookId' } },
  //   { table: Review, on: { 'T1.followed': 'Review.User_facebookId' } },
  //   { table: Post, on: { 'Review.Post_id': 'Post.id' } },
  //   { table: Product, on: { 'Review.Product_upc': 'Product.upc' } }
  // )
  // .then(// INSERT WHAT YOU WANT TO DO HERE
  // )
  // .catch(err => {
  //   const error = `You have an error in getPostsByFriends function in gobble-db/src/controller/PostController.js. The error is \n ${err}`;
  //   console.log(error);
  // });
  const qb = new QueryBuilder();
  const qb2 = new QueryBuilder();
  qb2.select({ what: 'followed', from: 'Follow', where: `Follow.follower = ${user}`, as: 'T1' });
  return (qb
    .select({ what: '*', from: qb2.materialize() })
    .innerJoin({ target: 'User', on: { 'User.facebookId': 'T1.followed' } })
    .innerJoin({ target: 'Review', on: `T1.followed = Review.User_facebookId AND date(Review.created_at) < date('${date}')` })
    .innerJoin({ target: 'Post', on: { 'Review.Post_id': 'Post.id' } })
    .innerJoin({ target: 'Product', on: { 'Review.Product_upc': 'Product.upc' } })
    .orderBy('Post.created_at')
    .fire()
    .then(res => res.slice(0, limit + 1)));
};

const getPostsById = function(arrayOfPostIds) {
  const qb = new QueryBuilder();
  const nested = new QueryBuilder();

  nested.select({ what: '*', from: 'Post', whereIn: { 'Post.id': arrayOfPostIds }, as: 'T1' });

  return (qb
    .select({ what: '*', from: nested })
    .innerJoin({ target: 'Review', on: 'Review.Post_id = T1.id' })
    .innerJoin({ target: 'User', on: 'Review.User_facebookId = User.facebookId' })
    .innerJoin({ target: 'Product', on: 'Review.Product_upc = Product.upc' })
    .fire());
};
// getAllPostsByDate('2016-07-30 00:00:00', 20);
User.save({ facebookId: 1, firstName: 'Charles', lastName: 'Zhang', email: '2@2' }).then(res => console.log(res));
// User.save({ facebookId: 2, firstName: 'Will', lastName: 'Tang', email: '2@2' });
// Review.save({ id: 1, User_facebookId: 2 });
// Follow.save({ follower: 1, followed: 2 });
// Product.save({ upc: 20394892038402936 });
// getPostsByFriends('2016-07-30 00:00:00', 20, 1).then(res => console.log(res));
module.exports = { getPostsByDate, getPostsByFriends, getPostsById };
