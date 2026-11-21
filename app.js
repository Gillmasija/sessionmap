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
function render() {}
render();
notify(loaded.error || 'Ready. Your session stays in this browser.', blocked);
window.addEventListener('storage', event => {
  if (event.key === KEY || event.key === null) notify('Saved data changed in another tab. Reload this page before editing.', true);
});
