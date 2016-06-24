// Dependencies
const utility = require('./utility');


class QueryBuilder {
  constructor() {
    this.sequence = [];
  }
  raw(...args) {
    this.sequence.push(args.join(' '));
  }
  select(obj) {
    // obj = {
    //   what: { column: ${ALIAS} } OR [] OR string
    //   from: { table: ${ALIAS} } or [] OR string
    // }
    this.sequence.push(`SELECT ${this._parseInput(obj.what, this._parseColumns)} FROM ${this._parseInput(obj.from, this._parseTables)}`);
    return this;
  }

  insertOrUpdate(obj) {
    // obj = {
    //   table: tableName,
    //   columns: { columnName: value }
    // }
    const columns = Object.keys(obj.columns);
    const values = columns.map(key => {
      if (typeof obj.columns[key] === 'string') {
        return `'${obj.columns[key]}'`;
      }
      return obj.columns[key];
    });
    const query = `INSERT INTO ${obj.table} (${columns.join(',')}) VALUES (${values.join(',')}) ON DUPLICATE KEY UPDATE ${columns.map(column => `${column} = VALUES(${column})`).join(',')};`;
    this.sequence.push(query);
  }

  where(...args) {
    let target;
    const first = args[0];
    if (typeof first === 'string') {
      target = args.join(' ');
    } else if (typeof first === 'object') {
      target = this._parseEquailty(first);
    }
    this.sequence.push(`WHERE ${target}`);
    return this;
  }

  andWhere(...args) {
    let target;
    const first = args[0];
    if (typeof first === 'string') {
      target = args.join(' ');
    } else if (typeof first === 'object') {
      target = this._parseEquailty(first);
    }
    this.sequence.push(`AND ${target}`);
    return this;
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
    return this;
  }

  leftJoin(obj) {
    const query = `LEFT JOIN ${this.parseInput(obj.table)} ON ${this._parseEquailty(obj.on)}`;
    this.sequence.push(query);
    return this;
  }

  alterTable(obj) {
    // obj = {
    //   table: tableName,
    //   add:
    //   drop:
    //   alter:
    // }
    let target;
    if (obj.hasOwnProperty('add')) {
      target = `ADD ${obj.add}`;
    } else if (obj.hasOwnProperty('drop')) {
      target = `DROP ${obj.drop}`;
    } else if (obj.hasOwnProperty('alter')) {
      target = `ALTER ${obj.alter}`;
    }
    const query = `ALTER TABLE ${obj.table} ${target}`;
    this.sequence.push(query);
  }
// ################################################ EXECUTE QUERIES ###############################################

  fire() {
    return this.db.query(this.sequence.join(' '));
  }

  materialize() {
    return `${this.sequence.join(' ')};`;
  }


// ############################################### HELPER FUNCTIONS ###############################################
  _parseInput(obj, stringFunc) {
    let columns;
    const type = utility.type(obj);
    if (type === 'string') {
      columns = [obj];
    } else if (type === 'array') {
      columns = obj;
    } else if (type === 'object') {
      columns = [];
      const entries = Object.keys(obj);
      for (let i = 0; i < entries.length; i++) {
        columns.push(stringFunc(entries[i], obj[entries[i]]));
      }
    } else {
      throw new Error('Unexpected input');
    }
    return columns.join(',');
  }

  _parseTables(alias, tableName) {
    return `${tableName}${alias ? `AS ${alias}` : ''}`;
  }

  _parseColumns(alias, columnName) {
    return `${alias ? `${alias}.` : ''}${columnName}`;
  }

  _parseEquailty(obj) {
    const type = utility.type(obj);
    const results = [];
    if (type === 'string') {
      results.push(obj);
    } else if (type === 'object') {
      const entries = Object.keys(obj);
      for (let i = 0; i < entries.length; i++) {
        results.push(`${entries[i]} = '${obj[entries[i]]}'`);
      }
    }
    return results.join(' AND ');
  }
}


module.exports = QueryBuilder;
