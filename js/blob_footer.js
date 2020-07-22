/**
 * BASIC TOC FUNCTIONALITY
 */

/**
 * Waits for whole DOM to be loaded before enabling TOC functionality and
 * adds event to links inside the page in div#content
 */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  enableToc();
  initPageLinks();
  trackVisit();
  scrollToNavigationItem('auto');
  closeNavMobile();
  addMobileNavFunctions();
  addZoomToLargeImages();
});

/**
 * Wrapper for triggering your page tracking.
 * @param  {...any} args any args your trackPageView function accepts
 */
function trackVisit() {
  console.log('trackVisit');
  if (typeof trackPageView === 'function') {
    var _trackPageView;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    setTimeout((_trackPageView = trackPageView).bind.apply(_trackPageView, [null].concat(args)), 250);
  } else {
    console.log('tracking not available. possibly blocked by browser.');
  }
}

/**
 * Is called on each page switch and also if page is opened by itself
 * Looks for a given hash in the URL and initializes the TOC on that position
 */
function enableToc() {
  console.log('enableToc');

  /* if page is openen with a deep link (hash), check the correct box (if it exists) */
  var hash = window.location.hash.substring(1);
  if (hash) {
    var initialTocLink = document.querySelectorAll('#toc_cb_' + hash + ' + label > a')[0];
    if (initialTocLink) {
      initBoxes(initialTocLink);
    }
  }
  var tocLinks = document.querySelectorAll('#toc label > a');
  tocLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (miniTocEnabled == true) destroyMiniToc();
      toggleBox(this);
      closeOverlay();
    });
  });
  addMobileNavFunctions();
  document.tocInitialized = true;
}

/**
 * Toggles a specific TOC checkbox belonging to an anchor.
 * @param {Element} anchorElement specifies which TOC anchor was clicked
 */
function toggleBox(anchorElement) {
  requestAnimationFrame(function () {
    console.log('toggleBox');
    var parent = anchorElement.parentNode;
    var checkbox = parent.previousElementSibling;
    var setTo = !checkbox.checked;
    /* uncheck same level end below checkboxes */
    var sameLevelCheckboxes = parent.parentNode.parentNode.querySelectorAll(':scope > li input[type=checkbox]');
    Array.prototype.forEach.call(sameLevelCheckboxes, function (cb) {
      cb.checked = false;
    });
    checkbox.checked = setTo;
  });
}

/**
 * Similar to toggleBox() but used for initializing the TOC.
 * e.g. after a switch or fresh page load, to a certain position.
 * Always sets checked to true and recursively goes through parent boxes.
 * @param {Element} anchorElement specifies which TOC anchor is the base
 */
function initBoxes(anchorElement) {
  try {
    var parent = anchorElement.parentNode;
    var checkbox = parent.previousElementSibling;
    /* TODO: debug why this can happen */
    if (checkbox.matches('input[type=checkbox]') === false) {
      return false;
    }
    var sameLevelCheckboxes = parent.parentNode.parentNode.querySelectorAll(':scope > li > input[type=checkbox]');
  } catch (e) {
    console.log(e);
  }

  requestAnimationFrame(function () {
    Array.prototype.forEach.call(sameLevelCheckboxes, function (cb) {
      cb.checked = false;
    });
    checkbox.checked = true;
    /* tick parent boxes */
    try {
      var ancestor_anchor = parent.parentNode.parentNode.previousElementSibling.firstChild;
      initBoxes(ancestor_anchor);
    } catch (e) {
      console.log('no more ancestor found');
    }
  });
}

/**
 * Links in +selector+ need a click event that triggers.
 * ticking of correct boxes after a page switch (== replacement of div#content).
 * Checks if id corresponding to URL page.html#anchor is available in TOC.
 * If yes, click it.
 * If no, take page from page.html#anchor, click TOC accordingly and scroll to #anchor
 * @param {selector} selector which a tags to equip with an eventListener
 */
