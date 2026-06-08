// Tests using Node's built-in runner (node:test) — deliberately NOT vitest.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { add, classify } from './index.js';

test('add sums two numbers', () => {
    assert.equal(add(2, 3), 5);
});

test('classify labels a number by sign', () => {
    assert.equal(classify(5), 'positive');
    assert.equal(classify(-1), 'negative');
    assert.equal(classify(0), 'zero');
});
