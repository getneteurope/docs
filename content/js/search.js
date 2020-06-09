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
    $('#search').on('click', (event) => {
        event.stopPropagation();
        if ($('#search').val() != '') openOverlay();
    });
    //$('#search').on('blur', closeOverlay);
    $('#btn-search-close').click(closeOverlay);

    $('#search').keyup(function (event) {
        var keyCode = event.keyCode || event.which;
        switch (keyCode) {
            case 38: // arrow up
            case 40: // arrow down
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
            case 27: // escape
                event.preventDefault();
                closeOverlay(event);
                return;
            case 13: // enter
                event.preventDefault();
                closeOverlay();
                // select first element because it is packaged in another object
                $(selected).find('> div > a')[0].click();
                return;
            case 38: // arrow up
                event.preventDefault();
                if (selectIdx > 0) {
                    selectIdx--;
                    next = selected.prev();
                }
                break;
            case 40: // arrow down
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
                }
                else {
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
    if (searchIndexLoaded)
        return true;
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
    if (term === '')
        return [];
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
        var li = $('<li/>', { class: 'search-list-entry entry-' + count })
            .append(formatEntry(entry, count));
        resultsList.append(li);
        if (count === 0)
            select(li);
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
    link.on('click', (event) => {
        console.log('click on link')
        openOverlay();
        // console.log('ele top at: ' + $('#' + entry.ref)[0].offsetTop);
        // var srwHeight = $('#search-results-wrapper').height();
        // var ePos = $('#' + entry.ref)[0].offsetTop;
        // var scollPos = ePos + srwHeight;

    });
    // scroll to element + overlayHeight
    link.append($('<h4>').text(dbentry.title));
    link.append($('<p/>').text(dbentry.body));
    if (dbentry.parents !== null && dbentry.parents.length > 0)
        link.append($('<span/>', { class: 'label' }).text(dbentry.parents.join(' / ')));
    div.append(link);

    return div;
}

$(document).ready(function () {
    loadLunrIndex();
});
