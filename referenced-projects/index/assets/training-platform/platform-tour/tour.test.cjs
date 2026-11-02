const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('./tour-model.js');

test('tool filtering returns matching examples and safely handles no match', () => {
  assert.deepEqual(model.filterTools('data').map(tool => tool.id), ['directory']);
  assert.equal(model.filterTools('all').length, 3);
  assert.equal(model.filterTools('unknown').length, 0);
});
test('four-dimensional rating uses the platform weights and rejects invalid scores', () => {
  assert.equal(model.score([5, 4, 3, 2]), 3.7);
  assert.equal(model.score([1, 1, 1, 1]), 1);
  assert.equal(model.score([5, 5, 5, 5]), 5);
  assert.equal(model.score([6, 4, 3, 2]), null);
  assert.equal(model.score([5, 4]), null);
});
test('requirement filters separate pending needs from implemented examples', () => {
  assert.equal(model.filterNeeds('pending').length, 2);
  assert.deepEqual(model.filterNeeds('done').map(need => need.id), ['n3']);
});
test('tool and training delivery stay separate and step selection stays in bounds', () => {
  assert.equal(model.step('tool', 99).title, '回写结果');
  assert.equal(model.step('training', 99).title, '受保护预览');
  assert.equal(model.step('tool', -4).index, 0);
  assert.equal(model.step('training', NaN).index, 0);
  assert.equal(model.step('unknown', 2).type, 'tool');
});
test('local course demo supports draft, publication and archive without any backend', () => {
  assert.equal(model.nextCourseStatus('draft'), 'published');
  assert.equal(model.nextCourseStatus('published'), 'archived');
  assert.equal(model.nextCourseStatus('archived'), 'published');
});
