export const TYPES = ['Discuss', 'Practice', 'Present', 'Break'];
export const blankSession = () => ({version: 1, title: 'Untitled workshop', start: '09:00', target: 90, activities: []});
function text(value, label, max, required = true) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error(`${label}: enter ${required ? '1' : '0'}–${max} characters.`);
  return value.trim();
}
function integer(value, label, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${label}: use a whole number from ${min} to ${max}.`);
  return value;
}
export function validateActivity(a) {
  if (!a || typeof a !== 'object' || Array.isArray(a)) throw new Error('Invalid activity.');
  if (!TYPES.includes(a.type)) throw new Error('Choose a valid activity type.');
  return {id: text(a.id, 'Activity ID', 80), title: text(a.title, 'Activity name', 100), type: a.type,
    minutes: integer(a.minutes, 'Duration', 1, 240), notes: text(a.notes, 'Notes', 2000, false)};
}
export function validateSession(s) {
  if (!s || s.version !== 1) throw new Error('Use a SessionMap version 1 backup.');
  if (typeof s.start !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(s.start)) throw new Error('Choose a valid start time.');
  if (!Array.isArray(s.activities) || s.activities.length > 40) throw new Error('Use at most 40 activities.');
  const activities = s.activities.map(validateActivity);
  if (new Set(activities.map(a => a.id)).size !== activities.length) throw new Error('Activity IDs must be unique.');
  return {version: 1, title: text(s.title, 'Session title', 100), start: s.start,
    target: integer(s.target, 'Target length', 5, 480), activities};
}
export function clock(minutes) {
  const day = Math.floor(minutes / 1440);
  const time = `${String(Math.floor(minutes % 1440 / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  return time + (day ? ` (+${day}d)` : '');
}
export function schedule(session) {
  const s = validateSession(session);
  const [h, m] = s.start.split(':').map(Number);
  let cursor = h * 60 + m;
  const rows = s.activities.map(a => {
    const start = clock(cursor);
    cursor += a.minutes;
    return {...a, start, end: clock(cursor)};
  });
  const total = s.activities.reduce((sum, a) => sum + a.minutes, 0);
  return {rows, total, remaining: s.target - total, end: clock(cursor), targetEnd: clock(h * 60 + m + s.target)};
}
export function moveActivity(session, id, direction) {
  const s = validateSession(session);
  const i = s.activities.findIndex(a => a.id === id);
  const j = i + direction;
  if (i < 0 || ![-1, 1].includes(direction) || j < 0 || j >= s.activities.length) return s;
  [s.activities[i], s.activities[j]] = [s.activities[j], s.activities[i]];
  return s;
}
