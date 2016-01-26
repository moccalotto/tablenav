(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports', 'module'], factory);
    } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        factory(exports, module);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, mod);
        global.TableNav = mod.exports;
    }
})(this, function (exports, module, _tooltip) {
    'use strict';

    module.exports = (function($) {
        function TableNav(selector, options) {
            if (!(this instanceof TableNav)) {
                return new TableNav(selector, options);
            }

            if (selector instanceof jQuery) {
                selector = selector.selector;
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
                self.setCurrentLink($(this));
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
            return this.tables().find('tbody tr:first').find('a:visible').eq(this._linkIndex);
        };

        TableNav.prototype.currentLink = function() {
            if (this._link && this._link.parent().length) {
                return this._link;
            }
            if (this._link && this._row && this._row.find('a:visible')) {
                return this._row.find('a:visible').first();
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

        TableNav.prototype.setCurrentLink = function($link) {
            this._link = $link.first();
            this._row = this.currentRow();
            this._linkIndex = this._row.find('a:visible').index($link);
            this.refreshUi();
            return this;
        };

        TableNav.prototype.startNavigation = function()
        {
            // search for next row in current table
            if (!this._link) {
                return this.setCurrentLink(this.currentLink());
            }
        }

        TableNav.prototype.gotoNextRow = function() {
            this.startNavigation();

            var $allRows = this.tables().find('tbody tr');
            var currentRowIndex = $allRows.index(this.currentRow());
            var nextRowIndex = (currentRowIndex + 1) % $allRows.length;

            for (var i = 0; i < $allRows.length; i++) {
                var $nextRow = $allRows.eq(nextRowIndex);
                var $nextLinks = $nextRow.find('a:visible');
                if ($nextLinks.eq(this._linkIndex)) {
                    return this.setCurrentLink($nextLinks.eq(this._linkIndex));
                }
                if ($nextLinks.eq(0)) {
                    return this.setCurrentLink($nextLinks.eq(0));
                }
                nextRowIndex = (nextRowIndex + 1) % $allRows.length;
            }

            // simply go to first available link if we have no "next" links to go to.
            // SHOULD NOT HAPPEN
            return this.setCurrentLink(this.firstLinkAvailable());
        };

        TableNav.prototype.gotoPrevRow = function() {
            this.startNavigation();

            var $allRows = this.tables().find('tbody tr');
            var currentRowIndex = $allRows.index(this.currentRow());
            var nextRowIndex = (currentRowIndex + $allRows.length - 1) % $allRows.length;

            for (var i = 0; i < $allRows.length; i++) {
                var $nextRow = $allRows.eq(nextRowIndex);
                var $nextLinks = $nextRow.find('a:visible');
                if ($nextLinks.eq(this._linkIndex)) {
                    return this.setCurrentLink($nextLinks.eq(this._linkIndex));
                }
                if ($nextLinks.eq(0)) {
                    return this.setCurrentLink($nextLinks.eq(0));
                }
                nextRowIndex = (nextRowIndex + $allRows.length - 1) % $allRows.length;
            }

            // simply go to first available link if we have no "next" links to go to.
            // SHOULD NOT HAPPEN
            return this.setCurrentLink(this.firstLinkAvailable());
        };

        TableNav.prototype.gotoNextLink = function() {
            this.startNavigation();

            var $linksInRow = this.currentRow().find('a:visible');
            var currentLinkIndex = $linksInRow.index(this.currentLink());

            if (!$linksInRow.length) {
                return this.setCurrentLink(this.firstLinkAvailable());
            }

            var newLinkIndex = (currentLinkIndex + 1) % $linksInRow.length;
            return this.setCurrentLink($linksInRow.eq(newLinkIndex));
        };

        TableNav.prototype.gotoPrevLink = function() {
            this.startNavigation();

            var $linksInRow = this.currentRow().find('a:visible');
            var currentLinkIndex = $linksInRow.index(this.currentLink());

            if (!$linksInRow.length) {
                return this.setCurrentLink(this.firstLinkAvailable());
            }

            var newLinkIndex = (currentLinkIndex + $linksInRow.length - 1) % $linksInRow.length;
            return this.setCurrentLink($linksInRow.eq(newLinkIndex));
        };

        TableNav.prototype.clickLink = function() {
            if (!this._link) {
                return false;
            }

            this._link.click();
        };

        var defaultInstance = null;

        TableNav.initDefault = function() {
            if (!defaultInstance) {
                defaultInstance = TableNav();
            }
            for (var method in defaultInstance) {
                if (method.charAt(0) !== '_') {
                    TableNav[method] = (function(method) {
                        return function() {
                            return defaultInstance[method].apply(defaultInstance, arguments);
                        };
                    } (method));
                }
            }
            return defaultInstance;
        };

        TableNav.stopDefault = function() {
            if (!defaultInstance) {
                return;
            }

            TableNav.clearUi();
            defaultInstance = null;
        }

        $(TableNav.initDefault);

        return TableNav.initDefault();
    })(jQuery);
});