function addClickHander(selector) {
  var pageID = window.location.pathname.slice(1, -5).replace(/.*\//, '');
  var pageRootElementAnchor = document.querySelector('#toc_cb_' + pageID + ' + label > a');
  document.querySelectorAll(selector).forEach(function (a) {
    if (a.hasAttribute('class')) return;
    if (a.href.startsWith(window.location.origin) === false) return;

    a.addEventListener('click', function (e) {
      console.log('click triggered');
      var id = a.href.split('.html#') ? a.href.split('.html#')[1] : a.href.slice(0, -5);
      console.log(id);
      var toc_anchor = document.querySelector('#toc_li_' + id + ' a');
      console.log(toc_anchor);
      if (toc_anchor) {
        initBoxes(toc_anchor);
      } else {
        initBoxes(pageRootElementAnchor);
      }
      scrollToHash(id);
      scrollToNavigationItem(id);
      closeNavMobile();
    });
  });
}

function initPageLinks() {
  console.log('initPageLinks');
  addClickHander('div#content a');
}

function initSearchResultsLinks() {
  console.log('initSearchResultsLinks');
  addClickHander('div#search-results > li a');
}

/**
 * Scrolls to and centers the appropriate navigation item
 * @param {String} id id of target
 */
function scrollToNavigationItem() {
  var id = arguments.length <= 0 || arguments[0] === undefined ? 'auto' : arguments[0];

  // TODO: see if we can utilize scrollspy highlight code for getting current nav item but avoid jittery scrolling
  setTimeout(function () {
    console.log('Nav scroll to ' + id);
    // if no id given, determine ID by URL filename or hash
    if (id == 'auto') {
      id = getIDfromURL();
      console.log('Resolved auto to: ' + id);
    }
    var toc = document.getElementById('toc');
    var target = document.getElementById('toc_li_' + id);
    if (target == null) {
      return false;
    }
    var pos = parseInt(target.offsetTop - window.innerHeight / 2);
    toc.scroll({ top: pos, left: 0, behavior: 'smooth' });
  }, 1350);
}

/**
 * Returns current ID from URL Hash or filename
 */
function getIDfromURL() {
  return window.location.href.split('.html#')[1] ? window.location.href.split('.html#')[1] : window.location.href.split('/').pop().split('#')[0].split('?')[0].slice(0, -5);
}

function addMobileNavFunctions() {
  if (!document.getElementById('burger')) {
    var burger = document.createElement('div');
    burger.setAttribute('id', 'burger');
    burger.classList.add('fa');
    burger.innerHTML = '';
    var mobilePageTitle = document.createElement('span');
    mobilePageTitle.setAttribute('id', 'mobile-pageheader');
    burger.appendChild(mobilePageTitle);
    burger.addEventListener('click', function () {
      openNavMobile();
    });
    document.body.insertBefore(burger, document.getElementById('content'));
  }
  document.getElementById('content').addEventListener('click', function (event) {
    console.log('close nav');
    closeNavMobile();
  });
}

function closeNavMobile() {
  var toc = document.getElementById('toc');
  if (toc) toc.classList.add('closed');

  var srw = document.getElementById('search-results-wrapper');
  if (srw) srw.classList.add('hidden');
}

function openNavMobile() {
  var toc = document.getElementById('toc');
  if (toc) toc.classList.remove('closed');

  var srw = document.getElementById('search-results-wrapper');
  if (srw) srw.classList.remove('hidden');
}

/**
 * SCROLLSPY FOR TOC
 */

/* TODO: rewrite with Intersection_Observer_API for all scroll events
   see minitoc.js IntersectionObserver
 */

document.scrollspy = { disabled: false };

/**
 * Waits for page to load completely, not just TOC.
 * Necessary for position caching of elements used for scrollspy performance.
 */
document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    initializeScrollspy();
    refreshTitle();
    handleScrollEvent(); // trigger minitoc
  }
};

/**
 * Scrollspy needs to be reinitialized when user resizes the window.
 * For performance reasons this is throttled to max once in 500ms.
 */
var resizeTimeout;
window.onresize = function () {
  window.clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(function () {
    initializeScrollspy();
  }, 500);
};

/**
 * Initializes scollspy functionality.
 * Caches all headings elements in current document.
 * First Removes its own event listener from window to avoid bubbling expensive scroll event.
 * Adds event listener again to trigger handleScrollEvent()
 */
function initializeScrollspy() {
  console.log('initializeScrollspy');
  document.scrollspy = {
    disabled: false
  };
  /* cache all headline elements */
  document.headingsSelector = ['div#content h4', 'div#content h5', 'div#content h6'];
  document.headingsElementsArray = [];
  document.querySelectorAll(document.headingsSelector.join(', ')).forEach(function (element) {
    document.headingsElementsArray.push(element);
  });

  /* remove existing eventlistener (for pageswitch) before adding it again */
  window.removeEventListener('scroll', handleScrollEvent, { scrollspy: true });
  window.addEventListener('scroll', handleScrollEvent, { scrollspy: true });
}

/**
 * Triggered on every scroll event.
 * Calculates whether scoll position is within area of section a cached headline belongs to.
 * Resets TOC to that specific section.
 */
