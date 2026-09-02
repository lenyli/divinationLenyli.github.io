'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

const root = path.resolve(__dirname, '..');
const context = { console, Date, Intl, JSON, Math, BigInt, TextEncoder };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'Divination-PWA', 'traditional-algorithms.js'), 'utf8'), context);

const windowsSource = fs.readFileSync(path.join(root, 'Divination.cs'), 'utf8');
const windowsPayloadMatch = windowsSource.match(/\/\/ WINDOWS_ALGORITHM_PAYLOAD_BEGIN([\s\S]*?)\/\/ WINDOWS_ALGORITHM_PAYLOAD_END/);
if (!windowsPayloadMatch) throw new Error('Windows algorithm payload markers are missing.');
const windowsChunks = [...windowsPayloadMatch[1].matchAll(/"([A-Za-z0-9+/=]+)"/g)].map(match => match[1]);
if (!windowsChunks.length) throw new Error('Windows algorithm payload is empty.');
const windowsBundle = zlib.gunzipSync(Buffer.from(windowsChunks.join(''), 'base64')).toString('utf8');
const windowsContext = { console, Date, Intl, JSON, Math, TextEncoder };
vm.createContext(windowsContext);
vm.runInContext(windowsBundle, windowsContext);

const fixtures = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden.json'), 'utf8'));
let failures = 0;
const requiredPromptText = {
  liuyao: ['起卦方式', '六个爻值', '月建', '日辰', '旬空', '本卦', '变卦完整六爻', '伏神与飞神', '用神六亲'],
  qimen: ['时家／转盘／拆补法', '九宫完整天地人神盘', '值符', '值使'],
  liuren: ['月将加时', '完整天地盘十二位', '四课', '三传'],
  xiaoliuren: ['月日时三步法', '月宫', '日宫', '时宫', '原始口诀'],
  meihua: ['复算参数', '主卦', '互卦', '变卦', '体卦', '用卦'],
  taiyi: ['采用模型', '太乙位置', '主算', '客算', '定算'],
  jinkoujue: ['四位', '阴阳取用', '动象', '复算过程', '最终取用状态'],
  almanac: ['应用已生成的象征性时间结果', '不要求重新核验', '黄历候选｜前5条'],
};
for (const fixture of fixtures) {
  const timestamp = new Date(fixture.input).getTime();
  const raw1 = context.ZhanbuAlgorithms.calculate(fixture.method, timestamp, JSON.stringify(fixture.options));
  const raw2 = context.ZhanbuAlgorithms.calculate(fixture.method, timestamp, JSON.stringify(fixture.options));
  const result1 = JSON.parse(raw1);
  const result2 = JSON.parse(raw2);
  const windowsResult = JSON.parse(windowsContext.ZhanbuAlgorithms.calculate(fixture.method, timestamp, JSON.stringify(fixture.options)));
  const digest = result1.ok
    ? crypto.createHash('sha256').update(result1.result.display).digest('hex')
    : '';
  const result = result1.result || {};
  const promptStable = result.aiPrompt === result2.result?.aiPrompt && result.aiPromptSection === result2.result?.aiPromptSection;
  const promptContract = result.aiPromptVersion === 'zhanbu-ai-prompt-v1'
    && typeof result.aiPrompt === 'string' && result.aiPrompt.includes('问题')
    && result.aiPrompt.includes('资料边界') && result.aiPrompt.includes('解读要求')
    && typeof result.aiPromptSection === 'string' && result.aiPromptSection.length > 0
    && (requiredPromptText[fixture.method] || []).every(text => result.aiPrompt.includes(text));
  const hashMatches = !fixture.displaySha256 || digest === fixture.displaySha256;
  const timezoneMatches = result.input?.timezoneOffsetMinutes === 480;
  const methodSpecific = fixture.method === 'almanac'
    ? result.calculatedFacts?.displayedDays?.length <= 5 && result.calculatedFacts?.pageSize === 5
      && result.calculatedFacts?.allDays?.length >= result.calculatedFacts?.displayedDays?.length
    : fixture.method === 'liuyao'
      ? (() => {
          const worldResponse = result.calculatedFacts?.worldAndResponse?.text;
          const moving = (result.calculatedFacts?.primary?.lines || []).filter(line => line.isChanging).map(line => `${line.position}爻`).join('、') || '无';
          const orderedText = `${worldResponse}、动爻 ${moving}`;
          return result.calculatedFacts?.changed?.lines?.length === 6
            && result.calculatedFacts?.primary?.lines?.length === 6
            && result.display.includes(orderedText)
            && result.aiPromptSection.includes(orderedText)
            && result.summary.indexOf(worldResponse) < result.summary.indexOf(`动爻${moving}`);
        })()
      : fixture.method === 'liuren'
        ? result.calculatedFacts?.heavenlyPlate?.length === 12
          && new Set(result.calculatedFacts.heavenlyPlate.map(item => item.under)).size === 12
        : true;
  const windowsMatches = windowsResult.ok === result1.ok
    && windowsResult.result?.display === result.display
    && windowsResult.result?.aiPrompt === result.aiPrompt
    && windowsResult.result?.aiPromptSection === result.aiPromptSection;
  if (!result1.ok || !result2.ok || !hashMatches || result.display !== result2.result.display || !promptStable || !promptContract || !timezoneMatches || !methodSpecific || !windowsMatches) {
    failures += 1;
    console.error(`FAIL ${fixture.method} ${fixture.input}: ${result1.error || 'contract mismatch'}`);
  }
}

const invalidCases = [
  ['meihua', { method: 'number', number: 0 }],
  ['jinkoujue', { method: 'random' }],
  ['liuyao', { generationMethod: 'coins' }],
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

const completion = JSON.parse(fs.readFileSync(path.join(root, 'source-data', 'xuantian-slip-42-43.json'), 'utf8'));
for (const correction of completion.corrections) {
  for (const relative of ['Divination.cs', 'Divination-PWA/data.js', 'Divination-iOS/Divination/DivinationData.swift', 'Divination-macOS/Divination/DivinationData.swift']) {
    if (!fs.readFileSync(path.join(root, relative), 'utf8').includes(correction.completeText)) {
      failures += 1;
      console.error(`FAIL slip ${correction.slipNumber} missing from ${relative}`);
    }
  }
}
const oracleNotice = '提示：复古神谕是本项目的独立牌组，AI 可能无法仅凭以上摘要准确理解完整牌义。';
for (const relative of ['Divination.cs', 'Divination-PWA/app.js', 'Divination-iOS/Divination/Engine.swift', 'Divination-macOS/Divination/Engine.swift']) {
  if (!fs.readFileSync(path.join(root, relative), 'utf8').includes(oracleNotice)) {
    failures += 1;
    console.error(`FAIL oracle notice missing from ${relative}`);
  }
}

if (failures) process.exitCode = 1;
else console.log(`PASS ${fixtures.length} PWA/Windows differential fixtures + ${invalidCases.length} invalid-input checks`);
