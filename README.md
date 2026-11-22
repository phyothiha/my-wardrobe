# README

## Project Structure

### Source view

```
my-wardrobe
  backend/ (Laravel)
  docs/ (Necessary documents)
  mobile/ (Expo)
  README.md
```

### Tree view

[tree.nathanfriend.com](https://tree.nathanfriend.com)

```
.
└── my-wardrobe/
    ├── backend/ (Laravel)
    ├── docs/ (Necessary documents)
    ├── mobile/ (Expo)
    └── README.md
```

## Prompting

Example prompt for new chat session.

> Read README.md, docs/releases/v1.0.md, and docs/implementations/v1.0/phase-01.md, then implement the Phase 01 Expo UI prototype in mobile/. Let me create, edit, and delete brands, categories, and wardrobe items using the fields, sizes, and image limit in the release spec. Start each session with sample data, keep changes in memory, and restore the samples when the app restarts. Choose the colors and fonts within the documented constraints. Run the available checks, tell me what you verified, and give me the steps to try it in Expo Go on Android.

## Database

When implementing or bug fixing, switch laravel environment `DB_DATABASE` value to `wardrobe`. Sometime, I would manually change it to `wardrobe_prod`, which contain actual data, to use myself, and I don't want to delete it when doing database prune command like `php artisan migrate:fresh`.
