var ignored = [
  "name"
];

exports.isIgnored = function(e) {
  if (e == null) {return null};
  var nm = (typeof(e) == "string") ? e : e.name();
  return (ignored.indexOf(nm) >= 0);
};

exports.ws = function(ary) {
  return ary.map(function(s) {
    s = s.trim();
    return s.replace(/\s+/gm, ' ');
  }).filter(function(s) {
    return s.length > 0;
  }).join(' ');
}
