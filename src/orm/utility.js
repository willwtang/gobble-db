const type = function(thing) {
  if (thing === undefined || thing === null) return thing;
  if (thing === true || thing === false) return 'boolean';
  if (typeof thing === 'string') return 'string';
  if (!isNaN(thing)) return 'number';
  if (typeof thing === 'function') return 'function';
  if (Array.isArray(thing)) return 'array';
  return 'object';
};

const stringify = function(thing) {
  return JSON.stringify(thing).replace(/"/g, '\'');
};

module.exports = {
  type, stringify,
};