var scrollTimer;
var lastScroll = {
  miniTocElement: null,
  miniTocHeadElement: null,
  navAnchorElement: null
}; // store element that has been ticked or highlighted to avoid unnecessary redraws
function handleScrollEvent() {
  var skipScrollSpy = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

  if (document.scrollspy.disabled && skipScrollSpy == true) {
    return true;
  }
  if (window.scrollY === 0) {
    removeHash();
  }
  window.cancelIdleCallback(scrollTimer);
  scrollTimer = window.requestIdleCallback(function () {
    document.headingsElementsArray.forEach(function (element) {
      var etopY = element.offsetTop - 50;
      var ebottomY = etopY + element.parentElement.offsetHeight;
      if (window.scrollY >= etopY && window.scrollY <= ebottomY) {
        var anchorElement = document.querySelectorAll('#toc_cb_' + element.id + ' + label > a')[0];
        if (anchorElement && lastScroll.navAnchorElement != anchorElement) {
          if (initBoxes(anchorElement)) {
            lastScroll.navAnchorElement = anchorElement;
          }
        }
        if (typeof refreshMiniToc === 'function' && miniTocEnabled === true && lastScroll.miniTocElement != element) {
          lastScroll.miniTocElement = element;
          refreshMiniToc(element);
        }
      } else {
        // if we are inside the same section but not inside a subsection
        if (element == lastScroll.miniTocHeadElement) {
          highlightMiniTocElementByID('none');
        }
      }
    });
    refreshTitle();
  }, { timeout: 500 });
}

/**
 * Find parents for given element.
 * Returns array of parentElements.
 * @param {Element} element - Any DOM element
 * @param {string} [filter] - Optional filter for css selectors that parent must match
 * @param {string} [stop] - Optionally stop at css selector or at first matching parent if stop === true
 * @return {array} - Array of parent elements
 */
function getParents(element) {
  var filter = arguments.length <= 1 || arguments[1] === undefined ? '*' : arguments[1];
  var stop = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  var parents = [];
  while (element) {
    if (element.matches(filter)) {
      parents.unshift(element);
    }
    if (stop) {
      if (stop === true || element.matches(stop)) {
        return parents;
      }
    }
    element = element.parentElement;
  }
  parents.pop();
  return parents.reverse();
}

/**
 * Removes hash from URL without changing scoll position
 * and without affecting browser history
 */
function removeHash() {
  var scrollV,
      scrollH,
      loc = window.location;
  if ('pushState' in history) history.pushState('', document.title, loc.pathname + loc.search);else {
    // Prevent scrolling by storing the page's current scroll offset
    scrollV = document.body.scrollTop;
    scrollH = document.body.scrollLeft;
    loc.hash = '';
    // Restore the scroll offset, should be flicker free
    document.body.scrollTop = scrollV;
    document.body.scrollLeft = scrollH;
  }
}

document.pageswitch = {
  disabled: false,
  preload: !isIE // disable preload in IE
};

/**
 * swup defaults except for linkSelector and containers
 */
if (document.pageswitch.disabled === false) {
  var options;

  (function () {

    /**
     * Takes stack of unique pages +document.pageswitch.pages+
     * preloads the page, waits for finish and calls itself again as callback
     * until all pages are loaded
     * Optional +timeout+ in milliseconds specifies how long to wait before preloading
     * the next page.
     */

    var runPreloader = function runPreloader() {
      var timeout = arguments.length <= 0 || arguments[0] === undefined ? 1000 : arguments[0];

      if (document.pageswitch.pages.length) {
        var pagePath = document.pageswitch.pages.shift();
        window.swup.preloadPage(pagePath).then(function () {
          setTimeout(function () {
            runPreloader(timeout);
          }, timeout);
        });
      }
    }

    /**
     * Remove Hash if we "page switch" to the same page but have no hash
     * Reset scroll position
     */
    ;

    options = {
      containers: ['#content'],
      cache: true,
      linkSelector: 'a:not([data-no-swup]):not([href^="tel:"]):not([href^="mailto:"]):not([href*="://"]), a[href^="/"]:not([data-no-swup]), a[href^="#"]:not([data-no-swup])',
      skipPopStateHandling: function skipPopStateHandling(event) {
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
      document.querySelectorAll('#toc a').forEach(function (anchor) {
        if (anchor.href && anchor.href.startsWith(window.location.origin)) {
          if (document.pageswitch.pages.includes(anchor.pathname) === false) {
            document.pageswitch.pages.push(anchor.pathname);
          }
        }
      });
      runPreloader();
    }swup.on('samePage', function (e) {
      //  console.log('_SWUUP: samePage');
      window.scrollTo(0, 0);
      removeHash();
    });

    /**
     * Scroll to targeted anchor when staying on same page during page switch
     */
    swup.on('samePageWithHash', function (e) {
      //  console.log('_SWUUP: samePageWithHash')
      var id = e.delegateTarget.hash.substr(1);
      scrollToHash(id);
    });

    /**
     * Scroll to target of link and change window title after page switches
     */
    swup.on('clickLink', function (e) {
      //  console.log('_SWUUP: clickLink')
      /* for deep links to anchors inside other pages */
      setTimeout(function () {
        //  console.log('clicklink timeout')
        refreshTitle();
        trackVisit();
      }, 350);
    });

    swup.on('contentReplaced', function () {
      //  console.log('_SWUUP: contentReplaced')
      reinitializeAfterPageSwitch();
      scrollToNavigationItem();
      if (window.location.hash) {
        scrollToHash(window.location.hash.substring(1));
      }
    });
  })();
}

/**
 * Scrolls to hash==id of anchor without engaging scrollspy
 * @param {string} id id of element to scroll to
 */
function scrollToHash(id) {
  //  console.log('scrollToHash id: ' + id);
  document.scrollspy.disabled = true;

  var element = document.getElementById(id);
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
    setTimeout(function () {
      handleScrollEvent();
      document.scrollspy.disabled = false;
    }, 1000);
  } else {
    document.scrollspy.disabled = false;
  }
}

