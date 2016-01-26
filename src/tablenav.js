(function(root, factory) {
    if (typeof define === 'function' && define.amd) {

        // AMD.
        return define(['jquery'], factory);

    } else if (typeof exports === 'object' && module.exports) {

        // Node/CommonJS
        module.exports = factory(require('jquery'));

    } else if (typeof root.jQuery === 'undefined') {

        // Browser globals: check that we have jQuery
        throw new Error('jQuery must be included');

    } else {
        // Browser globals:
        root.TableNav = factory(root.jQuery);

    }
} (this, function($) {

    function TableNav(selector, options) {
        if (!(this instanceof TableNav)) {
            return new TableNav(selector, options);
        }

        this._selector = selector || TableNav.options.selector;
        this._options = $.extend(TableNav.options, options);
        this._link = null;
        this._row = null;
        this._linkIndex = 0;
    };

    TableNav.options = {
        'activeRowClass' : 'info',
        'activeLinkClass': 'btn-info',
        'focusElements': '.btn:visible',
        'selector' : 'table.tablenav'
    };

    $.fn.tablenav = function(options) {
        return new TableNav(this, options);
    };

    TableNav.prototype.tables = function() {
        var $tables = $(this._selector);

        var $candidate = $tables.filter('table');

        // if selector yielded a set of tables. Simply return that,
        // ensuring that we ONLY have tables in the set.
        if ($candidate.length) {
            return $candidate;
        }

        // otherwise, assume that selector is the top level element,
        // and select all tables inside that top level element.
        return $tables.find('table');
    };

    TableNav.prototype.handleFocus = function() {
        var self = this;
        this.tables().on('focusin', 'a:visible', function() {
            self.gotoLink($(this));
        });
        return this;
    };

    // remove all UI feedback classes from table rows and links
    TableNav.prototype.clearUi = function() {
        this.tables().find('.' + this._options.activeLinkClass + ',.' + this._options.activeRowClass)
        .removeClass(this._options.activeRowClass)
        .removeClass(this._options.activeLinkClass);
    };

    TableNav.prototype.refreshUi = function() {
        // Clear the UI
        this.clearUi();

        // add UI styling classes again,
        if (this._link) {
            this.currentLink().addClass(this._options.activeLinkClass).each(function(index, element_to_focus) {
                // this .each is only run once, because the element set has size 1 or 0.
                element_to_focus.focus();
            });
            this.currentRow().addClass(this._options.activeRowClass);
        }

        return this;
    };

    TableNav.prototype.firstLinkAvailable = function() {
        return this.tables().find('tbody tr:first a:visible').eq(this._linkIndex);
    };

    TableNav.prototype.currentLink = function() {
        if (this._link && this._link.parent().length) {
            return this._link;
        }
        if (this._link && this._row && this._row.find('a:visible')) {
            return this._row.find('a:visible:first');
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
        if (!this._link) {
            return 0;
        }
        return this.tables().index(this.currentTable());
    };

    TableNav.prototype.gotoLink = function($link) {
        this._link = $link.first();
        this._row = this.currentRow();
        this._linkIndex = this._link.index();
        this.refreshUi();
        return this;
    };

    TableNav.prototype.gotoNextRow = function() {
        // search for next row in current table
        if (!this._link) {
            return this.gotoLink(this.currentLink());
        }

        var $newLink = this.currentRow().next('tr').find('a:visible').eq(this._linkIndex);
        if ($newLink.length) {
            return this.gotoLink($newLink);
        }

        // search for first row in next table
        var $newLink = this.tables().eq(this.currentTableIndex(this) + 1).find('tbody tr:first a:visible').eq(this._linkIndex);
        if ($newLink.length) {
            this._linkIndex = 0;
            return this.gotoLink($newLink);
        }

        // simply go to first available link if we have no "next" links to go to.
        return this.gotoLink(this.firstLinkAvailable());
    };

    TableNav.prototype.gotoPrevRow = function() {
        // search for previous row in current table
        var $newLink = this.currentRow().prev('tr').find('a:visible').eq(this._linkIndex);
        if ($newLink.length) {
            return this.gotoLink($newLink);
        }

        // search for last row in previous table
        var $newLink = this.tables().eq(this.currentTableIndex(this) - 1).find('tbody tr:last a:visible').eq(this._linkIndex);
        if ($newLink.length) {
            this._linkIndex = 0;
            return this.gotoLink($newLink);
        }

        // search for last row in current table
        var $newLink = this.currentTable().find('tr:last a:visible').eq(this._linkIndex);
        if ($newLink.length) {
            return this.gotoLink($newLink);
        }

        // Simply go to first available link if we have no "previous" links to go to.
        // Should never happen. So maybe we should log something?
        this._linkIndex = 0;
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
        if (!this._link) {
            return false;
        }

        this._link.click();
    };

    TableNav.init = function() {
        var mainNavigator = TableNav();

        for (var method in mainNavigator) {
            if (method.charAt(0) !== '_') {
                TableNav[method] = (function(method) {
                    return function() {
                        return mainNavigator[method].apply(mainNavigator, arguments);
                    };
                } (method));
            }
        }
    };

    $(TableNav.init);

    return TableNav;
}));
