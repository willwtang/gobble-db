const utility = require('./utility');

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
    this.columns.created_at = { name: 'created_at', type: 'TIMESTAMP', time: create ? 'create' : 'update' };
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

  foreignKey(constraintName, columns, referenceTable, referenceColumns) {
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
    this.foreignKeys.push({ name: constraintName, type: 'FOREIGN KEY', referenceTable, referenceColumns, columns });
  }

  primaryKey(constraintName, ...columns) {
    this.constraints[constraintName] = { name: constraintName, type: 'PRIMARY KEY', columns };
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
    this.queue = this.foreignKeys.map(obj => `CONSTRAINT ${obj.name} ${obj.type}(${utility.type(obj.columns) === 'array' ? obj.columns.join(',') : columns}) REFERENCES ${obj.referenceTable}(${utility.type(obj.referenceColumns) === 'array'})`);
  }

  end() {
    this._parseQueries();
    this._parseConstraints();
    this._parseForeignKeys();
    console.log(this.queries.join(','), this.foreignKeys.join(','));
    db.query(`CREATE TABLE IF NOT EXISTS ${this.tableName} (${this.queries.join(',')});`)
    .then(() => {
      const ALTER_TABLE = `ALTER TABLE ${this.tableName} ADD`;
      const dbQueries = [];
      for (let i = 0; i < this.queue.length; i++) {
        dbQueries.push(db.query(`${ALTER_TABLE} ${sb.queue[i]}`));
      }
      // Makes sure all asynchronous promises have returned before moving on
      return Promise.all(dbQueries);
    })
    .catch(err => console.log(err));
    return Model.bind(null, this.tableName, this.schema);
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


  // NUMBER TYPES
  // int(column, width, ...rest) {
  //   return this._generic(column, int.name.toUpperCase(), width, rest);
  // }

  // bigInt(column, width, ...rest) {
  //   return this._generic(column, 'BIGINT', width, rest);
  // }

  // tinyInt(column, width, ...rest) {
  //   return this._generic(column, 'TINYINT', width, rest);
  // }

  // // STRING TYPES
  // varChar(column, width, ...rest) {
  //   this._generic(column, 'VARCHAR', width, rest);
  // }

  // text(column, width, ...rest) {
  //   return this._generic(column, 'TEXT', width, rest);
  // }

  // decimal(column, width, ...rest) {
  //   return this._generic(column, 'DECIMAL', width, rest);
  // }


class Table {
  constructor(tableName, callback) {
    const schema = new Schema(tableName);
    callback(schema);
    return schema.end();
  }
}

const User = new Table('User', user => {
  user.bigInt('facebookId', 64, 'UNSIGNED');
  user.varChar('email', 255);
  user.varChar('firstName', 255);
  user.varChar('lastName', 255);
  user.primaryKey('User_primaryKey', 'facebookId');
  user.foreignKey('User_email', 'email', 'Email', 'email');
  user.timestamp();
});

module.exports = Table;

