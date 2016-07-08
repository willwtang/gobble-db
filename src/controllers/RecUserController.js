const { Post, Product, Media } = require('../models');
const Promise = require('bluebird');

const getAllUserRatings = function() {
  // const qb = new QueryBuilder();
  // const qb2 = new QueryBuilder();
//   qb2.select({ what: '*', from: 'Post', where: 'rating IS NOT NULL', as: 'T1' });
//   return qb
//     .select({ what: ['T1.User_facebook_id', 'T1.rating', 'Product.name', 'Product.upc'], from: qb2.materialize() })
//     .fire();
  return Post.fetch('rating IS NOT NULL and Product_upc IS NOT NULL', ['User_facebook_id', 'rating', 'Product_upc']);
};

const sendAllUserRatings = function(req, res) {
  getAllUserRatings()
    .then(results => res.status(200).send(results))
    .catch(err => res.status(400).send(err));
};

const getProductsByIds = function(arrayOfIds) {
  return Product.fetch({ upc: arrayOfIds }, ['upc', 'name', 'brand']);
};

const getImagesByIds = function(arrayOfIds) {
  return getProductsByIds(arrayOfIds)
    .then(products => {
      const promises = [];
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const mediaFetch = Media.fetch({ Product_upc: product.upc })
          .then(media => {
            if (media.length) product.image = media[0].url;
            return product;
          })
          .catch(err => console.log(err));
        promises.push(mediaFetch);
      }
      return Promise.all(promises);
    });
};
const sendProductsByIds = function(req, res) {
  const upcs = req.query.upc;
  getImagesByIds(upcs)
    .then(results => res.send(results))
    .catch(err => res.send(err));
};

module.exports = { sendAllUserRatings, sendProductsByIds };
