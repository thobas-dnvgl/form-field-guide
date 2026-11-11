import test from 'node:test';
import assert from 'node:assert/strict';
import { decisionTree, exampleFamilies, fileActions, filterOptions, makeCustomValue, moveValue, people, families } from './model.js';

test('search includes names, descriptions, and groups without case or surrounding-space sensitivity', () => {
  assert.equal(filterOptions(people, ' ADA ')[0].id, 'ada');
  assert.equal(filterOptions(people, 'Engineering').length, 2);
  assert.equal(filterOptions(people, 'design engineer')[0].id, 'grace');
  assert.deepEqual(filterOptions(people, 'nobody'), []);
});
test('custom entries reject blank text and case-insensitive duplicates', () => {
  assert.ok(makeCustomValue('  ', []).error);
  assert.ok(makeCustomValue(' ADA LOVELACE ', people).error);
  const result = makeCustomValue('  New label ', people).value;
  assert.equal(result.label, 'New label');
  assert.equal(result.custom, true);
  assert.match(result.id, /^custom-/);
});
test('reordering is immutable and respects boundaries', () => {
  const values = people.slice(0, 3);
  assert.deepEqual(moveValue(values, 0, 1).map(value => value.id), ['grace', 'ada', 'margaret']);
  assert.equal(values[0].id, 'ada');
  assert.equal(moveValue(values, 0, -1), values);
  assert.equal(moveValue(values, 3, -1), values);
});
test('dragging across several positions preserves other objects and their relative order', () => {
  const values = people.slice(0, 4);
  assert.deepEqual(moveValue(values, 0, 3).map(value => value.id), ['grace', 'margaret', 'alan', 'ada']);
  assert.deepEqual(moveValue(values, 3, -3).map(value => value.id), ['alan', 'ada', 'grace', 'margaret']);
  assert.equal(moveValue(values, 0, 3)[3], values[0]);
  assert.deepEqual(values.map(value => value.id), ['ada', 'grace', 'margaret', 'alan']);
  assert.deepEqual(moveValue(values, 2, 0), values);
});
test('taxonomy has stable unique identifiers', () => {
  assert.equal(new Set(families.map(family => family.id)).size, 8);
});
test('the explorer includes every taxonomy family without selection pickers', () => {
  assert.equal(exampleFamilies.length, 9);
  assert.deepEqual(exampleFamilies.filter(family => family.count !== 'none'), families);
  assert.equal(families.some(family => family.id === 'picker'), false);
});
test('the action menu is a no-value example rather than a form-value family', () => {
  assert.deepEqual(fileActions, ['Save', 'Print', 'Options', 'Exit']);
  const menu = exampleFamilies.find(family => family.id === 'menu');
  assert.equal(menu.count, 'none');
  assert.equal(menu.custom, false);
  assert.equal(families.some(family => family.id === 'menu'), false);
  assert.equal(new Set(exampleFamilies.map(family => family.id)).size, exampleFamilies.length);
  assert.ok(decisionTree.includes(`START -->|No: invokes an action| ACTION["Action menu / MenuButton\\nFile: ${fileActions.join(', ')}\\nInvokes commands; no form value"]`));
  assert.equal(decisionTree.includes('Outside this guide'), false);
});
test('taxonomy distinguishes optional popover search from direct field search', () => {
  const byId = Object.fromEntries(families.map(family => [family.id, family]));
  for (const id of ['select', 'multi-select']) {
    assert.equal(byId[id].search, 'Optional, inside the popover');
    assert.match(byId[id].use, /browse a known set/i);
    assert.match(byId[id].use, /button/i);
  }
  for (const id of ['combobox', 'multi-combobox']) {
    assert.equal(byId[id].search, 'In the value field');
    assert.match(byId[id].use, /type directly/i);
  }
});
test('decision tree distinguishes text completions from creating or selecting options', () => {
  assert.match(decisionTree, /VISIBLE\{"Keep all options visible in the form\?\\nOften useful for a short list"\}/);
  for (const edge of [
    'START -->|Yes| ENTRY',
    'ENTRY -->|Free-form text| FREECOUNT',
    'ENTRY -->|Choose from options| ALLOWCREATE',
    'ALLOWCREATE -->|Yes| CREATECOUNT',
    'ALLOWCREATE -->|No: existing options only| VISIBLE',
    'FREECOUNT -->|One| TEXT',
    'FREECOUNT -->|Multiple| TAGS',
    'VISIBLE -->|No: open on demand| FIND',
    'FIND -->|Know it: type directly| COMBOCOUNT',
    'FIND -->|Browse; filter if helpful| SELECTCOUNT',
    'COMBOCOUNT -->|One| COMBO',
    'COMBOCOUNT -->|Multiple| MULTICOMBO',
    'SELECTCOUNT -->|One| SELECT',
    'SELECTCOUNT -->|Multiple| MULTISELECT',
  ]) assert.ok(decisionTree.includes(edge), `Missing decision-tree edge: ${edge}`);
  assert.doesNotMatch(decisionTree, /picker|dialog/i);
  assert.match(decisionTree, /ENTRY\{"How is a value entered\?"\}/);
  assert.match(decisionTree, /ALLOWCREATE\{"Can people explicitly create an option\?"\}/);
  assert.match(decisionTree, /TEXT\["Text Field\\nOptional autocomplete completions"\]/);
  assert.match(decisionTree, /COMBO\["Combobox\\nSearch in value field"\]/);
  assert.match(decisionTree, /SELECT\["Select\\nValue on button\\nOptional search in popover"\]/);
  assert.match(decisionTree, /MULTISELECT\["Multi-select\\nSummary on button\\nOptional search in popover"\]/);
});
test('the accessible decision-tree outline explains text completions without treating them as options', () => {
  assert.match(decisionTree, /Text Field\\nOptional autocomplete completions/);
});
