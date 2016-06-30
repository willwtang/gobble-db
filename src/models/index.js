const Table = require('../orm/schema');

const User = new Table('User', user => {
  user.bigInt('facebookId', 64, 'UNSIGNED').primaryKey();
  user.varChar('firstName', 255);
  user.varChar('lastName', 255);
  user.varChar('email', 255);
});

const Product = new Table('Product', product => {
  product.bigInt('upc', 64, 'UNSIGNED').primaryKey();
  product.varChar('name', 255);
  product.int('Brand_id', 64, 'UNSIGNED');
  product.int('Nutrient_id', 64, 'UNSIGNED');

  product.foreignKey('Product_fk_Brand_id', 'Brand_id', 'Brand', 'id');
});

const Brand = new Table('Brand', brand => {
  brand
    .int('id', 64, 'UNSIGNED')
    .autoIncrement()
    .primaryKey();
  brand.varChar('name', 255);
});

const Category = new Table('Category', category => {
  category
    .int('id', 64, 'UNSIGNED')
    .notNull()
    .autoIncrement()
    .primaryKey();
  category.varChar('name', 255);
});

const ProductCategory = new Table('Product_Category', join => {
  join.bigInt('Product_upc', 64, 'UNSIGNED');
  join.int('Category_id', 64, 'UNSIGNED');

  join.primaryKey(null, 'Product_upc', 'Category_id');
  join.foreignKey('Product_Category_fk_Product_upc', 'Product_upc', 'Product', 'upc');
  join.foreignKey('Product_Category_fk_Category_id', 'Category_id', 'Category', 'id');
});

const Ingredient = new Table('Ingredient', ingredient => {
  ingredient.int('id', 64, 'UNSIGNED').primaryKey();
  ingredient.varChar('name', 255);
});

const ProductIngredient = new Table('Product_Ingredient', join => {
  join.bigInt('Product_upc', 64, 'UNSIGNED');
  join.int('Ingredient_id', 64, 'UNSIGNED');

  join.primaryKey(null, 'Product_upc', 'Ingredient_id');
  join.foreignKey('Product_Ingredient_fk_Product_upc', 'Product_upc', 'Product', 'upc');
  join.foreignKey('Product_Ingredient_fk_Ingredient_id', 'Ingredient_id', 'Ingredient', 'id');
});

const Tag = new Table('Tag', tag => {
  tag.int('id', 64, 'UNSIGNED').primaryKey();
  tag.varChar('name', 255);
});

const ProductTag = new Table('Product_Tag', join => {
  join.bigInt('Product_upc', 64, 'UNSIGNED');
  join.int('Tag_id', 64, 'UNSIGNED');

  join.primaryKey(null, 'Product_upc', 'Tag_id');
  join.foreignKey('Product_Tag_fk_Product_upc', 'Product_upc', 'Product', 'upc');
  join.foreignKey('Product_Tag_fk_Tag_id', 'Tag_id', 'Tag', 'id');
});

const Post = new Table('Post', post => {
  post.int('id', 64, 'UNSIGNED').autoIncrement().primaryKey();
  post.bigInt('User_facebookId', 64, 'UNSIGNED');
  post.int('likesCache', 64, 'UNSIGNED');
  post.text('comment');
  post.int('parentId', 64, 'UNSIGNED');

  post.foreignKey('Post_fk_User_facebookId', 'User_facebookId', 'User', 'facebookId');
});

const Image = new Table('Image', image => {
  image.int('id', 64, 'UNSIGNED').autoIncrement().primaryKey();
  image.int('Post_id', 64, 'UNSIGNED');
  image.varChar('url', 255);
  image.varChar('urlCompressed', 255);
  image.varChar('urlCompressedS3', 255);
  image.bigInt('Product_upc', 64, 'UNSIGNED');
  image.bigInt('User_facebookId', 64, 'UNSIGNED');

  image.foreignKey('Image_fk_Product_upc', 'Product_upc', 'Product', 'upc');
  image.foreignKey('Image_fk_User_facebookId', 'User_facebookId', 'User', 'facebookId');
  image.foreignKey('Image_fk_Post_id', 'Post_id', 'Post', 'id');
});

const Review = new Table('Review', review => {
  review.int('id', 64, 'UNSIGNED').autoIncrement().primaryKey();
  review.int('Post_id', 64, 'UNSIGNED');
  review.bigInt('Product_upc', 64, 'UNSIGNED');
  review.int('rating');
  review.bigInt('User_facebookId', 64, 'UNSIGNED');
  review.foreignKey('Review_fk_Product_upc', 'Product_upc', 'Product', 'upc');
  review.foreignKey('Review_fk_User_facebookId', 'User_facebookId', 'User', 'facebookId');
  review.foreignKey('Review_fk_Post_id', 'Post_id', 'Post', 'id');
});

const Wish = new Table('Wish', wish => {
  wish.int('id', 64, 'UNSIGNED').autoIncrement().primaryKey();
  wish.int('Post_id', 64, 'UNSIGNED');
  wish.bigInt('Product_upc', 64, 'UNSIGNED');
  wish.varChar('amazonUrl', 255);
  wish.bigInt('User_facebookId', 64, 'UNSIGNED');
  wish.foreignKey('Wish_fk_Product_upc', 'Product_upc', 'Product', 'upc');
  wish.foreignKey('Wish_fk_User_facebookId', 'User_facebookId', 'User', 'facebookId');
  wish.foreignKey('Wish_fk_Post_id', 'Post_id', 'Post', 'id');
});

const Livestream = new Table('Livestream', livestream => {
  livestream.int('id', 64, 'UNSIGNED').autoIncrement().primaryKey();
  livestream.int('Post_id', 64, 'UNSIGNED');
  livestream.bigInt('Product_upc', 64, 'UNSIGNED');
  livestream.varChar('url', 255);
  livestream.bigInt('User_facebookId', 64, 'UNSIGNED');
  livestream.foreignKey('Livestream_fk_Product_upc', 'Product_upc', 'Product', 'upc');
  livestream.foreignKey('Livestream_fk_User_facebookId', 'User_facebookId', 'User', 'facebookId');
  livestream.foreignKey('Livestream_fk_Post_id', 'Post_id', 'Post', 'id');
});

Product.save({ upc: 20394892038402934, name: 'cereal', Brand_id: 1 });
// Brand.save({ name: 'Kellog' });

Product.fetch({ upc: 20394892038402934 }).then(res => console.log(res));
// Product.join({ table: Brand, on: { Brand_id: 'id' } }).then(res => console.log(res));

module.exports = { User, Product, Brand, Category, ProductCategory, Ingredient, Tag, ProductTag, Image, Post, Review, Wish, Livestream, ProductIngredient };
