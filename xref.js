function att(e, a, def) {
  if (!def) { def = null; }
  if (!e || !a) {return def;}
  var v = e.attr(a);
  if (!v) { return def; }
  return v.value() || def;
}

function titleCase(s) {
  return s[0].toUpperCase() + s.slice(1).toLowerCase();
}

exports.invent = function(e) {
  var target = att(e, 'target');
  if (!target) {
    console.error('target required on xref');
    return '';
  }
  var target_el = e.doc().get('//*[@anchor="' + target + '"]');
  if (!target_el) {
    console.error('Invalid xref not found: ' + target)
    return '';
  }
  var tname = target_el.name();
  var format = att(e, 'format', 'default');
  switch (tname) {
    case 'figure':
    case 'section':
    case 'table':
      var num = att(target_el, 'pn', '').replace(/^[fst]-/, '');
      switch (format) {
        case 'counter':
          return num;
        case 'default':
          return titleCase(tname) + ' ' + num;
        case 'title':
          return target_el.get('name').text();
        case 'none':
          console.error('Deprecated format ' + format + ' in element ' + tname);
          return '';
        default:
          console.error('Invalid format ' + format + ' in element ' + tname);
          return '';
      }
      break;
    case 'reference':
      var t = '';
      switch (format) {
        case 'counter':
          console.error('counter invalid for reference targets');
          return '';
        case 'default':
          t = '[' + target + ']'
          break;
        case 'title':
          t = target_el.get('front/title').text();
          break;
        case 'none':
          console.error('Deprecated format ' + format + ' in element ' + tname);
          return '';
        default:
          console.error('Invalid format ' + format + ' in element ' + tname);
          return '';
      }

      var section = att(e, 'section');
      if (section) {
        var sectionFormat = att(e, 'sectionFormat', 'of');
        switch (sectionFormat) {
          case 'of':
            return 'Section ' + section + 'of ' + t;
          case 'comma':
            return t + ', Section ' + section;
          case 'parens':
            return t + '(Section ' + section + ')';
          case 'section':
            return 'Section ' + section;
          case 'number-only':
            return section;
          default:
            console.error('Invalid sectionFormat: ' + sectionFormat);
            return '';
        }
      }
      return t;
    default:
      return target;
  }
  console.error('Invalid target type: ' + tname);
  return '';
}
