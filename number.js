var fs = require('fs');
var dataUri = require('strong-data-uri');
var url = require('url');
var urllibsync = require('urllib-sync');
var xml = require('libxmljs');

exports.section = function(e) {
  var all = e.find('ancestor-or-self::section');
  return all.map(function(a){
    return a.get('count(preceding-sibling::section)')+1;
  }).join('.');
};

exports.appendix = function(e) {
  var all = e.find('ancestor-or-self::section');
  return all.map(function(a, i){
    var c = a.get('count(preceding-sibling::section)')+1;
    if (i == 0) {
      c = String.fromCharCode(64 + c);
    }
    return c;
  }).join('.');
};

var parts = [
  'abstract',
  'artwork',
  'aside',
  'blockquote',
  'dt',
  'li',
  'note',
  'references',
  'sourcecode',
  't',
];

exports.isPart = function(e) {
  if (e == null) {return false};
  var nm = (typeof(e) == "string") ? e : e.name();
  return (parts.indexOf(nm) >= 0);
};

exports.partNumber = function(e) {
  if (!exports.isPart(e)) {
    return null;
  }
  var sn;
  var s = e.get('ancestor::section[1]');
  if (s != null) {
    if (s.get('ancestor::back')) {
      sn = exports.appendix(s);
    } else {
      sn = exports.section(s);
    }
  } else {
    s = e.get('ancestor::abstract');
    if (s != null) {
      sn = 'abstract';
    }
    else {
      s = e.get('ancestor::note');
      if (s != null) {
        sn = "note-" + exports.sequentialNumber(s);
      } else {
        return null;
      }
    }
  }
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
};

var TLPs = {
  'trust200902': ["", ""],
  'noModificationTrust200902':
    ["  This document may not be modified, and derivative works of it may not be created, except to format it for publication as an RFC or to translate it into languages other than English.",
     ""],
  'noDerivativesTrust200902':
    ["  This document may not be modified, and derivative works of it may not be created, and it may not be published except as an Internet-Draft.",
     ""],
  'pre5378Trust200902':
    ["",
     "This document may contain material from IETF Documents or IETF Contributions published or made publicly available before November 10, 2008.  The person(s) controlling the copyright in some of this material may not have granted the IETF Trust the right to allow modifications of such material outside the IETF Standards Process. Without obtaining an adequate license from the person(s) controlling the copyright in such materials, this document may not be modified outside the IETF Standards Process, and derivative works of it may not be created outside the IETF Standards Process, except to format it for publication as an RFC or to translate it into languages other than English."]
};

exports.ipr = function(val) {
  return TLPs[val] || TLPs['trust200902'];
};

exports.normalize = function(t) {
  t = t.replace(/\.\s*\n\s+/gm, '.  ');
  return t.replace(/\s*\n\s+/gm, ' ');
};

att = function(e, a) {
  var attr = e.attr(a);
  if (!attr) { return null; }
  return attr.value();
}

exports.loadSrc = function(e) {
  var src = att(e, 'src');
  if (!src) { return; }
  var typ = att(e, 'type');
  if (!typ) {
    process.stderr.write("'type' attribute suggested for src: " + src + "\n");
  }

  var types = ['ascii-art', 'call-flow', 'hex-dump', 'svg'];

  // TODO: can base64 generate ".."?
  if (src.match(/(^\/)|(\.\.)/)) {
    process.stderr.write('Invalid src URL: ' + src + '\n');
    return;
  }
  var cwd = process.cwd() + '/';
  var u = url.resolve('file://' + cwd, src);
  var up = url.parse(u, false, true);
  if (!up) {
    return;
  }

  var todata = false;
  if (types.indexOf(typ) === -1) {
    // For unknown types, turn the data into a data: if it's not already
    if (up.protocol == 'data:') {
      return;
    }
    todata = true;
  }

  var data = null;
  var media = 'text/plain';

  if (up.protocol === 'file:') {
    // check to make sure we're in cwd or a subdir
    if (up.pathname.slice(0,cwd.length) !== cwd) {
      process.stderr.write('Invalid path: ' + up.pathname + '\n');
      return;
    }
    data = fs.readFileSync(up.pathname);
  } else if (up.protocol === 'data:') {
    data = dataUri.decode(u);
  } else if ((up.protocol === 'http:') || (up.protocol === 'http:')) {
    // jade is strictly snychronous
    var res = urllibsync.request(u);
    if (res.status !== 200) {
      process.stderr.write('HTTP error (' + res.statusCode + '): ' + u + '\n');
      return;
    }
    data = res.data;
    media = res.headers['content-type'];
    media = media.replace(/\s+/g, '');
  } else {
    process.stderr.write('Unknown URI scheme: ' + u + '\n');
    return;
  }

  if (todata) {
    var du = dataUri.encode(data, media);
    e.attr({'src': du, 'xml:base': u});
  } else {
    if (typ === 'svg') {
      var svg = xml.parseXmlString(data);
      var svgr = svg.root();
      if (up.protocol != 'data:') {
        svgr.attr({'xml:base': u});
      }
      e.addChild(svgr);
    } else {
      e.cdata(data.toString('utf8'));
      if (up.protocol != 'data:') {
        e.attr({'xml:base': u});
      }
    }
    e.attr('src').remove();
  }
}

exports.defaultAttr = function(e, a, val) {
  if (e && a && val && !e.attr(a)) {
    e.attr(a, val);
  }
}

exports.scripts = function(text) {
  var punycode = require('punycode');
  var unicode = require('unicode-properties');
  var s = new Set();
  var decoded = punycode.ucs2.decode(text);
  var i;
  for (i=0; i<decoded.length; i++) {
    s.add(unicode.getScript(decoded[i]));
  }
  var all = [];
  s.forEach(function(scr){
     all.push(scr);
  });
  return all.sort();
}

exports.blocks = function(text) {
  var punycode = require('punycode');
  var UnicodeTrie = require('unicode-trie');
  var blocks = require('./blocks.json');
  var blockt = new UnicodeTrie(fs.readFileSync(__dirname + '/block.trie'));

  var s = new Set();
  var decoded = punycode.ucs2.decode(text);
  var i;
  var b;
  for (i=0; i<decoded.length; i++) {
    b = blocks[blockt.get(decoded[i])]
    if (b != 'Basic Latin') {
      console.error('U+'+decoded[i].toString(16)+': ', b, String.fromCharCode(decoded[i]), i)
    }
    s.add(b);
  }
  var all = [];
  s.forEach(function(scr){
     all.push(scr);
  });
  return all.sort();
}
