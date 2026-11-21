import {schedule, moveActivity} from './model.js';
import {load, save, parseBackup, KEY, MAX_BACKUP} from './storage.js';
import {demoSession} from './demo.js';
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
let editingId = null;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if (page === 'agenda') {
  document.querySelector('.page-head').insertAdjacentHTML('beforeend', '<a class="button primary" href="#activity-title">Add an activity</a>');
  $('content').innerHTML = `<div class="grid"><section class="panel"><h2>Running order</h2><div id="summary"></div><div id="activities"></div></section>
    <aside class="stack"><section class="panel"><h2 id="editor-title">Add an activity</h2><form id="activity-form">
    <div class="field"><label for="activity-title">Activity name</label><input id="activity-title" required maxlength="100" placeholder="e.g. Map the challenge"></div>
    <div class="row"><div class="field"><label for="type">Type</label><select id="type"><option>Discuss</option><option>Practice</option><option>Present</option><option>Break</option></select></div><div class="field"><label for="minutes">Minutes</label><input id="minutes" type="number" min="1" max="240" step="1" value="15" required></div></div>
    <div class="field"><label for="notes">Facilitator notes (optional)</label><textarea id="notes" maxlength="2000" placeholder="Prompts, materials, or the outcome to aim for"></textarea></div>
    <div class="actions"><button id="save-activity" class="primary">Add activity</button><button id="cancel-edit" type="button" hidden>Cancel edit</button></div>
    <p class="hint">Up to 40 activities. Saved activities appear on the facilitator sheet.</p></form></section><a class="button" href="sheet.html">View facilitator sheet</a></aside></div>`;
  $('activity-form').addEventListener('submit', event => {
    event.preventDefault();
    const activity = {id: editingId || crypto.randomUUID(), title: $('activity-title').value, type: $('type').value, minutes: Number($('minutes').value), notes: $('notes').value};
    const activities = editingId ? session.activities.map(a => a.id === editingId ? activity : a) : [...session.activities, activity];
    if (commit({...session, activities})) resetEditor();
  });
  $('cancel-edit').addEventListener('click', resetEditor);
  $('activities').addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const {id, action} = button.dataset;
    const a = session.activities.find(item => item.id === id);
    if (!a) return;
    if (action === 'edit') {
      editingId = id; $('activity-title').value = a.title; $('type').value = a.type;
      $('minutes').value = a.minutes; $('notes').value = a.notes;
      $('editor-title').textContent = 'Edit activity'; $('save-activity').textContent = 'Save activity'; $('cancel-edit').hidden = false;
      $('activity-title').focus();
    } else if (action === 'remove') {
      if (confirm(`Remove “${a.title}”? This cannot be undone.`) && commit({...session, activities:session.activities.filter(item => item.id !== id)})) {
        if (editingId === id) resetEditor();
        $('activity-title').focus();
      }
    } else {
      if (commit(moveActivity(session, id, action === 'up' ? -1 : 1))) {
        const buttons = [...$('activities').querySelectorAll('button')];
        const next = buttons.find(b => b.dataset.id === id && b.dataset.action === action && !b.disabled) || buttons.find(b => b.dataset.id === id && b.dataset.action === 'edit');
        next?.focus();
      }
    }
  });
}
function resetEditor() {
  editingId = null; $('activity-form').reset(); $('editor-title').textContent = 'Add an activity';
  $('save-activity').textContent = 'Add activity'; $('cancel-edit').hidden = true;
}
if (page === 'sheet') {
  $('content').innerHTML = '<div class="actions no-print"><button id="print" class="primary">Print facilitator sheet</button><a class="button" href="agenda.html">Edit agenda</a></div><section id="sheet" class="panel section-gap"></section>';
  $('print').addEventListener('click', () => window.print());
}
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
  $('content').insertAdjacentHTML('beforeend', `<section class="panel section-gap"><h2>Keep a copy. Start with an idea.</h2><p class="muted">One session is stored in this browser. A JSON backup lets you move it to another browser or keep a copy before replacing it.</p>
    <div class="actions"><button id="export">Download backup</button><button id="demo">Load synthetic example</button><button id="recover-raw">Download stored data</button></div>
    <label class="file-label" for="import">Restore a SessionMap JSON backup (maximum 400 KB)</label><input id="import" type="file" accept=".json,application/json">
    <p class="hint">Restoring or loading an example replaces the current session after confirmation. Data stays on your device. Download stored data preserves the original text even if it is damaged.</p></section>`);
  $('export').addEventListener('click', () => download(JSON.stringify(session,null,2), 'sessionmap-backup.json'));
  $('recover-raw').addEventListener('click', () => {
    try {
      const raw = storage.getItem(KEY);
      if (raw === null) { notify('No stored data to download.'); return; }
      download(raw, 'sessionmap-stored-data.txt', 'text/plain');
    } catch { notify('Browser storage is unavailable. Allow storage or try another browser.', true); }
  });
  $('demo').addEventListener('click', () => {
    if (confirm('Replace this session with the synthetic workshop example? Download a backup first if needed.')) commit(demoSession(),true);
  });
  $('import').addEventListener('change', async event => {
    const file = event.target.files[0]; if (!file) return;
    $('import').disabled = true; notify('Reading backup…');
    try {
      if (file.size > MAX_BACKUP) throw new Error('Backup is too large (maximum 400 KB).');
      const candidate = parseBackup(await file.text());
      if (confirm(`Replace this session with “${candidate.title}” and its ${candidate.activities.length} activities?`)) commit(candidate,true);
      else notify('Restore cancelled. Your saved session is unchanged.');
    } catch (error) { notify(error.message, true); }
    finally { $('import').disabled = false; $('import').value = ''; }
  });
}
function download(content, filename, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const link = document.createElement('a'); link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    $('export').disabled = blocked;
  }
  if (page === 'agenda') renderActivities();
  if (page === 'sheet') {
    const r = schedule(session);
    $('sheet').innerHTML = `<p class="eyebrow">Facilitator running order</p><h2 class="sheet-title">${escape(session.title)}</h2>
      <div class="sheet-meta"><span>Start: ${session.start}</span><span>Planned finish: ${r.end}</span><span>${r.total} planned / ${session.target} target minutes</span></div>
      <p class="budget${r.remaining < 0 ? ' over' : ''}">${r.remaining < 0 ? `${-r.remaining} minutes over target` : `${r.remaining} minutes unallocated`}</p>
      ${r.rows.length ? r.rows.map(a => `<article class="sheet-row"><div class="sheet-time">${a.start} – ${a.end} · ${a.minutes} min · ${a.type}</div><h2>${escape(a.title)}</h2><p class="notes">${escape(a.notes || 'No facilitator notes.')}</p></article>`).join('') : '<div class="empty"><h3>No activities yet</h3><p>Add activities on the Agenda page to build your facilitator sheet.</p></div>'}
      <p class="hint">Planned times, not a live timer. (+1d) means the following day. SessionMap</p>`;
    $('print').disabled = blocked || !r.rows.length;
  }
}
function renderActivities() {
  const rows = schedule(session).rows;
  $('activities').innerHTML = rows.length ? rows.map((a, i) => `<article class="activity"><div class="time">${a.start}<small>${a.minutes} min</small></div><div><h3>${escape(a.title)}</h3><span class="tag">${a.type}</span><small>Until ${a.end}</small>${a.notes ? `<p class="notes">${escape(a.notes)}</p>` : ''}<div class="actions">
    ${[['edit','Edit'],['up','Earlier'],['down','Later'],['remove','Remove']].map(([action,label]) => `<button type="button" data-action="${action}" data-id="${escape(a.id)}" aria-label="${label}: ${escape(a.title)}"${(action === 'up' && i === 0) || (action === 'down' && i === rows.length - 1) ? ' disabled' : ''}>${label}</button>`).join('')}
    </div></div></article>`).join('') : '<div class="empty"><h3>A blank page, full of possibility.</h3><p>Add your first activity. Start with an introduction, a question, or a quick warm-up.</p></div>';
}
render();
notify(loaded.error || 'Ready. Your session stays in this browser.', blocked);
window.addEventListener('storage', event => {
  if (event.key === KEY || event.key === null) notify('Saved data changed in another tab. Reload this page before editing.', true);
});
