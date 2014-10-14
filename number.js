exports.section = function(e) {
  var all = e.find('ancestor-or-self::section');
  return all.map(function(a){
    return a.get('count(preceding-sibling::section)')+1;
  }).join('.');
};

var parts = [
  "artwork",
  "aside",
  "blockquote",
  "dt",
  "li",
  "sourcecode",
  "t",
];

exports.isPart = function(e) {
  if (e == null) {return false};
  var nm = (typeof(e) == "string") ? e : e.name();
  return (parts.indexOf(nm) >= 0);
}

exports.partNumber = function(e) {
  if (!exports.isPart(e)) {
    return null;
  }
  var s = e.get('ancestor::section[1]');
  if (s == null) {
    return null;
  }
  var sn = exports.section(s);
  var pn = s.find('descendant::*').filter(exports.isPart).indexOf(e) + 1;
  if (pn == 0) {
    console.error(e.toString());
    console.error(s.find('*').map(function(t) { t.name() }));
    process.exit();
  }
  return "p-" + sn + "-" + pn;
};

exports.sequentialNumber = function(e) {
  return "" + (e.find('count(preceding::' + e.name() + ")") + 1);
}
