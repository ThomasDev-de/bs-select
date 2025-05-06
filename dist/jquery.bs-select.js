/**
 * **************************************************
 *                     bsSelect
 * **************************************************
 *
 * @file jquery.bs-select.js
 * @author Thomas Kirsch
 * @license MIT
 * @version 2.1.24
 * @date 2025-04-24
 * @desc This script defines a Bootstrap dropdown select plugin that's customizable with various options/settings.
 * It extends off jQuery ($) and adds its plugin methods / properties to $.bsSelect.
 * @fileOverview README.md
 * @repository https://github.com/ThomasDev-de/bs-select (bsSelect)
 *
 * Dependencies:
 * ---------------
 * - jQuery (https://jquery.com/)
 * - Bootstrap (https://getbootstrap.com/)
 * - Bootstrap Icons (https://icons.getbootstrap.com/)
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
                btnClass: 'btn-outline-dark',
                btnWidth: 'fit-content',
                btnEmptyText: translations.btnEmptyText,
                btnSplit: false,
                dropDirection: null,
                dropIconClass: 'bi bi-chevron-down',
                menuClass: null,
                menuHeaderClass: 'text-bg-secondary text-uppercase',
                menuInnerClass: null,
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
                formatSelectedText(title, subtext) {
                    // Check whether subtext is empty and set accordingly
                    subtext = isValueEmpty(subtext) ? '' : `<small class="text-muted">${subtext}</small>`;

                    // Return the formatted HTML string
                    return `<div class="d-flex flex-column align-items-start">
                                <span>${title}</span>
                                    ${subtext}
                            </div>`;
                },
                formatItem($optionElement, optionText, dataSubtext) {
                    // Check whether subtext is empty and set accordingly
                    dataSubtext = isValueEmpty(dataSubtext) ? '' : `<small class="text-muted">${dataSubtext}</small>`;

                    // Return the formatted HTML string
                    return `<div class="d-flex flex-column align-items-start">
                                <span>${optionText}</span>
                                    ${dataSubtext}
                            </div>`;
                },
                deselectAllText: translations.deselectAllText,
                selectAllText: translations.selectAllText,
                checkedIcon: "bi bi-check-lg",
                debug: false,
                debugElement: null,
                menuItemClass: null,
                searchText: translations.searchText,
                onBeforeChange: null,
                onKeyDown: null,
                value: undefined
            }
        };

        /**
         * Triggers the specified event on the given select element.
         *
         * @param {$} $select - The select element to trigger the event on.
         * @param {string} event - The name of the event to trigger.
         * @param {array} addParams - Additional trigger parameters.
         */
        function trigger($select, event, addParams = []) {
            // Initialize an array to hold the event parameters
            let params = [];

            // If the event is not 'any.bs.select'
            if (event !== 'any.bs.select') {
                // Trigger the 'any.bs.select' event first
                trigger($select, 'any.bs.select');

                // Add any additional parameters to the params array
                if (addParams.length) {
                    addParams.forEach(p => {
                        params.push(p);
                    });
                }
                // Trigger the specified event with the parameters
                $select.trigger(event, params);
            } else {
                // If the event is 'any.bs.select', trigger it directly without parameters
                $select.trigger(event);
            }

            // Get the plugin settings
            const settings = $select.data('options');

            // If debug mode is enabled
            if (settings.debug) {
                // Log the triggered event and its parameters to the console
                console.log('trigger', event, params);

                // If a debug element is specified
                if (settings.debugElement !== null) {
                    // Convert the parameters to a string
                    const paramsString = params.length ? JSON.stringify(params) : null;
                    // Create a log message element
                    const log = $('<small>', {
                        class: 'js-log border-bottom',
                        html: '[' + new Date().toUTCString() + '] trigger <span class="text-warning">' + event + '</span> fired. Params: ' + paramsString
                    }).prependTo(settings.debugElement);

                    // Remove the log message after 5 seconds
                    setTimeout(function () {
                        log.remove();
                    }, 5000);
                }
            }
        }

        /**
         * Fetches the dropdown that is superordinate to the select.
         * @param {$} $select - The select element.
         * @returns {$} - The dropdown element.
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
            // Get the dropdown element that contains the select
            const $dropdown = getDropDown($select);
            // If the dropdown element exists
            if ($dropdown.length) {
                // Use the Bootstrap dropdown('show') method to open the dropdown
                $dropdown.dropdown('show');
            }
        }

        /**
         * Closes the dropdown that is superordinate to the select.
         *
         * @param {jQuery} $select - The select element.
         */
        function hide($select) {
            // Get the dropdown element that contains the select
            const $dropdown = getDropDown($select);
            // If the dropdown exists
            if ($dropdown.length) {
                // Use the Bootstrap dropdown('hide') method to close the dropdown.
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
        function getSelectedValuesFromDropdown($select) {
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
                // Get the value of the corresponding option element in the select element based on
                // the data-index attribute of the dropdown item
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
            // Get the plugin's settings from the select element's data
            const settings = $select.data('options');

            // Log the current value if debug mode is enabled
            if (settings.debug) {
                console.log('bsSelect:setSelectValues', $select.val());
            }

            // Get the currently selected values from the dropdown
            let values = getSelectedValuesFromDropdown($select);

            // Set the value of the original select element to the retrieved values.
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
            // Get the dropdown element
            const dropdown = getDropDown($select);
            // Store the values before the change
            const beforeValues = $select.val();
            // Get all the options within the select element
            const options = $select.find('option');
            // Get the settings for the bs-select plugin
            const settings = $select.data('options');
            // Check if multiple selections are allowed
            const multiple = false !== $select.prop('multiple');
            // Set the 'selected' property of all options to the given state (true for select all, false for deselect all)
            options.prop('selected', state);
            // Determine whether to toggle the check icon (for multiple selections with checkboxes)
            const toggleCheckIcon = multiple && settings.showMultipleCheckboxes;
            // Get the inner scrolling element of the dropdown menu
            const $dropdownMenuInner = dropdown.find('.js-menu-dropdown-inner');

            // Iterate through each option
            options.each(function (i) {
                // Find the corresponding dropdown item element
                const $item = dropdown.find('.dropdown-item[data-index="' + i + '"]');
                // If selecting all
                if (state) {
                    // Add the 'active' class to the dropdown item (visually indicates selection)
                    $item.addClass('active');
                    // Show the select icon within the dropdown item
                    $item.find('.dropdown-item-select-icon').show();
                } else {
                    // If deselecting all, remove the 'active' class and hide the icon
                    $item.removeClass('active');
                    $item.find('.dropdown-item-select-icon').hide();
                }
            });

            dropdown.find('[data-role="optgroup"] [type="checkbox"]').prop('checked', state);

            // If using checkboxes for multiple selections
            if (toggleCheckIcon) {
                // Update the checkbox icons to reflect the selection state
                dropdown.find('.dropdown-item:not(.active) .js-icon-checklist.bi-check-square').removeClass('bi-check-square').addClass('bi-square');
                dropdown.find('.dropdown-item.active .js-icon-checklist.bi-square').removeClass('bi-square').addClass('bi-check-square');
            }

            // Update the selected values in the original select element
            setSelectValues($select);
            // Update the title of the dropdown to reflect the current selection
            setDropdownTitle($select);
            // Scroll to the top of the dropdown menu
            $dropdownMenuInner.scrollTop(0);
            // Determine the event name ('selectAll' or 'selectNone')
            const ev = state ? 'selectAll' : 'selectNone';
            // Trigger the corresponding event
            trigger($select, ev + '.bs.select');
            // Get the values after the change
            const afterValues = getSelectedValuesFromDropdown($select);
            // If the values have changed, trigger the 'change' event
            if (hasValueChanged(beforeValues, afterValues)) {
                trigger($select, 'change.bs.select', [beforeValues, afterValues]);
            }
        }

        /**
         * Retrieves the major version of Bootstrap being used by extracting the main version number from the Bootstrap modal plugin.
         *
         * @return {number|undefined} The major version number of Bootstrap if available, or undefined if the Bootstrap modal plugin is not accessible.
         */
        function getBootstrapMajorVersion() {
            if (typeof $.fn.modal === 'undefined' || typeof $.fn.modal.Constructor === 'undefined') {
                console.error('Bootstrap Modal Plugin ist nicht verfügbar');
                return;
            }

            const bootstrapVersion = $.fn.modal.Constructor.VERSION;
            // Extrahieren der Hauptversionsnummer
            return parseInt(bootstrapVersion.split('.')[0]);
        }

        /**
         * Initializes the event listeners and functionality for a custom dropdown menu connected to a select element.
         * The function facilitates search, selection, and interaction within the dropdown, while maintaining synchronization
         * with the associated select element's state. It also supports Bootstrap-specific dropdown behaviors.
         *
         * @param {jQuery} $dropdown - jQuery object representing the dropdown container.
         * @param {jQuery} selectElement - jQuery object representing the associated HTML select element.
         * @param {boolean} multiple - Indicates whether the dropdown supports multiple selections.
         * @return {void} Does not return any value, modifies the DOM state and interacts with the dropdown's functionality.
         */
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
                .on('change', '[data-role="optgroup"] [type="checkbox"]', function (e) {
                    const checked = $(e.currentTarget).is(':checked');
                    const groupIndex = $(e.currentTarget).closest('[data-role="optgroup"]').data('ogIndex');

                    const options = $dropdown.find('[data-role="option"][data-og-index="' + groupIndex + '"]');
                    toggleSelectedItem($dropdown, selectElement, multiple, options, checked).then(() => {
                        //
                    });
                })
                .on('click', '.dropdown-item', function (e) {
                    e.preventDefault();
                    const settings = selectElement.data('options');
                    const item = $(e.currentTarget);
                    const active = item.hasClass('active');
                    toggleSelectedItem($dropdown, selectElement, multiple, item, !active)
                        .then(() => {
                            if (BS_V === 4 && multiple && (autoclose === "true" || autoclose === "outside")) {
                                e.stopPropagation();
                            }
                        });
                    // if (onBeforeChange(selectElement)) {
                    //
                    //     const beforeValues = selectElement.val();
                    //     item.toggleClass('active');
                    //     const active = item.hasClass('active');
                    //     if (!multiple) {
                    //
                    //         $dropdown
                    //             .find('.dropdown-item.active')
                    //             .not(item)
                    //             .removeClass('active');
                    //     }
                    //     const toggleCheckIcon = multiple && settings.showMultipleCheckboxes;
                    //
                    //     if (active) {
                    //         if (toggleCheckIcon) {
                    //             item
                    //                 .find('.js-icon-checklist')
                    //                 .removeClass('bi-square')
                    //                 .addClass('bi-check-square');
                    //         }
                    //
                    //         item.find('.dropdown-item-select-icon').show();
                    //     } else {
                    //         if (toggleCheckIcon) {
                    //             item
                    //                 .find('.js-icon-checklist')
                    //                 .removeClass('bi-check-square')
                    //                 .addClass('bi-square');
                    //         }
                    //
                    //         item.find('.dropdown-item-select-icon').hide();
                    //     }
                    //
                    //     setSelectValues(selectElement);
                    //     const afterValues = getSelectedValuesFromDropdown(selectElement);
                    //     setDropdownTitle(selectElement);
                    //     if (hasValueChanged(beforeValues, afterValues)) {
                    //         trigger(selectElement, 'change.bs.select', [beforeValues, afterValues]);
                    //     }
                    //
                    //     // Check the condition and make sure it is not closed if:
                    //     // Boostrap 4 & autoclose
                    //

                    // }
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
                    // Vorhandener Code
                    const $select = $dropdown.find('select');
                    trigger($select, 'shown.bs.select');
                    const searchElement = $dropdown.find('[type="search"]');
                    if (searchElement.length) {
                        searchElement.focus();
                    }

                    const $dropdownMenuInner = $dropdown.find('.js-menu-dropdown-inner');
                    const $activeItem = $dropdown.find('.dropdown-item.active:first');

                    if ($activeItem.length) {
                        $dropdownMenuInner.scrollTop($dropdownMenuInner.scrollTop() + $activeItem.position().top - $dropdownMenuInner.position().top);
                    } else {
                        $dropdownMenuInner.scrollTop(0);
                    }
                });
        }

        function toggleSelectedItem($dropdown, selectElement, multiple, items, setActive) {
            const settings = selectElement.data('options');
            const toggleCheckIcon = multiple && settings.showMultipleCheckboxes;
            return new Promise((resolve, reject) => {
                if (onBeforeChange(selectElement)) {

                    const beforeValues = selectElement.val();
                    if (setActive) {
                        items.not('.active').addClass('active');
                    } else {
                        items.removeClass('active');
                    }

                    if (!multiple) {
                        $dropdown
                            .find('.dropdown-item.active')
                            .not(items)
                            .removeClass('active');
                    }

                    if (setActive) {
                        if (toggleCheckIcon) {
                            items
                                .find('.js-icon-checklist.bi-square')
                                .removeClass('bi-square')
                                .addClass('bi-check-square');
                        }

                        items.find('.dropdown-item-select-icon').show();
                    } else {
                        if (toggleCheckIcon) {
                            items
                                .find('.js-icon-checklist.bi-check-square')
                                .removeClass('bi-check-square')
                                .addClass('bi-square');
                        }

                        items.find('.dropdown-item-select-icon').hide();
                    }

                    setSelectValues(selectElement);
                    const afterValues = getSelectedValuesFromDropdown(selectElement);
                    setDropdownTitle(selectElement);
                    if (hasValueChanged(beforeValues, afterValues)) {
                        trigger(selectElement, 'change.bs.select', [beforeValues, afterValues]);
                    }
                    resolve();
                }
            })

        }

        /**
         * Compares two arrays for equality by checking if they contain the same elements,
         * regardless of order, and without modifying the original arrays.
         *
         * @param {Array} arr1 - The first array to be compared.
         * @param {Array} arr2 - The second array to be compared.
         * @return {boolean} Returns true if both arrays contain the same elements, otherwise false.
         */
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

        /**
         * Determines if a value has changed by comparing the initial value with the current value.
         * It supports comparison of primitive types, arrays, and objects.
         *
         * @param {*} valueBefore The value before the change occurred. Can be a primitive, array, or object.
         * @param {*} currentValue The current value to be compared with the initial value. Can be a primitive, array, or object.
         * @return {boolean} Returns true if the values differ, false otherwise.
         */
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
         * @param {boolean} fireTrigger - (Optional) Whether to fire the trigger event. Default is false.
         *
         * @return {$} - The initialized dropdown menu.
         */
        function init($select, fireTrigger = false) {
            // Retrieve the settings for this specific select element.
            const settings = $select.data('options');

            // If debugging is enabled, log the initial value of the select element.
            if (settings.debug) {
                console.log('bsSelect:init with value:', $select.val());
            }

            // Attempt to retrieve a pre-existing dropdown wrapper for this select element.
            let $dropdown = getDropDown($select);

            // If a dropdown wrapper already exists, it means the plugin has already been initialized for this element.
            // In this case, simply return the existing dropdown wrapper.
            if ($dropdown.length) {
                return $dropdown;
            }

            // Determine if multiple selections are allowed for this select element.
            const multiple = $select.prop('multiple');
            // Check if the original select element is disabled using jQuery's is() method.
            const isDisabled = $select.is(':disabled');
            // Check if the select element is disabled using either the 'disabled' class or the 'disabled' attribute.
            const isSelectDisabled = $select.hasClass('disabled') || $select.is('[disabled]');

            // If the select element does not allow multiple selections and no value is currently selected,
            // reset the selectedIndex property to -1 to ensure no option is selected by default.
            if (!multiple && isValueEmpty($select.val())) {
                $select.prop("selectedIndex", -1);
            }

            // Determine the initial selected value. If fireTrigger is true and a value is provided in the settings,
            // use that value. Otherwise, use the value currently selected in the native select element.
            let selectedValue = (fireTrigger && typeof settings.value !== 'undefined') ? settings.value : $select.val();

            // If the select element allows multiple selections and the provided selectedValue is not an array,
            // convert it into an array to ensure compatibility with the plugin's internal logic.
            if (multiple && !Array.isArray(selectedValue)) {
                selectedValue = [selectedValue];
            }

            // Create a new div element to serve as the dropdown wrapper and insert it after the original select element.
            // The wrapper is assigned the classes 'js-bs-select-dropdown' and 'position-relative'.
            $dropdown = $('<div>', {
                class: `${WRAPPER_CLASS} position-relative`,
                css: {
                    width: settings.btnWidth // Set the width of the dropdown based on the provided settings.
                }
            }).insertAfter($select);

            // If a dropDirection is specified in the settings, add the corresponding class to the dropdown wrapper.
            if (settings.dropDirection !== null) {
                $dropdown.addClass(settings.dropDirection);
            }

            // Determine the class for the toggle icon. If no custom icon class is provided, use 'dropdown-toggle'.
            const toggleIconClass = settings.dropIconClass === null ? 'dropdown-toggle' : '';
            // Create the HTML for the dropdown icon, using the specified icon class if available.
            const dropIcon = settings.dropIconClass !== null ? `<i class="ms-2 ml-2 ${settings.dropIconClass}"></i>` : '';

            // Add the dropdown toggle button. The implementation differs depending on whether the dropdown is split or not.
            if (!settings.btnSplit) {
                // If btnSplit is false, create a single button that acts as both the dropdown toggle and displays the selected value(s).
                $('<button>', {
                    class: `btn ${settings.btnClass} ${toggleIconClass} d-flex flex-nowrap align-items-start flex-nowrap js-dropdown-header justify-content-between`, // Apply Bootstrap classes, the toggle icon class, and custom classes for styling and selection.
                    type: 'button',  // Set the button type to "button" to prevent form submission.
                    disabled: isDisabled, // Set the disabled state of the button to match the original select element.
                    'data-bs-toggle': 'dropdown', // Add the data attribute required for Bootstrap's dropdown functionality.  This is for Bootstrap 5.
                    'data-toggle': 'dropdown',  // Add the data attribute required for Bootstrap's dropdown functionality. This is for Bootstrap 4.
                    'aria-expanded': false, // Set the aria-expanded attribute to "false" initially, as the dropdown starts closed.
                    'data-bs-auto-close': multiple ? 'outside' : true, // Configure the dropdown's auto-close behavior. If multiple selections are allowed, close only when clicking outside. Otherwise, close when clicking anywhere.
                    html: `<div class="js-selected-text">${settings.btnEmptyText}</div>${dropIcon}`, // Set the HTML content of the button, including the placeholder text and the dropdown icon.
                    css: {
                        width: settings.btnWidth // Set the width of the button according to the settings.
                    }
                }).appendTo($dropdown); // Append the created button to the dropdown wrapper.
            } else {
                // If btnSplit is true, create a split button group, where one button displays the selected value(s) and another button triggers the dropdown.
                $dropdown.addClass('btn-group'); // Add the 'btn-group' class to the dropdown wrapper to create a button group.

                // Create the button that displays the selected value(s).
                $('<button>', {
                    class: `btn ${settings.btnClass} d-flex flex-nowrap align-items-start js-dropdown-header justify-content-between`, // Apply Bootstrap classes and custom classes for styling and selection.
                    type: 'button', // Set the button type to "button".
                    disabled: isDisabled,  // Set the disabled state to match the original select element.
                    html: `<div class="js-selected-text">${settings.btnEmptyText}</div>`, // Set the HTML content, including the placeholder text.
                    css: {
                        width: settings.btnWidth // Set the width according to the settings.
                    }
                }).appendTo($dropdown); // Append the button to the dropdown wrapper.


                // Create the button that triggers the dropdown.
                $('<button>', {
                    class: `btn ${settings.btnClass} dropdown-toggle dropdown-toggle-split`, // Apply Bootstrap classes for the split toggle button.
                    'data-bs-toggle': 'dropdown', // Add the data attribute for Bootstrap 5 dropdown functionality.
                    'data-toggle': 'dropdown',  // Add the data attribute for Bootstrap 4 dropdown functionality.
                    'aria-expanded': false, // Set aria-expanded to "false".
                    'data-bs-auto-close': multiple ? 'outside' : true // Set auto-close behavior similar to the non-split button.
                }).appendTo($dropdown); // Append the toggle button to the dropdown wrapper.
            }

            // Apply a fix for overflow issues that may occur when the dropdown is placed inside a Bootstrap table with fixed height.
            const isDropDownInBootstrapTable = $dropdown.closest('.fixed-table-body:not(.overflow-visible)').length;
            if (isDropDownInBootstrapTable) {
                // If the dropdown is inside a fixed-height table, add the 'overflow-visible' class to its parent to prevent clipping.
                $dropdown
                    .closest('.fixed-table-body')
                    .addClass('overflow-visible');
            }

            // Set up the dropdown menu and its event listeners.
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

            const menuInnerClasses = ['js-menu-dropdown-inner'];

            if (settings.menuInnerClass) {
                menuInnerClasses.push(settings.menuInnerClass);
            }
            ;
            const $dropdownMenuInner = $(`<div>`, {
                class: menuInnerClasses.join(' '),
                css: {
                    overflowY: 'auto',
                    maxHeight: `${settings.menuMaxHeight}px`
                }
            }).appendTo($dropdownMenu);

            $dropdownMenu
                .find('[type="search"]')
                .prop("autocomplete", "off");

            let i = 0;
            let optGrpIndex = -1;
            let inOGroup = false;
            const validElements = $select.find('optgroup, option');

            validElements.each(function (index, option) {
                const element = $(option);
                const isOptGroup = element.is("optgroup");
                if (isOptGroup) {
                    optGrpIndex++;
                    const headerHTML = [
                        '<div class="d-flex flex-nowrap align-items-center justify-content-between w-100">',
                        `<strong>${element.attr('label')}</strong>`,
                        '</div>',
                    ].join('')
                    // I am an option group
                    const dropdownHeader = $('<h6>', {
                        'data-role': 'optgroup',
                        'data-og-index': optGrpIndex,
                        class: `dropdown-header mb-0 my-0 w-100 rounded-0 py-1 ${settings.menuHeaderClass}`,
                        html: headerHTML
                    }).appendTo($dropdownMenuInner);

                    if (multiple) {
                        $('<input>', {
                            type: 'checkbox',
                            class: 'm-0'
                        }).appendTo(dropdownHeader.find('.d-flex:first'));
                    }
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
                        // String conversion for comparison
                        isSelected = selectedValue.some(item => String(item) === String(value));
                        selected = isSelected ? 'active' : '';
                    } else {
                        // String conversion for comparison
                        isSelected = String(selectedValue) === String(value);
                        selected = isSelected ? 'active' : '';
                    }
                }

                const showAndHasSubtext = settings.showSubtext && element.data('subtext');
                const showCheckList = multiple && settings.showMultipleCheckboxes;
                const showIcon = element.data('icon');
                const $subtext = showAndHasSubtext ? `<small class="text-muted">${element.data('subtext')}</small>` : '';
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

                const $drowDownItemWrapper = $('<div>', {
                    tabindex: i,
                    class: classList,
                }).appendTo($dropdownMenuInner);

                const $dropDownItem = $('<a>', {
                    href: '#',
                    'data-role': 'option',
                    'data-og-index': optGrpIndex,
                    'data-index': i,
                    class: `dropdown-item ${selected} ${disabledClass} px-2 d-flex flex-nowrap align-items-center ${itemClass} `,
                    css: {
                        cursor: 'pointer'
                    },
                    html: [
                        `${checkElement}${$icon}`,
                        `<div class="${paddingLeftClass} d-flex flex-column">`,
                        settings.formatItem(element, element.text(), element.data('subtext') || null),
                        `</div>`,
                        `<div class="dropdown-item-select-icon pl-1 ps-1 ml-auto ms-auto ">${checkElementPre}</div>`
                    ].join('')
                }).appendTo($drowDownItemWrapper)

                inOGroup = inOptGroup;
                i++;
            });

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

            setSelectValues($select);
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
         * Returns the HTML string for a checklist icon, based on the provided selection state.
         *
         * @param {boolean} isSelected True if the icon should be checked, false otherwise.
         * @returns {string} The HTML string representing the checklist icon.
         */
        function getCheckListIcon(isSelected) {
            // If isSelected is true, return the HTML for a checked icon ("bi-check-square").
            // Otherwise, return the HTML for an unchecked icon ("bi-square").
            // Both icons include Bootstrap Icon classes and custom classes for styling and functionality.
            return isSelected ? `<i class="bi bi-check-square mr-2 me-2 js-icon-checklist"></i>` : `<i class="bi bi-square me-2 mr-2 js-icon-checklist"></i>`;
        }

        /**
         * Sets the title of the bsSelect dropdown button based on the selected values.
         *
         * @param {jQuery} $select The jQuery object representing the select element.
         */
        function setDropdownTitle($select) {
            // Retrieve the plugin settings.
            const settings = $select.data('options');
            // Get the dropdown wrapper element.
            const $dropdown = getDropDown($select);
            // Find the element within the dropdown that displays the title text.
            const $titleElement = $dropdown.find('.js-dropdown-header .js-selected-text');
            // Get the currently selected values from the select element.
            let selectedValues = $select.val();
            // Check if any values are selected.
            const isEmpty = isValueEmpty(selectedValues);

            let title2;
            let subtext2 = null;
            let tooltip = "";

            // If no values are selected, set the title to the default empty text.
            if (isEmpty) {
                title2 = settings.btnEmptyText;
            } else {
                // If values are selected, handle the title display based on whether it's a multiple or single select.
                if (Array.isArray(selectedValues)) {
                    // Multiple select:
                    if (selectedValues.length === 1) {
                        // Only one option is selected, so display its text and subtext (if available).
                        let $option = $select.find(`option[value="${selectedValues[0]}"]`);
                        subtext2 = settings.showSubtext && $option.data('subtext') ? $option.data('subtext') : null;
                        title2 = $option.text();
                        tooltip = $option.text();
                    } else {
                        // Multiple options are selected.
                        if (!settings.showSelectionAsList) {
                            // Display the number of selected items.
                            let length = $select.find('option').length;
                            title2 = settings.showSelectedText(selectedValues.length, length);

                            // Construct the tooltip text by concatenating the text of each selected option.
                            let tooltips = [];
                            selectedValues.forEach(val => {
                                let $option = $select.find(`option[value="${val}"]`);
                                tooltips.push($option.text());
                            });
                            tooltip += tooltips.join(',');
                        } else {
                            // Display the selected options as a list.
                            let texts2 = [];
                            let subtexts2 = [];
                            let tooltips = [];
                            selectedValues.forEach(val => {
                                let $option = $select.find(`option[value="${val}"]`);
                                let hasSubtext = settings.showSubtext && $option.data('subtext');
                                subtexts2.push(hasSubtext ? $option.data('subtext') : null);
                                texts2.push($option.text());
                                tooltips.push($option.text());
                            });
                            title2 = texts2;
                            subtext2 = subtexts2;
                            tooltip += tooltips.join(',');
                        }
                    }
                } else {
                    // Single select: Display the selected option's text and subtext (if available).
                    let $option = $select.find(`option[value="${selectedValues}"]`);
                    if ($option.hasClass('d-none')) {
                        // If the selected option is hidden, display the default empty text.
                        title2 = settings.btnEmptyText;
                    } else {
                        let hasSubtexts = settings.showSubtext && $option.data('subtext');
                        subtext2 = hasSubtexts ? $option.data('subtext') : null;
                        title2 = $option.text();
                        tooltip = $option.text();
                    }
                }
            }

            // Set the HTML content of the title element using the formatted title and subtext.
            $titleElement.html(formateSelectedText(settings, title2, subtext2));

            // Set the tooltip attribute of the title element.
            $titleElement.attr('title', tooltip);
        }

        /**
         * Formats the selected text for display in the bsSelect dropdown button.
         * This function handles both single and multiple selections, as well as optional subtext.
         *
         * @param {Object} settings The plugin settings.
         * @param {string|Array} title The main title text(s) to display. Can be a string or an array of strings.
         * @param {string|Array|null} [subtext=null] The optional subtext(s) to display. Can be a string, an array of strings, or null.
         * @returns {string} The formatted HTML string representing the selected text.
         */
        function formateSelectedText(settings, title, subtext = null) {
            // Check if the title is an array (indicating multiple selections).
            if (Array.isArray(title) && title.length > 0) {
                // If the title is an array, iterate over each title element.
                let returnString = '';
                for (let i = 0; i < title.length; i++) {
                    // If the subtext is also an array, use the corresponding subtext element for the current title.
                    // Otherwise, use the provided subtext (or null if not provided).
                    const sub = Array.isArray(subtext) && subtext.length > i ? subtext[i] : null;

                    // Recursively call the formateSelectedText function for each title/subtext pair
                    // and concatenate the results into the returnString.
                    returnString += formateSelectedText(settings, title[i], sub);
                }
                // Return the combined formatted string for all selected items.
                return returnString;
            }

            // If the title is not an array (indicating a single selection or the recursive call for a single item in a multiple selection),
            // call the user-defined formatSelectedText function from the settings and return the result.
            return settings.formatSelectedText(title, subtext);
        }


        /**
         * Updates the visual state of the dropdown menu based on the selected values
         *
         * @param {jQuery} $select - The jQuery object representing the select element
         *
         * @*/
        /**
         * Updates the dropdown menu's visual state to reflect the currently selected values in the associated select element.
         *
         * @param {jQuery} $select The jQuery object representing the select element.
         */
        function val($select) {
            // Retrieve the dropdown wrapper element associated with the select element.
            const $dropdown = getDropDown($select);

            // Remove the 'active' class from all dropdown items to clear any previous selections.
            $dropdown.find('.dropdown-item.active').removeClass('active');
            // Uncheck all checked icons by removing the 'bi-check-square' class and adding the 'bi-square' class.
            $dropdown.find('.dropdown-item .js-icon-checklist.bi-check-square').removeClass('bi-check-square').addClass('bi-square');

            // Temporarily remove the 'disabled' class from disabled dropdown items to allow for proper styling updates.
            const disabledDropdownIcons = $dropdown.find('.dropdown-item.disabled');
            disabledDropdownIcons.removeClass('disabled');

            // Get the currently selected values from the select element.
            let values = $select.val();

            // If the selected values are not already an array (e.g., in a single-select scenario), convert them into an array.
            if (!Array.isArray(values)) {
                values = [values];
            }

            // Iterate over each selected value.
            values.forEach(value => {
                // Find the index of the corresponding option element within the select element.
                let index = $select.find(`option[value="${value}"]`).index();

                // Find the corresponding dropdown item using its data-index attribute.
                const item = $dropdown.find(`.dropdown-item[data-index="${index}"]`);

                // Add the 'active' class to the dropdown item to visually mark it as selected.
                item.addClass('active');
            });

            // For active items, check their icons by removing 'bi-square' and adding 'bi-check-square'.
            $dropdown.find('.dropdown-item.active .js-icon-checklist.bi-square').removeClass('bi-square').addClass('bi-check-square');

            // Update the actual select element's values based on the active dropdown items.
            setSelectValues($select);
            // Update the dropdown title to reflect the current selection.
            setDropdownTitle($select);

            // Re-add the 'disabled' class to the previously disabled dropdown items.
            disabledDropdownIcons.addClass('disabled');
        }

        /**
         * Destroys the bsSelect dropdown associated with a given select element, restoring the original select element.
         *
         * @param {jQuery} $select The jQuery object representing the select element.
         * @param {boolean} show Whether to show the original select element after destroying the dropdown.
         * @param {boolean} [clearData=false] Whether to remove the plugin's data associated with the select element.
         */
        function destroy($select, show, clearData = false) {
            // Retrieve the plugin settings associated with the select element.
            const settings = $select.data('options');

            // If debugging is enabled, log a message indicating the destruction process.
            if (settings.debug) {
                console.log('bsSelect:destroy');
            }

            // Store the current value of the select element before destroying the dropdown.
            let val = $select.val();

            // If debugging is enabled, log the value of the select element before destruction.
            if (settings.debug) {
                console.log('bsSelect:destroy value before: ', val);
            }

            // Retrieve the dropdown wrapper element associated with the select element.
            let $dropdown = getDropDown($select);

            // Move the original select element back to its original position in the DOM, before the dropdown wrapper.
            $select.insertBefore($dropdown);

            // Restore the original value of the select element.
            $select.val(val);

            // If debugging is enabled, log the value of the select element after restoration.
            if (settings.debug) {
                console.log('bsSelect:destroy value after: ', $select.val());
            }

            // If clearData is true, remove the plugin's data associated with the select element.
            if (clearData) {
                $select.removeData('options');
            }

            // Remove the dropdown wrapper element from the DOM.
            $dropdown.remove();

            // If show is true, restore the original select element's visibility and dimensions.
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
         * Refreshes the bsSelect dropdown for a given select element by destroying and re-initializing the plugin.
         *
         * @param {jQuery} $select The jQuery object representing the select element to refresh.
         */
        function refresh($select) {
            // Destroy the existing bsSelect dropdown, without showing the original select element and without clearing the plugin data.
            destroy($select, false, false);
            // Re-initialize the bsSelect dropdown for the select element, without triggering the init event.
            init($select, false);
        }

        /**
         * Toggles the disabled state of the bsSelect dropdown button associated with the provided select element.
         *
         * @param {jQuery} $select The jQuery object representing the select element.
         */
        function toggleDisabled($select) {
            // Determine the new disabled state by inverting the current disabled state of the select element.
            const status = !$select.is(':disabled');
            // Set the disabled state of the dropdown using the determined status.
            setDisabled($select, status);
        }

        /**
         * Sets the disabled state of the bsSelect dropdown menu.
         *
         * @param {jQuery} $select The jQuery object representing the select element associated with the dropdown.
         * @param {boolean} status True to disable the dropdown, false to enable it.
         */
        function setDisabled($select, status) {
            // Retrieve the dropdown wrapper element.
            const dropDown = getDropDown($select);
            // Find the dropdown toggle button within the wrapper.  This selector handles both Bootstrap 4 and Bootstrap 5 data attributes.
            const btn = dropDown.find('[data-bs-toggle="dropdown"],[data-toggle="dropdown"]');

            if (status) {
                // If the dropdown should be disabled:
                // Add the 'disabled' class to the toggle button for visual indication.
                btn.addClass('disabled');
                // Hide the dropdown menu.
                hide($select);
            } else {
                // If the dropdown should be enabled:
                // Remove the 'disabled' class from the toggle button.
                btn.removeClass('disabled');
            }

            // Set the 'disabled' property of the toggle button to reflect the desired state.
            btn.prop('disabled', status);
            // Set the 'disabled' property of the original select element to synchronize its state with the dropdown.
            $select.prop('disabled', status);

            // Trigger a custom 'toggleDisabled.bs.select' event to notify other parts of the plugin about the state change.
            trigger($select, 'toggleDisabled.bs.select', [status]);
        }

        /**
         * Disables specific items (options) within a select element and optionally sets their selected state.
         *
         * @param {jQuery} $select The jQuery object representing the select element.
         * @param {Object} object An object containing configuration options:
         *   - {Array|string} value: The value(s) of the options to disable. Can be a string or an array of strings.
         *   - {boolean} [enableOther=false]: If true, enables all options before disabling the specified ones.
         *   - {boolean|null} [setSelected=null]: If true or false, sets the 'selected' property of the disabled options accordingly.
         */
        function setItemsDisabled($select, object) {
            // Check if the provided argument is an object.  If not, the function does nothing.
            if (typeof object === 'object') {

                // Ensure the 'value' property exists in the object. If not, initialize it as an empty array.
                if (!object.hasOwnProperty('value')) {
                    object.value = [];
                }

                // Ensure the 'enableOther' property exists in the object. If not, default it to false.
                if (!object.hasOwnProperty('enableOther')) {
                    object.enableOther = false;
                }

                // Ensure the 'setSelected' property exists in the object. If not, default it to null.
                if (!object.hasOwnProperty('setSelected')) {
                    object.setSelected = null;
                }

                // If the 'value' property is not an array, convert it into an array.
                if (!Array.isArray(object.value)) {
                    object.value = [object.value];
                }

                // Destroy the existing bsSelect dropdown to manipulate the original select element directly.
                destroy($select, false, false);

                // If 'enableOther' is true, enable all options within the select element.
                if (object.enableOther) {
                    $select.find('option').prop('disabled', false);
                }

                // Iterate over the provided values to disable.
                object.value.forEach(val => {
                    // Find the option element corresponding to the current value.
                    const option = $select.find(`option[value="${val}"]`);

                    // If 'setSelected' is provided (true or false), set the 'selected' property of the option accordingly.
                    if (object.setSelected !== null) {
                        option.prop('selected', object.setSelected);
                    }

                    // Disable the current option element.
                    option.prop('disabled', true);
                });

                // Re-initialize the bsSelect dropdown after modifying the original select element.
                init($select, false);
            }
        }

        /**
         * Executes the `onBeforeChange` callback function, if defined in the plugin settings.
         * This function allows custom logic to be executed before a change event occurs.
         *
         * @param {jQuery} $select The jQuery object representing the select element.
         * @returns {boolean} True if the change is allowed (or if no callback is defined), false otherwise.
         */
        function onBeforeChange($select) {
            // Retrieve the plugin settings for the select element.
            const settings = $select.data('options');

            // Check if an 'onBeforeChange' callback function is defined in the settings.
            if (typeof settings.onBeforeChange === 'function') {
                // If the callback exists, execute it and store the returned value.
                const ok = settings.onBeforeChange($select);

                // If the callback returns true (or any truthy value), trigger the 'acceptChange.bs.select' event.
                if (ok) {
                    trigger($select, 'acceptChange.bs.select');
                } else {
                    // If the callback returns false (or any falsy value), trigger the 'cancelChange.bs.select' event.
                    trigger($select, 'cancelChange.bs.select');
                }

                // Return the value returned by the callback function.
                return ok;
            }

            // If no 'onBeforeChange' callback is defined, return true to allow the change.
            return true;
        }

        function hasOptions($select) {
            return $select.data('options') !== undefined;
        }

        /**
         * jQuery plugin for creating Bootstrap style select dropdowns.
         *
         * @namespace bsSelect
         * @param {object|string|null|undefined} options - The plugin options.
         * @param {null|object|int|string|float|boolean|array} param - The method values.
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
            const $elements = $(this);
            let callFunction = typeof options === 'string';
            let optionsSet = typeof options === 'object';

            return $elements.each(function (index, select) {
                const $select = $(select);
                // before methods call
                const beforeValues = $select.val();
                if (optionsSet) {
                    let setup;
                    // If options are already set, merge them with the new options
                    if (hasOptions($select)) {
                        setup = $.extend({}, $.bsSelect.DEFAULTS, $select.data('options'), options);
                    } else {
                        // Otherwise merge them with the defaults
                        setup = $.extend({}, $.bsSelect.DEFAULTS, options);
                    }

                    $select.data('options', setup);
                } else if (!hasOptions($select)) {
                    // If no options were passed and none can be found in the select, use the defaults
                    $select.data('options', $.bsSelect.DEFAULTS);
                }

                // Options should definitely be set in the select here.
                init($select, true);

                // Checks if the function should be called
                if (callFunction) {
                    // Uses a switch statement to determine which function to call based on the 'options' parameter
                    switch (options) {
                        // Case for getting selected text
                        case 'getSelectedText': {
                            // Variable to store the result
                            let result;
                            // Get the selected value
                            const value = $select.val();
                            // Check if the value is empty
                            if (isValueEmpty(value)) {
                                // If empty, set the result to an empty string
                                result = "";
                            } else {
                                // If not empty, check if multiple values are selected
                                const multiple = $select.prop('multiple');

                                // If multiple values are selected, create an array of selected texts
                                if (multiple && Array.isArray(value)) {
                                    const texts = [];
                                    value.forEach(val => {
                                        texts.push($select.find('[value="' + val + '"]').text());
                                    });
                                    result = texts.join(', ');
                                } else if (typeof value === 'string') {
                                    // If a single value is selected as a string, get the text for it
                                    result = $select.find('[value="' + value + '"]').text();
                                } else {
                                    // Otherwise set the result to an empty string
                                    result = '';
                                }
                            }
                            // if param is a function, pass result and value to function
                            if (typeof param === 'function') {
                                param(result, value);
                            }
                        }
                            break;
                        // handles selecting all options
                        case 'selectAll': {
                            // calls onBeforeChange, proceeds if it returns true
                            if (onBeforeChange($select)) {
                                toggleAllItemsState($select, true);
                            }
                        }
                            break;
                        // handles deselecting all options
                        case 'selectNone': {
                            // Check if onBeforeChange allows the operation
                            if (onBeforeChange($select)) {
                                toggleAllItemsState($select, false);
                            }
                        }
                            break;
                        // handles selecting first option
                        case 'selectFirst': {
                            // Check if onBeforeChange allows the change
                            if (onBeforeChange($select)) {
                                // Set the value to null and deselect all options initially
                                $select.val(null);
                                $select.find('option').prop('selected', false);
                                // Select the first option
                                $select.find('option:first').prop('selected', true);
                                // Update the plugin's internal state
                                val($select);
                                // Get values after the change
                                const afterValues = getSelectedValuesFromDropdown($select);
                                // Trigger a 'change' event if the value has changed
                                if (hasValueChanged(beforeValues, afterValues)) {
                                    trigger($select, 'change.bs.select', [beforeValues, afterValues]);
                                }
                                // Trigger 'selectFirst' event with the newly set value
                                trigger($select, 'selectFirst.bs.select', [afterValues]);
                            }
                        }
                            break;

                        // handles clearing the select
                        case 'clear': {
                            // sets value to null
                            $select.val(null);
                            // removes all options and optgroups
                            $select.find('option,optgroup').remove();
                            // refreshes the select element
                            refresh($select);
                            // triggers clear event
                            trigger($select, 'clear.bs.select');
                        }
                            break;
                        // handles selecting the last option
                        case 'selectLast': {
                            // checks if change is allowed by onBeforeChange
                            if (onBeforeChange($select)) {
                                // Clear selection and set last option as selected
                                $select.val(null);
                                $select.find('option').prop('selected', false);
                                $select.find('option:last').prop('selected', true);
                                val($select);
                                // Determine the newly set value
                                const afterValues = getSelectedValuesFromDropdown($select);
                                // Trigger the change event if the value has changed
                                if (hasValueChanged(beforeValues, afterValues)) {
                                    trigger($select, 'change.bs.select', [beforeValues, afterValues]);
                                }
                                // trigger selectLast event
                                trigger($select, 'selectLast.bs.select', [afterValues]);
                            }
                        }
                            break;
                        // Case for hiding the select element
                        case 'hide': {
                            hide($select);
                        }
                            break;
                        // Case for showing the select element
                        case 'show': {
                            show($select);
                        }
                            break;
                        // Case for setting the value of the select element
                        case 'val': {
                            if (onBeforeChange($select)) {
                                // Set the value to the native select element
                                $select.val(param);
                                // Update the plugin's internal state
                                val($select);
                                // Determine the newly set value
                                const afterValues = getSelectedValuesFromDropdown($select);
                                // Trigger the change event if the value has changed
                                if (hasValueChanged(beforeValues, afterValues)) {
                                    trigger($select, 'change.bs.select', [beforeValues, afterValues]);
                                }
                            }
                        }
                            break;
                        // Case for destroying the select element
                        case 'destroy': {
                            // triggers destroy event
                            trigger($select, 'destroy.bs.select');
                            // destroy select element
                            destroy($select, true, param);
                        }
                            break;
                        // Case for updating the options of the select element
                        case 'updateOptions': {
                            $select.data('options', $.extend({}, $.bsSelect.DEFAULTS, $select.data('options'), param || {}));
                            refresh($select);
                            trigger($select, 'update.bs.select');
                        }
                            break;
                        // Case for setting the button class of the select element
                        case 'setBtnClass': {
                            $select.data('options', $.extend({}, $.bsSelect.DEFAULTS, $select.data('options'), {btnClass: param}));
                            refresh($select);
                            trigger($select, 'update.bs.select');
                        }
                            break;
                        // Case for toggling the disabled state of the select element
                        case 'toggleDisabled': {
                            toggleDisabled($select);
                        }
                            break;
                        // Case for setting the disabled state of the select element
                        case 'setDisabled': {
                            setDisabled($select, param);
                        }
                            break;
                        // Case for setting the disabled state of the select items
                        case 'setItemsDisabled': {
                            setItemsDisabled($select, param);
                        }
                            break;
                        // Case for refreshing the select element
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
    }(jQuery)
);
