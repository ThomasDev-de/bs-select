// noinspection JSUnresolvedReference

(function ($) {
        const WRAPPER_CLASS = 'js-bs-select-dropdown';

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
                btnEmptyText: 'Please select..',
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
                showSelectedText: function (count, total) {
                    return count + ' of ' + total + ' selected';
                },
                deselectAllText: 'Deselect All',
                selectAllText: 'Select All',
                checkedIcon: "bi bi-check-lg",
                debug: false,
                debugElement: null,
                menuItemClass: null,
                searchText: "Search..",
                onBeforeChange: null
            }
        };

        /**
         *
         * @param $select
         * @param {string} event
         */
        function trigger($select, event) {
            let params = [];
            if (event !== 'any.bs.select') {
                trigger($select, 'any.bs.select');
                params.push($select.val());
                $select.trigger(event, params);
            }else{
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
         * @param $select
         * @returns {*}
         */
        function getDropDown($select) {
            return $select.closest(`.${WRAPPER_CLASS}`);
        }

        /**
         * Opens the dropdown which is superordinate to the select.
         * @param $select
         */
        function show($select) {
            const $dropdown = getDropDown($select);
            if ($dropdown.length) {
                $dropdown.dropdown('show');
            }
        }

        /**
         * Closes the dropdown that is superordinate to the select.
         * @param $select
         */
        function hide($select) {
            const $dropdown = getDropDown($select);
            if ($dropdown.length) {
                $dropdown.dropdown('hide');
            }
        }

        function setSelectValues($select) {
            const $dropdown = getDropDown($select);
            const multiple = $select.prop('multiple');
            let values = [];

            $dropdown.find('.dropdown-item:not(.active)').find('.dropdown-item-select-icon').hide();

            $dropdown.find('.dropdown-item.active').each(function (i, element) {
                let val = $select.find('option:eq(' + $(element).data('index') + ')').prop('value');
                if (val !== false) {
                    values.push(val);
                    $(element).find('.dropdown-item-select-icon').show();
                }
            });

            // update select
            if (multiple) {
                $select.val(values);
            } else if (values.length) {
                $select.val(values[0]);
            } else {
                $select.val(null);
            }
        }

        function toggleAllItemsState($select, state = false) {
            const dropdown = getDropDown($select);
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

            if (toggleCheckIcon)
            {
                dropdown.find('.dropdown-item:not(.active) .js-icon-checklist.bi-check-square').removeClass('bi-check-square').addClass('bi-square');
                dropdown.find('.dropdown-item.active .js-icon-checklist.bi-square').removeClass('bi-square').addClass('bi-check-square');
            }

            setDropdownTitle($select);
            setSelectValues($select);
            const ev = state ? 'selectAll' : 'selectNone';
            trigger($select, ev + '.bs.select');
            trigger($select, 'change.bs.select');
            // trigger($select, 'change');
        }

        function init($select, fireTrigger = false) {
            let $dropdown = getDropDown($select);

            if ($dropdown.length) {
                return $dropdown;
            }


            const settings = $select.data('options');
            const multiple = $select.prop('multiple');

            if (!multiple && !$select.find('option[selected]').length)
                $select.prop("selectedIndex", -1);

            let selectedValue = $select.val();

            $dropdown = $('<div>', {
                class: `${WRAPPER_CLASS}`,
                css: {
                    width: settings.btnWidth
                }
            }).insertAfter($select);

            if (settings.dropDirection !== null) {
                $dropdown.addClass(settings.dropDirection);
            }

            const toggleIconClass = settings.dropIconClass === null ? 'dropdown-toggle' : '';
            const dropIcon = settings.dropIconClass !== null ? `<i class="ms-2 ${settings.dropIconClass}"></i>` : '';
            // add dropdown toggle item
            if (!settings.btnSplit) {


                $('<button>', {
                    class: `btn ${settings.btnClass} ${toggleIconClass} d-flex align-items-center flex-nowrap js-dropdown-header justify-content-between`,
                    type: 'button',
                    'data-bs-toggle': 'dropdown',
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
                    'aria-expanded': false,
                    'data-bs-auto-close': multiple ? 'outside' : true
                }).appendTo($dropdown);
            }


            // fix overflow, when dropdown is inside bootstrap-table
            const isDropDownInBootstrapTable = $dropdown.closest('.fixed-table-body:not(.overflow-visible)').length;
            if (isDropDownInBootstrapTable) {
                $dropdown
                    .closest('.fixed-table-body')
                    .addClass('overflow-visible');
            }

            // add events
            $dropdown
                .on('hide.bs.dropdown', function () {
                    trigger($select, 'hide.bs.select');
                })
                .on('hidden.bs.dropdown', function () {
                    trigger($select, 'hidden.bs.select');
                })
                .on('show.bs.dropdown', function () {
                    trigger($select, 'show.bs.select');
                })
                .on('shown.bs.dropdown', function () {
                    trigger($select, 'shown.bs.select');
                    const searchElement = getDropDown($select).find('[type="search"]');
                    if (searchElement.length) {
                        searchElement.focus()
                    }
                });

            $select.appendTo($dropdown);
            $select.val(selectedValue);
            $select.hide();

            const $dropdownMenu = $('<div>', {
                class: 'dropdown-menu ps-1 '+settings.menuClass
            }).appendTo($dropdown);

            let searchInput = '';
            let closeButton = '';
            let actionMenu = '';
            if (true === settings.search) {
                searchInput = `<input type="search" autocomplete="off" class="form-control form-control-sm me-auto" placeholder="${settings.searchText}">`;
            }

            if (multiple) {
                // closeButton = `<button type="button" class="btn-close ms-2" data-bs-dismiss="dropdown" aria-label="Close"></button>`;
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
                    }).appendTo($dropdownMenuInner)
                    return;
                }
                // I am an option element
                const classList = element.get(0).className.trim();
                const value = element.prop('value');
                const inOptGroup = element.closest('optgroup').length !== 0;
                const isDisabled = element.prop('disabled');
                const disabledClass = isDisabled ? 'disabled' : '';

                if (!value || value === "") {
                    // Ignore options without value
                    return;
                }

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
                const paddingLeftClass = inOptGroup || $icon !== '' ? 'ps-2' : '';

                let checkElement = '';
                let checkElementPre = "";
                if (showCheckList){
                    checkElement = getCheckListIcon(isSelected);
                }
                else{
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
                    html: `<div class="dropdown-item ${selected} ${disabledClass} px-2 d-flex flex-nowrap align-items-center ${itemClass} " data-index="${i}" style="cursor: pointer;">${checkElement}${$icon}<div class="${paddingLeftClass} d-flex flex-column"><div>${element.text()}</div>${$subtext}</div><div class="dropdown-item-select-icon ps-1 ms-auto ">${checkElementPre}</div></div>`
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

            $dropdown
                .on('click', '.js-select-select-all', function (e) {
                    e.preventDefault();
                    if (onBeforeChange($select)) {
                        toggleAllItemsState($select, true);
                    }
                })
                .on('click', '.js-select-select-none', function (e) {
                    e.preventDefault();
                    if (onBeforeChange($select)) {
                        toggleAllItemsState($select, false);
                    }
                })
                .on('hidden.bs.dropdown', function () {
                    // empty search field if exists
                    let searchField = $(this).find('[type="search"]');
                    if (searchField.length) {
                        searchField.val(null).trigger('keyup');
                    }
                })
                .on('keyup input', '[type="search"]', function () {
                    const searchPattern = $(this).val().trim();
                    const searchElements = $dropdown.find('[data-index]');
                    if (searchPattern !== '') {
                        searchElements.each(function (index, value) {

                            let currentName = $(value).text().trim();
                            if (currentName.toUpperCase().indexOf(searchPattern.toUpperCase()) > -1) {
                                $(value).removeClass('d-none');
                            } else {
                                $(value).addClass('d-none');
                            }
                        });
                    } else {
                        searchElements.removeClass('d-none');
                    }
                })
                .on('click', '[data-bs-dismiss="dropdown"]', function (e) {
                    const btn = $(e.currentTarget);
                    const dd = btn.closest('.' + WRAPPER_CLASS);
                    dd.find('[data-bs-toggle="dropdown"]').dropdown('hide');
                })
                .on('click', '.dropdown-item', function (e) {
                    e.preventDefault();
                    if (onBeforeChange($select)) {
                        const item = $(e.currentTarget);

                        if (!multiple) {
                            $dropdown
                                .find('.dropdown-item.active')
                                .not(item)
                                .removeClass('active');
                        }

                        item.toggleClass('active');

                        const active = $(e.currentTarget).hasClass('active');
                        const toggleCheckIcon = multiple && settings.showMultipleCheckboxes;

                        if (active) {
                            if (toggleCheckIcon){
                                item.find('.js-icon-checklist').removeClass('bi-square').addClass('bi-check-square');
                            }
                            item.find('.dropdown-item-select-icon').show();
                        }
                        else {
                            if (toggleCheckIcon){
                                item.find('.js-icon-checklist').removeClass('bi-check-square').addClass('bi-square');
                            }
                            item.find('.dropdown-item-select-icon').hide();
                        }

                        setSelectValues($select);
                        setDropdownTitle($select);
                        trigger($select, 'change.bs.select');
                    }
                });

            setDropdownTitle($select);

            if (fireTrigger) {
                setTimeout(function(){
                    trigger($select, 'init.bs.select');
                },0)

            }
            return $dropdown;
        }

        function getCheckListIcon(isSelected)
        {
            return isSelected ? `<i class="bi bi-check-square me-2 js-icon-checklist"></i>` : `<i class="bi bi-square me-2 js-icon-checklist"></i>`
        }

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

                        title = `<span>${$icon}${$option.text()}</span><small class="text-muted ms-2">${$subtext}</small>`;
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

                                texts.push(`<div><span>${$icon}${$option.text()}</span><small class="text-muted ms-2">${$subtext}</small></div>`);
                                tooltips.push($option.text());
                            })
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
                            `<small class="text-muted ms-2">${$option.data('subtext')}`
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

        function val($select) {
            const settings = $select.data('options');
            const multiple = false !== $select.prop('multiple');
            const $dropdown = getDropDown($select);
            $dropdown.find('.dropdown-item.active').removeClass('active');
            $dropdown.find('.dropdown-item .js-icon-checklist.bi-check-square').removeClass('bi-check-square').addClass('bi-square');
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
            trigger($select, 'change.bs.select');
            setDropdownTitle($select);
        }

        function destroy($select, show, clearData = false) {
            let val = $select.val();
            let $dropdown = getDropDown($select);
            $select.insertBefore($dropdown);
            $select.val(val);
            if (clearData) {
                $select.removeData('options');
            }
            $dropdown.remove();
            if (show)
                $select.show();
        }

        function refresh($select) {
            destroy($select, false, false);
            init($select, false);
        }

        /**
         *
         * @param $select
         * @return {*|boolean|boolean}
         */
        function onBeforeChange($select){
            const settings = $select.data('options');
            if(typeof settings.onBeforeChange === 'function') {
                const ok = settings.onBeforeChange();
                if (ok) {
                    trigger($select, 'acceptChange.bs.select');
                } else {
                    trigger($select, 'cancelChange.bs.select');
                }
                return ok;
            }
            return true;
        }

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
                                // refresh($select);
                                // trigger($select, 'change.bs.select');
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

        $('[data-bs-toggle="select"]').bsSelect();

    }
    (jQuery)
);
