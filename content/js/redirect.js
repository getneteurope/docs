/* Client side redirect
docs.some.domain/abc redirect to doc.some.domain/abc
*/
var r = new RegExp('^docs\.');
if (r.test(window.location.hostname)) {
  let newUrl = window.location.href.replace('//docs\.', '//doc.');
  window.stop();
  window.location.replace(newUrl);
}
