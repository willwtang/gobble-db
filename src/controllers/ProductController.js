const { Product, Category, ProductCategory, Tag, ProductTag, Ingredient, ProductIngredient, Media } = require('./../models');
const QueryBuilder = require('../orm/querybuilder');

const addCategories = (upc, categories) => {
  for (let i = 0; i < categories.length; i++) {
    Category.fetch({ name: categories[i] })
      .then((results) => {
        // if doesn't exist add it first
        if (results.length === 0) {
          Category.save({ name: categories[i] })
            .then((savedResult) => {
              ProductCategory.save({ Product_upc: upc, Category_id: savedResult.insertId })
                .then((productCategorySavedResult) => {
                  console.log(productCategorySavedResult);
                })
                .catch((err) => {
                  console.error(err);
                });
            });
        } else {
          ProductCategory.save({ Product_upc: upc, Category_id: results[0].id })
            .then((productCategorySavedResult) => {
              console.log(productCategorySavedResult);
            })
            .catch((err) => {
              console.error(err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
};

const addTags = (upc, tags) => {
  for (let i = 0; i < tags.length; i++) {
    Tag.fetch({ name: tags[i] })
      .then((results) => {
        // if doesn't exist add it first
        if (results.length === 0) {
          Tag.save({ name: tags[i] })
            .then((savedResult) => {
              ProductTag.save({ Product_upc: upc, Tag_id: savedResult.insertId })
                .then((productTagSavedResult) => {
                  console.log(productTagSavedResult);
                })
                .catch((err) => {
                  console.error(err);
                });
            });
        } else {
          ProductTag.save({ Product_upc: upc, Tag_id: results[0].id })
            .then((productTagSavedResult) => {
              console.log(productTagSavedResult);
            })
            .catch((err) => {
              console.error(err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
};

const addIngredients = (upc, ingredients) => {
  for (let i = 0; i < ingredients.length; i++) {
    Ingredient.fetch({ name: ingredients[i] })
      .then((results) => {
        // if doesn't exist add it first
        if (results.length === 0) {
          Ingredient.save({ name: ingredients[i] })
            .then((savedResult) => {
              ProductIngredient.save({ Product_upc: upc, Ingredient_id: savedResult.insertId })
                .then((productIngredientSavedResult) => {
                  console.log(productIngredientSavedResult);
                })
                .catch((err) => {
                  console.error(err);
                });
            });
        } else {
          ProductIngredient.save({ Product_upc: upc, Ingredient_id: results[0].id })
            .then((productIngredientSavedResult) => {
              console.log(productIngredientSavedResult);
            })
            .catch((err) => {
              console.error(err);
            });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
};


const postProduct = (req, res) => {
  console.log('new product to be inserted: ', req.body);
  const categories = req.body.categories;
  const tags = req.body.tags;
  const ingredients = req.body.ingredients;
  const image = req.body.image;

  delete req.body.categories;
  delete req.body.tags;
  delete req.body.ingredients;
  delete req.body.image;

  const product = req.body;

  // add the product
  Product.save(product)
    .then((results) => {
      console.log(results);
    })
    .catch((err) => {
      console.error(err);
    });
  Media.save({ Product_upc: Number(product.upc), url: image })
    .then((results) => {
      console.log(results);
    })
    .catch((err) => {
      console.error(err);
    });

  // add the products categories
  addCategories(product.upc, categories);
  // add the products tags
  addTags(product.upc, tags);
  // add the product ingredients
  addIngredients(product.upc, ingredients);

  res.end();
};

const getProductHelper = (upc, callback) => {
  let tasksLeft = 5;

  const toReturn = {};
  toReturn.categories = [];
  toReturn.tags = [];
  toReturn.ingredients = [];
  toReturn.media = [];

  const productQB = new QueryBuilder();
  const categoriesQB = new QueryBuilder();
  const tagsQB = new QueryBuilder();
  const ingredientsQB = new QueryBuilder();
  const mediaQB = new QueryBuilder();

  productQB.select({ what: '*', from: 'Product', where: `Product.upc = ${upc}` });
  console.log(productQB.materialize());
  productQB.fire()
    .then((result) => {
      toReturn.product = result[0];
      if (--tasksLeft === 0) {
        console.log(toReturn);
        callback(toReturn);
      }
    })
    .catch((err) => {
      console.error(err);
    });

  //
  categoriesQB.select({ what: 'Category.name', from: 'Category' })
    .innerJoin({ target: 'product_category', on: { 'product_category.Category_id': 'category.id' } })
    .where({ Product_upc: upc });

  console.log(categoriesQB.materialize());
  categoriesQB.fire()
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        toReturn.categories.push(result[i].name);
      }
      if (--tasksLeft === 0) {
        console.log(toReturn);
        callback(toReturn);
      }
    })
    .catch((err) => {
      console.error(err);
    });

  //
  tagsQB.select({ what: 'Tag.name', from: 'Tag' })
    .innerJoin({ target: 'product_tag', on: { 'product_tag.Tag_id': 'tag.id' } })
    .where({ Product_upc: upc });

  console.log(tagsQB.materialize());
  tagsQB.fire()
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        toReturn.tags.push(result[i].name);
      }
      if (--tasksLeft === 0) {
        console.log(toReturn);
        callback(toReturn);
      }
    })
    .catch((err) => {
      console.error(err);
    });

  //
  ingredientsQB.select({ what: 'Ingredient.name', from: 'Ingredient' })
    .innerJoin({ target: 'product_ingredient', on: { 'product_ingredient.Ingredient_id': 'Ingredient.id' } })
    .where({ Product_upc: upc });

  console.log(ingredientsQB.materialize());
  ingredientsQB.fire()
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        toReturn.ingredients.push(result[i].name);
      }
      if (--tasksLeft === 0) {
        console.log(toReturn);
        callback(toReturn);
      }
    })
    .catch((err) => {
      console.error(err);
    });

  mediaQB.select({ what: 'url, urlCompressed, urlCompressedS3', from: 'Media' })
    .where({ Product_upc: upc });

  console.log(mediaQB.materialize());
  mediaQB.fire()
    .then((results) => {
      console.log(results);
      for (let i = 0; i < results.length; i++) {
        // toReturn.media.push(results[i].name);
      }
      if (--tasksLeft === 0) {
        console.log(toReturn);
        callback(toReturn);
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

// function timeStamp() {
//   return new Date().toISOString().slice(0, 19)
//   .replace('T', ' ');
// }

const getProductsByDate = function(req, res) {
  const date = req.query.date;
  const qb = new QueryBuilder();
  qb.select({ what: 'upc', from: 'Product', where: `Product.Product_created_at > ${date}` });
  console.log(qb.materialize());
  qb.fire()
    .then((result) => {
      console.log(result);
      const toReturn = [];
      let products = result.length;
      for (let i = 0; i < result.length; i++) {
        getProductHelper(result[i].upc, (product) => {
          toReturn.push(product);
          if (--products === 0) {
            res.end(JSON.stringify(toReturn));
          }
        });
      }
    });
};

const getProduct = (req, res) => {
  const upc = req.query.upc;
  let tasksLeft = 5;

  const toReturn = {};
  toReturn.categories = [];
  toReturn.tags = [];
  toReturn.ingredients = [];
  toReturn.media = [];

  const productQB = new QueryBuilder();
  const categoriesQB = new QueryBuilder();
  const tagsQB = new QueryBuilder();
  const ingredientsQB = new QueryBuilder();
  const mediaQB = new QueryBuilder();

  productQB.select({ what: '*', from: 'Product', where: `Product.upc = ${upc}` });
  console.log(productQB.materialize());
  productQB.fire()
    .then((result) => {
      toReturn.product = result[0];
      if (--tasksLeft === 0) {
        console.log(toReturn);
        res.end(JSON.stringify(toReturn));
      }
    })
    .catch((err) => {
      console.error(err);
    });

  //
  categoriesQB.select({ what: 'Category.name', from: 'Category' })
    .innerJoin({ target: 'product_category', on: { 'product_category.Category_id': 'category.id' } })
    .where({ Product_upc: upc });

  console.log(categoriesQB.materialize());
  categoriesQB.fire()
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        toReturn.categories.push(result[i].name);
      }
      if (--tasksLeft === 0) {
        console.log(toReturn);
        res.end(JSON.stringify(toReturn));
      }
    })
    .catch((err) => {
      console.error(err);
    });

  //
  tagsQB.select({ what: 'Tag.name', from: 'Tag' })
    .innerJoin({ target: 'product_tag', on: { 'product_tag.Tag_id': 'tag.id' } })
    .where({ Product_upc: upc });

  console.log(tagsQB.materialize());
  tagsQB.fire()
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        toReturn.tags.push(result[i].name);
      }
      if (--tasksLeft === 0) {
        console.log(toReturn);
        res.end(JSON.stringify(toReturn));
      }
    })
    .catch((err) => {
      console.error(err);
    });

  //
  ingredientsQB.select({ what: 'Ingredient.name', from: 'Ingredient' })
    .innerJoin({ target: 'product_ingredient', on: { 'product_ingredient.Ingredient_id': 'Ingredient.id' } })
    .where({ Product_upc: upc });

  console.log(ingredientsQB.materialize());
  ingredientsQB.fire()
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        toReturn.ingredients.push(result[i].name);
      }
      if (--tasksLeft === 0) {
        console.log(toReturn);
        res.end(JSON.stringify(toReturn));
      }
    })
    .catch((err) => {
      console.error(err);
    });

  mediaQB.select({ what: 'url, urlCompressed, urlCompressedS3', from: 'Media' })
    .where({ Product_upc: upc });

  console.log(mediaQB.materialize());
  mediaQB.fire()
    .then((results) => {
      for (let i = 0; i < results.length; i++) {
        toReturn.media.push(results[i]);
      }
      if (--tasksLeft === 0) {
        console.log(toReturn);
        res.end(JSON.stringify(toReturn));
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

module.exports = {
  postProduct, getProduct, getProductsByDate,
};
