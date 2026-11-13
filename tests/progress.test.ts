import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initialProgress, isDue, parseProgress, readProgress, schedule, weakAreas, type Evidence } from '../src/state/progress'

const now = new Date('2026-11-13T09:00:00Z')
test('review intervals and due boundary', () => {
  const forgot = schedule('Forgot', undefined, now)
  assert.equal(forgot.due, '2026-11-13T09:10:00.000Z')
  assert.equal(isDue([forgot], now), false)
  assert.equal(isDue([forgot], new Date(forgot.due)), true)
  assert.equal(isDue(undefined, now), true)
  assert.equal(schedule('Hard', undefined, now).interval, 1)
  assert.equal(schedule('Mastered', undefined, now).interval, 3)
  assert.equal(schedule('Mastered', { ...forgot, interval: 180 }, now).interval, 180)
})

test('portable JSON round trip and supported legacy shape', () => {
  const data = initialProgress()
  const visit = { href: '/technology/sr-mpls/guide/verify#verify-block-1', title: 'Verify', date: now.toISOString() }
  data.recent.push(visit)
  data.bookmarks.push(visit)
  data.pinned.push('sr-mpls')
  data.preferences['sr-mpls'] = { level: 2, goal: 3, path: 'hands-on' }
  data.reviews['sr-mpls:card-test'] = [schedule('Hard', undefined, now)]
  data.completed['sr-mpls:verify'] = now.toISOString()
  assert.deepEqual(parseProgress(JSON.stringify(data)), data)
  assert.deepEqual(parseProgress(JSON.stringify({ version: 0, pinned: ['sr-mpls'] })), { ...initialProgress(), pinned: ['sr-mpls'] })
})

test('reject unsafe links, malformed records, future versions, and impossible evidence', () => {
  const data = initialProgress()
  assert.throws(() => parseProgress(JSON.stringify({ ...data, version: 2 })), /unsupported/)
  assert.throws(() => parseProgress(JSON.stringify({ ...data, confidence: { 'sr-mpls': 6 } })), /Invalid progress/)
  assert.throws(() => parseProgress(JSON.stringify({ ...data, bookmarks: [{ href: '//example.org', title: 'External', date: now.toISOString() }] })), /Invalid progress/)
  assert.throws(() => parseProgress(JSON.stringify({ ...data, evidence: [{ ...item, kind: 'study', context: 'Verified in a real lab' }] })), /Invalid progress/)
  assert.deepEqual(readProgress({ getItem: () => 'unreadable' }), initialProgress())
})

const item: Evidence = { id: 'event-1', topic: 'sr-mpls', target: 'label', dimension: 'Conceptual Knowledge', kind: 'assessment', context: 'Studied', date: now.toISOString(), subtopic: 'Labels', score: 1 }
test('readiness weak areas follow the latest evidence per activity', () => {
  assert.deepEqual(weakAreas([]), [])
  assert.deepEqual(weakAreas([item], 'sr-mpls'), ['Labels'])
  assert.deepEqual(weakAreas([item], 'ospf'), [])
  assert.deepEqual(weakAreas([item, { ...item, date: '2026-11-13T09:01:00.000Z', score: 3 }]), [])
  assert.deepEqual(weakAreas([{ ...item, date: '2026-11-13T09:01:00.000Z', score: 3 }, item]), [])
})
