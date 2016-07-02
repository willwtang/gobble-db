const utility = require('./utility');
const db = require('./db');
process.env.DB_NAME = 'test';
const Model = require('./model');

class Schema {
  constructor(tableName) {
    this.queries = [];
    this.tableName = tableName;
    this.columns = {};
    this.current = null;
    this.constraints = {};
    this.foreignKeys = [];
    this.queue = [];
  }

  _generic(name, type, width, ...features) {
    if (this.columns.hasOwnProperty(name)) {
      throw new Error(`Cannot add two columns of the same name ${name}`);
    }
    this.current = this.columns[name] = { name, type, width, features };
    return this;
  }

// ############################################### COLUMN TYPES ###############################################


  // DATE TYPES
  timestamp(create) {
    if (this.columns.hasOwnProperty('created_at')) throw new Error('Already has created at column');
    this.columns.created_at = { name: `${this.tableName}_created_at`, type: 'TIMESTAMP', time: create ? 'create' : 'update' };
  }

// ############################################### OPTIONS FEATURES ###############################################
  autoIncrement() {
    this.current.features.push('AUTO_INCREMENT');
    return this;
  }

  notNull() {
    this.current.features.push('NOT NULL');
    return this;
  }


// ################################################# CONSTRAINTS ##################################################

  foreignKey(constraintName, columns, referenceTable, referenceColumns, onUpdateOrDelete) {
    const colVarType = utility.type(columns);
    if (colVarType === 'array') {
      for (let i = 0; i < columns.length; i++) {
        if (!this.columns.hasOwnProperty(colunns[i])) throw new Error(`Can\'t add foreign key to column ${columns[i]}, which does not exist`);
        this.columns[columns[i]].foreignKey = true;
      }
    } else if (colVarType === 'string') {
      if (!this.columns.hasOwnProperty(columns)) throw new Error(`Can\'t add foreign key to column ${columns[i]}, which does not exist`);
      this.columns[columns].foreignKey = true;
    }
    this.foreignKeys.push({ name: constraintName, type: 'FOREIGN KEY', referenceTable, referenceColumns, columns, onUpdateOrDelete });
  }

  primaryKey(constraintName, ...columns) {
    if (!columns.length) columns[0] = this.current.name;
    this.constraints[constraintName] = { name: constraintName || `${this.tableName}_pk`, type: 'PRIMARY KEY', columns };
    for (let i = 0; i < columns.length; i++) {
      if (!this.columns.hasOwnProperty(columns[i])) throw new Error(`Can\'t add primary key to column ${columns[i]}, which does not exist`);
      this.columns[columns[i]].primaryKey = true;
    }
    return this;
  }

  uniqueKey(constraintName, ...columns) {
    this.constraints[constraintName] = { name: constraintName, type: 'UNIQUE KEY', columns };
    for (let i = 0; i < columns.length; i++) {
      if (!this.columns.hasOwnProperty(colunns[i])) throw new Error(`Can\'t add unique key to column ${columns[i]}, which does not exist`);
      this.columns[columns[i]].uniqueKey = true;
    }
    return this;
  }

// ############################################### PARSE FUNCTIONS ##################################################

  // PARSE HELPER FUNCTIONS
  _parseHelperTimestamp(obj) {
    const query = `${obj.name} ${obj.type} DEFAULT CURRENT_TIMESTAMP${obj.create === 'create' ? '' : ' ON UPDATE CURRENT_TIMESTAMP'}`;
    return query;
  }

  _parseHelperGeneric(obj) {
    const query = `${obj.name} ${obj.type}${obj.width ? `(${utility.type(obj.width) === 'array' ? obj.width.join(',') : obj.width})` : ''}${obj.features.length ? `${obj.features.join(' ')}` : ''}`;
    return query;
  }
  _parseQueries() {
    const columns = Object.keys(this.columns);
    for (let i = 0; i < columns.length; i++) {
      const obj = this.columns[columns[i]];
      let query;
      switch (obj.type) {
        case 'TIMESTAMP':
          query = this._parseHelperTimestamp(obj);
          break;
        default:
          query = this._parseHelperGeneric(obj);
          break;
      }
      this.queries.push(query);
    }
  }

  _parseConstraints() {
    const constraints = Object.keys(this.constraints);
    for (let i = 0; i < constraints.length; i++) {
      const obj = this.constraints[constraints[i]];
      const query = `CONSTRAINT ${obj.name} ${obj.type}(${obj.columns.join(',')})`;
      this.queries.push(query);
    }
  }

