# Phase 08 - v1.0

## Goals

- [x] Bug fixing from [Phase 07 - v1.0](./phase-07.md)
- [x] Image ordering implementation.
- [x] Image resizing.

## Mobile

### Bug Fix

- Upload images from gallery is fine. But not directly from Camera.
- Popup modal box Cancel button switch to "X" sign icon button.
  - Show "X" sign icon below the images and not so big because the space is very tight.
- Show ordering message below form label.

### Features

- Able to sort uploaded image orders by dragging in create and edit form.
- Image remove button switch to "X" sign icon button.
- Gallery image resizing using `expo-image-manipulator` library.

## API

### Features

- Need to add `sort_order` column in `images` table.
- For ordering, smallest order come first to show.

## Footer Notes

- Used model: GPT-6.2 Astra Light
