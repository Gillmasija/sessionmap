# Verification — 2026-11-21

## Results

- `node --test tests/*.test.js`: 8 passed, 0 failed.
- `node scripts/lint.mjs`: passed; 16 files checked for JS syntax, conflict markers,
  trailing whitespace and required HTML metadata/asset links. This is a focused checker,
  not ESLint or a full accessibility audit.
- `node scripts/build.mjs`: passed; 9 static public assets copied to dist.
- `npm run test:e2e`: 9 passed, 0 failed, on installed Edge against dist.
- `git diff --check`: passed.
- Desktop 1280px, mobile 390px and 320px: all three pages have no horizontal document overflow.
- Screenshots: desktop.png, mobile.png and print.png, generated from synthetic demo data.

## Browser acceptance evidence

1. Save a 23:45 session; add two 20-minute activities to a 30-minute target. Shows
   10 minutes over target and correct next-day end times.
2. Move the second activity earlier, edit it to 10 minutes, render HTML-looking notes
   literally, cancel then confirm deletion, reload, and verify persisted facilitator notes.
3. Export JSON, reject invalid/oversized JSON without data loss, cancel a restore,
   accept a valid restore, and recover after a deliberately corrupted localStorage value.
4. Simulate a quota exception: show a save error, retain the input, leave storage unchanged.
5. Open two tabs: a stale save is rejected after the other tab saves a new title.
6. Keyboard Tab reaches the skip link; the editor shortcut focuses Activity name.
7. Print-media check hides navigation and controls and keeps the sheet visible.

Visual review found the mobile form too far below a long agenda, so a prominent
editor shortcut was added and keyboard-tested. Print review removed the decorative
page intro and enlarged the session title. Final screenshots reflect those fixes.

## Limits

Print CSS was inspected in emulated print media, not on physical paper or paginated
PDF. No Safari/Firefox, screen-reader audit or live hosting test is claimed.
GitHub CI runs the same checks with Chromium; consult the PR Checks tab for the
latest revision's result. There is no hosted demo until a deployment is configured.