/**
 * Reinitializes all frontend functionality that is required in div#content
 * after content replacement by a page switch
 */
function reinitializeAfterPageSwitch() {
  //  console.log('reinitializeAfterPageSwitch');

  var id = window.location.hash.substr(1);
  var pageID = window.location.pathname.slice(1, -5).replace(/.*\//, '');
  var idElement = document.querySelector('#toc_cb_' + id + ' + label > a');
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
  var idMain = document.querySelectorAll('div.sect2 > h3 > a.link, div.sect1 > h2 > a.link')[0];
  if (idMain) pageTitle = idMain.innerText;

  var idSecondary = document.querySelector('div.sect3 > h4 > a.link');
  if (window.location.hash && idSecondary) pageTitle += ' - ' + idSecondary.innerText;

  if (pageTitle) document.title = pageTitle;
  var mobilePageHeader = document.getElementById('mobile-pageheader');
  if (mobilePageHeader) {
    mobilePageHeader.innerHTML = pageTitle;
  }
}

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

var miniTocEnabled = true;

/**
 * Store timers and elements
 */
var miniTocTimer;
var lastMiniTocElement;

/**
 * Initialize MiniToc by creating the Elements and triggering a initial Scroll Event
 */
function initializeMiniToc() {
  document.scrollspy.disabled = true;
  console.log('on first page load createMiniTocStructure');
  createMiniTocStructure();

  console.log('on first page load handleScrollEvent');
  handleScrollEvent();
  document.scrollspy.disabled = false;
}
initializeMiniToc();

/**
 * Creates the Mini TOC Container and a <ul> with id 'minitoc' inside it
 * Returns reference to Mini TOC Element
 */
function createMiniTocStructure() {
  console.log('createMiniTocStructure');
  var miniTocContainer = document.createElement('nav');
  miniTocContainer.setAttribute('id', 'minitoc-container');
  var miniTocList = document.createElement('ul');
  miniTocList.setAttribute('id', 'minitoc');
  miniTocContainer.append(miniTocList);
  var contentElement = document.getElementById('content');
  contentElement.parentNode.insertBefore(miniTocContainer, contentElement);
  return document.getElementById('minitoc');
}

/**
 * Decides whether to build MiniToc for a new section
 * If +element+ has changed (scrolling occured) since last refreshMiniToc
 * Or to just highlight a particular subsection +element+ in the MiniToc
 * @param {Element} element from document.headingsElementsArray
 */
function refreshMiniToc(element) {
  console.log('refreshMiniToc');
  if (!miniTocEnabled) return;

  // avoid costly recreation if scroll within same section
  if (element != lastMiniTocElement) {
    buildMiniTocForSection(element);
    lastMiniTocElement = element; // cache to not rebuild if minitoc for this section already exists
  }
  if (element.nodeName.toLowerCase() == 'h6') {
    console.log('scroll inside h6: ' + element.id);
    highlightMiniTocElementByID(element.id);
  }
}

/**
 * Waits for animationFrame then highlights menu item for a particular h6 id
 * H6 id and MiniToc menu item id are linked through 'data-content-id' attribute of MiniToc list items
 * @param {String} id id of h6 element to highlight or 'none' to clear all highlight menu items
 */
function highlightMiniTocElementByID(id) {
  console.log('highlight h6: ' + id);

  // on click of head element of minitoc, removes all highlights
  if (id === 'none') {
    requestAnimationFrame(function () {
      document.querySelectorAll('#minitoc > li').forEach(function (li) {
        li.classList.remove('active');
      });
    });
    return true;
  }
  requestAnimationFrame(function () {
    document.querySelectorAll('#minitoc > li').forEach(function (li) {
      if (li.getAttribute('data-content-id') == id) {
        li.classList.add('active');
      } else {
        li.classList.remove('active');
      }
    });
  });
}

/**
 * Empty out the MiniToc element
 */
function destroyMiniToc() {
  var miniTocElement = document.getElementById('minitoc');
  if (miniTocElement) miniTocElement.innerHTML = '';
}

/**
 * Creates the list items, links and adds anchor event listener +handleMiniTocClick+ for a section
 * @param {Element} head h5 that presides over section for which to build a MiniToc
 */
function buildMiniTocForSection(head) {
  console.log('buildMiniTocForSection for id: ' + head.id);
  if (head.classList.contains('discrete')) {
    return false;
  }
  document.oldMiniToc = document.getElementById('minitoc'); // store here to replace later
  var miniToc = document.createElement('ul');
  miniToc.setAttribute('id', 'minitoc');

  // create top of minitoc element, "HeadAnchor"
  var headAnchor = document.createElement('a');
  headAnchor.setAttribute('id', 'minitoc-head-anchor');
  headAnchor.setAttribute('href', '#' + head.id);
  headAnchor.addEventListener('click', function (event) {
    handleMiniTocClick(head.id);
  });
  headAnchor.innerHTML = head.innerText;

  // add observer, when scrolling to head, remoe all highlighting from minitoc
  var intersectionObserverOptions = {
    root: null,
    rootMargin: '70px',
    threshold: 1.0
  };
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.intersectionRatio > 0) {// head element in viewpoert
        //highlightMiniTocElementByID('none'); // remove highlighting from subsections in minitoc
      }
    });
  }, intersectionObserverOptions);
  observer.observe(head);

  var headElement = document.createElement('li');
  headElement.setAttribute('id', 'minitoc-header');

  headElement.append(headAnchor);
  miniToc.append(headElement);

  // next elements are descendants of nephews
  var subsectionElements = [];
  elementNextAll(head).forEach(function (e) {
    if (e.matches('div.sect5')) {
      e.querySelectorAll('h6').forEach(function (h) {
        subsectionElements.push(h);
      });
    }
  });
  if (subsectionElements.length) {
    subsectionElements.forEach(function (ss) {
      var miniTocElement = document.createElement('li');
      miniTocElement.setAttribute('data-content-id', ss.id);
      var miniTocElementAnchor = document.createElement('a');
      miniTocElementAnchor.setAttribute('href', '#' + ss.id);
      miniTocElementAnchor.addEventListener('click', function (event) {
        handleMiniTocClick(ss.id);
      });
      miniTocElementAnchor.innerHTML = ss.innerText;
      miniTocElement.append(miniTocElementAnchor);
      miniToc.append(miniTocElement);
    });

    requestAnimationFrame(function () {
      document.oldMiniToc.replaceWith(miniToc);
    });
  } else {
    console.log(head.id + ' has no elements for minitoc');
    document.oldMiniToc.innerHTML = '';
  }
}

