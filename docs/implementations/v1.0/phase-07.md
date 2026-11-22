# Phase 07 - v1.0

## Goals

- [x] Connect between frontend and backend service.
- [x] Implement dedicated api search route.
- [x] Mobile UI adjustments.

## Technical Requirements

### General

- In [Phase 02 - v1.0](./phase-02.md), I did mentioned to disable delete button where items have been assigned to the record. In this phase, there will be two things.
  - You cannot edit the default ones.
  - When deleting the created ones, show alert box that will say all items that has been assigned will be set to default ones.

### Mobile

- Add loading state for data fetching and processing.
- Show Toast for success or error message.
- Infinite scroll data fetching on listing page.
- Show only 10 records in combobox and searching will call search api endpoints.
- Use debounce library on search text.
- Hide Edit button for default ones for Brands and Categories.
- In Cloth listing card, beside Active/Inactive badge, show how many images has been added. For example 1/5.

### API

- Use `GET /api/v1/{resource}` to browse records and `GET /api/v1/{resource}/search` to search or filter them. This applies to `brands`, `categories`, and `clothes`.
- Pass field-specific criteria as `filter[field]=value`. Reserve `q` for future multi-field text search and omit it from the v1 API.
- Brands and categories support `filter[name]` as a case-insensitive partial match.
  - Example: `GET /api/v1/brands/search?filter[name]=uni`
- Clothes support exact matches on `filter[brand_id]`, `filter[category_id]`, `filter[size]`, and `filter[is_active]`. Combine supplied filters with AND.
  - Example: `GET /api/v1/clothes/search?filter[size]=M&filter[is_active]=0`
  - Omit `filter[is_active]` to include both statuses. Use `0` for inactive and `1` for active.
- Browse and search use the same [Phase 06 - v1.0](./phase-06.md) ordering and 10 records per page. Pass `page` as a top-level query parameter and keep the active filters when requesting the next page.

## Footer Notes

- Used model: GPT-6.2 Astra Light
