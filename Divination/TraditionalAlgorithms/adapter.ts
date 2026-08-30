import { generateQimen } from 'mingyu-core/divination/qimen';
import { generateLiuren } from 'mingyu-core/divination/liuren';
import { generateXiaoliuren } from 'mingyu-core/divination/xiaoliuren';
import { generateMeihua } from 'mingyu-core/divination/meihua';
import { generateJinkoujue } from 'mingyu-core/divination/jinkoujue';
import { generateAlmanacSelection } from 'mingyu-core/divination/almanac';
import { taiyi } from 'mingyu-core';

const { generateTaiyi } = taiyi;

type Options = Record<string, unknown>;

const METHOD_VERSION = 'mingyu-core-0.1.32+zhanbu-2';
const SOURCE_URL = 'https://github.com/Brhiza/mingyu/tree/main/packages/core';

const QUESTION_CATEGORIES = [
  'loveSingle', 'lovePartner', 'marriage', 'wealth', 'career',
  'litigation', 'health', 'study', 'travel', 'search',
] as const;
type QuestionCategory = typeof QUESTION_CATEGORIES[number];
type Gender = 'male' | 'female';
type SearchTarget = 'elder' | 'peer' | 'junior' | 'property';
type FocusProfile = {
  questionCategory: QuestionCategory;
  gender?: Gender;
  searchTarget?: SearchTarget;
};

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  loveSingle: '婚恋·未婚', lovePartner: '婚恋·已有对象', marriage: '婚姻·已婚', wealth: '财运', career: '事业',
  litigation: '官司诉讼', health: '健康疾病', study: '考试／学业', travel: '出行／远行', search: '寻人寻物',
};
const SEARCH_TARGET_LABELS: Record<SearchTarget, string> = {
  elder: '长辈', peer: '平辈', junior: '晚辈', property: '财物',
};
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥'.split('');
const HEAVENLY_GENERALS = ['贵人', '螣蛇', '朱雀', '六合', '勾陈', '青龙', '天空', '白虎', '太常', '玄武', '太阴', '天后'];
const ELEMENT_CYCLE = ['木', '火', '土', '金', '水'];
const STEM_ELEMENTS: Record<string, string> = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
};
const BRANCH_ELEMENTS: Record<string, string> = {
  子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水',
};

function readFocus(options: Options): FocusProfile | undefined {
  if (options.questionCategory === undefined || options.questionCategory === '') return undefined;
  const questionCategory = String(options.questionCategory) as QuestionCategory;
  if (!QUESTION_CATEGORIES.includes(questionCategory)) throw new Error(`所测事项分类无效：${questionCategory}`);
  const profile: FocusProfile = { questionCategory };
  if (['loveSingle', 'lovePartner', 'marriage'].includes(questionCategory)) {
    const gender = String(options.gender || '') as Gender;
    if (!['male', 'female'].includes(gender)) throw new Error('婚恋／婚姻类需要选择求测者性别。');
    profile.gender = gender;
  }
  if (questionCategory === 'search') {
    const searchTarget = String(options.searchTarget || '') as SearchTarget;
    if (!['elder', 'peer', 'junior', 'property'].includes(searchTarget)) throw new Error('寻人寻物类需要选择寻找对象。');
    profile.searchTarget = searchTarget;
  }
  return profile;
}

function focusLabel(profile: FocusProfile): string {
  const details = [
    profile.gender ? (profile.gender === 'male' ? '男测' : '女测') : '',
    profile.searchTarget ? `寻${SEARCH_TARGET_LABELS[profile.searchTarget]}` : '',
  ].filter(Boolean);
  return CATEGORY_LABELS[profile.questionCategory] + (details.length ? `（${details.join('·')}）` : '');
}

function relationBetween(fromElement: string, toElement: string): string {
  if (fromElement === toElement) return '比和';
  const from = ELEMENT_CYCLE.indexOf(fromElement);
  const to = ELEMENT_CYCLE.indexOf(toElement);
  if (from < 0 || to < 0) return '关系未知';
  if ((from + 1) % 5 === to) return `${fromElement}生${toElement}`;
  if ((from + 2) % 5 === to) return `${fromElement}克${toElement}`;
  if ((to + 1) % 5 === from) return `${toElement}生${fromElement}`;
  return `${toElement}克${fromElement}`;
}

