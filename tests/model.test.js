import {test} from 'node:test';
import assert from 'node:assert/strict';
import {blankSession, validateSession, schedule, moveActivity} from '../model.js';
const a = (id, minutes = 30) => ({id, title: 'Activity', type: 'Practice', minutes, notes: ''});
test('empty agenda has full remaining budget and unchanged end', () => {
  const r = schedule(blankSession());
  assert.equal(r.remaining, 90); assert.equal(r.end, '09:00'); assert.deepEqual(r.rows, []);
});
test('schedule is cumulative, detects overruns and crosses midnight', () => {
  const r = schedule({...blankSession(), start: '23:45', target: 45, activities: [a('1'), a('2')]});
  assert.equal(r.rows[0].end, '00:15 (+1d)'); assert.equal(r.rows[1].start, '00:15 (+1d)');
  assert.equal(r.end, '00:45 (+1d)'); assert.equal(r.remaining, -15); assert.equal(r.targetEnd, '00:30 (+1d)');
});
test('invalid dates, fractions, bounds, types and duplicate IDs are rejected', () => {
  for (const patch of [{start:'24:00'}, {target:4}, {target:481}, {title:' '}, {version:2}, {activities:[a('x'),a('x')]}, {activities:[a('x',1.5)]}, {activities:[a('x',241)]}, {activities:[{...a('x'),type:'unknown'}]}, {activities:Array.from({length:41},(_,i)=>a(String(i)))}]) {
    assert.throws(() => validateSession({...blankSession(), ...patch}));
  }
});
test('reordering preserves original and handles boundaries', () => {
  const s = {...blankSession(), activities:[a('1'), a('2')]};
  assert.deepEqual(moveActivity(s,'2',-1).activities.map(x=>x.id), ['2','1']);
  assert.equal(s.activities[0].id,'1'); assert.deepEqual(moveActivity(s,'1',-1),s);
});
