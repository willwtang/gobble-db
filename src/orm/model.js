const QueryBuilder = require('./querybuilder');

class Model {
  constructor(tableName, schema) {
    this.tableName = tableName;
    this.schema = schema;
  }

  fetch(where, what) {
    const qb = new QueryBuilder();
    what = what || '*';
    return qb
      .select({ what, from: this.tableName })
      .where(where)
      .fire();
  }

  save(obj) {
    const qb = new QueryBuilder();
    const wrap = {
      table: this.tableName,
      columns: obj,
    };
    return qb.insertOrUpdate(wrap).fire();
  }

  destroy(obj) {
    const qb = new QueryBuilder();
    obj.table = this.tableName;
    return qb
      .destroy(obj)
      .fire();
  }

  join(obj) {
    const qb = new QueryBuilder();
    const what = obj.what || '*';
    const table = obj.table.tableName;
    const on = obj.on;

    return (qb
      .select({ what, from: this.tableName })
      .innerJoin({ table: this.tableName, target: table, on })
      .fire());
  }
}

module.exports = Model;