function sixRelation(selfElement: string, otherElement: string): string {
  if (selfElement === otherElement) return '兄弟';
  const self = ELEMENT_CYCLE.indexOf(selfElement);
  const other = ELEMENT_CYCLE.indexOf(otherElement);
  if ((self + 1) % 5 === other) return '子孙';
  if ((other + 1) % 5 === self) return '父母';
  if ((self + 2) % 5 === other) return '妻财';
  return '官鬼';
}

function requestedSixRelation(profile: FocusProfile): string | undefined {
  switch (profile.questionCategory) {
    case 'loveSingle': case 'lovePartner': case 'marriage': return profile.gender === 'male' ? '妻财' : '官鬼';
    case 'wealth': return '妻财';
    case 'career': case 'litigation': case 'health': return '官鬼';
    case 'study': return '父母';
    case 'search': return ({ elder: '父母', peer: '兄弟', junior: '子孙', property: '妻财' } as const)[profile.searchTarget!];
    case 'travel': return undefined;
  }
}

function profileInput(profile?: FocusProfile): Options {
  return profile ? {
    questionCategory: profile.questionCategory,
    ...(profile.gender ? { gender: profile.gender } : {}),
    ...(profile.searchTarget ? { searchTarget: profile.searchTarget } : {}),
  } : {};
}

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

function liurenGeneralDistribution(result: ReturnType<typeof generateLiuren>) {
  const start = BRANCHES.indexOf(result.noblemanBranch);
  const observed = [
    ...result.fourLessons.map((item) => ({ branch: item.upper, god: item.god })),
    ...result.threeTransmissions.map((item) => ({ branch: item.branch, god: item.god })),
  ];
  const candidate = (step: number) => BRANCHES.map((branch, index) => ({
    branch,
    god: HEAVENLY_GENERALS[((index - start) * step % 12 + 12) % 12],
  }));
  const scored = [candidate(1), candidate(-1)].map((distribution) => ({
    distribution,
    score: observed.filter((item) => distribution.some((entry) => entry.branch === item.branch && entry.god === item.god)).length,
  }));
  return scored.sort((a, b) => b.score - a.score)[0].distribution;
}

function liurenFocus(result: ReturnType<typeof generateLiuren>, profile: FocusProfile) {
  const category = profile.questionCategory;
  const spirit = (() => {
    if (['loveSingle', 'lovePartner', 'marriage'].includes(category)) return profile.gender === 'male' ? '太常' : '六合';
    return ({ wealth: '青龙', career: '太常', litigation: '白虎', health: '白虎', study: '太阴', search: '玄武' } as Record<string, string>)[category];
  })();
  const dayStem = result.ganzhi.day[0];
  const dayBranch = result.ganzhi.day[1];
  const distribution = liurenGeneralDistribution(result);
  const horseByGroup: Record<string, string> = {
    申: '寅', 子: '寅', 辰: '寅', 寅: '申', 午: '申', 戌: '申',
    巳: '亥', 酉: '亥', 丑: '亥', 亥: '巳', 卯: '巳', 未: '巳',
  };
  const branch = category === 'travel'
    ? horseByGroup[dayBranch]
    : distribution.find((item) => item.god === spirit)?.branch;
  const transmission = result.threeTransmissions.find((item) => category === 'travel' ? item.branch === branch : item.god === spirit);
  const branchElement = branch ? BRANCH_ELEMENTS[branch] : '';
  return {
    questionCategory: category,
    categoryLabel: focusLabel(profile),
    classSpirit: category === 'travel' ? '驿马' : spirit,
    transmission: transmission?.stage ?? null,
    branch: branch ?? null,
    relationToDayStem: branchElement ? relationBetween(branchElement, STEM_ELEMENTS[dayStem]) : null,
    relationToDayBranch: branchElement ? relationBetween(branchElement, BRANCH_ELEMENTS[dayBranch]) : null,
    fullHeavenlyGeneralDistribution: distribution,
  };
}

