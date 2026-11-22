# Phase 02 - v1.0

## Goals

- [ ] UI fix and improvement.

## Mobile

### Input

- Validation error should be red for input label, input border, and error message.
- Validation message should show below related input box.
- Mandatory field marked with "\*" and remove (optional) keyword for field that don't required.

### Alert message

- Title and description should be meaningful.

### Category and Brand

- Will show all records.
- Records will search by name.
- Show assigned product counts beside name. Examples below
  - Tops (5) (Note: 5 is where this category has 5 items assigned)
  - Bottoms (Note: do not show 0)
- Disable delete record button where there are products assigned.

### Item

- Change collection tab that say _Items_ to _Clothes_ and individual record like _Add Cloth_.
- Size, Brand, and Category field should use _Combobox_ because those lists will be too many in the future.
  - The input show "Select" and the user have to select explicity.
  - Only single select.
- Add Advanced toggle button and when toggle it will display optional fields as defined in [Release - v1.0](../../releases/v1.0.md).

## Footer Notes

- Used model: GPT-6.2 Astra Light
