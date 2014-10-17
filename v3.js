function atv(e, a) {
  if (e == null) {return null;}
  var atr = e.attr(a);
  if (atr == null) {return null;}
  return atr.value();
}

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

exports.series = function(e) {
  var dn = e.attr('docName');
  if (!dn) {
    return "RFC";
  } else {
    dn = dn.value();
    if (dn.match(/^draft-/)) {
      return 'Internet-Draft';
    }
  }
  return 'Private';
}

var categories = {
  std:      "Standards Track",
  bcp:      "BCP",
  info:     "Informational",
  exp:      "Experimental",
  historic: "Historic"
};

exports.status = function(e) {
  return categories[atv(e, 'category')];
};

var months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December" ];

exports.isoDate = function(e) {
  var now = new Date();
  var year = atv(e, 'year') || now.getFullYear();
  var month = atv(e, 'month');
  if (month == null) {
    month = now.getMonth()+1
  } else {
    var m = months.indexOf(month);
    if (m >= 0) {
      month = m+1;
    }
  }
  var day = atv(e, 'day') || now.getDate();
  return "" + year + "-" + month + "-" + day;
};

exports.ipr = function(val) {
  
};