function formatLiuren(date: Date, options: Options) {
  const result = generateLiuren(date);
  const profile = readFocus(options);
  const focus = profile ? liurenFocus(result, profile) : undefined;
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
    ...(focus ? [
      '', `事项定位：${focus.categoryLabel}`,
      `类神：${focus.classSpirit}｜${focus.transmission ?? '不在三传'}｜所临地支 ${focus.branch}`,
      `类神与日干／日支：${focus.relationToDayStem}／${focus.relationToDayBranch}`,
      `十二天将：${focus.fullHeavenlyGeneralDistribution.map((item) => `${item.branch}${item.god}`).join('、')}`,
    ] : []),
  ].join('\n');
  return envelope('liuren', result.timestamp, { dateTime: date.toISOString(), method: '月将加时', ...profileInput(profile) }, {
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
    ...(focus ? { focus } : {}),
  }, display, ['输出为结构化课盘与取传事实；神煞、课体仍应结合所问事项人工辨用。'],
  `月将${result.monthLeader}，${result.transmissionRule}；三传${result.threeTransmissions.map((item) => item.branch).join('→')}${result.guaTi.length ? `；${result.guaTi.slice(0, 3).join('、')}` : ''}${focus ? `；${focus.categoryLabel}类神${focus.classSpirit}临${focus.branch}${focus.transmission ? `（${focus.transmission}）` : '（不在三传）'}` : ''}`,
  result.timingEvidence?.slice(0, 3).join('；') ?? '当前课只给出先后与触发条件，没有唯一日期。');
}

function xiaoliurenFocus(primary: { name: string; verse: string }, profile: FocusProfile) {
  const keywordMap: Record<QuestionCategory, string[]> = {
    loveSingle: ['婚姻', '阴人', '人口', '合'], lovePartner: ['婚姻', '阴人', '人口', '合'], marriage: ['婚姻', '阴人', '人口', '合'],
    wealth: ['求财', '财'], career: ['官事', '求谋'], litigation: ['官事', '口舌', '刑伤'], health: ['病人', '病者', '病'],
    study: ['求谋', '文书'], travel: ['行人', '去者', '来人', '回程'], search: ['失物'],
  };
  const clauses = primary.verse.split(/[，。；]/u).map((item) => item.trim()).filter(Boolean);
  const matched = clauses.filter((clause) => keywordMap[profile.questionCategory].some((keyword) => clause.includes(keyword)));
  const totalJudgments: Record<string, string> = {
    大安: '大安事事昌', 留连: '留连事难成', 速喜: '速喜喜来临',
    赤口: '赤口主口舌', 小吉: '小吉最吉昌', 空亡: '空亡事不祥',
  };
  return {
    questionCategory: profile.questionCategory,
    categoryLabel: focusLabel(profile),
    primaryPalace: primary.name,
    categoryExcerpt: matched.length ? matched.join('；') : null,
    totalJudgment: totalJudgments[primary.name] ?? clauses[0] ?? primary.name,
  };
}

function formatXiaoliuren(date: Date, options: Options) {
  const result = generateXiaoliuren({ customDate: date });
  const profile = readFocus(options);
  const focus = profile ? xiaoliurenFocus(result.primary, profile) : undefined;
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
    ...(focus ? [
      `事项定位：${focus.categoryLabel}`,
      `对应断语：${focus.categoryExcerpt ?? '口诀无对应分句，采用总断'}`,
      `总断：${focus.totalJudgment}`,
    ] : []),
    '',
    `复算：月数 ${result.calculation.monthSeed} → 日数 ${result.calculation.daySeed} → 时数 ${result.calculation.hourSeed}`,
  ].join('\n');
  return envelope('xiaoliuren', result.timestamp, { dateTime: date.toISOString(), method: 'time', ...profileInput(profile) }, {
    lunarMonth: result.lunarMonth,
    lunarDay: result.lunarDay,
    isLeapMonth: result.isLeapMonth,
    hourLabel: result.hourLabel,
    ganzhi: result.ganzhi,
    calculation: result.calculation,
    sequence: result.sequence,
    ...(focus ? { focus } : {}),
  }, display, ['按东八区民用日零点换日；闰月沿用同名月序。'],
  `月宫${result.sequence.month.name}、日宫${result.sequence.day.name}、时宫${result.sequence.hour.name}；主宫${result.primary.name}${focus ? `；${focus.categoryLabel}：${focus.categoryExcerpt ?? focus.totalJudgment}` : ''}`);
}

