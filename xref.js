function warn(msg, n) {
  var ln = ""
  if (n && n.line) {
    ln = " (input line " + n.line() + ")";
  }
  console.error("WARNING" + ln + ": " + msg);
}

function error(msg, n) {
  var ln = ""
  if (n && n.line) {
    ln = " (input line " + n.line() + ")";
  }
  console.error("ERROR" + ln + ": " + msg);
  process.exit(1);
}

function att(e, a, def) {
  if (!e || !a) {return def;}
  var v = e.attr(a);
  if (!v) { return def; }
  return v.value() || def;
}

function titleCase(s) {
  return s[0].toUpperCase() + s.slice(1).toLowerCase();
}

function liNum(li) {
  var ret = '';
  while (li) {
    var ol = li.get('ancestor::ol[1]');
    if (ret) {
      ret = '.' + ret;
    }
    ret = (parseInt(att(ol, 'start')) +
           li.get('count(preceding-sibling::li)')) + ret;
    li = ol.get('ancestor::li[1]');
  }
  return ret;
}

function getInvent(e) {
  var t = e.text().trim();
  if (t) { return t; }
  var target = att(e, 'target');
  if (!target) {
    warn('target required on xref', e);
    return '';
  }
  var target_el = e.doc().get('//*[@anchor="' + target + '"]');
  if (!target_el) {
    warn('Invalid xref not found: ' + target, e)
    return '';
  }
  var tname = target_el.name();
  var num = att(target_el, 'pn', '').replace(/^[fst]-/, '');
  var format = att(e, 'format', 'default');
  switch (format) {
    case 'counter':
      switch (tname) {
        case 'figure':
        case 'section':
        case 'table':
          return num;
        case 'li':
          return liNum(target_el);
        case 'reference':
        case 'referencegroup':
          error('invalid format=counter for ' + tname, e);
      };
      break;
    case 'default':
      switch (tname) {
        case 'figure':
        case 'section':
        case 'table':
          return titleCase(tname) + ' ' + num;
        case 'reference':
        case 'referencegroup':
          var dr = e.doc().get('//displayreference[@target="' + target + '"]/@to');
          dr = dr && dr.value();
          return dr || target;
        case 'li':
          return 'Item ' + liNum(target_el);
      }
      break;
    case 'title':
      if (tname === 'reference') {
        return target_el.get('front/title').text().trim();
      }
      var nm = target_el.get('name');
      if (nm) {
        return nm.text();
      }
      return target;
  }
  warn('Invalid target type: ' + tname + ' for format="' + format + '"', e);
  return null;
}

exports.invent = function(e) {
  var invented = getInvent(e);
  var dc = att(e, 'derivedContent');
  if (dc && (dc !== invented)) {
    warn('Invalid derivedContent being overwritten', e);
  }
  return invented;
}
