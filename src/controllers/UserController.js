const { User } = require('./../models');

const getUser = (req, res) => {
  User.fetch({ facebook_id: req.query.facebook_id })
    .then(fetchedUser => {
      res.status(200).json(fetchedUser);
    })
    .catch(err => {
      console.err(err);
    });
};

const postUser = (req, res) => {
  const newUser = {
    facebook_id: req.body.facebook_id,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    display_name: req.body.display_name,
    gender: req.body.gender,
    photo_url: req.body.photo_url,
  };

  User.save(newUser)
    .then(savedUser => {
      res.status(200).send(savedUser);
    })
    .catch(err => {
      console.err(err);
    });
};

module.exports = {
  getUser,
  postUser,
};
