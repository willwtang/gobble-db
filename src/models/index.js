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
  product.int('Brand_id', 64, 'UNSIGNED');
  product.int('Nutrient_id', 64, 'UNSIGNED');

  product.timestamp();

  product.foreignKey('Product_fk_Brand_id', 'Brand_id', 'Brand', 'id');
});

const Brand = new Table('Brand', brand => {
  brand
    .int('id', 64, 'UNSIGNED')
    .autoIncrement()
    .primaryKey();
  brand.varChar('name', 255);
  brand.timestamp();
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
  ingredient.int('id', 64, 'UNSIGNED').primaryKey();
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
  tag.int('id', 64, 'UNSIGNED').primaryKey();
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
  post.int('likesCache', 64, 'UNSIGNED');
  post.text('comment');
  post.int('rating');
  post.int('parentId', 64, 'UNSIGNED');

  post.foreignKey('Post_fk_User_facebook_id', 'User_facebook_id', 'User', 'facebook_id');
  post.foreignKey('Post_fk_Product_upc', 'Product_upc', 'Product', 'upc');

  post.timestamp();
});

const Media = new Table('Image', media => {
  media.int('id', 64, 'UNSIGNED').autoIncrement().primaryKey();
  media.int('Post_id', 64, 'UNSIGNED');
  media.varChar('url', 255);
  media.varChar('urlCompressed', 255);
  media.varChar('urlCompressedS3', 255);
  media.bigInt('Product_upc', 64, 'UNSIGNED');
  media.bigInt('User_facebook_id', 64, 'UNSIGNED');

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

module.exports = { User, Product, Brand, Category, ProductCategory, Ingredient, Tag, ProductTag, Media, Post, ProductIngredient, Follow };
