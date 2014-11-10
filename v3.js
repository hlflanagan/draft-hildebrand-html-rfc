var romanize = require('romanize');

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

function to26(n) {
  if (n==0) {
    return [0];
  }
  var rem = n;
  var digs = [];
  while (rem > 0) {
    // for the first 26, we've already subtracted 1.
    // For other digits, subtract 1 so that we can add to 'a' later
    digs.unshift((rem % 26) - (digs.length>0? 1 : 0));
    rem = Math.floor(rem/26)
  }
  return digs;
}

exports.olStyledNum = function(style, num) {
  return style.replace(/%([cCdiIt%])/g, function(match, s) {
    switch (s) {
      case '%':
        return '%';
      case 't':
        return to26(num-1).toString();
      case 'c':
        return to26(num-1).map(function (n) {
          return String.fromCharCode('a'.charCodeAt(0)+n)
        }).join('');
      case 'C':
        return to26(num-1).map(function (n) {
          return String.fromCharCode('A'.charCodeAt(0)+n);
        }).join('');
      case 'd':
        return "" + num;
      case 'i':
        return romanize(num).toLowerCase();
      case 'I':
        return romanize(num);
    }
  })
}
