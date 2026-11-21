import {blankSession, validateSession} from './model.js';
export const KEY = 'sessionmap.v1';
export const MAX_BACKUP = 400000;
export function parseBackup(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > MAX_BACKUP) throw new Error('Backup is too large (maximum 400 KB).');
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error('This is not a valid JSON backup.'); }
  return validateSession(parsed);
}
export function load(storage) {
  try {
    const raw = storage.getItem(KEY);
    return {session: raw === null ? blankSession() : parseBackup(raw), error: null, raw};
  } catch {
    return {session: blankSession(), error: 'Saved data could not be read. It has not been replaced. Download the stored data or recover with a valid backup.', raw: null};
  }
}
export function save(storage, session) {
  const clean = validateSession(session);
  try { storage.setItem(KEY, JSON.stringify(clean)); }
  catch { throw new Error('Could not save in this browser. Your previous saved session is unchanged. Check browser storage availability.'); }
  return clean;
}