/**
 * Smooth scrolls to target of MiniToc link
 * @param {String} id of H5, H6 Element to scroll to when menu item is clicked
 */
function handleMiniTocClick(id) {
  event.stopPropagation();
  event.preventDefault();
  console.log('minitoc click, target: ' + id);
  scrollToHash(id);
}

/**
 * Helper function to get all siblings after +element+
 * @param {Element} element 
 */
function elementNextAll(element) {
  var siblings = [];
  while (element.nextElementSibling) {
    siblings.push(element.nextElementSibling);
    element = element.nextElementSibling;
  }
  return siblings;
}

// ########################################################################### //
// Search Overlay
// ########################################################################### //
var selectIdx = 0;
var overlayOpen = false;

function openOverlay(event) {
  var srw = $('#search-results-wrapper');

  // copy element
  var clone = srw.clone();

  // remove transition
  clone.css('transition', 'none');
  clone.css('visibility', 'hidden');

  // add max-height from .open
  clone.css('max-height', '60vh');

  // get height
  clone.appendTo('body');
  var srwHeight = clone.height();
  console.log('clone height: ' + srwHeight);

  // remove copy
  clone.remove();

  // add open to real element
  srw.addClass('open');

  // set padding of content
  //$('#content').css('padding-top', srwHeight + 'px');

  overlayOpen = true;
}

function closeOverlay(event) {
  var srw = $('#search-results-wrapper');
  srw.removeClass('open');
  $('#content').css('padding-top', '');
  overlayOpen = false;
}

function select(element) {
  element.addClass('selected');
}

function unselect(element) {
  element.removeClass('selected');
}

