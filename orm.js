// DEPRECATED FILE - HERE FOR REFERENCE ONLY - WILL


class QueryBuilder {
  constructor() {
    this.sequence = [];
  }
  raw(...args) {
    this.sequence.push(args.join(' '));
  }
  select(obj) {
    // obj = {
    //   what: { column: ${ALIAS} }
    //   from: { table: ${ALIAS} }
    // }
    this.sequence.push(`SELECT ${this._parseInput(obj.what, this._parseColumns)} FROM ${this._parseInput(obj.from, this._parseTables)}`);
    return this;
  }

  ######
  _parseInput(obj, stringFunc) {
    let columns;
    const type = utility.type(obj);
    if (type === 'string') {
      columns = [obj];
    } else if (type === 'array') {
      columns = obj;
    } else if (type === 'object') {
      columns = [];
      const entries = Object.entries(obj);
      for (let i = 0; i < entries.length; i++) {
        columns.push(stringFunc(entries[i][0], entries[i][1]));
      }
    } else {
      throw new Error('Unexpected input');
    }
    return columns.join(',');
  }

  _parseTables(alias, tableName) {
    return `${tableName} AS ${alias}`;
  }

  _parseColumns(alias, tableName) {
    return `${alias}.${tableName}`;
  }

  _parseEquailty(obj) {
    const type = utility.type(obj);
    const results = [];
    if (type === 'string') {
      results.push(obj);
    } else if (type === 'object') {
      const entries = Object.entries(obj);
      for (let i = 0; i < entries.length; i++) {
        results.push(`${entries[i][0]} = ${entries[i][1]}`);
      }
    }
    return results.join(' AND ');
  }

  _where(conjunction, ...args) {
    let target;
    const first = args[0];
    if (typeof first === 'string') {
      target = args.join(' ');
    } else if (typeof first === 'object') {
      target = this._parseEquailty(first);
    }
    this.sequence.push(`${conjunction} ${target}`);
  }

  where(...args) {
    this._where('WHERE', ...args);
  }

  andWhere(...args) {
    this._where('AND', ...args);
  }

  orWhere(...args) {
    this._where('OR', ...args);
  }

  innerJoin(obj) {
    // obj = {
    //   table: {
    //     tableName: ${ALIAS}
    //   }
    //   on: {
    //     column: column
    //   }
    // }
    const query = `INNER JOIN ${this.parseInput(obj.table)} ON ${this._parseEquailty(obj.on)}`;
    this.sequence.push(query);
  }

  insertOrUpdate(obj) {
    // obj = {
    //   table: tableName,
    //   columns: { columnName: value }
    // }
    const columns = Object.keys(obj.columns);
    const values = columns.map(key => obj.columns[key]);
    const query = `INSERT INTO ${obj.table} (${columns.join(',')}) VALUES (${values.join(',')}) ON DUPLICATE KEY UPDATE ${columns.map(column => `${column} = VALUES(${column})`).join(',')};`;
    this.sequence.push(query);
  }

}

const a = new QueryBuilder();
// a.select({ what: { id: 't1', books: 't2'}, from: { User: 't1', Book: 't2' }}).where({'t1.id': 1, 't2.id': 99});
a.insertOrUpdate({ table: 'User', columns: { facebookId: 5, email: 'will@will.com' } });
console.log(a.sequence);

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

  text(column, width) {
    return this._generic(column, 'TEXT', width);
  }
  int(column, width, ...rest) {
    return this._generic(column, 'INT', width, rest);
  }

  bigInt(column, width, ...rest) {
    return this._generic(column, 'BIGINT', width, rest);
  }

  tinyInt(column, width, ...rest) {
    return this._generic(column, 'TINYINT', width, rest);
  }

  varChar(column, width, ...rest) {
    this._generic(column, 'VARCHAR', width, rest);
  }

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

  foreignKey(referenceTable, referenceColumn, constraintName, column) {
    for (let i = 0; i < columns.length; i++) {
      if (!this.columns.hasOwnProperty(colunns[i])) throw new Error(`Can\'t add foreign key to column ${columns[i]}, which does not exist`);
      this.columns[columns[i]].foreignKey = true;
    }
    this.foreignKeys.push({ name: constraintName, type: 'FOREIGN KEY', referenceTable, referenceColumn, column });
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

  parseQueries() {
    const columns = Object.keys(this.columns);
    for (let i = 0; i < columns.length; i++) {
      const obj = this.columns[columns[i]];
      let query;
      switch (obj.type) {
        case 'TIMESTAMP':
          query = `${obj.name} ${obj.type} DEFAULT CURRENT_TIMESTAMP${obj.create === 'create' ? '' : ' ON UPDATE CURRENT_TIMESTAMP'}`;
          break;

        default:
          query = `${obj.name} ${obj.type}${obj.width ? `(${obj.width})` : ''}${obj.features.length ? ` ${obj.features.join(' ')}` : ''}`;
          break;
      }
      this.queries.push(query);
    }
  }

  parseConstraints() {
    const constraints = Object.keys(this.constraints);
    for (let i = 0; i < constraints.length; i++) {
      const obj = this.constraints[constraints[i]];
      const query = `CONSTRAINT ${obj.name} ${obj.type}(${obj.columns.join(',')})`;
      this.queries.push(query);
    }
  }

  parseForeignKeys() {
    this.queue = this.foreignKeys.map(obj => `CONSTRAINT ${obj.name} ${obj.type}(${column}) REFERENCES ${obj.referenceTable}(${obj.referenceColumn})`);
  }

  end() {
    this.parseQueries();
    this.parseConstraints();

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

class Table {
  constructor(tableName, callback) {
    const schema = new Schema(tableName);
    callback(schema);
    return schema.end();
  }
}

// var User = new Table('User', user => {
//   user.bigInt('facebookId', 64, 'UNSIGNED');
//   user.varChar('email', 255);
//   user.varChar('firstName', 255);
//   user.varChar('lastName', 255);
//   user.primaryKey('User_primaryKey', 'facebookId');
//   user.timestamp();
// });

// });
// console.log(a);
