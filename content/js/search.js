// ########################################################################### //
// Search Overlay
// ########################################################################### //
var selectIdx = 0;
var overlayOpen = false;

function openOverlay(event) {
    $('#search-results-wrapper').show();
    $('input#search').focus();
    $('div#content').addClass('blur');
    $('body').addClass('no-scroll');
    overlayOpen = true;
}

function closeOverlay(event) {
    $('#search-results-wrapper').hide();
    $('div#content').removeClass('blur');
    $('body').removeClass('no-scroll');
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
    btnCloseSearch.appendTo(wrapper);
    resultsList.appendTo(wrapper);
    wrapper.insertBefore('div#content');

    // open/close overlay depending on where the user clicks
    $('#search').on('click', (event) =>{
        event.stopPropagation();
        openOverlay();
    });
    //$('#search').on('blur', closeOverlay);
    $('#btn-search-close').click(closeOverlay);

    $(window).keyup(function (event) {
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
    $(window).keyup(function (event) {
        // return if overlay is not open, i.e. do nothing
        if (!overlayOpen)
            return;

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
                if(searchTerm != '') {
                    var results = search(searchTerm);
                    $('#num-results').text('(' + results.length + ')');
                    render(results);
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
    var link = $('<a/>').attr('href', dbentry.file + '#' + entry.ref).attr('onclick', 'closeOverlay()');

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
