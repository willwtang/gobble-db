const Table = require('../orm/schema');

const User = new Table('User', user => {
  user.bigInt('facebook_id', 64, 'UNSIGNED').primaryKey();
  user.varChar('first_name', 255);
  user.varChar('last_name', 255);
  user.varChar('display_name', 255);
  user.varChar('gender', 255);
  user.varChar('photo_url', 255);
  user.timestamp();
});

const Follow = new Table('Follow', follow => {
  follow.bigInt('follower', 64, 'UNSIGNED');
  follow.bigInt('followed', 64, 'UNSIGNED');

  follow.primaryKey(null, 'follower', 'followed');
  follow.foreignKey('Follow_fk_follower', 'follower', 'User', 'facebook_id');
  follow.foreignKey('Follow_fk_followed', 'followed', 'User', 'facebook_id');
});

const Product = new Table('Product', product => {
  product.bigInt('upc', 64, 'UNSIGNED').primaryKey();
  product.varChar('name', 255);
  product.varChar('brand', 255);
  product.int('energy', 64, 'UNSIGNED');
  product.int('fat', 64, 'UNSIGNED');
  product.int('saturatedfat', 64, 'UNSIGNED');
  product.int('monounsaturatedfat', 64, 'UNSIGNED');
  product.int('polyunsaturatedfat', 64, 'UNSIGNED');
  product.int('omega3fat', 64, 'UNSIGNED');
  product.int('transfat', 64, 'UNSIGNED');
  product.int('cholesterol', 64, 'UNSIGNED');
  product.int('carbohydrates', 64, 'UNSIGNED');
  product.int('sugar', 64, 'UNSIGNED');
  product.int('starch', 64, 'UNSIGNED');
  product.int('polyols', 64, 'UNSIGNED');
  product.int('fiber', 64, 'UNSIGNED');
  product.int('protein', 64, 'UNSIGNED');
  product.int('salt', 64, 'UNSIGNED');
  product.int('sodium', 64, 'UNSIGNED');
  product.int('alcohol', 64, 'UNSIGNED');
  product.int('vitamina', 64, 'UNSIGNED');
  product.int('vitaminc', 64, 'UNSIGNED');
  product.int('vitamind', 64, 'UNSIGNED');
  product.int('vitamine', 64, 'UNSIGNED');
  product.int('vitamink', 64, 'UNSIGNED');
  product.int('vitaminb1', 64, 'UNSIGNED');
  product.int('vitaminb2', 64, 'UNSIGNED');
  product.int('vitaminpp', 64, 'UNSIGNED');
  product.int('vitaminb6', 64, 'UNSIGNED');
  product.int('vitaminb9', 64, 'UNSIGNED');
  product.int('vitaminb12', 64, 'UNSIGNED');
  product.int('biotin', 64, 'UNSIGNED');
  product.int('pantothenicacid', 64, 'UNSIGNED');
  product.int('calcium', 64, 'UNSIGNED');
  product.int('phosphorus', 64, 'UNSIGNED');
  product.int('iron', 64, 'UNSIGNED');
  product.int('magnesium', 64, 'UNSIGNED');
  product.int('zinc', 64, 'UNSIGNED');
  product.int('copper', 64, 'UNSIGNED');
  product.int('manganese', 64, 'UNSIGNED');
  product.int('selenium', 64, 'UNSIGNED');
  product.int('chromium', 64, 'UNSIGNED');
  product.int('molybdenum', 64, 'UNSIGNED');
  product.int('iodine', 64, 'UNSIGNED');
  product.int('caffeine', 64, 'UNSIGNED');
  product.int('taurine', 64, 'UNSIGNED');
  product.int('potassium', 64, 'UNSIGNED');
  product.timestamp();
});


const Category = new Table('Category', category => {
  category
    .int('id', 64, 'UNSIGNED')
    .notNull()
    .autoIncrement()
    .primaryKey();
  category.varChar('name', 255);
  category.timestamp();
});

const ProductCategory = new Table('Product_Category', join => {
  join.bigInt('Product_upc', 64, 'UNSIGNED');
  join.int('Category_id', 64, 'UNSIGNED');

  join.primaryKey(null, 'Product_upc', 'Category_id');
  join.foreignKey('Product_Category_fk_Product_upc', 'Product_upc', 'Product', 'upc');
  join.foreignKey('Product_Category_fk_Category_id', 'Category_id', 'Category', 'id');

  join.timestamp();
});

const Ingredient = new Table('Ingredient', ingredient => {
  ingredient
    .int('id', 64, 'UNSIGNED')
    .notNull()
    .autoIncrement()
    .primaryKey();
  ingredient.varChar('name', 255);
  ingredient.timestamp();
});

const ProductIngredient = new Table('Product_Ingredient', join => {
  join.bigInt('Product_upc', 64, 'UNSIGNED');
  join.int('Ingredient_id', 64, 'UNSIGNED');

  join.primaryKey(null, 'Product_upc', 'Ingredient_id');
  join.foreignKey('Product_Ingredient_fk_Product_upc', 'Product_upc', 'Product', 'upc');
  join.foreignKey('Product_Ingredient_fk_Ingredient_id', 'Ingredient_id', 'Ingredient', 'id');

  join.timestamp();
});

