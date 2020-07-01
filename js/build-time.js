/**
 * Converts UNIX timestamp created by toolchain via asciidoctor
 * to local time of browser/visitor.

  build.rb:
  ---------------
  'systemtimestamp' => %x(date +%s)
  ---------------

  file.adoc:
  ---------------
  [.builddate]
  {systemtimestamp}

  ---------------
*/

/**
 * Wait for DOM to be loaded
 */
'use strict';

document.addEventListener('DOMContentLoaded', setBuildDate);

/**
 * Converts timestamp to Date object and creates human readable date-time string
 * Format: YYYY - MM - DD HH:mm
 * 
 * Note: builddate should not be a ID but a class
 */
function setBuildDate() {
  var buildDateElement = document.querySelector('#builddate > p');
  if (!buildDateElement) return;
  var buildDate = buildDateElement.innerText;
  var timeZone;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {}
  if (buildDateElement && buildDate && !buildDateElement.getAttribute('set')) {
    var dateObject = new Date(buildDate * 1000);
    var dateArray = [];
    dateArray['YYYY'] = dateObject.getFullYear();
    dateArray['MM'] = ('0' + (dateObject.getMonth() + 1)).slice(-2);
    dateArray['HH'] = ('0' + dateObject.getHours()).slice(-2);
    dateArray['DD'] = ('0' + dateObject.getDate()).slice(-2);
    dateArray['mm'] = ('0' + dateObject.getMinutes()).slice(-2);
    dateArray['ss'] = ('0' + dateObject.getSeconds()).slice(-2);
    var dateString = dateArray['YYYY'] + '-' + dateArray['MM'] + '-' + dateArray['DD'] + ' ' + dateArray['HH'] + ':' + dateArray['mm'] + ':' + dateArray['ss'] + (timeZone ? ' ' + timeZone : '');
    buildDateElement.setAttribute('set', 'true');
    buildDateElement.innerText = dateString;
  }
}