function formatMeihua(date: Date, options: Options) {
  const profile = readFocus(options);
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
    ...(profile ? [
      `事项定位：${focusLabel(profile)}｜体卦代表求测人，用卦代表所测之事${profile.questionCategory === 'wealth' ? `｜${result.analysis.tiYongRelation.includes('体克用') ? '体克用，可作为得财条件' : '当前不是体克用，不作“我克财”条件'}` : ''}`,
    ] : []),
    '',
    text(result.mainHexagram.movingYaoCi),
  ].join('\n');
  return envelope('meihua', result.timestamp, { dateTime: date.toISOString(), method, ...(method === 'number' ? { number } : {}), ...profileInput(profile) }, {
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
    ...(profile ? { focus: {
      questionCategory: profile.questionCategory,
      categoryLabel: focusLabel(profile),
      selfRole: '体卦／求测人', matterRole: '用卦／所测之事', mode: '简化体用版',
    } } : {}),
  }, display, ['时间起卦与数字起卦为不同输入口径；结果保留所用方法和复算字段。'],
  `主卦${result.originalName}，第${result.movingYao.position}爻动，变${result.changedName}；${result.analysis.tiYongRelation}${profile ? `；${focusLabel(profile)}以体为求测人、用为所测之事` : ''}`,
  result.analysis.yingQi?.slice(0, 4).join('；') ?? '当前卦没有形成明确应期线索。');
}

function formatJinkoujue(date: Date, options: Options) {
  const profile = readFocus(options);
  const allowed = ['time', 'branch', 'number'];
  const method = allowed.includes(String(options.method)) ? String(options.method) : 'time';
  const params: Record<string, unknown> = { method, customDate: date };
  if (method === 'branch') params.branch = options.branch;
  if (method === 'number') params.number = Number(options.number);
  const result = generateJinkoujue(params as Parameters<typeof generateJinkoujue>[0]);
  const dayElement = STEM_ELEMENTS[result.ganzhi.day[0]];
  const positionRelations = Object.entries(result.positions).map(([key, item]) => ({
    key,
    position: item.name,
    element: item.element,
    sixRelation: sixRelation(dayElement, item.element),
  }));
  const requested = profile ? requestedSixRelation(profile) : undefined;
  const matchedPositions = requested ? positionRelations.filter((item) => item.sixRelation === requested).map((item) => item.position) : [];
  const focus = profile ? {
    questionCategory: profile.questionCategory,
    categoryLabel: focusLabel(profile),
    referenceElement: dayElement,
    fourPositionSixRelations: positionRelations,
    useGodSixRelation: requested ?? '地分',
    useGodPositions: requested ? matchedPositions : ['地分'],
    useGodPresent: requested ? matchedPositions.length > 0 : true,
    hiddenSpirit: false,
    absentNote: requested && matchedPositions.length === 0 ? '用神不现；当前简化流派不设伏神，需综合四位生克旺衰。' : null,
    ...(['lovePartner', 'marriage'].includes(profile.questionCategory) ? {
      selfOtherRelation: relationBetween(result.positions.diFen.element, result.positions.jiangShen.element),
      selfPosition: '地分', otherPosition: '将神',
    } : {}),
  } : undefined;
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
    ...(focus ? [
      '', `事项定位：${focus.categoryLabel}`,
      `四位六亲：${focus.fourPositionSixRelations.map((item) => `${item.position}=${item.sixRelation}`).join('、')}`,
      `用神：${focus.useGodSixRelation}｜所在位：${focus.useGodPositions.length ? focus.useGodPositions.join('、') : '不现'}`,
      ...(focus.absentNote ? [focus.absentNote] : []),
      ...('selfOtherRelation' in focus ? [`地分与将神：${focus.selfOtherRelation}`] : []),
    ] : []),
    '',
    result.mainLine,
    result.summary,
  ].join('\n');
  return envelope('jinkoujue', result.timestamp, { dateTime: date.toISOString(), method, branch: options.branch, number: options.number, ...profileInput(profile) }, {
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
    ...(focus ? { focus } : {}),
  }, display, ['随机起课未接入；首版提供时间、指定地分和数字三种可复算输入。'],
  `地分${result.diFenBranch}，${result.yinYangUse.pattern}用${result.yinYangUse.usePosition}${result.movements.length ? `；动象${result.movements.slice(0, 2).map((item) => item.name).join('、')}` : ''}${focus ? `；${focus.categoryLabel}用神${focus.useGodSixRelation}${focus.useGodPositions.length ? `在${focus.useGodPositions.join('、')}` : '不现'}` : ''}`);
}

