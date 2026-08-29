'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = { console, Date, Intl, JSON, Math, BigInt, TextEncoder };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'Divination-PWA', 'traditional-algorithms.js'), 'utf8'), context);

const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden.json'), 'utf8'));
let failures = 0;
for (const fixture of fixtures) {
  const timestamp = new Date(fixture.input).getTime();
  const raw1 = context.ZhanbuAlgorithms.calculate(fixture.method, timestamp, JSON.stringify(fixture.options));
  const raw2 = context.ZhanbuAlgorithms.calculate(fixture.method, timestamp, JSON.stringify(fixture.options));
  const result1 = JSON.parse(raw1);
  const result2 = JSON.parse(raw2);
  const digest = result1.ok
    ? crypto.createHash('sha256').update(result1.result.display).digest('hex')
    : '';
  if (!result1.ok || !result2.ok || digest !== fixture.displaySha256 || result1.result.display !== result2.result.display) {
    failures += 1;
    console.error(`FAIL ${fixture.method} ${fixture.input}: ${result1.error || digest}`);
  }
}

const invalidCases = [
  ['meihua', { method: 'number', number: 0 }],
  ['almanac', { topic: 'travel', startDate: '', endDate: '' }],
  ['unknown', {}],
];
for (const [method, options] of invalidCases) {
  const result = JSON.parse(context.ZhanbuAlgorithms.calculate(method, Date.now(), JSON.stringify(options)));
  if (result.ok) {
    failures += 1;
    console.error(`FAIL invalid input accepted: ${method}`);
  }
}

if (failures) process.exitCode = 1;
else console.log(`PASS ${fixtures.length} golden fixtures + ${invalidCases.length} invalid-input checks`);