  _parseForeignKeys() {
    this.queue = this.foreignKeys.map(obj => {
      let query = `ADD CONSTRAINT ${obj.name} ${obj.type}(${this._arrayOrString(obj.columns)}) REFERENCES ${obj.referenceTable}(${this._arrayOrString(obj.referenceColumns)})`;
      if (obj.onUpdateOrDelete) {
        if (obj.onUpdateOrDelete.hasOwnProperty('onUpdate')) {
          query += `ON UPDATE ${obj.onUpdateOrDelete.onUpdate}`;
        }
        if (obj.onUpdateOrDelete.hasOwnProperty('onDelete')) {
          query += `ON DELETE ${obj.onUpdateOrDelete.onDelete}`;
        }
      }
      return query;
    });
  }

  _arrayOrString(obj) {
    if (utility.type(obj) === 'array') {
      return obj.join(' ');
    }
    return obj;
  }

  end() {
    this._parseQueries();
    this._parseConstraints();
    this._parseForeignKeys();
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${this.queries.join(',')});`;
    const ALTER_TABLE = `ALTER TABLE ${this.tableName}`;
    const queueQueries = this.queue.map(query => `${ALTER_TABLE} ${query}`);

    return { createTableQuery, queueQueries };

    // return Model.bind(null, this.tableName, this.schema);
  }
}

(function populatSchemaMethods() {
  const sqlColumnTypes = [
    // Text types
    'varChar', 'text', 'blob', 'mediumText', 'mediumBlob', 'longText', 'longBlob',
    'enum', 'set',
    // Number types
    'tinyInt', 'smallInt', 'mediumInt', 'int', 'bigInt', 'float', 'double', 'decimal',
  ];
  for (let i = 0; i < sqlColumnTypes.length; i++) {
    const sqlColumn = sqlColumnTypes[i];
    Schema.prototype[sqlColumn] = function(column, width, ...rest) {
      return this._generic(column, sqlColumn.toUpperCase(), width, rest);
    };
  }
}());

const asyncManager = (function() {
  let foreignKeyQueries = [];
  let createTablePromises = [];
  return function(promise, query) {
    Array.prototype.push.apply(foreignKeyQueries, query);
    createTablePromises.push(promise);
    if (createTablePromises.length === 1) {
      Promise.all(createTablePromises)
      .then(() =>
        db
          .getConnection()
          .then(conn => {
            const promises = [];
            for (let i = 0; i < foreignKeyQueries.length; i++) {
              promises.push(conn.query(foreignKeyQueries[i]));
            }
            return Promise.all(promises).then(() => db.release(conn));
          })
      )
      .then(() => {
        foreignKeyQueries = [];
        createTablePromises = [];
      });
    }
  };
}());

class Table {

  constructor(tableName, callback, debugging) {
    this.tableName = tableName;
    const schema = new Schema(tableName);
    callback(schema);
    const { createTableQuery, queueQueries } = schema.end();
    if (debugging) {
      return { createTableQuery, queueQueries };
    }
    this.createTableIfNotExists(createTableQuery, queueQueries);
    return new Model(tableName, schema);
  }

  createTableIfNotExists(createTableQuery, queueQueries) {
    db.getConnection()
      .then(conn =>
        this.hasTable(conn)
        .then(exists => {
          if (!exists) {
            asyncManager(conn.query(createTableQuery), queueQueries);
          }
        })
        .then(() => conn)
      )
      .then(conn => db.release(conn))
      .catch(err => {
        const error = `\nSchema query error! \n Create table queries: ${createTableQuery} \n Foreign key queries: ${queueQueries} \n ${err}`;
        console.log(error);
      });
  }

  hasTable(conn) {
    return conn.query(`SHOW TABLES LIKE '${this.tableName}'`).then(res => res.length > 0);
  }

  // DEPRECATED BUT KEEP THIS HERE FOR NOW JUST IN CASE
  // queryArray(array) {
  //   const promises = [];
  //   for (let i = 0; i < array.length; i++) {
  //     const promise = db.getConnection().then(conn => conn.query(array[i]));
  //     promises.push(promise);
  //   }
  //   return Promise.all(promises);
  // }
}

module.exports = Table;

// ################################################# TESTS BELOW ##################################################

// const User = new Table('User', user => {
//   user.bigInt('facebookId', 64, 'UNSIGNED');
//   user.varChar('email', 255);
//   user.varChar('firstName', 255);
//   user.varChar('lastName', 255);
//   user.primaryKey('User_primaryKey', 'facebookId');
//   user.timestamp();
// }, true);

// console.log(User);

// const Product = new Table('Product', product => {
//   product.bigInt('upc', 64, 'UNSIGNED');
//   product.bigInt('User_facebookId', 64, 'UNSIGNED');
//   product.foreignKey('fk_Product_User_facebookId', 'User_facebookId', 'User', 'facebookId');
// });
