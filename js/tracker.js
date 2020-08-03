'use strict';

var trackingEnabled = true;

// -- adjust to your matomo configuration --
var matomoEnabled = true;
var matomoSiteID = '1';
var matomoHostname = 'wirecard.matomo.cloud';
// -- adjust to your matomo configuration --

/**
 * Customize trackPageView to your liking.
 * Call this function via trackVisit(...args) from navigation.js
 * 
 * @param  {...any} args any arguments you want to pass
 */
function trackPageView() {
  if (!trackingEnabled) return;
  var pageUrl = window.location.href;
  var pageTitle = document.title;
  console.log('trackPageView of PAGE: ' + pageUrl + ' with TITLE: ' + pageTitle);

  /* FOR MATOMO */
  if (matomoEnabled && typeof _paq !== 'undefined') {
    _paq.push(['setCustomUrl', pageUrl]);
    _paq.push(['setDocumentTitle', pageTitle]);
    _paq.push(['trackPageView']);
  }
  /* END MATOMO */
}

/*+
+ SNIPPET FOR MATOMO
*/
var _paq = window._paq || [];
_paq.push(['trackPageView']);
_paq.push(['enableLinkTracking']);
_paq.push(['enableHeartBeatTimer', 15]);
_paq.push(['setSiteId', matomoSiteID]);

(function () {
  if (!trackingEnabled) return;
  var u = "https://" + matomoHostname + "/";
  _paq.push(['setTrackerUrl', u + 'matomo.php']);
  var d = document,
      g = d.createElement('script'),
      s = d.getElementsByTagName('script')[0];
  g.type = 'text/javascript';g.defer = true;g.src = '//cdn.matomo.cloud/' + matomoHostname + '/matomo.js';s.parentNode.insertBefore(g, s);
})();
/**
 * END MATOMO SNIPPET
 */
