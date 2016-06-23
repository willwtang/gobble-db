require('./setup');
const expect = require('chai').expect;

// We're using supertest, which allows for use of any super-agent methods
// and really easy HTTP assertions.
// See https://www.npmjs.com/package/supertest for a better reference
const appUrl = `${process.env.PROTOCOL}${process.env.HOST}:${process.env.PORT}`;
const request = require('supertest');

describe('Gobble Template', () => {
  describe('Basic GET Request', () => {
    it('should return status code 200 and json string "Hello, World!"', (done) => {
      request(appUrl)
        .get('/')
        .set('Accept', 'application/json')
        .expect(200, { message: 'Hello, World!' })
        .end((err) => {
          if (err) return done(err);
          return done();
        });
    });
  });

  describe('Dummy Chai Assertion', () => {
    it('should verify the equality of two strings', () => {
      expect('Of course this works!').to.equal('Of course this works!');
    });
  });

  // More tests (as in A LOT more!) and describe blocks below
});
