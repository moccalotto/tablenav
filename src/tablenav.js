(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        return define(['exports', 'jquery'], factory);
    }

    if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {

        if (typeof jQuery === 'undefined' && typeof window === 'undefined')  {
            return factory(exports, require('jquery')(root));
        }

        if (typeof jQuery === 'undefined') {
            return factory(exports, require('jquery'));
        }

        return factory(exports, jQuery);

    }
    return factory(root.TableNav, root.jQuery);

} (this, function(exports, $) {

    function TableNav(selector, options) {
        var defaults = {
            'activeRowClass' : 'info',
            'activeLinkClass': 'btn-info',
            'focusElements': '.btn:visible',
        };
        this.options = $.extend(defaults, options);
        this.link = null;
        this.row = null;
        this.selector = selector;
        this.linkIndex = 0;
    };

    TableNav.prototype.tables = function() {
        var $tables = $(this.selector);

        var $candidate = $tables.filter('table');

        // if selector yielded a set of tables. Simply return that,
        // ensuring that we ONLY have tables in the set.
        if ($candidate.length) {
            return $candidate;
        }

        // otherwise, assume that selector is the top level element,
        // and select all tables inside that top level element.
        return $candidate.find('table');
    };

    TableNav.prototype.handleFocus = function() {
        var self = this;
        this.tables().on('focusin', 'a:visible', function() {
            self.gotoLink($(this));
        });
        return this;
    };

    TableNav.prototype.refreshUi = function() {
        // remove various UI feedback classes from tablerows and links
        this.tables().find('.' + this.options.activeLinkClass + ',.' + this.options.activeRowClass)
        .removeClass(this.options.activeRowClass)
        .removeClass(this.options.activeLinkClass);

        // add them again to the correct elements
        if (this.link) {
            this.currentLink().addClass(this.options.activeLinkClass).each(function(index, element_to_focus) {
                // this .each is only run once, because the element set has size 1 or 0.
                element_to_focus.focus();
            });
            this.currentRow().addClass(this.options.activeRowClass);
        }

        return this;
    };

    TableNav.prototype.firstLinkAvailable = function() {
        return this.tables().find('tbody tr:first a:visible').eq(this.linkIndex);
    };

    TableNav.prototype.currentLink = function() {
        if (this.link && this.link.parent().length) {
            return this.link;
        }
        if (this.link && this.row && this.row.find('a:visible')) {
            return this.row.find('a:visible:first');
        }
        return this.firstLinkAvailable();
    };

    TableNav.prototype.currentRow = function() {
        return this.currentLink().closest('tr');
    };

    TableNav.prototype.currentTable = function() {
        return this.currentRow().closest('table');
    };

    TableNav.prototype.currentTableIndex = function() {
        if (!this.link) {
            return 0;
        }
        return this.tables().index(this.currentTable());
    };

    TableNav.prototype.gotoLink = function($link) {
        this.link = $link.first();
        this.row = this.currentRow();
        this.linkIndex = this.link.index();
        this.refreshUi();
        return this;
    };

    TableNav.prototype.gotoNextRow = function() {
        // search for next row in current table
        if (!this.link) {
            return this.gotoLink(this.currentLink());
        }

        var $newLink = this.currentRow().next('tr').find('a:visible').eq(this.linkIndex);
        if ($newLink.length) {
            return this.gotoLink($newLink);
        }

        // search for first row in next table
        var $newLink = this.tables().eq(_currentTableIndex(this) + 1).find('tbody tr:first a:visible').eq(this.linkIndex);
        if ($newLink.length) {
            this.linkIndex = 0;
            return this.gotoLink($newLink);
        }

        // simply go to first available link if we have no "next" links to go to.
        return this.gotoLink(this.firstLinkAvailable());
    };

    TableNav.prototype.gotoPrevRow = function() {
        // search for previous row in current table
        var $newLink = this.currentRow().prev('tr').find('a:visible').eq(this.linkIndex);
        if ($newLink.length) {
            return this.gotoLink($newLink);
        }

        // search for last row in previous table
        var $newLink = this.tables().eq(_currentTableIndex(this) - 1).find('tbody tr:last a:visible').eq(this.linkIndex);
        if ($newLink.length) {
            this.linkIndex = 0;
            return this.gotoLink($newLink);
        }

        // search for last row in current table
        var $newLink = this.currentTable().find('tr:last a:visible').eq(this.linkIndex);
        if ($newLink.length) {
            return this.gotoLink($newLink);
        }

        // Simply go to first available link if we have no "previous" links to go to.
        // Should never happen. So maybe we should log something?
        this.linkIndex = 0;
        return this.gotoLink(this.firstLinkAvailable());
    };

    TableNav.prototype.gotoNextLink = function() {
        // go to next link in current row
        var $newLink = this.currentLink().next('a:visible');
        if ($newLink.length) {
            return this.gotoLink($newLink);
        }

        // go to first link in this Row
        var $newLink = this.currentRow().find('a:visible:first');
        if ($newLink.length) {
            return this.gotoLink($newLink);
        }

        return this.gotoLink(this.firstLinkAvailable());
    };

    TableNav.prototype.gotoPrevLink = function() {
        // go to previous link in current row
        var $newLink = this.currentLink().prev('a:visible');
        if ($newLink.length) {
            return this.gotoLink($newLink);
        }

        // go to last link in this Row
        var $newLink = this.currentRow().find('a:visible:last');
        if ($newLink.length) {
            return this.gotoLink($newLink);
        }

        return this.gotoLink(this.firstLinkAvailable());
    };

    TableNav.prototype.clickLink = function() {
        if (!this.link) {
            return false;
        }

        this.link.click();
    };

    exports = TableNav;
}));