const Tag = new Table('Tag', tag => {
  tag
    .int('id', 64, 'UNSIGNED')
    .notNull()
    .autoIncrement()
    .primaryKey();
  tag.varChar('name', 255);
  tag.timestamp();
});

const ProductTag = new Table('Product_Tag', join => {
  join.bigInt('Product_upc', 64, 'UNSIGNED');
  join.int('Tag_id', 64, 'UNSIGNED');

  join.primaryKey(null, 'Product_upc', 'Tag_id');
  join.foreignKey('Product_Tag_fk_Product_upc', 'Product_upc', 'Product', 'upc');
  join.foreignKey('Product_Tag_fk_Tag_id', 'Tag_id', 'Tag', 'id');
  join.timestamp();
});

const Post = new Table('Post', post => {
  post.int('postId', 64, 'UNSIGNED').autoIncrement().primaryKey();
  post.bigInt('User_facebook_id', 64, 'UNSIGNED');
  post.bigInt('Product_upc', 64, 'UNSIGNED');
  post.int('likesCache', 64, 'UNSIGNED').default(0);
  post.text('comment');
  post.int('rating');
  post.int('parentId', 64, 'UNSIGNED');

  post.foreignKey('Post_fk_User_facebook_id', 'User_facebook_id', 'User', 'facebook_id');
  post.foreignKey('Post_fk_Product_upc', 'Product_upc', 'Product', 'upc');

  post.timestamp();
});

const Like = new Table('Likes', like => {
  // like.int('postId', 64, 'UNSIGNED').autoIncrement().primaryKey();
  like.bigInt('facebook_id', 64, 'UNSIGNED').primaryKey();
  like.int('Post_id', 64, 'UNSIGNED');

  like.foreignKey('Like_fk_facebook_id', 'facebook_id', 'User', 'facebook_id');
  like.foreignKey('Like_fk_Post_id', 'Post_id', 'Post', 'postId');

  like.timestamp();
});

const Media = new Table('Media', media => {
  media.int('id', 64, 'UNSIGNED').autoIncrement().primaryKey();
  media.int('Post_id', 64, 'UNSIGNED');
  media.varChar('url', 255);
  media.varChar('urlCompressed', 255);
  media.varChar('urlCompressedS3', 255);
  media.int('views', 64, 'UNSIGNED');
  media.bigInt('Product_upc', 64, 'UNSIGNED');
  media.bigInt('User_facebook_id', 64, 'UNSIGNED');
  media.int('view', 64, 'UNSIGNED').default(0);

  media.foreignKey('Image_fk_Product_upc', 'Product_upc', 'Product', 'upc');
  media.foreignKey('Image_fk_User_facebook_id', 'User_facebook_id', 'User', 'facebook_id');
  media.foreignKey('Image_fk_Post_id', 'Post_id', 'Post', 'id');

  media.timestamp();
});

// const Review = new Table('Review', review => {
//   review.int('reviewId', 64, 'UNSIGNED').autoIncrement().primaryKey();
//   review.int('Post_id', 64, 'UNSIGNED');
//   review.bigInt('Product_upc', 64, 'UNSIGNED');
//   review.int('rating');
//   review.bigInt('User_facebook_id', 64, 'UNSIGNED');
//   review.timestamp();

//   review.foreignKey('Review_fk_Product_upc', 'Product_upc', 'Product', 'upc');
//   review.foreignKey('Review_fk_User_facebookId', 'User_facebookId', 'User', 'facebookId');
//   review.foreignKey('Review_fk_Post_id', 'Post_id', 'Post', 'id');
// });

// const Wish = new Table('Wish', wish => {
//   wish.int('wishId', 64, 'UNSIGNED').autoIncrement().primaryKey();
//   wish.int('Post_id', 64, 'UNSIGNED');
//   wish.bigInt('Product_upc', 64, 'UNSIGNED');
//   wish.bigInt('User_facebookId', 64, 'UNSIGNED');
//   wish.foreignKey('Wish_fk_Product_upc', 'Product_upc', 'Product', 'upc');
//   wish.foreignKey('Wish_fk_User_facebookId', 'User_facebookId', 'User', 'facebookId');
//   wish.foreignKey('Wish_fk_Post_id', 'Post_id', 'Post', 'id');

//   wish.timestamp();
// });

// Product.save({ upc: 20394892038402934, name: 'cereal', Brand_id: 1 });
// Product.save({ upc: 23894238974, name: 'cereal', Brand_id: 1 });
// Brand.save({ name: 'Kellog' });

// Review.save({ Post_id: 1, Product_upc: 20394892038402934, rating: 5 });
// Post.save({ id: 1, User_facebookId: 1, likesCache: 10, comment: 'test' });

// Post.join({ table: Review, on: { 'Post.id': 'Review.Post_id' } }, { table: Product, on: { 'Review.Product_upc': 'Product.upc' } }, { table: User, on: { 'Post.User_facebookId': 'User.facebookId' } }).then(res => console.log(res));
// Product.fetch({ upc: 20394892038402934 }).then(res => console.log(res));
// Product.join({ table: Brand, on: { 'Product.Brand_id': 'Brand.id' } }).then(res => console.log(res));
// Product.match({ upc: [20394892038402934, 23894238974] }).then(res => console.log(res));

module.exports = { User, Product, Category, ProductCategory, Ingredient, Tag, ProductTag, Media, Post, ProductIngredient, Follow, Like };