function hoverResult(event) {
  // selected hovered item and unselect .selected
  unselect($('.selected'));
  select($(this));
  $(this).attr('class').split(/\s+/).forEach(function (cls) {
    if (cls.startsWith('entry')) {
      var spl = cls.split('-');
      selectIdx = parseInt(spl.pop());
    }
  });
}

$(document).ready(function () {
  var wrapper = $('<div id="search-results-wrapper"><div class="sect1"><h2>Search Results <span id="num-results">...</span></h2></div></div>');
  var btnCloseSearch = $('<button type="button" id="btn-search-close" class="close fa"></button>');
  var resultsList = $('<ul id="search-results">');
  resultsList.appendTo(wrapper);
  btnCloseSearch.appendTo(wrapper);
  wrapper.insertBefore('div#content');

  // open/close overlay depending on where the user clicks
  $('#search').on('click', function (event) {
    event.stopPropagation();
    if ($('#search').val() != '') openOverlay();
  });
  //$('#search').on('blur', closeOverlay);
  $('#btn-search-close').click(closeOverlay);

  $('#search').keyup(function (event) {
    var keyCode = event.keyCode || event.which;
    switch (keyCode) {
      case 38: // arrow up
      case 40:
        // arrow down
        event.preventDefault();
        if (event.stopPropagation) event.stopPropagation();
        return false;
    }
  });

  // TODO fix scrolling when navigating with arrow keys and overflow: scroll
  $('#search').keyup(function (event) {

    if ($('#search').val() == '') {
      closeOverlay();
    }
    var keyCode = event.keyCode || event.which;
    var selected = $('.selected');
    var next = null;

    switch (keyCode) {
      case 27:
        // escape
        event.preventDefault();
        closeOverlay(event);
        return;
      case 13:
        // enter
        event.preventDefault();
        closeOverlay();
        // select first element because it is packaged in another object
        $(selected).find('> div > a')[0].click();
        return;
      case 38:
        // arrow up
        event.preventDefault();
        if (selectIdx > 0) {
          selectIdx--;
          next = selected.prev();
        }
        break;
      case 40:
        // arrow down
        event.preventDefault();
        if (selectIdx < $('ul#search-results > li').length - 1) {
          selectIdx++;
          next = selected.next();
        }
        break;
      default:
        var searchTerm = $('#search').val();
        if (searchTerm != '') {
          var results = search(searchTerm);
          $('#num-results').text('(' + results.length + ')');
          render(results);
          openOverlay();
        } else {
          $('#num-results').text('...');
          $('#search-results').empty();
        }
        return;
    }

    if (next !== null) {
      select(next);
      unselect(selected);
    }
  });
});

// ########################################################################### //
// Lunr
// ########################################################################### //
var searchTerm = '';
var searchIndexLoaded = false;
// lunr search index
var idx;
// db for reverse lookups from lunr
var db;

function loadLunrIndex() {
  if (searchIndexLoaded) return true;
  try {
    $.getJSON('lunrindex.json', function (data) {
      idx = lunr.Index.load(data);
      searchIndexLoaded = true;
    });
    $.getJSON('lunrdb.json', function (data) {
      db = data;
    });
  } catch (e) {
    console.log(e);
  }
  return true;
}

function search(term) {
  if (term === '') return [];
  return idx.search(term);
}

// show the search results in the list ul#serach-results
function render(results) {
  $('#search-results-wrapper').addClass('open');
  var resultsList = $('ul#search-results');
  console.log(results);
  resultsList.empty();
  var count = 0;
  results.forEach(function (entry) {
    var li = $('<li/>', { 'class': 'search-list-entry entry-' + count }).append(formatEntry(entry, count));
    resultsList.append(li);
    if (count === 0) select(li);
    count++;
  });

  $('ul#search-results > li').hover(hoverResult);
  initSearchResultsLinks();
}

// format and style each entry
function formatEntry(entry, count) {
  var dbentry = db[entry.ref];
  var div = $('<div/>');
  var link = $('<a/>').attr('href', dbentry.file + '#' + entry.ref);
  link.on('click', function (event) {
    console.log('click on link');
    openOverlay();
    // console.log('ele top at: ' + $('#' + entry.ref)[0].offsetTop);
    // var srwHeight = $('#search-results-wrapper').height();
    // var ePos = $('#' + entry.ref)[0].offsetTop;
    // var scollPos = ePos + srwHeight;
  });
  // scroll to element + overlayHeight
  link.append($('<h4>').text(dbentry.title));
  link.append($('<p/>').text(dbentry.body));
  if (dbentry.parents !== null && dbentry.parents.length > 0) link.append($('<span/>', { 'class': 'label' }).text(dbentry.parents.join(' / ')));
  div.append(link);

  return div;
}

$(document).ready(function () {
  loadLunrIndex();
});

