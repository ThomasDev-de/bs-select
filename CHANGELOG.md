# Changelog

All important changes to this project are documented in this file.

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
