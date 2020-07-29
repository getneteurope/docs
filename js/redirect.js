/* Client side redirect
docs.some.domain/abc redirect to doc.some.domain/abc
*/
'use strict';

var r = new RegExp('^docs\.');
if (r.test(window.location.hostname)) {
  var newUrl = window.location.href.replace('//docs\.', '//doc.');
  window.stop();
  window.location.replace(newUrl);
}
