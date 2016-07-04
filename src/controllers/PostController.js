const { Product, User, Review, Post, Media, Like } = require('../models');
const QueryBuilder = require('../orm/querybuilder');
const { dateNow, removeQuotes } = require('../lib/utility');

const fetch = require('isomorphic-fetch');
const gobbleProductBuilder = process.env.GOBBLE_PRODUCT_BUILDER;

const getPostsByDate = function(date, limit) {
  const qb = new QueryBuilder();
  const qb2 = new QueryBuilder();
  qb2.select({ what: '*', from: 'Post', limit, where: `parentId IS NULL AND date(Post.Post_created_at) < STR_TO_DATE('${date}', '%Y-%m-%d %H:%i:%s')`, orderBy: 'Post_created_at', as: 'T1' });
  return (qb
    .select({ what: '*', from: qb2.materialize() })
    .innerJoin({ target: 'User', on: { 'User.facebook_id': 'T1.User_facebook_id' } })
    .leftJoin({ target: 'Product', on: { 'T1.Product_upc': 'Product.upc' } })
    .orderBy('T1.Post_created_at')
    .fire());
};

const sendPostsByDate = function(req, res) {
  const date = req.query.date || dateNow();
  const limit = 10;
  getPostsByDate(date, limit)
    .then(results => {
      res.send(results);
    })
    .catch(err => {
      console.log(err);
      res.status(404).send(err);
    });
};


const getPostsByFriends = function(date, limit, user) {
  const qb = new QueryBuilder();
  const qb2 = new QueryBuilder();
  qb2.select({ what: 'followed', from: 'Follow', where: `Follow.follower = ${user}`, as: 'T1' });
  return (qb
    .select({ what: '*', from: qb2.materialize() })
    .innerJoin({ target: 'User', on: { 'User.facebook_id': 'T1.followed' } })
    .innerJoin({ target: 'Post', on: `Post.parentId IS NULL AND T1.followed = Post.User_facebook_id AND date(Post.Post_created_at) < STR_TO_DATE('${date}', '%Y-%m-%d %H:%i:%s')` })
    .leftJoin({ target: 'Product', on: { 'Post.Product_upc': 'Product.upc' } })
    .orderBy('Post_created_at')
    .fire()
    .then(res => res.slice(0, limit + 1)));
};

const sendPostsByFriends = function(req, res) {
  const date = req.query.date || dateNow();
  const limit = 10;
  const user = +req.query.facebookId;
  // if (date.charAt(0) === '"' && date.charAt(date.length - 1) === '"') {
  //   date = removeQuotes(date);
  // }

  getPostsByFriends(date, limit, user)
    .then(results => {
      res.send(results);
    })
    .catch(err => {
      console.log(err);
      res.status(404).send(err);
    });
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

const updateLikeCache = function(postId) {
  Like.fetch({ Post_id: postId })
    .then((result) => {
      console.log('likes: ', result.length);
      const likes = result.length;
      Post.save({ postId, likesCache: likes })
        .then(() => {
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.error(err);
    });
};

const likePost = function(req, res) {
  console.log(req.body);
  const facebookId = req.body.facebookId;
  const postId = req.body.postId;

  Like.destroy({ facebook_id: facebookId, Post_id: postId })
    .then((result) => {
      if (result.affectedRows === 0) {
        Like.save({ facebook_id: facebookId, Post_id: postId })
          .then(() => {
            updateLikeCache(postId);
          });
      } else {
        updateLikeCache(postId);
      }
    });
  res.end();
};

const getCompressMedia = function(req, res) {
  const qb = new QueryBuilder();
  qb.select({ what: 'id, url', from: 'Media', where: 'urlCompressed is null', orderBy: 'views' })
    .fire()
    .then((results) => {
      console.log(results);
      const pictures = [];
      const limit = Math.min(results.length, 10);
      for (let i = 0; i < limit; i++) {
        pictures.push({ task: 'compress', imageId: results[i].id, imageUrl: results[i].url });
      }
      res.end(JSON.stringify(pictures));
    })
    .catch((err) => {
      console.error(err);
      res.end();
    });
};

const postCompressMedia = function(req, res) {
  Media.save({ id: req.body.imageId, urlCompressed: req.body.compressedUrl })
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
    });
  res.end();
};

// getPostsByDate('2016-07-30 00:00:00', 20).then(res => console.log(res));
// Post.save({ User_facebook_id: 2, Product_upc: 20394892038402936 });
const getCommentsByParentId = function(parentId) {
  return Post.join({ table: User, on: { 'Post.parentId': parentId, 'User.facebook_id': 'Post.User_facebook_id' } });
};

const sendCommentsByParentId = function(req, res) {
  const parentId = req.query.parentId;
  getCommentsByParentId(parentId)
    .then(results => res.send(results))
    .catch(err => {
      console.log(err);
      res.status(404).send(err);
    });
};

const getAllReviews = function() {
  return (Post
    .join({ table: Product, on: 'Post.rating IS NOT NULL AND Post.Product_upc = Product.upc' }));
};

const sendAllReviews = function(req, res) {
  getAllReviews()
    .then(results => res.send(results))
    .catch(err => {
      console.log('sendAllReviews error', err);
      res.status(404).send(err);
    });
};

const createDummyData = function(nUsers, nProducts, nPosts) {
  for (let upc = 1; upc < nProducts; upc++) {
    Product.save({ upc });
  }
  for (let facebookId = 1; facebookId < nUsers; facebookId++) {
    User.save({ facebook_id: facebookId });
  }
  const memo = {};
  for (let i = 0; i < nPosts; i++) {
    let count = 0;
    let user = ~~(Math.random() * nUsers) + 1;
    let upc = ~~(Math.random() * nProducts) + 1;
    memo[user] = memo[user] || new Set();
    while (memo[user].has(upc) && count++ < 100) {
      user = ~~(Math.random() * nUsers) + 1;
      upc = ~~(Math.random() * nProducts) + 1;
      memo[user] = memo[user] || new Set();
    }
    if (!memo[user].has(upc)) {
      memo[user].add(upc);
      Post.save({ User_facebook_id: user, Product_upc: upc, rating: ~~(Math.random() * 5) + 1 });
    }
  }
};

// getAllReviews().then(res => console.log(res));
getPostsByDate(null, 20).then(res => console.log(res));
// Post.save({ User_facebook_id: 2, Product_upc: 20394892038402936 });
// Post.save({ User_facebook_id: 10153855879659926, Product_upc: 20394892038402936 });

// getCommentsByParentId(5).then(r => console.log(r));
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
module.exports = { sendAllReviews, sendCommentsByParentId, sendPostsByFriends, sendPostsByDate, sendPostsById, postReview, likePost, getCompressMedia, postCompressMedia };
// getPostsByFriends('2017-01-01 00:00:00', 10, 2).then(res => console.log('#######', res));
// console.log(dateNow());
// getPostsByFriends('2016-07-30 00:00:00', 10, 1).then(res => console.log('#######', res));
