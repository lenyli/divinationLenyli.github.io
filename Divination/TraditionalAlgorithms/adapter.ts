import { generateQimen } from 'mingyu-core/divination/qimen';
import { generateLiuren } from 'mingyu-core/divination/liuren';
import { generateXiaoliuren } from 'mingyu-core/divination/xiaoliuren';
import { generateMeihua } from 'mingyu-core/divination/meihua';
import { generateJinkoujue } from 'mingyu-core/divination/jinkoujue';
import { generateAlmanacSelection } from 'mingyu-core/divination/almanac';
import { generateLiuyao } from 'mingyu-core/divination/liuyao';
import { configure } from 'mingyu-core/calendar';
import { taiyi } from 'mingyu-core';

const { generateTaiyi } = taiyi;

type Options = Record<string, unknown>;

const METHOD_VERSION = 'mingyu-core-0.1.32+zhanbu-3';
const SOURCE_URL = 'https://github.com/Brhiza/mingyu/tree/main/packages/core';

type CalculationTimezoneMode = 'fixedEast8' | 'deviceLocal';
type CalculationContext = {
  contextVersion: 1;
  timestampUtc: number;
  inputWallClock: string;
  calculationTimezoneMode: CalculationTimezoneMode;
  calculationTimezoneOffsetMinutes: number;
  dayBoundaryPolicy: 'civilMidnight';
};

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

function resolveCalculationContext(date: Date, options: Options): CalculationContext {
  const mode = options.calculationTimezoneMode === 'deviceLocal' ? 'deviceLocal' : 'fixedEast8';
  const suppliedOffset = Number(options.calculationTimezoneOffsetMinutes);
  const offset = mode === 'fixedEast8' ? 480 : suppliedOffset;
  if (!Number.isInteger(offset) || offset < -720 || offset > 840) {
    throw new Error('设备本地时区需要提供 -720 到 840 之间的整数分钟偏移。');
  }
  configure({ timezoneOffset: offset });
  return {
    contextVersion: 1,
    timestampUtc: date.getTime(),
    inputWallClock: dateText(date, offset),
    calculationTimezoneMode: mode,
    calculationTimezoneOffsetMinutes: offset,
    dayBoundaryPolicy: 'civilMidnight',
  };
}

function contextInput(context: CalculationContext): Options {
  return {
    castContext: context,
    dateTimeUtc: new Date(context.timestampUtc).toISOString(),
    wallClock: context.inputWallClock,
    timezoneMode: context.calculationTimezoneMode,
    timezoneOffsetMinutes: context.calculationTimezoneOffsetMinutes,
    dayBoundaryPolicy: context.dayBoundaryPolicy,
  };
}

function timezoneLabel(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  return `UTC${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`;
}

function text(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  return String(value);
}

function list(value: unknown): string {
  return Array.isArray(value) && value.length ? value.map(text).join('、') : '无';
}

