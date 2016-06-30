const QueryBuilder = require('./querybuilder');
const db = require('./db');

class Transaction {
  constructor() {
    this.queries = [];
  }

  next(cb) {
    this.queries.push(cb);
    return this;
  }

  start() {
    db.getConnection()
    .then(conn => {
      this.queries.reduce((accumulator, queryFunc) => {
        const qb = new QueryBuilder();
        return accumulator.then(res => {
          queryFunc(qb, res);
          return conn.query(qb.materialize());
        });
      }, conn.query('START TRANSACTION;'))
        .then(() => conn.query('COMMIT;'))
        .catch(err => {
          console.log(err);
          conn.query('ROLLBACK;');
        });
    });
  }
}

module.exports = Transaction;

// const test = new Transaction();
// test.next(qb =>
//   qb
//   .raw('DELETE FROM User WHERE facebookId = 55555')
// ).next(qb =>
//   qb.select({ what: 'facebookId', from: 'User' }).where({ email: 'will@gmail.com' })
// ).next((qb, res) =>
//   qb
//   .insertOrUpdate({
//     table: 'User',
//     columns: {
//       facebookId: res[0].facebookId,
//       firstName: 'Will',
//       lastName: 'Tang',
//       email: 'xxxxxxxxxxx',
//     },
//   })
// ).start();

