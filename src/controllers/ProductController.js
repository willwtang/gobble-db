const { Product, Category, ProductCategory, Tag, ProductTag, Ingredient, ProductIngredient } = require('./../models');

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

  delete req.body.categories;
  delete req.body.tags;
  delete req.body.ingredients;

  const product = req.body;

  // add the product
  Product.save(product)
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

module.exports = {
  postProduct,
};
