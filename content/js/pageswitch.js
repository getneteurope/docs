
document.pageswitch = {
  disabled: false,
  preload: !isIE  // disable preload in IE
}


/**
 * swup defaults except for linkSelector and containers
 */
if (document.pageswitch.disabled === false) {
  var options = {
    containers: ['#content'],
    cache: true,
    linkSelector:
      'a:not([data-no-swup]):not([href^="tel:"]):not([href^="mailto:"]):not([href*="://"]), a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup])',
    skipPopStateHandling: function (event) {
      if (event.state && event.state.source == 'swup') {
        return false;
      }
      return true;
    }
  };

  if (document.pageswitch.preload === true) {
    options.plugins = [new SwupPreloadPlugin()];
  }

  window.swup = new Swup(options);

  if (document.pageswitch.preload === true) {
    document.pageswitch.pages = [];
    document.querySelectorAll('#toc a').forEach((anchor) => {
      if (anchor.href && anchor.href.startsWith(window.location.origin)) {
        if (document.pageswitch.pages.includes(anchor.pathname) === false) {
          document.pageswitch.pages.push(anchor.pathname);
        }
      }
    });
    runPreloader();
  }

  /**
   * Takes stack of unique pages +document.pageswitch.pages+
   * preloads the page, waits for finish and calls itself again as callback
   * until all pages are loaded
   * Optional +timeout+ in milliseconds specifies how long to wait before preloading
   * the next page.
   */
  function runPreloader(timeout = 1000) {
    if (document.pageswitch.pages.length) {
      var pagePath = document.pageswitch.pages.shift();
      window.swup.preloadPage(pagePath).then(() => {
        setTimeout(() => {
          runPreloader(timeout);
        }, timeout);
      });
    }
  }

  /**
   * Remove Hash if we "page switch" to the same page but have no hash
   * Reset scroll position
   */
  swup.on('samePage', function (e) {
    //  console.log('_SWUUP: samePage');
    window.scrollTo(0, 0);
    removeHash();
  });

  /**
   * Scroll to targeted anchor when staying on same page during page switch
   */
  swup.on('samePageWithHash', function (e) {
    //  console.log('_SWUUP: samePageWithHash')
    const id = e.delegateTarget.hash.substr(1);
    scrollToHash(id);
  });

  /**
   * Scroll to target of link and change window title after page switches
   */
  swup.on('clickLink', function (e) {
    //  console.log('_SWUUP: clickLink')
    /* for deep links to anchors inside other pages */
    setTimeout(() => {
      //  console.log('clicklink timeout')
      refreshTitle();
      trackVisit();
    }, 350);
  });

  swup.on('contentReplaced', () => {
    //  console.log('_SWUUP: contentReplaced')
    reinitializeAfterPageSwitch();
    scrollToNavigationItem();
    if (window.location.hash) {
      scrollToHash(window.location.hash.substring(1));
    }
  });
}

/**
 * Scrolls to hash==id of anchor without engaging scrollspy
 * @param {string} id id of element to scroll to
 */
function scrollToHash(id) {
  //  console.log('scrollToHash id: ' + id);
  document.scrollspy.disabled = true;

  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView();

    // var adjustOffsetBy = 20;

    // console.log('adjust by: ' + adjustOffsetBy);
    // $('html, body').stop().animate({
    //     'scrollTop': element.offsetTop + adjustOffsetBy
    // }, 900, 'swing', function () {
    //     window.location.hash = id;
    // });

    // var srw = document.getElementById('search-results-wrapper');
    // if(srw) {
    //   var offsetToAdd = srw.offsetHeight;
    //   document.getElementById('#content').style.paddingTop = offsetToAdd + 'px';
    // }  

    /* because scrollIntoView has no callback */
    setTimeout(() => {
      handleScrollEvent();
      document.scrollspy.disabled = false;
    }, 1000);
  }
  else {
    document.scrollspy.disabled = false;
  }
}

/**
 * Reinitializes all frontend functionality that is required in div#content
 * after content replacement by a page switch
 */
function reinitializeAfterPageSwitch() {
  //  console.log('reinitializeAfterPageSwitch');

  const id = window.location.hash.substr(1);
  const pageID = window.location.pathname.slice(1, -5).replace(/.*\//, '');
  const idElement = document.querySelector('#toc_cb_' + id + ' + label > a');
  var pageAnchorElement = document.querySelector('#toc_cb_' + pageID + ' + label > a');
  //  console.log('contentReplaced. new page: ' + pageID);
  toggleBox(pageAnchorElement);
  initBoxes(pageAnchorElement);
  if (id) {
    initBoxes(idElement);
  }
  enableRequestDetailsHideShow();
  createSampleTabs();
  initializeScrollspy();
  initPageLinks();
  refreshTitle();
  window.scrollTo(0, 0);
  setBuildDate();
  loadBrowserFixes();
  initSampleTabs();
  if (overlayOpen == true) {
    openOverlay();
  } // to adjust div#content padding-top if search field is open,
  addMobileNavFunctions();
  addZoomToLargeImages();
}

/**
 * Sets the window title according to page headlines found in the page
 * Format: Page - Section
 * Mainly for SEO purposes
 */
function refreshTitle() {
  //  console.log('refreshTitle');
  var pageTitle;
  const idMain = document.querySelectorAll('div.sect2 > h3 > a.link, div.sect1 > h2 > a.link')[0];
  if (idMain) pageTitle = idMain.innerText;

  const idSecondary = document.querySelector('div.sect3 > h4 > a.link');
  if (window.location.hash && idSecondary) pageTitle += ' - ' + idSecondary.innerText;

  if (pageTitle) document.title = pageTitle;
  var mobilePageHeader = document.getElementById('mobile-pageheader');
  if (mobilePageHeader) {
    mobilePageHeader.innerHTML = pageTitle;
  }
}
