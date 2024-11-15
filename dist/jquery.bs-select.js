// noinspection JSCheckFunctionSignatures,JSUnresolvedReference

/**
 * This script defines a Bootstrap dropdown select plugin that's customizable with various options/settings.
 * It extends off jQuery ($) and adds its plugin methods / properties to $.bsSelect.
 *
 * The plugin methods are:
 *
 * - setDefaults(options): This function is used to set the default options by extending the current defaults with the
 *   provided parameter options.
 * - getDefaults(): Returns a copy of the current default settings with debug and debugElement properties removed.
 *
 * The default settings are stored in a DEFAULTS object.
 *
 * The script also includes a number of helper functions intended to manage dropdown behaviours. They include triggering of
 * events, fetching dropdown associated with a select element, showing and hiding dropdowns, changing select values,
 * toggling the state of all items in a dropdown, initializing a dropdown menu and so on.
 *
 * When "firing" or "triggering" events, the function trigger is called, which emits events on the dropdown select with
 * additional logic for debugging events.
 *
 * The select values are managed with setSelectValues, which sets the values for a select element based on the currently
 * active element in the corresponding dropdown.
 *
 * All items in the select dropdown can be toggled with toggleAllItemsState, which is a helper that toggles all options in
 * a dropdown to a provided state.
 *
 * init is used to initialize the dropdown for a select element.
 *
 * The specific details of how each function operates depend on the context in which they're called, the existing DOM and
 * the provided options. These functions are used within the context of a Bootstrap dropdown menu to provide additional
 * functionalities such as selecting and deselecting all, updating select values based on dropdown changes, debugging
 * events and other enhancements.
 */
