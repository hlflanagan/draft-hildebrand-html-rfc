function atv(e, a) {
  if (e == null) {return null;}
  var atr = e.attr(a);
  if (atr == null) {return null;}
  return atr.value();
}

var months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December" ];

exports.monthName = function(d) {
  return months[d.getMonth()];
}

exports.monthNumber = function(m) {
  if (m instanceof Date) {
    m = m.getMonth();
  }
  return months.indexOf(m);
}

function pad2(v) {
  return ("0"+v).slice(-2);
}

exports.isoDate = function(e) {
  var year, month, day;
  if (e instanceof Date) {
    year = e.getFullYear();
    month = e.getMonth()+1;
    day = e.getDate();
  } else {
    var now = new Date();
    year = atv(e, 'year') || now.getFullYear();
    month = atv(e, 'month');
    if (month == null) {
      month = now.getMonth()+1
    } else {
      var m = months.indexOf(month);
      if (m >= 0) {
        month = m+1;
      }
    }
    day = atv(e, 'day') || now.getDate();
  }
  return "" + year + "-" + pad2(month) + "-" + pad2(day);
};