/**
 * zoom effect for hover
 */

function zoomImage(e) {
  var zoomer = e.currentTarget;
  x = e.offsetX / zoomer.offsetWidth * 100;
  y = e.offsetY / zoomer.offsetHeight * 100;
  zoomer.style.backgroundPosition = x + '% ' + y + '%';
}

function addZoomToLargeImages() {
  var contentWrapperWidth = $('div#content').width();
  $('img').each(function (i, image) {
    if ($(image).attr('data-has-zoom') == 'true' || $(image).attr('no-zoom')) {
      return true;
    }
    var hasZoomClass = $(image).parent().parent().hasClass('zoom');
    $(image).attr('data-has-zoom', 'true');
    console.log($(image).attr('src'));
    var zb = $('<div class="zoom-box fa fa-search-plus">');
    $(image).parent().append(zb);
    var originalWidth = image.width;
    var originalHeight = image.height;
    // svg naturalWidth === 0, therefore do not use < for comparison
    requestIdleCallback(function () {
      if (image.src.match(new RegExp('\.svg$'))) {
        image.width = contentWrapperWidth;
      }
      // do not give zoom to "one liner images"
      if (image.width / image.height < 10 && image.width > contentWrapperWidth * 0.95 || hasZoomClass) {
        $(image).attr('data-action', 'zoom');
      }
    });
    return true;
  });
}

function isSVG(img) {
  return img.src.match(new RegExp('\.svg$'));
}

