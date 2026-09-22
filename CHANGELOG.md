# Changelog

All important changes to this project are documented in this file.

## [dev-main]

## [2.1.40] - 2026-09-22

### Changed
- `selectAll` and `selectNone` now leave disabled options unchanged, including options in disabled optgroups.
- `selectAllOnInit` excludes disabled options, including options in disabled optgroups.
- Disabled `optgroup`s are now recognized consistently in the dropdown UI and group selection controls.
- `selectFirst` and `selectLast` now skip disabled options.
- Demo redesigned as a fixed-navigation options showcase with live examples, alphabetically sorted option names, and English explanations.
- README now documents the existing `setItemsDisabled` method, including `value`, `enableOther`, and `setSelected`.
- Corrected README documentation for `showMultipleCheckboxes` and the default value of `showSelectionAsList`.
- `formatItem`, `formatSelectedText`, and `getSelectedText` now work with options without an explicit `value` attribute.
- `animatedMenu` now reveals `dropup` menus from the bottom.
- Demo now presents `search` and `animatedMenu` as separate option rows, each with one live setting select.
- Demo `showActionMenu` now uses a single-valued setting select and a separate multi-select target.
- Demo `showMultipleCheckboxes` now uses a single-valued setting select and a separate multi-select target.
- Demo `showSelectionAsList` now uses a single-valued setting select and a separate multi-select target.
- Demo `showSubtext` now uses real option subtexts in its setting select.
- Demo now presents `formatItem`, `formatSelectedText`, `menuClass`, and `menuInnerClass` in separate option rows.
- Demo navigation now mirrors the actual section order and labels.
- `menuInnerClass` demo choices now describe concrete spacing and surface variants.
- `setItemsDisabled` now emits `setItemsDisabled.bs.select` and emits `change.bs.select` when it changes selected values.

### Fixed
- Tab navigation in open dropdowns no longer focuses the empty option wrapper before the first selectable item.
- Disabled dropdown items are excluded from the tab order.

## [2.1.38] - 2026-05-26

### Added
- New option `nullable` (default `true`) to control whether single-selects can be empty.
- Demo now includes both single-select variants: `nullable: true` and `nullable: false`.

### Changed
- For single-selects with `nullable: false`, initialization and `val(null)` now keep/select the first selectable option.
- `selectNone` on single-select respects `nullable` and does not clear when `nullable: false`.
- README documents that `btnEmptyText` is only shown for single-selects when `nullable` is `true`.

### Fixed
- Single-select with `nullable: false`: clicking the currently selected dropdown item no longer deselects it.
- Added tests for nullable default behavior, non-nullable fallback behavior, and non-nullable active-item click behavior.

### Tests
- Expanded `test/tests.js` coverage across core methods (`selectAll`, `selectNone`, `selectFirst`, `selectLast`, `setVisible`, `toggleVisibility`, `setDisabled`, `toggleDisabled`, `setItemsDisabled`, `updateOptions`, `setBtnClass`, `getSelectedText`, `clear`, `refresh`, `destroy`).
- Added event coverage for `clear.bs.select`, `refresh.bs.select`, `update.bs.select`, `destroy.bs.select`, `acceptChange.bs.select`, `cancelChange.bs.select`, `any.bs.select`, `keydown.bs.select`, and proxied Bootstrap lifecycle events (`show/shown/hide/hidden`).

## [2.1.37] - 2026-05-26

### Added
- Search now also matches `optgroup` titles.
- If an `optgroup` title matches the search term, all options of that group are shown.
- Demo page now includes a dedicated "Search By Group Title" example (location -> projects).

### Fixed
- Search now also matches option `subtext` values in addition to the visible option text.
- Dropdown menu and search field now respect viewport width on mobile devices to prevent horizontal overflow.

## [2.1.36] - 2026-05-06

### Added
- Added additional European locale files: `cs-CZ`, `da-DK`, `el-GR`, `en-GB`, `es-ES`, `fi-FI`, `fr-FR`, `hu-HU`, `it-IT`, `nb-NO`, `nl-NL`, `pl-PL`, `pt-PT`, `ro-RO`, `sk-SK`, and `sv-SE`.

### Changed
- README now documents the available locale files.

## [2.1.35] - 2026-05-05

### Added
- New option `selectAllOnInit`: If enabled on a multi-select, all options are selected during initialization.

## [2.1.34] - 2026-05-05

### Fixed
- Bootstrap 4: Dropdown no longer closes when toggling an `optgroup` checkbox in multi-select mode (`autoClose: true|outside`).

## [2.1.33] - 2026-05-04

### Added
- New option `animatedMenu`: Animates bsSelect dropdown menus when they open.

### Changed
- Dropdown menu animation now uses the Web Animations API without additional CSS.
- Animation uses `clip-path` and `opacity` so Bootstrap/Popper positioning is not overwritten.
- README option table updated for `animatedMenu`.

## [2.1.30] - 2025-12-23

### Added
- New option `searchQuery`: Allows a fixed search prefix in the search field.
- New method `search`: Programmatic filtering of the list.
- Bootstrap `input-group` integration for predefined search terms.
- Minimum width for the search field (150px/250px) for better usability.
- New test cases for search and predefined filters.

### Changed
- The layout of the toolbar (search field and close button) has been optimized for better alignment.
- `doSearch` logic refactored to process prefixes and user input consistently.
- Search field behavior when closing the dropdown: Now resets to `searchQuery` or empties the field correctly.

### Fixed
- Fixed `ReferenceError: setup is not defined` in method calls.
- Fixed issue where spaces in search were automatically removed.
- Layout correction: Close button and search field are now correctly in one line (d-flex).
- Added padding for the close button.

## [2.1.29.1] - 2025-07-25
- Initial status before the current extensions.
