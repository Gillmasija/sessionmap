# SessionMap project brief

## User and problem
Workshop facilitators and educators need a realistic running order before a session. Spreadsheets make cumulative timing and last-minute reordering awkward.

## Scope and stack
Three static pages: overview/session details, agenda editor, facilitator sheet. Plain HTML/CSS/JavaScript, Node built-in test runner, no runtime dependencies. One session per browser; explicit saves to localStorage; JSON backup and validated replacement import. No account, backend, AI, calendar integration or real participant data.

## Skills demonstrated
Accessible frontend forms, responsive layouts, immutable data validation, cumulative time arithmetic, failure handling, automated boundary tests and GitHub CI.

## Design decisions
Light blue/ink identity, clear navigation, labeled timing summaries, keyboard reorder buttons. Use integer minutes and local clock times; show next-day markers. Underfilled and overfilled agendas are explicit; timing is planned, not a live timer. Imported files are bounded and validated before any overwrite.

## Acceptance criteria
- [ ] Create and persist session title, start time and 5–480 minute target.
- [ ] Add/edit/remove/reorder up to 40 activities (1–240 minutes) with types and facilitator notes.
- [ ] Show cumulative start/end times, totals and time remaining/over target, including midnight rollover.
- [ ] Empty, invalid input, loading and storage failures have useful visible feedback.
- [ ] Export/import versioned JSON without executing HTML, silently dropping invalid data, or overwriting on failure.
- [ ] Synthetic demo is clearly labeled and requires confirmation to replace existing work.
- [ ] Facilitator sheet includes notes, session details, times and print styling.
- [ ] Responsive at 320px and desktop, semantic labels, visible keyboard focus, matching favicon.
- [ ] Relevant tests, lint, production build and GitHub CI pass before ready status.
- [ ] README documents setup, data behavior, limitations and verification evidence.

## Milestones
Follow README's 12 planned commits. Draft PR is opened at this brief before implementation. Default branch remains setup only; no merge or auto-merge.
