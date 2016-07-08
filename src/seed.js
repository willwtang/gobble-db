const { Product, User, Post } = require('./models');
const Promise = require('bluebird');

// INSERT PASSWORD HERE
process.env.DB_PASSWORD = 'abc';

const createDummyUsers = function(nUsers) {
  const promises = [];
  for (let facebookId = 1; facebookId < nUsers; facebookId++) {
    promises.push(User.save({ facebook_id: facebookId, first_name: `test${facebookId}`, last_name: `last${facebookId}`, photo_url: '/images/gobble-logo.png' }));
  }
  return Promise.all(promises);
};

const createDummyReviews = function(nUser) {
  Product
    .fetch()
    .then(res => {
      const promises = [];
      for (let i = 0; i < res.length; i++) {
        const user = ~~(Math.random() * nUser);
        const rating = ~~(Math.random() * 5) + 1;
        const upc = res[i].upc;
        const comment = 'sdo saojfs jalskfjaslks skjfasklfa ekjalkejfawe skdjfjsdf sdkjfskadf sdkjjfsd sdkjfaskdjf lss saefiaw sdmffk sskjflajkf skfjlaef skdfljskdjf';
        promises.push(Post.save({ User_facebook_id: user, rating, Product_upc: upc, comment }));
      }
      return Promise.all(promises);
    })
    .then(res => console.log(res));
};

createDummyUsers(500).then(() => createDummyReviews(500));