/**
* zoom effect for click
* based on // zoom-vanilla.js - 2.0.6 (https://github.com/spinningarrow/zoom-vanilla.js)
* modified for correct svg handling in calculateZoom()
*/
document.addEventListener('DOMContentLoaded', function () {
  +(function () {
    "use strict";
    var OFFSET = 80;

    // From http://youmightnotneedjquery.com/#offset
    function offset(element) {
      var rect = element.getBoundingClientRect();
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
      return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft
      };
    }

    function zoomListener() {
      var activeZoom = null;
      var initialScrollPosition = null;
      var initialTouchPosition = null;

      function listen() {
        document.body.addEventListener('click', function (event) {
          if (event.target.getAttribute('data-action') !== 'zoom' || event.target.tagName !== 'IMG') return;

          zoom(event);
        });
      }

      function zoom(event) {
        event.stopPropagation();

        if (document.body.classList.contains('zoom-overlay-open')) return;

        if (event.metaKey || event.ctrlKey) return openInNewWindow();

        closeActiveZoom({ forceDispose: true });

        activeZoom = vanillaZoom(event.target);
        activeZoom.zoomImage();

        addCloseActiveZoomListeners();
      }

      function openInNewWindow() {
        window.open(event.target.getAttribute('data-original') || event.target.currentSrc || event.target.src, '_blank');
      }

      function closeActiveZoom(options) {
        options = options || { forceDispose: false };
        if (!activeZoom) return;

        activeZoom[options.forceDispose ? 'dispose' : 'close']();
        removeCloseActiveZoomListeners();
        activeZoom = null;
      }

      function addCloseActiveZoomListeners() {
        // todo(fat): probably worth throttling this
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('click', handleClick);
        document.addEventListener('keyup', handleEscPressed);
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchend', handleClick);
      }

      function removeCloseActiveZoomListeners() {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('keyup', handleEscPressed);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleClick);
      }

      function handleScroll(event) {
        if (initialScrollPosition === null) initialScrollPosition = window.pageYOffset;
        var deltaY = initialScrollPosition - window.pageYOffset;
        if (Math.abs(deltaY) >= 40) closeActiveZoom();
      }

      function handleEscPressed(event) {
        if (event.keyCode == 27) closeActiveZoom();
      }

      function handleClick(event) {
        event.stopPropagation();
        event.preventDefault();
        closeActiveZoom();
      }

      function handleTouchStart(event) {
        initialTouchPosition = event.touches[0].pageY;
        event.target.addEventListener('touchmove', handleTouchMove);
      }

      function handleTouchMove(event) {
        if (Math.abs(event.touches[0].pageY - initialTouchPosition) <= 10) return;
        closeActiveZoom();
        event.target.removeEventListener('touchmove', handleTouchMove);
      }

      return { listen: listen };
    }

    var vanillaZoom = (function () {
      var fullHeight = null;
      var fullWidth = null;
      var overlay = null;
      var imgScaleFactor = null;

      var targetImage = null;
      var targetImageWrap = null;
      var targetImageClone = null;

      function zoomImage() {
        var img = document.createElement('img');
        img.onload = function () {
          fullHeight = Number(img.height);
          fullWidth = Number(img.width);
          console.log(img);
          zoomOriginal();
        };
        img.src = targetImage.currentSrc || targetImage.src;
      }

      function zoomOriginal() {
        targetImageWrap = document.createElement('div');
        targetImageWrap.className = 'zoom-img-wrap';
        targetImageWrap.style.position = 'absolute';
        targetImageWrap.style.top = offset(targetImage).top + 'px';
        targetImageWrap.style.left = offset(targetImage).left + 'px';

        targetImageClone = targetImage.cloneNode();
        targetImageClone.style.visibility = 'hidden';

        targetImage.style.width = targetImage.offsetWidth + 'px';
        targetImage.parentNode.replaceChild(targetImageClone, targetImage);

        document.body.appendChild(targetImageWrap);
        targetImageWrap.appendChild(targetImage);

        targetImage.classList.add('zoom-img');
        targetImage.setAttribute('data-action', 'zoom-out');

        overlay = document.createElement('div');
        overlay.className = 'zoom-overlay';

        document.body.appendChild(overlay);

        calculateZoom();
        triggerAnimation();
      }

      function calculateZoom() {
        var svg = isSVG(targetImage);

        targetImage.offsetWidth; // repaint before animating

        var originalFullImageWidth = svg ? targetImage.clientWidth * 2 : targetImage.clientWidth;
        var originalFullImageHeight = svg ? targetImage.clientHeight * 2 : targetImage.clientHeight;

        var maxScaleFactor = originalFullImageWidth / targetImage.width;

        var viewportHeight = window.innerHeight - OFFSET;
        var viewportWidth = window.innerWidth - OFFSET;

        var imageAspectRatio = originalFullImageWidth / originalFullImageHeight;
        var viewportAspectRatio = viewportWidth / viewportHeight;

        if (originalFullImageWidth < viewportWidth && originalFullImageHeight < viewportHeight) {
          imgScaleFactor = maxScaleFactor;
        } else if (imageAspectRatio < viewportAspectRatio) {
          imgScaleFactor = viewportHeight / originalFullImageHeight * maxScaleFactor;
        } else {
          imgScaleFactor = viewportWidth / originalFullImageWidth * maxScaleFactor;
        }
      }

      function triggerAnimation() {
        targetImage.offsetWidth; // repaint before animating

        var imageOffset = offset(targetImage);
        var scrollTop = window.pageYOffset;

        var viewportY = scrollTop + window.innerHeight / 2;
        var viewportX = window.innerWidth / 2;

        var imageCenterY = imageOffset.top + targetImage.height / 2;
        var imageCenterX = imageOffset.left + targetImage.width / 2;

        var translateY = Math.round(viewportY - imageCenterY);
        var translateX = Math.round(viewportX - imageCenterX);

        var targetImageTransform = 'scale(' + imgScaleFactor + ')';
        var targetImageWrapTransform = 'translate(' + translateX + 'px, ' + translateY + 'px) translateZ(0)';

        targetImage.style.webkitTransform = targetImageTransform;
        targetImage.style.msTransform = targetImageTransform;
        targetImage.style.transform = targetImageTransform;

        targetImageWrap.style.webkitTransform = targetImageWrapTransform;
        targetImageWrap.style.msTransform = targetImageWrapTransform;
        targetImageWrap.style.transform = targetImageWrapTransform;

        document.body.classList.add('zoom-overlay-open');
      }

      function close() {
        document.body.classList.remove('zoom-overlay-open');
        document.body.classList.add('zoom-overlay-transitioning');

        targetImage.style.webkitTransform = '';
        targetImage.style.msTransform = '';
        targetImage.style.transform = '';

        targetImageWrap.style.webkitTransform = '';
        targetImageWrap.style.msTransform = '';
        targetImageWrap.style.transform = '';

        if (!'transition' in document.body.style) return dispose();

        targetImageWrap.addEventListener('transitionend', dispose);
        targetImageWrap.addEventListener('webkitTransitionEnd', dispose);
      }

      function dispose() {
        targetImage.removeEventListener('transitionend', dispose);
        targetImage.removeEventListener('webkitTransitionEnd', dispose);

        if (!targetImageWrap || !targetImageWrap.parentNode) return;

        targetImage.classList.remove('zoom-img');
        targetImage.style.width = '';
        targetImage.setAttribute('data-action', 'zoom');

        targetImageClone.parentNode.replaceChild(targetImage, targetImageClone);
        targetImageWrap.parentNode.removeChild(targetImageWrap);
        overlay.parentNode.removeChild(overlay);

        document.body.classList.remove('zoom-overlay-transitioning');
      }

      return function (target) {
        targetImage = target;
        return { zoomImage: zoomImage, close: close, dispose: dispose };
      };
    })();

    zoomListener().listen();
  })();
});
