const { Product, User, Review, Post, Follow, Media } = require('../models');
const QueryBuilder = require('../orm/querybuilder');

const fetch = require('isomorphic-fetch');
const gobbleProductBuilder = process.env.GOBBLE_PRODUCT_BUILDER;

const getPostsByDate = function(date, limit) {
  const qb = new QueryBuilder();
  const qb2 = new QueryBuilder();
  qb2.select({ what: '*', from: 'Post', limit, where: 'parentId IS NULL', orderBy: 'Post_created_at', as: 'T1' });
  return (qb
    .select({ what: '*', from: qb2.materialize() })
    .innerJoin({ target: 'User', on: { 'User.facebook_id': 'T1.User_facebook_id' } })
    .leftJoin({ target: 'Product', on: { 'T1.Product_upc': 'Product.upc' } })
    .orderBy('T1.Post_created_at')
    .fire());
};

const getPostsByFriends = function(date, limit, user) {
  const qb = new QueryBuilder();
  const qb2 = new QueryBuilder();
  qb2.select({ what: 'followed', from: 'Follow', where: `Follow.follower = ${user}`, as: 'T1' });
  return (qb
    .select({ what: '*', from: qb2.materialize() })
    .innerJoin({ target: 'User', on: { 'User.facebook_id': 'T1.followed' } })
    .innerJoin({ target: 'Post', on: `Post.parentId IS NULL AND T1.followed = Post.User_facebook_id AND date(Post.Post_created_at) < date('${date}')` })
    .leftJoin({ target: 'Product', on: { 'Post.Product_upc': 'Product.upc' } })
    .orderBy('Post_created_at')
    .fire()
    .then(res => res.slice(0, limit + 1)));
};

const getPostsById = function(arrayOfPostIds) {
  const qb = new QueryBuilder();
  const nested = new QueryBuilder();

  nested.select({ what: '*', from: 'Post', whereIn: { 'Post.postId': arrayOfPostIds }, as: 'T1' });

  return (qb
    .select({ what: '*', from: nested })
    .innerJoin({ target: 'User', on: 'Post.User_facebook_id = User.facebook_id' })
    .innerJoin({ target: 'Product', on: 'Post.Product_upc = Product.upc' })
    .fire());
};

const postReview = function(req, res) {
  console.log('inside post review db: ', req.body);
  const post = req.body;
  Product.fetch({ upc: post.upc })
    .then(results => {
      if (results.length === 0) {
        Product.save({ upc: post.upc });
        console.log('adding product to product builder');
        fetch(`${gobbleProductBuilder}/api/product`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ upc: post.upc }),
        })
        .then(response => {
          console.log(response);
        })
        .catch(err => {
          console.err(err);
        });
      }
      Post.save({ User_facebook_id: post.facebookId, Product_upc: post.upc, comment: post.review, rating: post.rating })
        .then((saveResult) => {
          for (let i = 0; i < post.media.length; i++) {
            Media.save({ Product_upc: post.upc, url: post.media[i], Post_id: saveResult.insertId, User_facebook_id: post.facebookId })
              .then((mediaSave) => {
                console.log(mediaSave);
              })
              .catch((err) => {
                console.error(err);
              });
          }
          console.log('review saved!!!: ', saveResult);
        })
        .catch((err) => {
          console.error(err);
        });
    });
  res.end();
};

// getPostsByDate('2016-07-30 00:00:00', 20).then(res => console.log(res));
// Post.save({ User_facebook_id: 2, Product_upc: 20394892038402936 });
// Post.fetch({ User_facebook_id: "5" }).then(res => console.log(res));
// User.save({ facebook_id: 1, first_name: 'Charles', last_name: 'Zhang' });
// User.save({ facebook_id: 2, first_name: 'Will', last_name: 'Tang' });
// getAllPostsByDate('2016-07-30 00:00:00', 20);
// User.save({ facebookId: 1, firstName: 'Charles', lastName: 'Zhang', email: '2@2' }).then(res => console.log(res));
// User.save({ facebookId: 2, firstName: 'Will', lastName: 'Tang', email: '2@2' });
// Review.save({ id: 1, User_facebookId: 2 });
// Follow.save({ follower: 1, followed: 2 });
// Product.save({ upc: 20394892038402936 });
// getPostsByFriends('2016-07-30 00:00:00', 20, 1).then(res => console.log(res));
module.exports = { getPostsByDate, getPostsByFriends, getPostsById, postReview };
