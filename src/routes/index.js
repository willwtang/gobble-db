const UserController = require('./../controllers/UserController');
const PostController = require('./../controllers/PostController');
const ProductController = require('./../controllers/ProductController');
const FollowController = require('./../controllers/FollowController');

const routes = (app) => {
  app.get('/db/user', UserController.getUser);
  app.post('/db/user', UserController.postUser);
  app.post('/db/review', PostController.postReview);
  app.post('/db/product', ProductController.postProduct);
  app.get('/db/product', ProductController.getProduct);
  app.get('/db/productsByDate', ProductController.getProductsByDate);
  app.post('/db/like', PostController.likePost);
  app.get('/db/compressMedia', PostController.getCompressMedia);
  app.post('/db/compressMedia', PostController.postCompressMedia);
  app.get('/db/postsById', PostController.getPostsById);

  app.post('/db/follow', FollowController.postFollow);
  app.get('/db/followers', FollowController.getFollowers);
  app.get('/db/following', FollowController.getFollowing);
};

module.exports = routes;