(function ($) {

        const defaultTranslations = {
            btnEmptyText: "Please select..",
            deselectAllText: "Deselect All",
            selectAllText: "Select All",
            searchText: "Search..",
            showSelectedText: function (count, total) {
                return count + ' of ' + total + ' selected';
            },
        };

        const translations = window.bsSelectTranslations || defaultTranslations;

        const WRAPPER_CLASS = 'js-bs-select-dropdown';
        /**
         * Represents a Bootstrap Select plugin.
         *
         * @class
         */
        $.bsSelect = {
            setDefaults: function (options) {
                this.DEFAULTS = $.extend({}, this.DEFAULTS, options || {});
            },
            getDefaults: function () {
                const defCopy = this.DEFAULTS;
                delete defCopy.debug;
                delete defCopy.debugElement;
                return defCopy;
            },
            DEFAULTS: {
                btnWidth: 'fit-content',
                btnEmptyText: translations.btnEmptyText,
                btnSplit: false,
                dropDirection: null,
                dropIconClass: 'bi bi-chevron-down',
                menuClass: null,
                menuHeaderClass: 'text-bg-secondary text-uppercase',
                btnClass: 'btn-outline-dark',
                search: true,
                menuPreHtml: null,
                menuAppendHtml: null,
                menuMaxHeight: 300,
                showSubtext: true,
                showActionMenu: true,
                showMultipleCheckboxes: false,
                actionMenuBtnClass: 'btn-light',
                showSelectionAsList: false,
                showSelectedText: translations.showSelectedText,
                deselectAllText: translations.deselectAllText,
                selectAllText: translations.selectAllText,
                checkedIcon: "bi bi-check-lg",
                debug: false,
                debugElement: null,
                menuItemClass: null,
                searchText: translations.searchText,
                onBeforeChange: null,
                onKeyDown: null
            }
        };

        /**
         *
         * Triggers the specified event on the given select element.
         *
         * @param {JQuery} $select - The select element to trigger the event on.
         * @param {string} event - The name of the event to trigger.
         * @param {array} addParams - Additional trigger parameters.
         */
        function trigger($select, event, addParams = []) {
            let params = [];
            if (event !== 'any.bs.select') {
                trigger($select, 'any.bs.select');
                if (addParams.length) {
                    addParams.forEach(p => {
                        params.push(p);
                    });
                } else {
                    params.push($select.val());
                }
                $select.trigger(event, params);
            } else {
                $select.trigger(event);
            }
            const settings = $select.data('options');


            if (settings.debug) {
                console.log('trigger', event, params);

                if (settings.debugElement !== null) {
                    const log = $('<small>', {
                        class: 'js-log border-bottom',
                        html: '[' + new Date().toUTCString() + '] trigger <span class="text-warning">' + event + '</span> fired'
                    }).prependTo(settings.debugElement);


                    setTimeout(function () {
                        log.remove();
                    }, 5000);
                }
            }
        }

        /**
         * Fetches the dropdown that is superordinate to the select.
         * @param {JQuery} $select - The select element.
         * @returns {JQuery} - The dropdown element.
         */
        function getDropDown($select) {
            return $select.closest(`.${WRAPPER_CLASS}`);
        }

        /**
         * Opens the dropdown which is superordinate to the select.
         *
         * @param {jQuery} $select - The select element.
         *
         * @return {void}
         */
        function show($select) {
            const $dropdown = getDropDown($select);
            if ($dropdown.length) {
                $dropdown.dropdown('show');
            }
        }

        /**
         * Closes the dropdown that is superordinate to the select.
         *
         * @param {jQuery} $select - The select element.
         */
        function hide($select) {
            const $dropdown = getDropDown($select);
            if ($dropdown.length) {
                $dropdown.dropdown('hide');
            }
        }

        /**
         * Retrieves selected values from a dropdown associated with a given select element.
         *
         * @param {jQuery} $select - The jQuery object representing the select element.
         * @return {Array|string|null} An array of selected values if the select allows multiple selections,
         *                             a single value if the select allows only one selection,
         *                             or null if no value is selected.
         */
        function getSelectedValuesFromDropdown($select){
            // Retrieve the dropdown element related to the given select element
            const $dropdown = getDropDown($select);
            // Check if the select element allows multiple selections
            const multiple = $select.prop('multiple');
            // Initialize an array to store selected values
            let values = [];
            // Hide the selection icon for all dropdown items that are not active
            $dropdown.find('.dropdown-item:not(.active)').find('.dropdown-item-select-icon').hide();
            // Iterate over all active dropdown items
            $dropdown.find('.dropdown-item.active').each(function (i, element) {
                // Get the value of the corresponding option element in the select element based on the data-index attribute of the dropdown item
                let val = $select.find('option:eq(' + $(element).data('index') + ')').prop('value');
                // If the value is not false, add it to the values array and show the selection icon
                if (val !== false) {
                    values.push(val);
                    $(element).find('.dropdown-item-select-icon').show();
                }
            });

            // Return the appropriate value based on the select element's multiple attribute
            if (multiple) {
                // If the select element allows multiple selections, return the array of selected values
                return values;
            } else if (!isValueEmpty(values)) {
                // If there is at least one selected value, return the first one
                return values[0];
            } else {
                // If no values are selected, return null
                return null;
            }
        }

        /**
         * Sets the values of a select element based on its data options.
         *
         * @param {jQuery} $select - The jQuery object representing the select element.
         * @return {void}
         */
        function setSelectValues($select) {
            const settings = $select.data('options');
            if (settings.debug) {
                console.log('bsSelect:setSelectValues', $select.val());
            }

            const multiple = $select.prop('multiple');
            let values = getSelectedValuesFromDropdown($select);
            $select.val(values);
        }

        /**
         * Toggles the state of all items in a dropdown select element.
         *
         * @param {jQuery} $select - The dropdown select element as a jQuery object.
         * @param {boolean} [state=false] - The state to toggle the items to. Defaults to false.
         *
         * @returns {void}
         */
        function toggleAllItemsState($select, state = false) {
            const dropdown = getDropDown($select);
            const beforeValues = $select.val();
            const options = $select.find('option');
            const settings = $select.data('options');
            const multiple = false !== $select.prop('multiple');
            options.prop('selected', state);
            const toggleCheckIcon = multiple && settings.showMultipleCheckboxes;


            options.each(function (i) {
                const $item = dropdown.find('.dropdown-item[data-index="' + i + '"]');
                if (state) {
                    $item.addClass('active');
                    $item.find('.dropdown-item-select-icon').show();
                    // if (toggleCheckIcon){
                    //     $item.find('.js-icon-checklist').removeClass('bi-check-square').addClass('bi-square');
                    // }
                } else {
                    $item.removeClass('active');
                    $item.find('.dropdown-item-select-icon').hide();
                    // if (toggleCheckIcon){
                    //     $item.find('.js-icon-checklist').removeClass('bi-check-square').addClass('bi-square');
                    // }
                }
            });

            if (toggleCheckIcon) {
                dropdown.find('.dropdown-item:not(.active) .js-icon-checklist.bi-check-square').removeClass('bi-check-square').addClass('bi-square');
                dropdown.find('.dropdown-item.active .js-icon-checklist.bi-square').removeClass('bi-square').addClass('bi-check-square');
            }
            setSelectValues($select);
            setDropdownTitle($select);

            const ev = state ? 'selectAll' : 'selectNone';
            trigger($select, ev + '.bs.select');
            const afterValues = getSelectedValuesFromDropdown($select);
            trigger($select, 'change.bs.select', [beforeValues, afterValues]);
            // trigger($select, 'change');
        }

        function getBootstrapMajorVersion() {
            if (typeof $.fn.modal === 'undefined' || typeof $.fn.modal.Constructor === 'undefined') {
                console.error('Bootstrap Modal Plugin ist nicht verfügbar');
                return;
            }

            const bootstrapVersion = $.fn.modal.Constructor.VERSION;
            // Extrahieren der Hauptversionsnummer
            return parseInt(bootstrapVersion.split('.')[0]);
        }

        function setupDropdown($dropdown, selectElement, multiple) {
            const $dropdownToggle = $dropdown.find('.dropdown-toggle');
            const autoclose = $dropdownToggle.data('autoClose') || $dropdownToggle.data('bsAutoClose') || "true";
            const BS_V = getBootstrapMajorVersion();
            $dropdown
                .on('click', '.js-select-select-all', function (e) {
                    e.preventDefault();
                    if (onBeforeChange(selectElement)) {
                        toggleAllItemsState(selectElement, true);
                        if (BS_V === 4 && multiple && (autoclose === "true" || autoclose === "outside")) {
                            e.stopPropagation();
                        }
                    }
                })
                .on('click', '.js-select-select-none', function (e) {
                    e.preventDefault();
                    if (onBeforeChange(selectElement)) {
                        toggleAllItemsState(selectElement, false);
                        if (BS_V === 4 && multiple && (autoclose === "true" || autoclose === "outside")) {
                            e.stopPropagation();
                        }
                    }
                })
                .on('hidden.bs.dropdown', function () {
                    // empty search field if exists
                    let searchField = $(this).find('[type="search"]');
                    if (searchField.length) {
                        const searchElements = $dropdown.find('[data-index]');
                        searchElements.removeClass('d-none').addClass('d-flex');
                        searchField.val(null).trigger('keyup');
                    }
                })
                .on('keyup input', '[type="search"]', function (e) {
                    const settings = selectElement.data('options');

                    const searchField = $(e.currentTarget);
                    const searchPattern = searchField.val().trim();
                    if (settings.debug) {
                        console.log('bsSelect:search', searchPattern);
                    }
                    const searchElements = $dropdown.find('[data-index]');
                    const dropdownHeaders = $dropdown.find('.dropdown-header'); // Elemente für dropdown-header

                    searchElements.removeClass('d-none').addClass('d-flex');
                    dropdownHeaders.removeClass('d-none'); // Setzt dropdown-header auf sichtbar

                    if (settings.debug) {
                        console.log('bsSelect:search elements:', searchElements.length);
                    }
                    if (!isValueEmpty(searchPattern)) {
                        const search = searchPattern.toUpperCase();
                        searchElements.each(function (index, value) {
                            let currentName = $(value).text().trim();
                            if (currentName.toUpperCase().indexOf(search) > -1) {
                                if (settings.debug) {
                                    console.log('bsSelect:search elements found:', currentName);
                                }
                                $(value).removeClass('d-none').addClass('d-flex');
                            } else {
                                if (settings.debug) {
                                    console.log('bsSelect:search elements not found:', currentName);
                                }
                                $(value).addClass('d-none').removeClass('d-flex');
                            }
                        });

                        // Blendet dropavio-header aus, wenn ein Suchstring vorhanden ist
                        dropdownHeaders.addClass('d-none');
                    } else {
                        if (settings.debug) {
                            console.log('bsSelect:search is empty');
                        }
                        searchElements.removeClass('d-none');
                        dropdownHeaders.removeClass('d-none'); // Zeigt dropdown-header an, wenn kein Suchstring vorhanden ist
                    }
                })
                .on('click', '[data-dismiss="dropdown"], [data-bs-dismiss="dropdown"]', function (e) {
                    const btn = $(e.currentTarget);
                    const dd = btn.closest('.' + WRAPPER_CLASS);
                    dd.find('[data-bs-toggle="dropdown"],[data-toggle="dropdown"]').dropdown('hide');
                })
                .on('click', '.dropdown-item', function (e) {
                    e.preventDefault();
                    const settings = selectElement.data('options');
                    const active = $(e.currentTarget).hasClass('active');
                    const beforeValues = selectElement.val();

                    if (onBeforeChange(selectElement)) {

                        const item = $(e.currentTarget);

                        if (!multiple) {
                            $dropdown
                                .find('.dropdown-item.active')
                                .not(item)
                                .removeClass('active');
                        }

                        item.toggleClass('active');

                        const toggleCheckIcon = multiple && settings.showMultipleCheckboxes;

                        if (active) {
                            if (toggleCheckIcon) {
                                item
                                    .find('.js-icon-checklist')
                                    .removeClass('bi-square')
                                    .addClass('bi-check-square');
                            }

                            item.find('.dropdown-item-select-icon').show();
                        } else {
                            if (toggleCheckIcon) {
                                item
                                    .find('.js-icon-checklist')
                                    .removeClass('bi-check-square')
                                    .addClass('bi-square');
                            }

                            item.find('.dropdown-item-select-icon').hide();
                        }

                        setSelectValues(selectElement);
                        const afterValues = getSelectedValuesFromDropdown(selectElement);
                        setDropdownTitle(selectElement);
                        trigger(selectElement, 'change.bs.select', [beforeValues, afterValues]);

                        // Check the condition and make sure it is not closed if:
                        // Boostrap 4 & autoclose

                        if (BS_V === 4 && multiple && (autoclose === "true" || autoclose === "outside")) {
                            e.stopPropagation();
                        }
                    }
                })
                .on('keydown', function (e) {
                    const $wrap = $(e.currentTarget);
                    const $selectElement = $wrap.find('select');
                    const settings = $selectElement.data('options');
                    if (typeof settings.onKeyDown === 'function') {
                        settings.onKeyDown($selectElement, e);
                    }
                    trigger($selectElement, 'keydown.bs.select', [$selectElement, e]);
                })
                .on('keydown', '[type="search"]', function (e) {
                    switch (e.code) {
                        case 'Enter':
                            e.preventDefault();
                            const item = $dropdown.find('.dropdown-item:visible:first');
                            if (item.length) {
                                item.trigger('click');
                                $dropdown.removeClass('show');
                                $dropdown.find('.dropdown-menu').removeClass('show');
                            }
                            break;
                        default:
                        // Space for more keyboard events
                    }
                })
                .on('hide.bs.dropdown', function () {
                    const $select = $dropdown.find('select');
                    const valueBefore = $select.data('valueBefore');
                    const currentValue = $select.val();
                    const valueChanged = hasValueChanged(valueBefore, currentValue);
                    trigger($select, 'hide.bs.select', [valueChanged]);
                })
                .on('hidden.bs.dropdown', function () {
                    const $select = $dropdown.find('select');
                    $select.removeData('valueBefore');
                    trigger($select, 'hidden.bs.select');
                })
                .on('show.bs.dropdown', function () {
                    const $select = $dropdown.find('select');
                    $select.data('valueBefore', $select.val());
                    trigger($select, 'show.bs.select');
                })
                .on('shown.bs.dropdown', function () {
                    const $select = $dropdown.find('select');
                    trigger($select, 'shown.bs.select');
                    const searchElement = $dropdown.find('[type="search"]');
                    if (searchElement.length) {
                        searchElement.focus();
                    }
                });

        }

        function arraysEqual(arr1, arr2) {
            if (arr1.length !== arr2.length) {
                return false;
            }

            const sortedArr1 = [...arr1].sort();
            const sortedArr2 = [...arr2].sort();

            for (let i = 0; i < sortedArr1.length; i++) {
                if (sortedArr1[i] !== sortedArr2[i]) {
                    return false;
                }
            }

            return true;
        }

        function hasValueChanged(valueBefore, currentValue) {
            // Prüfen, ob sich der Wert geändert hat
            if (Array.isArray(valueBefore) && Array.isArray(currentValue)) {
                // Vergleichen von Arrays
                return !arraysEqual(valueBefore, currentValue);
            }

            if (typeof valueBefore === 'object' && typeof currentValue === 'object') {
                // Vergleichen von Objekten (inklusive null)
                return JSON.stringify(valueBefore) !== JSON.stringify(currentValue);
            }

            // Vergleichen von primitiven Typen (int, string, float, null)
            return valueBefore !== currentValue;
        }

        /**
         * Checks if the given value is empty. A value is considered empty if it is:
         * - null
         * - undefined
         * - an empty array
         * - a string containing only whitespace characters
         *
         * @param {*} value - The value to be checked for emptiness.
         * @return {boolean} - Returns `true` if the value is empty, otherwise `false`.
         */
        function isValueEmpty(value) {
            if (value === null || value === undefined) {
                return true; // Null or undefined
            }
            if (Array.isArray(value)) {
                return value.length === 0; // Empty array
            }
            if (typeof value === 'string') {
                return value.trim().length === 0; // Empty string (including only spaces)
            }
            return false; // All other values are considered non-empty (including numbers)
        }

        /**
         * Initializes a dropdown menu for a select element.
         *
         * @param {Window.jQuery} $select - The select element to initialize the dropdown for.
         * @param {boolean} fireTrigger - (Optional) Whether or not to fire the trigger event. Default is false.
         *
         * @return {JQuery} - The initialized dropdown menu.
         */
        function init($select, fireTrigger = false) {
            const settings = $select.data('options');
            const multiple = $select.prop('multiple');

            if (settings.debug) {
                console.log('bsSelect:init with value:', $select.val());
            }
            /**
             * @type {JQuery}
             */
            let $dropdown = getDropDown($select);
            const isSelectDisabled = $select.hasClass('disabled') || $select.is('[disabled]');

            if ($dropdown.length) {
                return $dropdown;
            }

            if (!multiple && isValueEmpty($select.val())) {
                $select.prop("selectedIndex", -1);
            }

            let selectedValue = $select.val();


            $dropdown = $('<div>', {
                class: `${WRAPPER_CLASS} position-relative`,
                css: {
                    width: settings.btnWidth
                }
            }).insertAfter($select);

            if (settings.dropDirection !== null) {
                $dropdown.addClass(settings.dropDirection);
            }

            const toggleIconClass = settings.dropIconClass === null ? 'dropdown-toggle' : '';
            const dropIcon = settings.dropIconClass !== null ? `<i class="ms-2 ml-2 ${settings.dropIconClass}"></i>` : '';
            // add dropdown toggle item
            if (!settings.btnSplit) {
                $('<button>', {
                    class: `btn ${settings.btnClass} ${toggleIconClass} d-flex align-items-center flex-nowrap js-dropdown-header justify-content-between`,
                    type: 'button',
                    'data-bs-toggle': 'dropdown',
                    'data-toggle': 'dropdown',
                    'aria-expanded': false,
                    'data-bs-auto-close': multiple ? 'outside' : true,
                    html: `<span class="js-selected-text">${settings.btnEmptyText}</span>${dropIcon}`,
                    css: {
                        width: settings.btnWidth
                    }
                }).appendTo($dropdown);
            } else {
                $dropdown.addClass('btn-group');
                $('<button>', {
                    class: `btn ${settings.btnClass} d-flex align-items-center js-dropdown-header justify-content-between`,
                    type: 'button',
                    html: `<span class="js-selected-text">${settings.btnEmptyText}</span>`,
                    css: {
                        width: settings.btnWidth
                    }
                }).appendTo($dropdown);

                $('<button>', {
                    class: `btn ${settings.btnClass} dropdown-toggle dropdown-toggle-split`,
                    'data-bs-toggle': 'dropdown',
                    'data-toggle': 'dropdown',
                    'aria-expanded': false,
                    'data-bs-auto-close': multiple ? 'outside' : true
                }).appendTo($dropdown);
            }

            /**
             * fix overflow, when dropdown is inside bootstrap-table plugin
             * @see https://github.com/wenzhixin/bootstrap-table
             */
            const isDropDownInBootstrapTable = $dropdown.closest('.fixed-table-body:not(.overflow-visible)').length;
            if (isDropDownInBootstrapTable) {
                $dropdown
                    .closest('.fixed-table-body')
                    .addClass('overflow-visible');
            }

            setupDropdown($dropdown, $select, multiple);

            /**
             * If the select has been assigned to a label, create a click event to open the select
             */
            if ($select.attr('id')) {
                const selectId = $select.attr('id');
                const label = $(`label[for="${selectId}"]`);
                if (label.length) {
                    label.on('click', function () {
                        const closestDropDown = getDropDown($(`select[id="${selectId}"]`));
                        closestDropDown.trigger('click');
                    });
                }
            }

            $select.appendTo($dropdown);
            $select.val(selectedValue);
            $select.css({
                'position': 'absolute',
                'left': '0',
                'opacity': '0',
                'height': '0',
                'width': '0'
            });

            const $dropdownMenu = $('<div>', {
                class: 'dropdown-menu pl-1 ps-1 ' + settings.menuClass ?? ''
            }).appendTo($dropdown);

            let searchInput = '';
            let closeButton = '';
            let actionMenu = '';
            if (true === settings.search) {
                searchInput = `<input type="search" autocomplete="off" class="form-control form-control-sm mr-auto me-auto mr-auto" placeholder="${settings.searchText}">`;
            }

            if (multiple) {
                if (settings.showActionMenu) {
                    actionMenu = `<div class="d-flex flex-nowrap mt-2 p-0"><a href="#" class="btn-sm text-nowrap btn ${settings.actionMenuBtnClass} js-select-select-all">${settings.selectAllText}</a><span class="mx-1"></span><a href="#" class="btn-sm text-nowrap btn ${settings.actionMenuBtnClass} js-select-select-none">${settings.deselectAllText}</a></div>`;
                }
            }

            let toolbarClasses = '';
            if (searchInput !== '' || closeButton !== '' || actionMenu !== '') {
                toolbarClasses = 'px-2 pb-2 pt-2 border-bottom';
            }

            $(`<div class="d-flex flex-column ${toolbarClasses}"><div class="d-flex  justify-content-end align-items-center">${searchInput}${closeButton}</div>${actionMenu}</div>`).appendTo($dropdownMenu);

            if (settings.menuPreHtml !== null) {
                $('<div>', {
                    html: settings.menuPreHtml,
                    class: 'text-muted p-3 fs-6',
                }).appendTo($dropdownMenu);
                $('<hr class="dropdown-divider mt-0">').appendTo($dropdownMenu);
            }

            const $dropdownMenuInner = $(`<div>`, {
                css: {
                    overflowY: 'auto',
                    maxHeight: `${settings.menuMaxHeight}px`
                }
            }).appendTo($dropdownMenu);

            $dropdownMenu
                .find('[type="search"]')
                .prop("autocomplete", "off");

            let i = 0;
            let inOGroup = false;
            const validElements = $select.find('optgroup, option');

            validElements.each(function (index, option) {
                const element = $(option);
                const isOptGroup = element.is("optgroup");
                if (isOptGroup) {
                    // I am an option group
                    $('<h6>', {
                        class: `dropdown-header text-start my-0 w-100 rounded-0 py-1 ${settings.menuHeaderClass}`,
                        text: element.attr('label')
                    }).appendTo($dropdownMenuInner);
                    return;
                }
                // I am an option element
                const classList = element.get(0).className.trim();

                const value = element.prop('value');
                const inOptGroup = element.closest('optgroup').length !== 0;
                const isDisabled = isSelectDisabled || element.is('[disabled]') || element.hasClass('disabled');
                const disabledClass = isDisabled ? 'disabled' : '';

                let isSelected = false;
                let selected = "";
                if (value !== false) {
                    if (multiple) {
                        isSelected = $.inArray(value, selectedValue) > -1;
                        selected = isSelected ? 'active' : '';
                    } else {
                        isSelected = selectedValue === value;
                        selected = isSelected ? 'active' : '';
                    }
                }

                const showSubtext = settings.showSubtext && element.data('subtext');
                const showCheckList = multiple && settings.showMultipleCheckboxes;
                const showIcon = element.data('icon');
                const $subtext = showSubtext ? `<small class="text-muted">${element.data('subtext')}</small>` : '';
                const $icon = showIcon ? `<i class="${element.data('icon')}"></i> ` : '';
                const paddingLeftClass = inOptGroup || $icon !== '' ? 'ps-2 pl-2' : '';

                let checkElement = '';
                let checkElementPre = "";
                if (showCheckList) {
                    checkElement = getCheckListIcon(isSelected);
                } else {
                    checkElementPre = `<i class="${settings.checkedIcon}"></i>`;
                }

                if (inOGroup && !inOptGroup) {
                    $(`<hr>`, {
                        class: 'dropdown-divider'
                    }).appendTo($dropdownMenuInner);
                }

                const itemClass = settings.menuItemClass === null ? '' : settings.menuItemClass;

                $('<div>', {
                    tabindex: i,
                    class: classList,
                    html: `<a href="#" class="dropdown-item ${selected} ${disabledClass} px-2 d-flex flex-nowrap align-items-center ${itemClass} " data-index="${i}" style="cursor: pointer;">${checkElement}${$icon}<div class="${paddingLeftClass} d-flex flex-column"><div>${element.text()}</div>${$subtext}</div><div class="dropdown-item-select-icon pl-1 ps-1 ml-auto ms-auto ">${checkElementPre}</div></a>`
                }).appendTo($dropdownMenuInner);


                inOGroup = inOptGroup;
                i++;
            });

            setSelectValues($select);

            if (settings.menuAppendHtml !== null) {
                $(`<hr>`, {
                    class: 'dropdown-divider'
                }).appendTo($dropdownMenuInner);

                $('<div>', {
                    html: settings.menuAppendHtml,
                    class: 'text-muted fs-6',
                    css: {padding: '4px 16px'}
                }).appendTo($dropdownMenuInner);
            }

            setDropdownTitle($select);

            if (fireTrigger) {
                setTimeout(function () {
                    trigger($select, 'init.bs.select');
                    $dropdown.show();
                }, 0);
            }
            return $dropdown;
        }

        /**
         * Returns the HTML string of a checklist icon.
         *
         * @param {boolean} isSelected - Indicates whether the icon should be selected or not.
         * @return {string} - The HTML string representing the checklist icon.
         */
        function getCheckListIcon(isSelected) {
            return isSelected ? `<i class="bi bi-check-square mr-2 me-2 js-icon-checklist"></i>` : `<i class="bi bi-square me-2 mr-2 js-icon-checklist"></i>`;
        }

        /**
         * Sets the dropdown title based on the selected values in the given select element.
         *
         * @param {JQuery} $select - The select element.
         */
        function setDropdownTitle($select) {
            const settings = $select.data('options');
            // const multiple = false !== $select.prop('multiple');
            const $dropdown = getDropDown($select);
            const $titleElement = $dropdown.find('.js-dropdown-header .js-selected-text');
            let selectedValues = $select.val();
            let title;
            let tooltip = "";

            // If no value is set, set empty text
            if (!selectedValues || !selectedValues.length || selectedValues === "" || !$select.find('option:selected').length) {
                title = settings.btnEmptyText;
            } else {
                if (Array.isArray(selectedValues)) {
                    // I am multiple
                    if (selectedValues.length === 1) {
                        // Only one option was selected
                        let $option = $select.find(`option[value="${selectedValues[0]}"]`);
                        let $subtext = settings.showSubtext && $option.data('subtext') ?
                            `<small class="text-muted mx-2">${$option.data('subtext')}`
                            : '';
                        let $icon = $option.data('icon') ?
                            `<i class="${$option.data('icon')}"></i> `
                            : '';

                        title = `<span>${$icon}${$option.text()}</span><small class="text-muted ms-2 ml-2">${$subtext}</small>`;
                        tooltip = $option.text();
                    } else {
                        // Several option was selected
                        if (!settings.showSelectionAsList) {
                            let length = $select.find('option').length;
                            title = settings.showSelectedText(selectedValues.length, length);
                            let tooltips = [];
                            selectedValues.forEach(val => {
                                let $option = $select.find(`option[value="${val}"]`);
                                tooltips.push($option.text());
                            });
                            tooltip += tooltips.join(',');
                        } else {
                            // show as list
                            let texts = [];
                            let tooltips = [];
                            selectedValues.forEach(val => {
                                let $option = $select.find(`option[value="${val}"]`);
                                let $subtext = settings.showSubtext && $option.data('subtext') ?
                                    $option.data('subtext')
                                    : '';
                                let $icon = $option.data('icon') ?
                                    `<i class="${$option.data('icon')}"></i> `
                                    : '';

                                texts.push(`<div><span>${$icon}${$option.text()}</span><small class="text-muted ms-2 ml-2">${$subtext}</small></div>`);
                                tooltips.push($option.text());
                            });
                            title = `<div class="d-flex flex-column">${texts.join('')}</div>`;
                            tooltip += tooltips.join(',');
                        }
                    }
                } else {
                    // I am single select
                    let $option = $select.find(`option[value="${selectedValues}"]`);
                    if ($option.hasClass('d-none')) {
                        title = settings.btnEmptyText;
                    } else {
                        let $subtext = settings.showSubtext && $option.data('subtext') ?
                            `<small class="text-muted ms-2 ml-2">${$option.data('subtext')}`
                            : '';
                        let $icon = $option.data('icon') ?
                            `<i class="${$option.data('icon')}"></i> `
                            : '';
                        title = `<span>${$icon}${$option.text()}</span><small class="text-muted mx-2">${$subtext}</small>`;
                        tooltip = $option.text();
                    }
                }
            }

            $titleElement.html(title);
            $titleElement.attr('title', tooltip);
        }

        /**
         * Updates the visual state of the dropdown menu based on the selected values
         *
         * @param {jQuery} $select - The jQuery object representing the select element
         *
         * @*/
        function val($select) {

            // const settings = $select.data('options');
            // const multiple = false !== $select.prop('multiple');
            const $dropdown = getDropDown($select);
            const beforeValues = $select.val();
            $dropdown.find('.dropdown-item.active').removeClass('active');
            $dropdown.find('.dropdown-item .js-icon-checklist.bi-check-square').removeClass('bi-check-square').addClass('bi-square');
            const disabledDropdownIcons = $dropdown.find('.dropdown-item.disabled');
            disabledDropdownIcons.removeClass('disabled');
            let selectedValues = $select.val();
            if (!Array.isArray(selectedValues)) {
                selectedValues = [selectedValues];
            }

            selectedValues.forEach(value => {
                let index = $select.find(`option[value="${value}"]`).index();
                const item = $dropdown.find(`.dropdown-item[data-index="${index}"]`);
                item.addClass('active');
            });
            $dropdown.find('.dropdown-item.active .js-icon-checklist.bi-square').removeClass('bi-square').addClass('bi-check-square');

            setSelectValues($select);
            const afterValues = getSelectedValuesFromDropdown($select);
            trigger($select, 'change.bs.select', [beforeValues, afterValues]);
            setDropdownTitle($select);
            disabledDropdownIcons.addClass('disabled');
        }

        /**
         * Destroys a dropdown element and restores the original select element.
         *
         * @param {jQuery} $select - The select element to destroy.
         * @param {boolean} show - Flag to indicate whether to show the select element after destruction.
         * @param {boolean} [clearData=false] - Flag to indicate whether to clear the data associated with the select element.
         *
         * @return {undefined}
         */
        function destroy($select, show, clearData = false) {
            const settings = $select.data('options');
            if (settings.debug) {
                console.log('bsSelect:destroy');
            }
            let val = $select.val();
            if (settings.debug) {
                console.log('bsSelect:destroy value before: ', val);
            }
            let $dropdown = getDropDown($select);
            $select.insertBefore($dropdown);
            $select.val(val);
            if (settings.debug) {
                console.log('bsSelect:destroy value after: ', $select.val());
            }
            if (clearData) {
                $select.removeData('options');
            }
            $dropdown.remove();
            if (show) {

                $select.css({
                    'position': '',
                    'left': '',
                    'opacity': '',
                    'height': '',
                    'width': ''
                });
            }
        }

        /**
         * Refreshes the given select element by destroying and reinitializing it.
         *
         * @param {jQuery} $select - The select element to refresh.
         *
         * @return {void}
         */
        function refresh($select) {
            destroy($select, false, false);
            init($select, false);
        }

        /**
         * Toggles the disabled state of a dropdown button associated with the provided select element.
         *
         * @param {jQuery} $select - The jQuery object representing the select element.
         * @return {void}
         */
        function toggleDisabled($select) {
            const dropDown = getDropDown($select);
            const btn = dropDown.find('[data-bs-toggle="dropdown"],[data-toggle="dropdown"]');
            if (btn.hasClass('disabled')) {
                setDisabled($select, false);
            }
            else{
                setDisabled($select, true);
            }
        }


        /**
         * Sets the disabled status of a dropdown menu.
         *
         * @param {jQuery} $select - The jQuery object representing the dropdown selector.
         * @param {boolean} status - A boolean indicating whether to disable (true) or enable (false) the dropdown.
         * @return {void} This function does not return a value.
         */
        function setDisabled($select, status) {
            const dropDown = getDropDown($select);
            const btn = dropDown.find('[data-bs-toggle="dropdown"],[data-toggle="dropdown"]');
            if (status) {
                btn.addClass('disabled');
            }
            else{
                btn.removeClass('disabled');
            }
            trigger($select, 'toggleDisabled.bs.select', [status]);
        }


        /**
         * Executes the onBeforeChange function provided in the settings object.
         * If the function exists and returns true, triggers the 'acceptChange.bs.select' event.
         * If the function exists and returns false, triggers the 'cancelChange.bs.select' event.
         * Returns the value returned by the onBeforeChange function or true if it does not exist.
         *
         * @param {jQuery} $select - The select element.
         * @return {*|boolean} - The value returned by the onBeforeChange function or true if it does not exist.
         */
        function onBeforeChange($select) {
            const settings = $select.data('options');
            if (typeof settings.onBeforeChange === 'function') {
                const ok = settings.onBeforeChange($select);
                if (ok) {
                    trigger($select, 'acceptChange.bs.select');
                } else {
                    trigger($select, 'cancelChange.bs.select');
                }
                return ok;
            }
            return true;
        }

        /**
         * jQuery plugin for creating Bootstrap style select dropdowns.
         *
         * @namespace bsSelect
         * @param {object} options - The plugin options.
         * @param {null|object|int|string|float|boolean} param - The method values.
         * @returns {object} - The jQuery object.
         *
         * @see https://github.com/ThomasDev-de/bs-select
         * @example
         * $('#mySelect').bsSelect({ search: true });
         *
         * @example
         * $('#mySelect').bsSelect({
         *   search: true,
         *   btnWidth: '150px'
         * });
         */
        $.fn.bsSelect = function (options, param) {
            let callFunction = false;
            let optionsSet = false;

            switch (typeof options) {
                case 'string': {
                    callFunction = true;
                }
                    break;
                default: {
                    optionsSet = true;
                }
                    break;
            }

            return $(this).each(function (index, select) {
                const $select = $(select);

                if (optionsSet) {
                    const setup = $.extend({}, $.bsSelect.DEFAULTS, $select.data(), options || {});
                    $select.data('options', setup);
                }

                init($select, true);


                if (callFunction) {

                    switch (options) {
                        case 'getSelectedText': {
                            let result; // Variable zum Speichern des Ergebnisses
                            const value = $select.val();
                            if (isValueEmpty(value)) {
                                result = "";
                            } else {
                                const multiple = $select.prop('multiple');

                                if (multiple && Array.isArray(value)) {
                                    const texts = [];
                                    value.forEach(val => {
                                        texts.push($select.find('[value="' + val + '"]').text());
                                    })
                                    result = texts.join(', ');
                                } else if (typeof value === 'string') {
                                    result = $select.find('[value="' + value + '"]').text();
                                } else {
                                    result = '';
                                }
                            }
                            if (typeof param === 'function') {
                                param(result, value);
                            }
                        }
                            break;
                        case 'selectAll': {
                            if (onBeforeChange($select)) {
                                toggleAllItemsState($select, true);
                            }
                        }
                            break;
                        case 'selectNone': {
                            if (onBeforeChange($select)) {
                                toggleAllItemsState($select, false);
                            }
                        }
                            break;
                        case 'hide': {
                            hide($select);
                        }
                            break;
                        case 'show': {
                            show($select);
                        }
                            break;
                        case 'val': {
                            if (onBeforeChange($select)) {
                                $select.val(param);
                                val($select);
                            }
                        }
                            break;
                        case 'destroy': {
                            trigger($select, 'destroy.bs.select');
                            destroy($select, true, param);
                        }
                            break;
                        case 'updateOptions': {
                            $select.data('options', $.extend({}, $.bsSelect.DEFAULTS, $select.data('options'), param || {}));
                            refresh($select);
                            trigger($select, 'update.bs.select');
                        }
                        break;
                        case 'setBtnClass': {
                            $select.data('options', $.extend({}, $.bsSelect.DEFAULTS, $select.data('options'),  {btnClass: param}));
                            refresh($select);
                            trigger($select, 'update.bs.select');
                        }
                            break;
                        case 'toggleDisabled': {
                           toggleDisabled($select);
                        }
                            break;
                        case 'setDisabled': {
                           setDisabled($select, param);
                        }
                            break;
                        case 'refresh': {
                            refresh($select);
                            trigger($select, 'refresh.bs.select');
                        }
                            break;
                    }
                }

                return $select;
            });
        };

        document.addEventListener("DOMContentLoaded", () => {
            $('[data-bs-toggle="select"],[data-toggle="select"]').bsSelect();
        });
    }
    (jQuery)
);
