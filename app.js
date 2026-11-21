import {blankSession, validateSession, schedule, moveActivity} from './model.js';
import {load, save, parseBackup, KEY, MAX_BACKUP} from './storage.js';
const $ = id => document.getElementById(id);
let storage;
try { storage = window.localStorage; } catch { storage = {getItem(){throw Error();},setItem(){throw Error();}}; }
const loaded = load(storage);
let session = loaded.session;
let blocked = Boolean(loaded.error);
let lastRaw = loaded.raw;
function notify(message, error = false) {
  $('status').textContent = message;
  $('status').className = `notice${error ? ' error' : ''}`;
}
function commit(next, recovery = false) {
  if (blocked && !recovery) { notify('Recover your saved data on the Session page before making changes.', true); return false; }
  try {
    if (!recovery && storage.getItem(KEY) !== lastRaw) throw new Error('This session changed in another tab. Reload before saving to avoid replacing newer changes.');
    session = save(storage, next);
    lastRaw = JSON.stringify(session); blocked = false;
    notify('Saved in this browser.'); render(); return true;
  } catch (error) { notify(error.message, true); return false; }
}
const page = document.body.dataset.page;
if (page === 'index') {
  $('content').innerHTML = `<div class="grid"><section class="panel"><h2>Session details</h2>
    <form id="session-form"><div class="field"><label for="title">Workshop title</label><input id="title" name="title" required maxlength="100" autocomplete="off"></div>
    <div class="row"><div class="field"><label for="start">Start time</label><input id="start" name="start" type="time" required></div>
    <div class="field"><label for="target">Target length (minutes)</label><input id="target" name="target" type="number" min="5" max="480" step="1" required></div></div>
    <button class="primary" type="submit">Save session details</button><p class="hint">Save your details before switching pages. Times use a 24-hour clock, without a date or time zone.</p></form></section>
    <aside class="stack"><section class="panel"><h2>Your time at a glance</h2><div id="summary"></div><a class="button primary" href="agenda.html">Build your agenda</a></section>
    <section class="panel callout"><h2>Leave room for the unexpected.</h2><p>A little breathing space helps a workshop stay human. Plan your activities, then check how much time is left.</p></section></aside></div>`;
  $('session-form').addEventListener('submit', event => {
    event.preventDefault();
    commit({...session, title: $('title').value, start: $('start').value, target: Number($('target').value)});
  });
}
function summary() {
  const r = schedule(session);
  const label = r.remaining < 0 ? `${-r.remaining} minutes over target` : r.remaining === 0 ? 'Your agenda fits exactly' : `${r.remaining} minutes unallocated`;
  return `<div class="stats"><div class="stat"><strong>${r.total}</strong><span>planned min</span></div><div class="stat"><strong>${session.target}</strong><span>target min</span></div><div class="stat"><strong>${session.activities.length}</strong><span>activities</span></div></div>
    <p class="budget${r.remaining < 0 ? ' over' : ''}">${label}</p><p class="muted">Planned finish <strong>${r.end}</strong><br>Target finish ${r.targetEnd}</p>`;
}
function render() {
  if ($('summary')) $('summary').innerHTML = summary();
  if (page === 'index') {
    $('title').value = session.title; $('start').value = session.start; $('target').value = session.target;
  }
}
render();
notify(loaded.error || 'Ready. Your session stays in this browser.', blocked);
window.addEventListener('storage', event => {
  if (event.key === KEY || event.key === null) notify('Saved data changed in another tab. Reload this page before editing.', true);
});
