'use strict';

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
