import { generateQimen } from 'mingyu-core/divination/qimen';
import { generateLiuren } from 'mingyu-core/divination/liuren';
import { generateXiaoliuren } from 'mingyu-core/divination/xiaoliuren';
import { generateMeihua } from 'mingyu-core/divination/meihua';
import { generateJinkoujue } from 'mingyu-core/divination/jinkoujue';
import { generateAlmanacSelection } from 'mingyu-core/divination/almanac';
import { taiyi } from 'mingyu-core';

const { generateTaiyi } = taiyi;

type Options = Record<string, unknown>;

const METHOD_VERSION = 'mingyu-core-0.1.32+zhanbu-1';
const SOURCE_URL = 'https://github.com/Brhiza/mingyu/tree/main/packages/core';

function text(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  return String(value);
}

function list(value: unknown): string {
  return Array.isArray(value) && value.length ? value.map(text).join('、') : '无';
}

function dateText(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function envelope(
  method: string,
  timestamp: number,
  input: Options,
  facts: unknown,
  display: string,
  limitations: string[] = [],
  summary = '',
  timingSummary = '',
) {
  return {
    method,
    methodVersion: METHOD_VERSION,
    input,
    calculatedAt: timestamp,
    calculatedFacts: facts,
    provenance: {
      engine: 'Mingyu Core（MIT，本地离线编译）',
      source: SOURCE_URL,
      wrapper: 'Zhanbu traditional algorithms adapter v1',
    },
    limitations,
    summary,
    timingSummary,
    display,
  };
}

function formatQimen(date: Date) {
  const result = generateQimen(date, 'zhuanpan', 'hour', 'chaibu');
  const palaces = result.jiuGongGe
    .sort((a, b) => a.gong - b.gong)
    .map((palace) => `${palace.name}（${palace.direction}）｜天盘 ${palace.tianPan.stem} ${palace.tianPan.star}｜地盘 ${palace.diPan.stem}｜${palace.renPan.door}｜${palace.shenPan.god}`)
    .join('\n');
  const display = [
    '【奇门遁甲｜时家转盘拆补法】',
    `起局：${dateText(date)}`,
    `四柱：${result.ganzhi.year}年 ${result.ganzhi.month}月 ${result.ganzhi.day}日 ${result.ganzhi.hour}时`,
    `定局：${result.isYangDun ? '阳遁' : '阴遁'}${result.juShu}局｜值符 ${result.zhiFu}｜值使 ${result.zhiShi}`,
    `节气：${text(result.timeInfo?.solarTerm)}｜空亡：${list(result.voidBranches)}｜驿马：${text(result.horseStar?.branch)}`,
    `格局：${list(result.patternTags)}`,
    '',
    '九宫盘：',
    palaces,
  ].join('\n');
  return envelope('qimen', result.timestamp, { dateTime: date.toISOString(), scope: 'hour', layout: 'zhuanpan', juMethod: 'chaibu' }, {
    ganzhi: result.ganzhi,
    isYangDun: result.isYangDun,
    juShu: result.juShu,
    zhiFu: result.zhiFu,
    zhiShi: result.zhiShi,
    solarTerm: result.timeInfo?.solarTerm,
    voidBranches: result.voidBranches,
    horseStar: result.horseStar,
    patternTags: result.patternTags,
    yingQi: result.yingQi,
    palaces: result.jiuGongGe,
  }, display, ['首版固定为时家、转盘、拆补法；盘面事实不等同于事项断语。'],
  `${result.isYangDun ? '阳遁' : '阴遁'}${result.juShu}局，值符${result.zhiFu}，值使${result.zhiShi}${result.patternTags.length ? `；${result.patternTags.slice(0, 3).join('、')}` : ''}`,
  result.yingQi?.description ?? '当前盘只给出相对节奏，没有唯一日期。');
}

function formatLiuren(date: Date) {
  const result = generateLiuren(date);
  const lessons = result.fourLessons.map((item) => `${item.name}：${item.lower} → ${item.upper}｜${item.god}｜${item.relation}`).join('\n');
  const transmissions = result.threeTransmissions.map((item) => `${item.stage}：${item.branch}｜${item.god}｜${item.relation}${item.isVoid ? '｜空亡' : ''}`).join('\n');
  const display = [
    '【大六壬｜月将加时】',
    `起课：${dateText(date)}`,
    `四柱：${result.ganzhi.year}年 ${result.ganzhi.month}月 ${result.ganzhi.day}日 ${result.ganzhi.hour}时`,
    `月将：${result.monthLeader}｜占时：${result.divinationBranch}｜${text(result.dayNight)}｜贵人临支：${text(result.noblemanBranch)}`,
    `旬空：${list(result.xunKong)}｜取传：${text(result.transmissionRule)}｜课体：${list(result.guaTi)}`,
    '',
    '四课：', lessons,
    '',
    '三传：', transmissions,
  ].join('\n');
  return envelope('liuren', result.timestamp, { dateTime: date.toISOString(), method: '月将加时' }, {
    ganzhi: result.ganzhi,
    dayNight: result.dayNight,
    monthLeader: result.monthLeader,
    divinationBranch: result.divinationBranch,
    noblemanBranch: result.noblemanBranch,
    xunKong: result.xunKong,
    transmissionRule: result.transmissionRule,
    transmissionPattern: result.transmissionPattern,
    fourLessons: result.fourLessons,
    threeTransmissions: result.threeTransmissions,
    guaTi: result.guaTi,
    timingEvidence: result.timingEvidence,
  }, display, ['输出为结构化课盘与取传事实；神煞、课体仍应结合所问事项人工辨用。'],
  `月将${result.monthLeader}，${result.transmissionRule}；三传${result.threeTransmissions.map((item) => item.branch).join('→')}${result.guaTi.length ? `；${result.guaTi.slice(0, 3).join('、')}` : ''}`,
  result.timingEvidence?.slice(0, 3).join('；') ?? '当前课只给出先后与触发条件，没有唯一日期。');
}

function formatXiaoliuren(date: Date) {
  const result = generateXiaoliuren({ customDate: date });
  const display = [
    '【小六壬｜月日时三步】',
    `起课：${dateText(date)}`,
    `农历：${result.isLeapMonth ? '闰' : ''}${result.lunarMonth}月${result.lunarDay}日｜${result.hourLabel}`,
    `月宫：${result.sequence.month.name}`,
    `日宫：${result.sequence.day.name}`,
    `时宫：${result.sequence.hour.name}`, 
    '',
    `主宫：${result.primary.name}`,
    result.primary.verse,
    '',
    `复算：月数 ${result.calculation.monthSeed} → 日数 ${result.calculation.daySeed} → 时数 ${result.calculation.hourSeed}`,
  ].join('\n');
  return envelope('xiaoliuren', result.timestamp, { dateTime: date.toISOString(), method: 'time' }, {
    lunarMonth: result.lunarMonth,
    lunarDay: result.lunarDay,
    isLeapMonth: result.isLeapMonth,
    hourLabel: result.hourLabel,
    ganzhi: result.ganzhi,
    calculation: result.calculation,
    sequence: result.sequence,
  }, display, ['按东八区民用日零点换日；闰月沿用同名月序。'],
  `月宫${result.sequence.month.name}、日宫${result.sequence.day.name}、时宫${result.sequence.hour.name}；主宫${result.primary.name}`);
}

function formatMeihua(date: Date, options: Options) {
  const method = options.method === 'number' ? 'number' : 'time';
  const number = typeof options.number === 'number' ? options.number : Number(options.number);
  if (method === 'number' && (!Number.isSafeInteger(number) || number <= 0)) {
    throw new Error('数字起卦需要输入大于 0 的整数。');
  }
  const result = generateMeihua(date, method === 'number' ? { method, number } : { method });
  const display = [
    '【梅花易数】',
    `起卦：${dateText(date)}｜${method === 'number' ? `数字 ${number}` : '时间起卦'}`,
    `主卦：${result.mainHexagram.symbol} ${result.originalName}（上${result.mainHexagram.upper} 下${result.mainHexagram.lower}）`,
    `互卦：${text(result.interHexagram?.symbol)} ${text(result.interName)}`,
    `变卦：${text(result.changedHexagram?.symbol)} ${text(result.changedName)}`,
    `动爻：第${result.movingYao.position}爻｜${result.movingYao.yaoName}`,
    `体：${result.tiGua.name}·${result.tiGua.element}｜用：${result.yongGua.name}·${result.yongGua.element}`,
    `体用：${result.analysis.tiYongRelation}｜体旺衰：${result.analysis.tiSeasonState}｜用旺衰：${result.analysis.yongSeasonState}`,
    `变卦关系：${result.analysis.changedRelation}`,
    '',
    text(result.mainHexagram.movingYaoCi),
  ].join('\n');
  return envelope('meihua', result.timestamp, { dateTime: date.toISOString(), method, ...(method === 'number' ? { number } : {}) }, {
    ganzhi: result.ganzhi,
    originalName: result.originalName,
    interName: result.interName,
    changedName: result.changedName,
    mainHexagram: result.mainHexagram,
    interHexagram: result.interHexagram,
    changedHexagram: result.changedHexagram,
    movingYao: result.movingYao,
    tiGua: result.tiGua,
    yongGua: result.yongGua,
    analysis: result.analysis,
    calculation: result.calculation,
  }, display, ['时间起卦与数字起卦为不同输入口径；结果保留所用方法和复算字段。'],
  `主卦${result.originalName}，第${result.movingYao.position}爻动，变${result.changedName}；${result.analysis.tiYongRelation}`,
  result.analysis.yingQi?.slice(0, 4).join('；') ?? '当前卦没有形成明确应期线索。');
}

function formatJinkoujue(date: Date, options: Options) {
  const allowed = ['time', 'branch', 'number'];
  const method = allowed.includes(String(options.method)) ? String(options.method) : 'time';
  const params: Record<string, unknown> = { method, customDate: date };
  if (method === 'branch') params.branch = options.branch;
  if (method === 'number') params.number = Number(options.number);
  const result = generateJinkoujue(params as Parameters<typeof generateJinkoujue>[0]);
  const positions = Object.values(result.positions).map((item) => `${item.name}：${text(item.stem)}${item.branch}｜${item.element}｜${text(item.god)}｜${item.seasonState}${item.isVoid ? '｜空亡' : ''}`).join('\n');
  const movements = result.movements.map((item) => `${item.category}·${item.name}：${item.trigger}`).join('\n') || '无';
  const display = [
    '【金口诀】',
    `起课：${dateText(date)}｜${result.methodLabel}`,
    `四柱：${result.ganzhi.year}年 ${result.ganzhi.month}月 ${result.ganzhi.day}日 ${result.ganzhi.hour}时`,
    `地分：${result.diFenBranch}｜月将：${result.monthLeader}｜贵人：${result.noblemanBranch}｜${result.dayNight}`,
    `阴阳取用：${result.yinYangUse.pattern}，用${result.yinYangUse.usePosition}`,
    '',
    positions,
    '',
    `动象：\n${movements}`,
    '',
    result.mainLine,
    result.summary,
  ].join('\n');
  return envelope('jinkoujue', result.timestamp, { dateTime: date.toISOString(), method, branch: options.branch, number: options.number }, {
    ganzhi: result.ganzhi,
    method: result.method,
    monthLeader: result.monthLeader,
    noblemanBranch: result.noblemanBranch,
    diFenBranch: result.diFenBranch,
    xunKong: result.xunKong,
    positions: result.positions,
    relations: result.relations,
    yinYangUse: result.yinYangUse,
    movements: result.movements,
    calculation: result.calculation,
  }, display, ['随机起课未接入；首版提供时间、指定地分和数字三种可复算输入。'],
  `地分${result.diFenBranch}，${result.yinYangUse.pattern}用${result.yinYangUse.usePosition}${result.movements.length ? `；动象${result.movements.slice(0, 2).map((item) => item.name).join('、')}` : ''}`);
}

function formatTaiyi(date: Date, options: Options) {
  const allowed = ['year', 'month', 'day', 'hour'];
  const scope = allowed.includes(String(options.scope)) ? String(options.scope) as 'year' | 'month' | 'day' | 'hour' : 'year';
  const result = scope === 'year' ? generateTaiyi({ scope, year: date.getFullYear() }) : generateTaiyi({ scope, date });
  const display = [
    `【太乙神数｜${result.accumulatedLabel}七十二局】`,
    `时间：${dateText(date)}｜干支：${result.ganZhi}`,
    `${result.accumulatedLabel}：${result.accumulatedValue}｜${result.yinYang}${result.bureau}局`,
    `太乙：${result.taiyiPosition}（${result.taiyiGua}宫·${result.taiyiDir}）`,
    `文昌：${result.wenChangPosition}｜始击：${result.shiJiPosition}｜计神：${result.jiShenPosition}`,
    `主算 ${result.lordCount}｜客算 ${result.guestCount}｜定算 ${result.setCount}`,
    '',
    result.judgments.join('\n'),
  ].join('\n');
  return envelope('taiyi', Date.now(), { dateTime: date.toISOString(), scope }, {
    scope: result.scope,
    ganZhi: result.ganZhi,
    accumulatedValue: result.accumulatedValue,
    accumulatedLabel: result.accumulatedLabel,
    yinYang: result.yinYang,
    bureau: result.bureau,
    taiyiPosition: result.taiyiPosition,
    taiyiPalace: result.taiyiPalace,
    taiyiGua: result.taiyiGua,
    taiyiDir: result.taiyiDir,
    wenChangPosition: result.wenChangPosition,
    shiJiPosition: result.shiJiPosition,
    jiShenPosition: result.jiShenPosition,
    lordCount: result.lordCount,
    guestCount: result.guestCount,
    setCount: result.setCount,
    judgments: result.judgments,
    model: result.model,
  }, display, ['年计按积年起局；月、日、时计采用现代历法定位复现通行四计。'],
  `${result.yinYang}${result.bureau}局，太乙${result.taiyiPosition}，文昌${result.wenChangPosition}，始击${result.shiJiPosition}；主算${result.lordCount}、客算${result.guestCount}`);
}

function formatAlmanac(date: Date, options: Options) {
  const topic = String(options.topic || 'custom') as Parameters<typeof generateAlmanacSelection>[0]['topic'];
  const startDate = String(options.startDate || '');
  const endDate = String(options.endDate || '');
  if (!startDate || !endDate) throw new Error('择日需要开始日期和结束日期。');
  const result = generateAlmanacSelection({ topic, startDate, endDate });
  const shownDays = result.days.slice(0, 12);
  const candidates = shownDays.map((day, index) => [
    `${index + 1}. ${day.date} ${day.weekday}｜农历 ${day.lunarDate}｜${day.ganzhi.day}日`,
    `   建除 ${day.dayOfficer}｜十二神 ${day.twelveStar}｜冲煞 ${day.clash}`,
    `   支持：${list(day.highlights)}`,
    `   限制：${list(day.cautions)}`,
  ].join('\n')).join('\n\n');
  const display = [
    `【择日／黄历｜${result.topicLabel}】`,
    `范围：${result.startDate} 至 ${result.endDate}｜共比较 ${result.days.length} 天`,
    '候选按规则状态、事项匹配与日期排列；以下显示前 12 项：',
    '',
    candidates,
  ].join('\n');
  return envelope('almanac', result.timestamp, { topic, startDate, endDate }, {
    topic: result.topic,
    topicLabel: result.topicLabel,
    startDate: result.startDate,
    endDate: result.endDate,
    days: shownDays,
    totalDays: result.days.length,
  }, display, ['未提供参与人生辰时，不计算与参与人的刑冲破害；候选是透明规则筛选，不替代现实条件判断。'],
  `${result.topicLabel}候选：${shownDays.slice(0, 3).map((day) => day.date).join('、')}`,
  `${result.topicLabel}候选：${shownDays.slice(0, 3).map((day) => day.date).join('、')}`);
}

export function calculate(method: string, timestamp: number, optionsJson = '{}'): string {
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) throw new Error('起课时间无效。');
    const options = JSON.parse(optionsJson || '{}') as Options;
    const result = (() => {
      switch (method) {
        case 'qimen': return formatQimen(date);
        case 'liuren': return formatLiuren(date);
        case 'xiaoliuren': return formatXiaoliuren(date);
        case 'meihua': return formatMeihua(date, options);
        case 'taiyi': return formatTaiyi(date, options);
        case 'jinkoujue': return formatJinkoujue(date, options);
        case 'almanac': return formatAlmanac(date, options);
        default: throw new Error(`未知占卜方法：${method}`);
      }
    })();
    return JSON.stringify({ ok: true, result });
  } catch (error) {
    return JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}
