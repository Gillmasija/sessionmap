import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankSession} from '../model.js';
import {load, save, parseBackup, KEY} from '../storage.js';
test('storage round trip and absent storage', () => {
  const memory = new Map(); const storage = {getItem:k=>memory.get(k) ?? null, setItem:(k,v)=>memory.set(k,v)};
  assert.equal(load(storage).error,null); const s = {...blankSession(), title:'Workshop'};
  save(storage,s); assert.deepEqual(load(storage).session,s);
  assert.equal(memory.has(KEY),true);
});
test('corruption is reported without an implicit write', () => {
  let writes=0; const result=load({getItem:()=>'{broken',setItem:()=>writes++});
  assert.ok(result.error); assert.equal(writes,0);
});
test('denied reads and quota failures are recoverable', () => {
  assert.ok(load({getItem:()=>{throw Error('denied');}}).error);
  assert.throws(()=>save({setItem:()=>{throw Error('quota');}},blankSession()),/Could not save/);
});
test('invalid import and oversized input fail before writes', () => {
  for (const raw of ['null','{}','<script>', ' '.repeat(400001)]) assert.throws(()=>parseBackup(raw));
  assert.equal(parseBackup(JSON.stringify({...blankSession(),title:'<img onerror=alert(1)>'})).title,'<img onerror=alert(1)>');
});