function formatTaiyi(date: Date, options: Options) {
  const profile = readFocus(options);
  const allowed = ['year', 'month', 'day', 'hour'];
  const scope = allowed.includes(String(options.scope)) ? String(options.scope) as 'year' | 'month' | 'day' | 'hour' : 'year';
  const result = scope === 'year' ? generateTaiyi({ scope, year: date.getFullYear() }) : generateTaiyi({ scope, date });
  const roleMap: Partial<Record<QuestionCategory, [string, string]>> = {
    loveSingle: ['己方意愿／条件', '对方意愿／条件'], lovePartner: ['己方意愿／条件', '对方意愿／条件'], marriage: ['己方意愿／条件', '配偶意愿／条件'],
    wealth: ['己方财力', '外部财源'], career: ['自身条件', '上司／竞争者／外部职位条件'], litigation: ['己方诉讼人', '对方诉讼人'],
    health: ['本人正气', '病邪'], travel: ['己方／出行人', '途中变数'],
  };
  const roles = profile ? (roleMap[profile.questionCategory] ?? ['求测方', '外部对象／条件']) : undefined;
  const focus = profile && roles ? {
    questionCategory: profile.questionCategory,
    categoryLabel: focusLabel(profile),
    lordMeaning: roles[0],
    guestMeaning: roles[1],
    comparison: result.lordCount === result.guestCount ? '主客相当' : result.lordCount > result.guestCount ? '主方数值占优' : '客方数值占优',
  } : undefined;
  const display = [
    `【太乙神数｜${result.accumulatedLabel}七十二局】`,
    `时间：${dateText(date)}｜干支：${result.ganZhi}`,
    `${result.accumulatedLabel}：${result.accumulatedValue}｜${result.yinYang}${result.bureau}局`,
    `太乙：${result.taiyiPosition}（${result.taiyiGua}宫·${result.taiyiDir}）`,
    `文昌：${result.wenChangPosition}｜始击：${result.shiJiPosition}｜计神：${result.jiShenPosition}`,
    `主算 ${result.lordCount}｜客算 ${result.guestCount}｜定算 ${result.setCount}`,
    ...(focus ? [`事项定位：${focus.categoryLabel}`, `主算含义：${focus.lordMeaning}｜客算含义：${focus.guestMeaning}｜${focus.comparison}`] : []),
    '',
    result.judgments.join('\n'),
  ].join('\n');
  return envelope('taiyi', Date.now(), { dateTime: date.toISOString(), scope, ...profileInput(profile) }, {
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
    ...(focus ? { focus } : {}),
  }, display, ['年计按积年起局；月、日、时计采用现代历法定位复现通行四计。'],
  `${result.yinYang}${result.bureau}局，太乙${result.taiyiPosition}，文昌${result.wenChangPosition}，始击${result.shiJiPosition}；主算${result.lordCount}（${focus?.lordMeaning ?? '己方'}）、客算${result.guestCount}（${focus?.guestMeaning ?? '对方／外部'}）${focus ? `；${focus.comparison}` : ''}`);
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
        case 'liuren': return formatLiuren(date, options);
        case 'xiaoliuren': return formatXiaoliuren(date, options);
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
