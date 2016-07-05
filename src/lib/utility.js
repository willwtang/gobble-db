const padLeft = function(num) {
  if (num > 0 && num < 10) return `0${num}`;
  return String(num);
};

const formatDate = function(d) {
  const ymd = [d.getFullYear(), padLeft(d.getMonth() + 1), padLeft(d.getDate())].join('-');
  const hms = [padLeft(d.getHours()), padLeft(d.getMinutes()), padLeft(d.getSeconds())].join(':');
  return `${ymd} ${hms}`;
};

const dateNow = function() {
  return formatDate(new Date());
};

const removeQuotes = function(string) {
  return string.replace(/^"|"$/g, '');
};

module.exports = { formatDate, dateNow, removeQuotes };
