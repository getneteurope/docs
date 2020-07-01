/**
 * Wait for DOM to be loaded
 */
'use strict';

document.addEventListener('DOMContentLoaded', initSampleTabs);

function initSampleTabs() {
    enableRequestDetailsHideShow();
    createSampleTabs();
}

function enableRequestDetailsHideShow() {
    $('table.r-details > caption').each(function () {
        if ($(this).hasClass('hide-show-enabled')) {
            return;
        }
        $(this).addClass('hide-show-enabled');
        $(this).unbind();
        $(this).on('click touch', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).toggleClass('r-details-expanded');
            return false;
        });
    });
}

function createSampleTabs() {
    var sampleTabs = $('.discrete.sample-tabs');
    var Tabs = {};
    sampleTabs.each(function () {
        if ($(this).hasClass('tabs-enabled')) return;

        $(this).addClass('tabs-enabled');
        var headlineElement = $(this);
        var tabsWrapper = $('<div/>', { 'class': 'tabs-wrapper' });

        // build Tabs data structure
        $(this).siblings('.tab').each(function () {
            var language = $(this).text();
            var tabWrapper = $('<div/>', { 'class': 'tab-wrapper' }).attr('data-lang', language);
            tabWrapper.append($(this).nextUntil('.tab'));
            tabsWrapper.append(tabWrapper);
            Tabs[language] = tabWrapper;
        });

        headlineElement.after(tabsWrapper);

        Object.keys(Tabs).forEach(function (key) {
            return Tabs[key] == null && delete Tabs[key];
        });

        // create button row
        var _btnrow = $('<div/>', { 'class': 'btn-samples-row' });
        for (var language in Tabs) {
            var btn = $('<button/>', {
                text: language.toUpperCase(),
                'class': 'btn-samples-tab'
            }).attr('data-lang', language);

            btn.on('click touch', function () {
                // hide all
                $('.tab-wrapper').hide();
                $(this).siblings('.btn-samples-tab.active').removeClass('active');
                $(this).addClass('active');
                $('.tab-wrapper[data-lang="' + $(this).attr('data-lang') + '"]').show();
            });
            btn.appendTo(_btnrow);
        }
        _btnrow.insertAfter(headlineElement);
        $(_btnrow).children('button').first().click();
    });
}