function dateText(date: Date, offsetMinutes = 480): string {
  const shifted = new Date(date.getTime() + offsetMinutes * 60_000);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())} ${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`;
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

const TRIGRAM_BY_LINES: Record<string, string> = {
  '阳阳阳': '乾', '阳阳阴': '兑', '阳阴阳': '离', '阳阴阴': '震',
  '阴阳阳': '巽', '阴阳阴': '坎', '阴阴阳': '艮', '阴阴阴': '坤',
};
const NAJIA_STEMS: Record<string, { lower: string; upper: string }> = {
  乾: { lower: '甲', upper: '壬' }, 兑: { lower: '丁', upper: '丁' },
  离: { lower: '己', upper: '己' }, 震: { lower: '庚', upper: '庚' },
  巽: { lower: '辛', upper: '辛' }, 坎: { lower: '戊', upper: '戊' },
  艮: { lower: '丙', upper: '丙' }, 坤: { lower: '乙', upper: '癸' },
};

function liuyaoNaJiaStems(yaoTypes: string[]): string[] {
  const lower = TRIGRAM_BY_LINES[yaoTypes.slice(0, 3).join('')];
  const upper = TRIGRAM_BY_LINES[yaoTypes.slice(3, 6).join('')];
  if (!lower || !upper) throw new Error('六爻经卦结构无效，无法配置纳甲天干。');
  return [NAJIA_STEMS[lower].lower, NAJIA_STEMS[lower].lower, NAJIA_STEMS[lower].lower,
    NAJIA_STEMS[upper].upper, NAJIA_STEMS[upper].upper, NAJIA_STEMS[upper].upper];
}

function liuyaoUsefulGod(result: ReturnType<typeof generateLiuyao>, profile?: FocusProfile) {
  if (!profile) return undefined;
  if (profile.questionCategory === 'travel') {
    const world = result.yaosDetail.find((line) => line.isWorld);
    return {
      requestedSixRelative: null,
      mappingRuleVersion: 'zhanbu-liuyao-focus-v2',
      candidates: world ? [{ kind: 'world', position: world.position, sixRelative: world.sixRelative }] : [],
      visibleCandidates: world ? [world.position] : [],
      hiddenCandidates: [],
      chosenPosition: world?.position ?? null,
      twoPresent: false,
      hidden: false,
      source: '项目兼容口径：出行以世爻为求测方；只作事项定位。',
      selectionReason: world ? ['出行事项按项目兼容口径定位世爻。'] : [],
      limitations: ['出行取世爻是项目简化口径，不替代人工审盘。'],
    };
  }
  const requested = requestedSixRelation(profile);
  const visible = result.yaosDetail.filter((line) => line.sixRelative === requested);
  const hidden = (result.hiddenSpirits ?? []).filter((line) => line.sixRelative === requested);
  const chosenPosition = visible.length === 1 ? visible[0].position : visible.length === 0 && hidden.length === 1 ? hidden[0].position : null;
  const selectionReason = chosenPosition === null
    ? [visible.length + hidden.length === 0 ? '盘中没有对应六亲，未伪造用神。' : '对应六亲存在多个候选，保留人工定用。']
    : [visible.length === 1 ? '对应六亲仅有一个明现候选。' : '对应六亲未明现且仅有一个伏藏候选。'];
  return {
    requestedSixRelative: requested ?? null,
    mappingRuleVersion: 'zhanbu-liuyao-focus-v2',
    candidates: [
      ...visible.map((line) => ({ kind: 'visible', position: line.position, branch: line.najiaDizhi, state: line.seasonState })),
      ...hidden.map((line) => ({ kind: 'hidden', position: line.position, branch: line.najiaDizhi, coveringLine: line.underYao })),
    ],
    visibleCandidates: visible.map((line) => line.position),
    hiddenCandidates: hidden.map((line) => line.position),
    chosenPosition,
    twoPresent: visible.length > 1,
    hidden: visible.length === 0 && hidden.length > 0,
    source: '项目事项六亲映射 v2；候选选择只在唯一明现或唯一伏藏时自动确定。',
    selectionReason,
    limitations: ['健康、出行等细分事项仍是简化口径；多候选时不自动取第一爻。'],
  };
}

function formatLiuyao(date: Date, options: Options, context: CalculationContext) {
  const profile = readFocus(options);
  const generationMethod = String(options.generationMethod ?? '');
  if (!['manual', 'coins'].includes(generationMethod)) throw new Error(`六爻起卦方式无效：${generationMethod || '未提供'}`);
  let result: ReturnType<typeof generateLiuyao>;
  if (generationMethod === 'manual') {
    if (!Array.isArray(options.yaos)) throw new Error('六爻手动卦需要提供六个爻值。');
    result = generateLiuyao(date, { method: 'manual', yaos: options.yaos as number[] });
  } else {
    if (!Array.isArray(options.coinThrows)) throw new Error('六爻随机三钱需要提供六次已冻结的投掷记录。');
    result = generateLiuyao(date, {
      method: 'coins',
      coinThrows: options.coinThrows as Array<{ coins: [2 | 3, 2 | 3, 2 | 3]; total: 6 | 7 | 8 | 9 }>,
    });
  }
  const mainTypes = result.yaosDetail.map((line) => line.yaoType);
  const changedTypes = result.yaosDetail.map((line) => line.isChanging ? (line.yaoType === '阳' ? '阴' : '阳') : line.yaoType);
  const mainStems = liuyaoNaJiaStems(mainTypes);
  const changedStems = liuyaoNaJiaStems(changedTypes);
  const lines = result.yaosDetail.map((line, index) => ({
    ...line,
    naJia: { stem: mainStems[index], branch: line.najiaDizhi },
    changedLine: line.changedYao ? {
      ...line.changedYao,
      naJia: { stem: changedStems[index], branch: line.changedYao.dizhi },
      relations: line.changeRelations ?? [],
      changeDirection: line.changeDirection ?? null,
    } : null,
  }));
  const usefulGod = liuyaoUsefulGod(result, profile);
  const lineDisplay = lines.slice().reverse().map((line) => {
    const flags = [line.isVoid && '空', line.isMonthBreak && '月破', line.isDayClash && '日冲', line.isDayBreak && '日破', line.isHiddenMove && '暗动', line.seasonState].filter(Boolean).join('、');
    const role = line.isWorld ? '世' : line.isResponse ? '应' : '—';
    const changed = line.changedLine ? ` → ${line.changedLine.liuqin}${line.changedLine.naJia.stem}${line.changedLine.naJia.branch}${line.changedLine.wuxing}${line.changedLine.relations.length ? `（${line.changedLine.relations.join('、')}）` : ''}` : '';
    return `${line.position}爻｜${line.sixGod}｜${line.sixRelative}｜${line.naJia.stem}${line.naJia.branch}${line.wuxing}｜${role}｜${line.yaoType}${line.isChanging ? '动' : '静'}｜${flags || '—'}${changed}`;
  }).join('\n');
  const display = [
    '【六爻纳甲｜随机三钱／手动卦】',
    `起卦：${dateText(date, context.calculationTimezoneOffsetMinutes)}（${timezoneLabel(context.calculationTimezoneOffsetMinutes)}）｜${generationMethod === 'coins' ? '随机三钱' : '手动卦'}`,
    `四柱：${result.ganzhi.year}年 ${result.ganzhi.month}月 ${result.ganzhi.day}日 ${result.ganzhi.hour}时`,
    `月建：${result.ganzhi.month.slice(-1)}｜日辰：${result.ganzhi.day.slice(-1)}｜旬空：${result.voidBranches.join('、')}`,
    `本卦：${result.originalName}｜变卦：${result.changedName}｜互卦：${result.interName}`,
    `卦宫：${result.palace.name}宫·${result.palace.wuxing}｜阶段：${result.palaceStage ?? '—'}｜${result.worldAndResponse.join('、')}`,
    '', '六爻盘：', lineDisplay,
    ...(usefulGod ? ['', `事项定位：${focusLabel(profile!)}`, `用神六亲：${usefulGod.requestedSixRelative ?? '世爻'}｜候选：${usefulGod.candidates.map((item) => `${item.position}爻${item.kind === 'hidden' ? '伏' : ''}`).join('、') || '无'}｜最终取用：${usefulGod.chosenPosition ? `${usefulGod.chosenPosition}爻` : '未自动确定'}`, `取用说明：${usefulGod.selectionReason.join('；')}`] : []),
  ].join('\n');
  const moving = result.changingYaos.map((line) => `${line.position}爻`).join('、') || '无';
  return envelope('liuyao', result.timestamp, {
    ...contextInput(context), generationMethod, yaoValues: result.yaoArray,
    ...(result.generation?.coinThrows ? { coinThrows: result.generation.coinThrows } : {}),
    ...profileInput(profile),
  }, {
    calendar: { fourPillars: result.ganzhi, monthBuild: result.ganzhi.month.slice(-1), dayChen: result.ganzhi.day.slice(-1), voidBranches: result.voidBranches },
    palace: { ...result.palace, stage: result.palaceStage },
    primary: { name: result.originalName, lines },
    changed: { name: result.changedName, lines: lines.map((line) => line.changedLine) },
    mutual: result.interName,
    hexagramRelations: result.hexagramRelations,
    fanfuRelations: result.fanfuRelations,
    hiddenSpirits: result.hiddenSpirits,
    guaShen: result.guaShen,
    specialPattern: result.specialPattern,
    specialAdvice: result.specialAdvice,
    isChaotic: result.isChaotic,
    chaoticReason: result.chaoticReason,
    sanheWithDay: result.sanheWithDay,
    sanheWithMonth: result.sanheWithMonth,
    sanxingInYaos: result.sanxingInYaos,
    evidenceAnalysis: result.evidenceAnalysis,
    usefulGod,
    generation: result.generation,
  }, display, ['纳甲天干按京房八宫经卦纳干表补齐；未自动扩展无来源神煞。'],
  `本卦${result.originalName}，动爻${moving}，${result.worldAndResponse.join('、')}，变卦${result.changedName}；月建${result.ganzhi.month.slice(-1)}、日辰${result.ganzhi.day.slice(-1)}、旬空${result.voidBranches.join('、')}${usefulGod ? `；用神${usefulGod.requestedSixRelative ?? '世爻'}${usefulGod.chosenPosition ? `在${usefulGod.chosenPosition}爻` : '未自动唯一确定'}` : ''}`);
}

function formatQimen(date: Date, context: CalculationContext) {
  const result = generateQimen(date, 'zhuanpan', 'hour', 'chaibu');
  const patternTags = result.patternTags ?? [];
  const orderedPalaces = [...result.jiuGongGe].sort((a, b) => a.gong - b.gong);
  const palaces = orderedPalaces
    .map((palace) => `${palace.name}（${palace.direction}）｜天盘 ${palace.tianPan.stem} ${palace.tianPan.star}｜地盘 ${palace.diPan.stem}｜${palace.renPan.door}｜${palace.shenPan.god}`)
    .join('\n');
  const display = [
    '【奇门遁甲｜时家转盘拆补法】',
    `起局：${dateText(date, context.calculationTimezoneOffsetMinutes)}（${timezoneLabel(context.calculationTimezoneOffsetMinutes)}）`,
    `四柱：${result.ganzhi.year}年 ${result.ganzhi.month}月 ${result.ganzhi.day}日 ${result.ganzhi.hour}时`,
    `定局：${result.isYangDun ? '阳遁' : '阴遁'}${result.juShu}局｜值符 ${result.zhiFu}｜值使 ${result.zhiShi}`,
    `节气：${text(result.timeInfo?.solarTerm)}｜空亡：${list(result.voidBranches)}｜驿马：${text(result.horseStar?.branch)}`,
    `格局：${list(patternTags)}`,
    '',
    '九宫盘：',
    palaces,
  ].join('\n');
  return envelope('qimen', result.timestamp, { ...contextInput(context), family: '时家', scope: 'hour', layout: 'zhuanpan', juMethod: 'chaibu' }, {
    ganzhi: result.ganzhi,
    isYangDun: result.isYangDun,
    juShu: result.juShu,
    zhiFu: result.zhiFu,
    zhiShi: result.zhiShi,
    solarTerm: result.timeInfo?.solarTerm,
    voidBranches: result.voidBranches,
    horseStar: result.horseStar,
    patternTags,
    yingQi: result.yingQi,
    palaces: orderedPalaces,
  }, display, ['首版固定为时家、转盘、拆补法；盘面事实不等同于事项断语。'],
  `${result.isYangDun ? '阳遁' : '阴遁'}${result.juShu}局，值符${result.zhiFu}，值使${result.zhiShi}${patternTags.length ? `；格局${patternTags.join('、')}` : ''}`,
  result.yingQi?.description ?? '当前盘只给出相对节奏，没有唯一日期。');
}

function liurenGeneralDistribution(result: ReturnType<typeof generateLiuren>) {
  if (result.heavenlyPlate.length !== 12) throw new Error('大六壬天地盘数据不完整：天盘必须恰好 12 位。');
  const under = new Set(result.heavenlyPlate.map((item) => item.under));
  const upper = new Set(result.heavenlyPlate.map((item) => item.branch));
  const generals = new Set(result.heavenlyPlate.map((item) => item.god));
  if (under.size !== 12 || upper.size !== 12 || generals.size !== 12) {
    throw new Error('大六壬天地盘数据不完整：地盘支、天盘支和十二天将必须各自唯一。');
  }
  return result.heavenlyPlate.map((item) => ({ under: item.under, branch: item.branch, god: item.god }));
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
  const locations = category === 'travel'
    ? distribution.filter((item) => item.branch === horseByGroup[dayBranch])
    : distribution.filter((item) => item.god === spirit);
  const branch = locations[0]?.branch;
  const branchElement = branch ? BRANCH_ELEMENTS[branch] : '';
  return {
    questionCategory: category,
    categoryLabel: focusLabel(profile),
    mappingRuleVersion: 'zhanbu-liuren-focus-candidates-v2',
    classSpiritCandidates: [category === 'travel' ? '驿马' : spirit].filter(Boolean),
    locations,
    inLessons: result.fourLessons.filter((item) => category === 'travel' ? item.upper === branch : item.god === spirit),
    inTransmissions: result.threeTransmissions.filter((item) => category === 'travel' ? item.branch === branch : item.god === spirit),
    relationToDayStem: branchElement ? relationBetween(branchElement, STEM_ELEMENTS[dayStem]) : null,
    relationToDayBranch: branchElement ? relationBetween(branchElement, BRANCH_ELEMENTS[dayBranch]) : null,
    limitations: ['类神为项目辅助候选，不改变四课三传，也不单独构成吉凶结论。'],
  };
}

function formatLiuren(date: Date, options: Options, context: CalculationContext) {
  const result = generateLiuren(date);
  const guaTi = result.guaTi ?? [];
  const profile = readFocus(options);
  const focus = profile ? liurenFocus(result, profile) : undefined;
  const lessons = result.fourLessons.map((item) => `${item.name}：${item.lower} → ${item.upper}｜${item.god}｜${item.relation}`).join('\n');
  const transmissions = result.threeTransmissions.map((item) => `${item.stage}：${item.branch}｜${item.god}｜${item.relation}${item.isVoid ? '｜空亡' : ''}`).join('\n');
  const display = [
    '【大六壬｜月将加时】',
    `起课：${dateText(date, context.calculationTimezoneOffsetMinutes)}（${timezoneLabel(context.calculationTimezoneOffsetMinutes)}）`,
    `四柱：${result.ganzhi.year}年 ${result.ganzhi.month}月 ${result.ganzhi.day}日 ${result.ganzhi.hour}时`,
    `月将：${result.monthLeader}｜占时：${result.divinationBranch}｜${text(result.dayNight)}｜贵人临支：${text(result.noblemanBranch)}`,
    `旬空：${list(result.xunKong)}｜取传：${text(result.transmissionRule)}｜课体：${list(guaTi)}`,
    '',
    '四课：', lessons,
    '',
    '三传：', transmissions,
    ...(focus ? [
      '', `事项定位：${focus.categoryLabel}`,
      `类神候选：${focus.classSpiritCandidates.join('、') || '无确定候选'}｜${focus.inTransmissions.length ? `入${focus.inTransmissions.map((item) => item.stage).join('、')}` : '不在三传'}`,
      `类神与日干／日支：${focus.relationToDayStem}／${focus.relationToDayBranch}`,
      `十二天将：${liurenGeneralDistribution(result).map((item) => `${item.under}上${item.branch}乘${item.god}`).join('、')}`,
    ] : []),
  ].join('\n');
  return envelope('liuren', result.timestamp, { ...contextInput(context), method: '月将加时', ...profileInput(profile) }, {
    ganzhi: result.ganzhi,
    dayNight: result.dayNight,
    monthLeader: result.monthLeader,
    divinationBranch: result.divinationBranch,
    noblemanBranch: result.noblemanBranch,
    noblemanGroundBranch: result.noblemanGroundBranch,
    xunKong: result.xunKong,
    earthlyPlate: result.earthlyPlate,
    heavenlyPlate: liurenGeneralDistribution(result),
    dayStemResidence: result.dayStemResidence,
    transmissionRule: result.transmissionRule,
    transmissionPattern: result.transmissionPattern,
    fourLessons: result.fourLessons,
    threeTransmissions: result.threeTransmissions,
    guaTi,
    timingEvidence: result.timingEvidence,
    ...(focus ? { focus } : {}),
  }, display, ['输出为结构化课盘与取传事实；神煞、课体仍应结合所问事项人工辨用。'],
  `月将${result.monthLeader}，${text(result.transmissionRule)}；三传${result.threeTransmissions.map((item) => item.branch).join('→')}${guaTi.length ? `；${guaTi.join('、')}` : ''}${focus ? `；${focus.categoryLabel}类神候选${focus.classSpiritCandidates.join('、')}` : ''}`,
  result.timingEvidence?.join('；') ?? '当前课只给出先后与触发条件，没有唯一日期。');
}

function xiaoliurenFocus(primary: { name: string; verse: string }, profile: FocusProfile) {
  return {
    questionCategory: profile.questionCategory,
    categoryLabel: focusLabel(profile),
    primaryPalace: primary.name,
    matchedTextExcerpt: null,
    limitations: ['当前没有独立核验的六宫事项表，只保留主宫与原始口诀，不从文案关键词推导事项结论。'],
  };
}

function formatXiaoliuren(date: Date, options: Options, context: CalculationContext) {
  const result = generateXiaoliuren({ customDate: date });
  const profile = readFocus(options);
  const focus = profile ? xiaoliurenFocus(result.primary, profile) : undefined;
  const display = [
    '【小六壬｜月日时三步】',
    `起课：${dateText(date, context.calculationTimezoneOffsetMinutes)}（${timezoneLabel(context.calculationTimezoneOffsetMinutes)}）`,
    `农历：${result.isLeapMonth ? '闰' : ''}${result.lunarMonth}月${result.lunarDay}日｜${result.hourLabel}`,
    `月宫：${result.sequence.month.name}`,
    `日宫：${result.sequence.day.name}`,
    `时宫：${result.sequence.hour.name}`, 
    '',
    `主宫：${result.primary.name}`,
    result.primary.verse,
    ...(focus ? [
      `事项定位：${focus.categoryLabel}`,
      '事项辅助：未启用（暂无独立核验的结构化事项表）',
    ] : []),
    '',
    `复算：月数 ${result.calculation.monthSeed} → 日数 ${result.calculation.daySeed} → 时数 ${result.calculation.hourSeed}`,
  ].join('\n');
  return envelope('xiaoliuren', result.timestamp, { ...contextInput(context), school: '六宫月日时三步法', method: 'time', monthPolicy: '农历月序', leapMonthPolicy: '沿用同名月序', hourBranchPolicy: '十二时支', ...profileInput(profile) }, {
    lunarMonth: result.lunarMonth,
    lunarDay: result.lunarDay,
    isLeapMonth: result.isLeapMonth,
    hourLabel: result.hourLabel,
    ganzhi: result.ganzhi,
    calculation: result.calculation,
    sequence: result.sequence,
    ...(focus ? { focus } : {}),
    primaryPalace: result.primary.name,
    primaryVerse: result.primary.verse,
  }, display, [`按${timezoneLabel(context.calculationTimezoneOffsetMinutes)}民用日零点换日；闰月沿用同名月序。`],
  `月宫${result.sequence.month.name}、日宫${result.sequence.day.name}、时宫${result.sequence.hour.name}；主宫${result.primary.name}${focus ? `；${focus.categoryLabel}仅保留原始口诀，不自动匹配事项句` : ''}`);
}

function formatMeihua(date: Date, options: Options, context: CalculationContext) {
  const profile = readFocus(options);
  const method = String(options.method ?? 'time');
  if (!['time', 'number'].includes(method)) throw new Error(`梅花易数起卦方式无效：${method}`);
  const number = typeof options.number === 'number' ? options.number : Number(options.number);
  if (method === 'number' && (!Number.isSafeInteger(number) || number <= 0)) {
    throw new Error('数字起卦需要输入大于 0 的整数。');
  }
  const result = generateMeihua(date, method === 'number' ? { method: 'number', number } : { method: 'time' });
  const display = [
    '【梅花易数】',
    `起卦：${dateText(date, context.calculationTimezoneOffsetMinutes)}（${timezoneLabel(context.calculationTimezoneOffsetMinutes)}）｜${method === 'number' ? `数字 ${number}（一数法）` : '时间起卦'}`,
    `主卦：${result.mainHexagram.symbol} ${result.originalName}（上${result.mainHexagram.upper} 下${result.mainHexagram.lower}）`,
    `互卦：${text(result.interHexagram?.symbol)} ${text(result.interName)}`,
    `变卦：${text(result.changedHexagram?.symbol)} ${text(result.changedName)}`,
    `动爻：第${result.movingYao.position}爻｜${result.movingYao.yaoName}`,
    `体：${result.tiGua.name}·${result.tiGua.element}｜用：${result.yongGua.name}·${result.yongGua.element}`,
    `体用：${result.analysis.tiYongRelation}｜体旺衰：${result.analysis.tiSeasonState}｜用旺衰：${result.analysis.yongSeasonState}`,
    `变卦关系：${result.analysis.changedRelation}`,
    ...(profile ? [
      `事项定位：${focusLabel(profile)}｜体卦代表求测人，用卦代表所测之事；只列体用与旺衰事实，不直接代替吉凶判断`,
    ] : []),
    '',
    text(result.mainHexagram.movingYaoCi),
  ].join('\n');
  return envelope('meihua', result.timestamp, { ...contextInput(context), method, formulaVersion: method === 'number' ? 'mingyu-one-number-v1' : 'mingyu-lunar-time-v1', ...(method === 'number' ? { number } : {}), ...profileInput(profile) }, {
    ganzhi: result.ganzhi,
    originalName: result.originalName,
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
  result.analysis.yingQi?.join('；') ?? '当前卦没有形成明确应期线索。');
}

function formatJinkoujue(date: Date, options: Options, context: CalculationContext) {
  const profile = readFocus(options);
  const allowed = ['time', 'branch', 'number'];
  const method = String(options.method ?? 'time');
  if (!allowed.includes(method)) throw new Error(`INVALID_METHOD：${method}`);
  const params: Record<string, unknown> = { method, customDate: date };
  if (method === 'branch') {
    const branch = String(options.branch ?? '');
    if (!branch) throw new Error('MISSING_BRANCH：指定地分起课需要地支。');
    if (!BRANCHES.includes(branch)) throw new Error(`INVALID_BRANCH：${branch}`);
    params.branch = branch;
  }
  if (method === 'number') {
    const number = Number(options.number);
    if (options.number === undefined || options.number === '') throw new Error('MISSING_NUMBER：数字起课需要数字。');
    if (!Number.isSafeInteger(number) || number <= 0) throw new Error('INVALID_NUMBER：数字必须是安全范围内的正整数。');
    params.number = number;
  }
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
    requestedSixRelative: requested ?? null,
    candidates: requested ? matchedPositions : [],
    chosenPosition: null,
    useGodPresent: requested ? matchedPositions.length > 0 : null,
    hiddenSpirit: false,
    mappingVersion: 'zhanbu-jinkoujue-focus-candidates-v2',
    absentNote: requested && matchedPositions.length === 0 ? '候选六亲不现；当前简化流派不设伏神，需综合四位生克旺衰。' : null,
    limitations: requested ? ['同六亲位置只作为候选；当前没有来源充分的唯一取用选择器，最终取用保留为空。'] : ['未选择可映射事项，不自动指定用神。'],
    ...(['lovePartner', 'marriage'].includes(profile.questionCategory) ? {
      selfOtherRelation: relationBetween(result.positions.diFen.element, result.positions.jiangShen.element),
      selfPosition: '地分', otherPosition: '将神',
    } : {}),
  } : undefined;
  const positions = Object.values(result.positions).map((item) => `${item.name}：${text(item.stem)}${item.branch}｜${item.element}｜${text(item.god)}｜${item.seasonState}${item.isVoid ? '｜空亡' : ''}`).join('\n');
  const movements = result.movements.map((item) => `${item.category}·${item.name}：${item.trigger}`).join('\n') || '无';
  const display = [
    '【金口诀】',
    `起课：${dateText(date, context.calculationTimezoneOffsetMinutes)}（${timezoneLabel(context.calculationTimezoneOffsetMinutes)}）｜${result.methodLabel}`,
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
      `用神六亲候选：${focus.requestedSixRelative ?? '未指定'}｜候选位置：${focus.candidates.length ? focus.candidates.join('、') : '不现／未指定'}｜最终取用：未自动指定`,
      ...(focus.absentNote ? [focus.absentNote] : []),
      ...('selfOtherRelation' in focus ? [`地分与将神：${focus.selfOtherRelation}`] : []),
    ] : []),
    '',
    result.mainLine,
    result.summary,
  ].join('\n');
  return envelope('jinkoujue', result.timestamp, { ...contextInput(context), method, ...(method === 'branch' ? { branch: params.branch } : {}), ...(method === 'number' ? { number: params.number } : {}), inputPolicy: '只消费当前 method 所需参数，其他参数不参与计算', ...profileInput(profile) }, {
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
  `地分${result.diFenBranch}，${result.yinYangUse.pattern}用${result.yinYangUse.usePosition}${result.movements.length ? `；动象${result.movements.map((item) => item.name).join('、')}` : ''}${focus ? `；${focus.categoryLabel}六亲候选${focus.requestedSixRelative ?? '未指定'}${focus.candidates.length ? `在${focus.candidates.join('、')}` : '不现'}` : ''}`);
}

function formatTaiyi(date: Date, options: Options, context: CalculationContext) {
  const profile = readFocus(options);
  const allowed = ['year', 'month', 'day', 'hour'];
  const requestedScope = String(options.scope ?? 'year');
  if (!allowed.includes(requestedScope)) throw new Error(`太乙计式无效：${requestedScope}`);
  const scope = requestedScope as 'year' | 'month' | 'day' | 'hour';
  const calculationYear = new Date(date.getTime() + context.calculationTimezoneOffsetMinutes * 60_000).getUTCFullYear();
  const result = scope === 'year' ? generateTaiyi({ scope, year: calculationYear }) : generateTaiyi({ scope, date });
  const resultTimestamp = typeof (result as { timestamp?: unknown }).timestamp === 'number'
    ? (result as { timestamp: number }).timestamp
    : date.getTime();
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
    mappingVersion: 'zhanbu-taiyi-focus-roles-v2',
    limitations: ['主客角色是项目辅助标签；主算、客算和定算仅作为盘面数值，不按大小自动判断胜负。'],
  } : undefined;
  const display = [
    `【太乙神数｜${result.accumulatedLabel}七十二局】`,
    `时间：${dateText(date, context.calculationTimezoneOffsetMinutes)}（${timezoneLabel(context.calculationTimezoneOffsetMinutes)}）｜计式：${scope}｜干支：${result.ganZhi}`,
    `${result.accumulatedLabel}：${result.accumulatedValue}｜${result.yinYang}${result.bureau}局`,
    `太乙：${result.taiyiPosition}（${result.taiyiGua}宫·${result.taiyiDir}）`,
    `文昌：${result.wenChangPosition}｜始击：${result.shiJiPosition}｜计神：${result.jiShenPosition}`,
    `主算 ${result.lordCount}｜客算 ${result.guestCount}｜定算 ${result.setCount}`,
    ...(focus ? [`事项定位：${focus.categoryLabel}`, `辅助角色：主算=${focus.lordMeaning}｜客算=${focus.guestMeaning}；数值不自动等同胜负`] : []),
    '',
    result.judgments.join('\n'),
  ].join('\n');
  return envelope('taiyi', resultTimestamp, { ...contextInput(context), scope, ...profileInput(profile) }, {
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
  }, display, ['年计按积年起局；月、日、时计采用现代历法定位复现通行四计。主客数值不直接等同胜负。'],
  `${result.yinYang}${result.bureau}局，太乙${result.taiyiPosition}，文昌${result.wenChangPosition}，始击${result.shiJiPosition}；主算${result.lordCount}（${focus?.lordMeaning ?? '己方'}）、客算${result.guestCount}（${focus?.guestMeaning ?? '对方／外部'}）、定算${result.setCount}`);
}

function parseLocalDate(value: string, label: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error(`${label}必须使用 YYYY-MM-DD 格式。`);
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    throw new Error(`${label}不是有效日期。`);
  }
  return timestamp;
}

function formatAlmanac(date: Date, options: Options, context: CalculationContext) {
  const allowedTopics = ['marriage', 'move', 'opening', 'contract', 'travel', 'medical', 'study', 'burial', 'renovation', 'custom'];
  const rawTopic = String(options.topic || 'custom');
  if (!allowedTopics.includes(rawTopic)) throw new Error(`择日事项无效：${rawTopic}`);
  const topic = rawTopic as Parameters<typeof generateAlmanacSelection>[0]['topic'];
  const startDate = String(options.startDate || '');
  const endDate = String(options.endDate || '');
  if (!startDate || !endDate) throw new Error('择日需要开始日期和结束日期。');
  const startTimestamp = parseLocalDate(startDate, '开始日期');
  const endTimestamp = parseLocalDate(endDate, '结束日期');
  if (startTimestamp > endTimestamp) throw new Error('开始日期不能晚于结束日期。');
  const rangeDays = Math.floor((endTimestamp - startTimestamp) / 86_400_000) + 1;
  if (rangeDays > 180) throw new Error('择日范围不能超过 180 天。');
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
  return envelope('almanac', result.timestamp, { ...contextInput(context), topic, startDate, endDate, rangeDays }, {
    topic: result.topic,
    topicLabel: result.topicLabel,
    startDate: result.startDate,
    endDate: result.endDate,
    allDays: result.days,
    displayedDays: shownDays,
    totalDays: result.days.length,
    page: 1,
    pageSize: 12,
  }, display, ['未提供参与人生辰时，不计算与参与人的刑冲破害；候选是透明规则筛选，不替代现实条件判断。'],
  `${result.topicLabel}候选：${shownDays.slice(0, 3).map((day) => day.date).join('、')}`,
  `${result.topicLabel}候选：${shownDays.slice(0, 3).map((day) => day.date).join('、')}`);
}

export function calculate(method: string, timestamp: number, optionsJson = '{}'): string {
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) throw new Error('起课时间无效。');
    const parsedOptions = JSON.parse(optionsJson || '{}') as unknown;
    if (!parsedOptions || typeof parsedOptions !== 'object' || Array.isArray(parsedOptions)) {
      throw new Error('算法选项必须是 JSON 对象。');
    }
    const options = parsedOptions as Options;
    const context = resolveCalculationContext(date, options);
    const result = (() => {
      switch (method) {
        case 'liuyao': return formatLiuyao(date, options, context);
        case 'qimen': return formatQimen(date, context);
        case 'liuren': return formatLiuren(date, options, context);
        case 'xiaoliuren': return formatXiaoliuren(date, options, context);
        case 'meihua': return formatMeihua(date, options, context);
        case 'taiyi': return formatTaiyi(date, options, context);
        case 'jinkoujue': return formatJinkoujue(date, options, context);
        case 'almanac': return formatAlmanac(date, options, context);
        default: throw new Error(`未知占卜方法：${method}`);
      }
    })();
    return JSON.stringify({ ok: true, result });
  } catch (error) {
    return JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
}
