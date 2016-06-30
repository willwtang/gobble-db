require('./setup');
const expect = require('chai').expect;

// We're using supertest, which allows for use of any super-agent methods
// and really easy HTTP assertions.
// See https://www.npmjs.com/package/supertest for a better reference

// Uncomment these two lines when doing integration tests
// const appUrl = `${process.env.PROTOCOL}${process.env.HOST}:${process.env.PORT}`;
// const request = require('supertest');

// Test requires
const Table = require('../src/orm/schema');
const QueryBuilder = require('../src/orm/querybuilder');

describe('Table and Schema classes', () => {
  describe('Schema class', () => {
    it('Table class should exist', () => {
      expect(Table).to.exist;
    });
    it('Table class should be a class', () => {
      expect(Table).to.be.a('function');
    });
  });

  describe('Table class usage', () => {
    const testString = new Table('User', user => {
      user.bigInt('facebookId', 64, 'UNSIGNED');
      user.varChar('email', 255);
      user.varChar('firstName', 255);
      user.varChar('lastName', 255);
      user.primaryKey('User_primaryKey', 'facebookId');
      user.timestamp();
    }, true);
    describe('Table class should internally produce a string', () => {
      expect(testString.createTableQuery).to.be.a('string');
    });
    describe('Table class should start with "CREATE TABLE IF NOT EXISTS"', () => {
      expect(testString.createTableQuery.indexOf('CREATE TABLE IF NOT EXISTS')).to.equal(0);
    });
    describe('Table class should produce the correct SQL query', () => {
      const correctQuery = 'CREATE TABLE IF NOT EXISTS User (facebookId BIGINT(64)UNSIGNED,email VARCHAR(255),firstName VARCHAR(255),lastName VARCHAR(255),created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,CONSTRAINT User_primaryKey PRIMARY KEY(facebookId));';
      expect(testString.createTableQuery).to.equal(correctQuery);
    });
  });
});

describe('QueryBuilder class', () => {
  describe('QueryBuilder class', () => {
    it('QueryBuilder class should exist', () => {
      expect(QueryBuilder).to.exist;
    });
    it('QueryBuilder should be a class', () => {
      expect(QueryBuilder).to.be.a('function');
    });
  });

  describe('QueryBuilder usage', () => {
    const testQuery = new QueryBuilder().insertOrUpdate({
      table: 'User',
      columns: {
        facebookId: 555,
        firstName: 'Will',
        lastName: 'Tang',
        email: 'xxxxxxxxxxx',
      },
    }).materialize();
    it('QueryBuilder should produce a string', () => {
      expect(testQuery).to.be.a('string');
    });
    it('QueryBuilder should produce the correct SQL query', () => {
      const correctQuery = "INSERT INTO User (facebookId,firstName,lastName,email) VALUES (555,'Will','Tang','xxxxxxxxxxx') ON DUPLICATE KEY UPDATE facebookId = VALUES(facebookId),firstName = VALUES(firstName),lastName = VALUES(lastName),email = VALUES(email);";
      expect(testQuery).to.equal(correctQuery);
    });
  });
});
