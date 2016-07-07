const UserController = require('./../controllers/UserController');
const PostController = require('./../controllers/PostController');
const ProductController = require('./../controllers/ProductController');
const FollowController = require('./../controllers/FollowController');
const SearchController = require('./../controllers/SearchController');

const routes = (app) => {
  app.get('/db/user', UserController.getUser);
  app.post('/db/user', UserController.postUser);

  app.post('/db/follow', FollowController.postFollow);
  app.delete('/db/follow', FollowController.deleteFollow);
  app.get('/db/followers', FollowController.getFollowers);
  app.get('/db/follower_ids', FollowController.getFollowerIds);
  app.get('/db/following', FollowController.getFollowing);
  app.get('/db/following_ids', FollowController.getFollowingIds);
  app.get('/db/is_following', FollowController.getIsFollowing);

  app.post('/db/review', PostController.postReview);
  app.post('/db/wish', PostController.postWish);
  app.post('/db/product', ProductController.postProduct);
  app.get('/db/product', ProductController.getProduct);
  app.get('/db/productsByDate', ProductController.getProductsByDate);
  app.post('/db/like', PostController.likePost);
  app.get('/db/compressMedia', PostController.getCompressMedia);
  app.post('/db/compressMedia', PostController.postCompressMedia);
  app.get('/db/postsById', PostController.getPostsById);
  app.get('/db/search', SearchController.getSearchResults);
  app.get('/db/getProductReviews', ProductController.getProductReviews);
};

module.exports = routes;
