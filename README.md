# TableNav
Javascript Library for navigating tables.

It does not have keyboard support. That is up to you.

It does however keep track of where the "cursor" is.

## Getting started

1.  Include jQuery on your page.

2.  Include tablenav on your page before the closing ``</body>`` tag but AFTER the jQuery inclusion.

    ```html
    <script src="/path/to/tablenav.js"></script>
    ```

3.  Add class="tablenav" to all tables that should be navigable.

4.  Handle the navigation:

    ```html
    <script>
        $(document).keydown(function(e) {
            switch(e.which) {
                case 37: // left
                    TableNav.gotoPrevLink();
                    break;

                case 38: // up
                    TableNav.gotoPrevRow();
                    break;

                case 39: // right
                    TableNav.gotoNextLink();
                    break;

                case 40: // down
                    TableNav.gotoNextRow();
                    break;

                default: return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        });
    </script>
    ```
