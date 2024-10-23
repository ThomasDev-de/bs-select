
`$.fn.bsSelect`

This jQuery plugin converts a simple select element into a bootstrap dropdown element. It offers numerous options,
methods and events for further processing.
It was developed on the basis of jQuery 3.6, Bootstrap 5.3 and Bootstrap icons.

## table of contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Methods](#methods)
- [Events](#events)

## Requirements

- bootstrap 4 or 5
- jQuery

## Installation

Download and include the script at the end of the body tag.

```html
<script src="dist/locale/de-DE.min.js" type="text/javascript"><!-- optional -->
<script src="dist/jquery.bs-select.js" type="text/javascript">
```

or install with **composer** and include the script at the end of the body tag.

```shell
composer require webcito/bs-select
```

```html
<script src="/vendor/webcito/bs-select/dist/locale/de-DE.min.js" type="text/javascript"> <!-- optional -->
<script src="/vendor/webcito/bs-select/dist/jquery.bs-select.min.js" type="text/javascript">
```

## Set global defaults

```js
// multiple options
$.bsSelect.setDefaults(options);
// get default options
$.bsSelect.getDefaults();
```

## Usage

All selects with the attribute `[data-bs-toggle="select"]` or `[data-toggle="select"]` are initialized automatically.

```html
<!-- Simple selection -->
<select name="countries">
    <option value="Germany">Deutschland</option>
    <option value="Poland">Polen</option>
    ...
</select>

<!-- Or multiSelection -->
<select name="cities" multiple>
    <option value="1">Berlin rocks</option>
    <option value="2">New York</option>
    ...
</select>

<!-- Or with option groups -->
<select name="cities2" multiple>
    <optgroup label="Germany">
        <option value="1">Berlin</option>
        <option value="2">Munich</option>
    </optgroup>
    <optgroup label="USA">
        <option value="3">New York</option>
        <option value="4">San Francisco</option>
    </optgroup>
    <optgroup label="Spain">
        <option value="5">Barcelona</option>
        <option value="6">Madrid</option>
    </optgroup>
    ...
</select>
<!-- load jQuery and Bootstrap before -->
<script src="dist/jquery.bs-select.js" type="text/javascript">
    <script>
        $('select').bsSelect();
</script>
```

## option[data-attributes]

| data-attribute | example                                                          | description                                                              |
|----------------|------------------------------------------------------------------|--------------------------------------------------------------------------|
| data-subtext   | `<option data-subtext="Germany" value="1">Berlin</option>`       | Adds a small additional text section                                     |
| data-icon      | `<option data-icon="fa-solid fa-city" value="1">Berlin</option>` | Adds an icon in front of the option. (e.g. a class from Bootstrap Icons) |

## Options

| property               | data-attribute                | type             | default                             | desc                                                                                                                                                                                                                              |
|------------------------|-------------------------------|------------------|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| search                 | [data-search]                 | `bool`           | `true`                              | *adds a search function to the menu*                                                                                                                                                                                              |
| searchText             | [data-search-text]            | `string`         | `Search..`                          | "Placeholder for search input box*                                                                                                                                                                                                |
| btnWidth               | [data-btn-width]              | `string`         | `fit-content`                       | *the css width of the dropdown button*                                                                                                                                                                                            |
| btnEmptyText           | [data-btn-empty-text]         | `string`         | `Please select..`                   | *The text at no selection*                                                                                                                                                                                                        |
| btnSplit               | [data-btn-split]              | `string`         | `false`                             | *create a split button dropdown* [bootstrap Split button](https://getbootstrap.com/docs/5.3/components/dropdowns/#split-button)                                                                                                   |
| btnClass               | [data-btn-class]              | `string`         | `btn-outline-secondary`             | *The classes assigned to the dropdown button*                                                                                                                                                                                     |
| dropDirection          | [data-drop-direction]         | `null\|string`   | `null`                              | *opens the DropDown in a desired direction. Possible directions are:* `dropup\|dropend\|dropstart\|dropdown-center\|dropup-center` see [bootstrap directions](https://getbootstrap.com/docs/5.3/components/dropdowns/#directions) |
| dropIconClass          | [data-drop-icon-class]        | `null\|string`   | `bi bi-chevron-down`                | *If an icon is set here, the dropdown toggle icon is replaced with it. This only works if btnSplit is false.*                                                                                                                     |
| menuHeaderClass        | [data-menu-header-class]      | `string`         | `text-bg-secondary text-uppercase`  | *If option groups are present, the background class of the heading is set here.*                                                                                                                                                  |
| menuItemClass          | [data-menu-item-class]        | `string`         | `null`                              | *The classes are added to the element `.dropdown-item`.*                                                                                                                                                                          |
| menuMaxHeight          | [data-menu-max-height]        | `number`         | `300`                               | *maximum Height of the dropdown list before it starts scrolling.*                                                                                                                                                                 |
| menuPreHtml            | [data-menu-pre-html]          | `null\|string`   | `null`                              | *shows a text in the menu before the selection*                                                                                                                                                                                   |
| menuAppendHtml         | [data-menu-append-html]       | `null\|string`   | `null`                              | *shows the text in the menu after the selection*                                                                                                                                                                                  |
| showSubtext            | [data-show-subtext]           | `bool`           | `true`                              | *If this option is true, options have the data attribute data-subtext, the subtext will be displayed in the dropdown.*                                                                                                            |
| showActionMenu         | [data-show-action-menu]       | `bool`           | `true`                              | *If it is a multiple selection and this option is true, two buttons are displayed above the selection for faster selection.*                                                                                                      |
| showMultipleCheckboxes | [data-show-action-menu]       | `bool`           | `false`                             | *If this option is true, a checkbox is displayed in front of each option instead of the check icon.*                                                                                                                              |
| actionMenuBtnClass     | [data-action-menu-btn-class]  | `string`         | `btn-light`                         | *The classnames for the buttons in the action menu.*                                                                                                                                                                              |
| showSelectionAsList    | [data-show-selection-as-list] | `bool`           | `true`                              | *If it is a multiple selection, all selections should be listed below each other. If the value is false, it will show how much was selected.*                                                                                     |
| showSelectedText       |                               | `function`       | `(selectedItems, totalItems) => {}` | *If it is a multiple selection and the selected elements are greater than 1, this function is called. This function is ignored if the showSelectionAsList option is true.*                                                        |
| deselectAllText        | [data-deselect-all-text]      | `string`         | `Deselect All`                      | *If showActionMenu is true, the language of the two buttons can be set here.*                                                                                                                                                     |
| selectAllText          | [data-select-all-text]        | `string`         | `Select All`                        | *If showActionMenu is true, the language of the two buttons can be set here.*                                                                                                                                                     |
| checkedIcon            | [data-checked-icon]           | `string`         | `bi bi-check-lg`                    | *Class used to style the select icon.*                                                                                                                                                                                            |
| onBeforeChange         |                               | `null\|function` | `($select) => { return true; }`     | *This function is called before the values are changed. If the function returns true, the change is made, otherwise nothing is changed.*                                                                                          |
| onKeyDown              |                               | `null\|function` | `($select, keyEvent) => { // }`     | *Called when the pressed key is not a dropdown command (arrowUp,arrowDown,ESCAPE)*                                                                                                                                                |

## Methods

Methods are called as follows

```js
$('select').bsSelect('method', param);
```

| method            | example                                                                       | description                                                                                                               |
|-------------------|-------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------|
| `'show'`          | `$('select').bsSelect('show');`                                               | Opens the dropdown                                                                                                        |
| `'hide'`          | `$('select').bsSelect('hide');`                                               | Closes the dropdown                                                                                                       | 
| `'val'`           | `$('select').bsSelect('val', 1);`                                             | Changes the value of the select                                                                                           | 
| `'selectAll'`     | `$('select').bsSelect('selectAll');`                                          | Selects all values                                                                                                        | 
| `'selectNone'`    | `$('select').bsSelect('selectNone');`                                         | deselects all values                                                                                                      | 
| `'updateOptions'` | `$('select').bsSelect('updateOptions', {buttonClass: 'btn btn-danger',...});` | Changes the options of the dropdown.                                                                                      |
| `'refresh'`       | `$('select').bsSelect('refresh');`                                            | Rebuild the dropdown. This is useful if the options are changed via Javascript.                                           |
| `'destroy'`       | `$('select').bsSelect('destroy'[, true]);`                                    | Deletes the dropdown and restores the original select. If parameter is passed true, all data is removed from the element. |

## Events

| event type             | Description                                                                                         |
|------------------------|-----------------------------------------------------------------------------------------------------|
| init.bs.select         | Fires when the plugin has been initialised.                                                         |
| hide.bs.select         | Fires immediately when the hide instance method has been called.                                    |
| hidden.bs.select       | Fired when the dropdown has finished being hidden from the user and CSS transitions have completed. |
| show.bs.select         | Fires immediately when the show instance method is called.                                          |
| shown.bs.select        | Fired when the dropdown has been made visible to the user and CSS transitions have completed.       |
| refresh.bs.select      | Fires when the `refresh` method has been invoked.                                                   |
| change.bs.select       | Fires when the method `val` has been called.                                                        |
| acceptChange.bs.select | If the function onBeforeChange returns true, this event is fired.                                   |
| cancelChange.bs.select | If the function onBeforeChange returns false, this event is fired.                                  |
| update.bs.select       | Fires when the method `updateOptions` was called.                                                   |
| destroy.bs.select      | Fires when the `destroy` method has been activated.                                                 |
| selectAll.bs.select    | Fires when the select all option has been pressed.                                                  |
| selectNone.bs.select   | Fires when the select none option has been pressed.                                                 |
| any.bs.select          | Fires at every event.                                                                               |
| keydown.bs.select      | Fires when the pressed key is not a dropdown command (arrowUp,arrowDown,ESCAPE)                     |
