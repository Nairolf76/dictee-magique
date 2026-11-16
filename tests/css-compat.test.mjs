import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import cssCompat from '../scripts/css-compat.mjs';

// Resolve the existing Vite dependency, including when running from staging.
const root = process.env.DICTEE_SOURCE_ROOT || process.cwd();
const require = createRequire(path.join(root, 'package.json'));
const postcss = require('postcss');
const processCss = text => postcss([cssCompat()]).process(text, {from: undefined});

test('adds legacy lengths before modern declarations, retaining !important and nested arithmetic', async () => {
  const {root} = await processCss('.toy{padding:2cqw -.25cqw!important;width:min(100dvh,calc(100% + 1.2cqw));height:90dvh}');
  const declarations = [];
  root.walkDecls(d => declarations.push([d.prop,d.value,d.important]));
  assert.deepEqual(declarations, [
    ['padding','calc(var(--toy-unit, 4px) * 2) calc(var(--toy-unit, 4px) * -.25)',true],
    ['padding','2cqw -.25cqw',true],
    ['width','min(100vh,calc(100% + calc(var(--toy-unit, 4px) * 1.2)))',undefined],
    ['width','min(100dvh,calc(100% + 1.2cqw))',undefined],
    ['height','90vh',undefined], ['height','90dvh',undefined],
  ]);
});
test('leaves quoted text, URL data and identifiers intact; repeated processing is idempotent', async () => {
  const source = '.x{content:"10cqw";background:url(https://example.test/10cqw);--name:thing2cqw;gap:1cqw 2cqw}';
  const first = await processCss(source);
  assert.match(first.css, /content:"10cqw"/);
  assert.match(first.css, /thing2cqw/);
  assert.match(first.css, /https:\/\/example.test\/10cqw/);
  assert.equal((await processCss(first.css)).css, first.css);
});
test('all production CSS declarations receive adjacent fallbacks without changing modern values', async () => {
  let converted = 0;
  for (const file of ['style.css','practice.css','branding.css','key-art.css']) {
    const source = await readFile(path.join(root,'src',file),'utf8');
    const before = postcss.parse(source);
    const modern = [];
    before.walkDecls(d => {if (/\d(?:cqw|dvh)\b/.test(d.value)) modern.push([d.prop,d.value]);});
    const result = await processCss(source);
    const after = [];
    result.root.walkDecls(d => {
      if (!/\d(?:cqw|dvh)\b/.test(d.value)) return;
      after.push([d.prop,d.value]);
      assert.equal(d.prev().type,'decl');
      assert.equal(d.prev().prop,d.prop);
      assert.doesNotMatch(d.prev().value,/\d(?:cqw|dvh)\b/);
      converted++;
    });
    assert.deepEqual(after,modern);
  }
  assert.ok(converted > 60, `checked ${converted} production fallbacks`);
});
