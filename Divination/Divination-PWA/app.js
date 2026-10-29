// 占卜逻辑：完整移植自 Divination.cs
'use strict';

const MODULE_TEXT_COLORS = ['#3E5B63','#43565B','#6E4E8E','#6A8F4E','#5A6C7A','#355C8C','#9E4F44','#3E6A57','#3E5975','#5E8B7E','#8A5A7B','#B08B2F','#9C6A3C','#C4A85A','#8C3F57'];

const LANG_KEY = 'divination_lang';
const SPECIAL_TAROT_START = 156;
const LENORMAND_SPECIAL_START = 43;
const ORACLE_SPECIAL_START = 49;

const STR = {
  zh: {
    closingNoticeTitle: '网页版即将关闭',
    closingNoticeBody: '本网页版将于 2026 年 10 月 27 日关闭。之后请在 App Store 搜索“观兆问筮”下载 iOS 版继续使用。',
    closingNoticeOK: '知道了',
    mods: ["首页","六爻纳甲","塔罗","雷诺曼","卢恩符文","占星骰子","玄天灵签","奇门遁甲","大六壬","小六壬","梅花易数","太乙神数","金口诀","择日/黄历","复古神谕"],
    modTabs: ["首页","六爻纳甲","塔罗牌","雷诺曼牌","卢恩符文","占星骰子","玄天灵签","奇门遁甲","大六壬","小六壬","梅花易数","太乙神数","金口诀","择日黄历","复古神谕"],
    mobileTabs: ["首页","六爻纳甲","塔罗牌","雷诺曼牌","卢恩符文","占星骰子","玄天灵签","奇门遁甲","大六壬","小六壬","梅花易数","太乙神数","金口诀","择日黄历","复古神谕"],
    newMethodTabs: ["奇门遁甲","大六壬","小六壬","梅花易数","太乙神数","金口诀","择日/黄历"],
    tarotTabs: ["通用","YES OR NO","大牌"],
    homeTabs: ["综合占卜"],
    qianLabels: ["圣意","谋望","家宅","婚姻","失物","官事","行人","占病","解曰"],
    cardPre: ["第一张","第二张","第三张"],
    runePre: ["第一枚","第二枚","第三枚"],
    liuYaoRows: [
      ["本卦", "【事情的现状】"],
      ["变卦", "【事情的最终结果】"],
      ["互卦", "【事情发展过程中的内在矛盾/隐藏动态】"],
      ["错卦", "【事情的反面状态，即\"不是什么\"】"],
      ["综卦", "【从另一个角度看这件事，或错误处理方式的后果】"]
    ],
    upperTrigram: "上卦",
    lowerTrigram: "下卦",
    movingLines: "动爻",
    completeTrigrams: "手动起卦请同时选择上卦和下卦。",
    requiredGender: "婚恋／婚姻类必须选择性别。",
    inputLabel: "输入问题：",
    copy: "复制结果",
    clear: "清空",
    history: "历史",
    help: "说明",
    histTitle: "历史记录",
    histCopyAll: "复制全部",
    histClearAll: "清除全部",
    close: "关 闭",
    ok: "确 定",
    helpTitle: "使用说明",
    copied: "已复制",
    includeSpecial: "包含特殊牌",
    dateWarn: "未作校准，仅供参考，自行甄别",
    emptyQuestion: "（未填写问题）",
    briefNote: "―― 简要说明 ――",
    specialCards: "特殊牌",
    none: "无",
    histTitleFmt: name => `历史记录 - ${name}（最近30条）`,
    specialWarnTitle: "特殊牌说明",
    specialWarnText: "此开关同时启用塔罗特殊牌、国色华光雷诺曼扩展牌和复古神谕强调牌。",
    am: "上午",
    pm: "下午",
    goHome: "占 卜",
    goLiuYao: "起 卦",
    goDice: "掷骰子",
    goQian: "求 签",
    goDraw: "抽 牌",
    planet: "行星",
    sign: "星座",
    house: "宫位",
    planetDesc: "【做什么：发挥这股能量】",
    signDesc: "【怎么做：以这种方式】",
    houseDesc: "【在哪里做：在这个领域】",
    dongYao: "动爻",
    dongYaoNone: "无",
    shiYao: "世爻",
    yingYao: "应爻",
    tarotPred: "塔罗预测",
    astroPred: "占星预测",
    baseDuration: "基础时长",
    unit: "计量单位",
    adjustNum: "调整数字",
    tarotOrder: "塔罗抽牌顺序",
    astroDice: "占星骰子",
    noWithinYear: "一年内无",
    calculate: "排 盘",
    dateTime: "起课时间",
    castMethod: "起卦方式",
    timeMethod: "时间",
    numberMethod: "数字",
    numberValue: "数字",
    scope: "计式",
    diFenMethod: "地分方式",
    branchMethod: "指定地分",
    branch: "地支",
    topic: "事项",
    startDate: "开始日期",
    endDate: "结束日期",
    algorithmUnavailable: "本地算法包未加载，请刷新后重试。",
    langBtn: "EN",
    langTitle: "切换为 English",
    helpText: "1. 选择占卜方式：综合=多体系合参；塔罗／复古神谕／卢恩=心理、关系与建议；雷诺曼=现实事件与消息；占星骰子=快速看影响领域；玄天灵签=整体签意；六爻=具体事件成败与应期；奇门=行动、时机与方向；大六壬=复杂人事过程；小六壬=临时小事；梅花=即时趋势与应期；太乙=宏观局势；金口诀=近期具体人事；择日／黄历=选日期。\n\n2. 提问建议：尽量一事一问；婚恋／婚姻需选择性别；同一事项没有新变化时不建议反复重占。\n\n3. 其他：“包含特殊牌”同时启用塔罗特殊牌、雷诺曼扩展牌和复古神谕强调牌；每个模块保存最近30条历史；“复制结果”可直接用于AI解读。",
    liuYaoSummary: (ben, dong, shi, ying, bian, hu, cuo, zong) => {
      const dongText = dong.length ? dong.join("、") : "无";
      return `本卦${ben[0]}，动爻${dongText}，世爻${ben[shi]}，应爻${ben[ying]}，变卦${bian[0]}，互卦${hu[0]}，错卦${cuo[0]}，综卦${zong[0]}；`;
    }
  },
  en: {
    closingNoticeTitle: 'This web version is closing',
    closingNoticeBody: 'This web version will close on October 27, 2026. To keep using it, search for “Oracle Atlas” on the App Store and download the iOS app.',
    closingNoticeOK: 'OK',
    mods: ["Home","I Ching","Tarot","Lenormand","Runes","Astro Dice","Fortune Slip","Qimen","Da Liu Ren","Xiao Liu Ren","Meihua Yishu","Taiyi","Jin Kou Jue","Date Selection","Old Style Oracle"],
    modTabs: ["Home","I Ching","Tarot","Lenormand","Runes","Astro Dice","Slip","Qimen","Da Liu Ren","Xiao Liu Ren","Meihua","Taiyi","Jin Kou Jue","Date Select","Old Oracle"],
    mobileTabs: ["Home","I Ching","Tarot","Lenormand","Runes","Astro Dice","Slip","Qimen","Da Liu Ren","Xiao Liu Ren","Meihua","Taiyi","Jin Kou Jue","Date Select","Old Oracle"],
    newMethodTabs: ["Qimen","Da Liu Ren","Xiao Liu Ren","Meihua Yishu","Taiyi","Jin Kou Jue","Date Selection"],
    tarotTabs: ["General","YES OR NO","Major"],
    homeTabs: ["Combined"],
    qianLabels: ["Oracle","Ambition","Home","Marriage","Lost item","Legal","Traveler","Illness","Summary"],
    cardPre: ["Card 1","Card 2","Card 3"],
    runePre: ["Rune 1","Rune 2","Rune 3"],
    liuYaoRows: [
      ["Primary", "【Current situation】"],
      ["Changed", "【Final outcome】"],
      ["Mutual", "【Hidden dynamics during the process】"],
      ["Opposite", "【What it is not】"],
      ["Inverted", "【Another angle, or consequences of mishandling】"]
    ],
    upperTrigram: "Upper",
    lowerTrigram: "Lower",
    movingLines: "Moving",
    completeTrigrams: "Select both the upper and lower trigrams for a manual cast.",
    requiredGender: "Please select a gender for love or marriage questions.",
    inputLabel: "Question:",
    copy: "Copy",
    clear: "Clear",
    history: "History",
    help: "Help",
    histTitle: "History",
    histCopyAll: "Copy all",
    histClearAll: "Clear all",
    close: "Close",
    ok: "OK",
    helpTitle: "Help",
    copied: "Copied",
    includeSpecial: "Include special cards",
    dateWarn: "Uncalibrated; for reference only",
    emptyQuestion: "(No question entered)",
    briefNote: "―― Brief notes ――",
    specialCards: "Special cards",
    none: "None",
    histTitleFmt: name => `History - ${name} (last 30)`,
    specialWarnTitle: "About special cards",
    specialWarnText: "This switch enables special Tarot cards, Guose Huaguang Lenormand extensions, and Old Style Oracle accent cards.",
    am: "AM",
    pm: "PM",
    goHome: "Divine",
    goLiuYao: "Cast",
    goDice: "Roll",
    goQian: "Draw slip",
    goDraw: "Draw",
    planet: "Planet",
    sign: "Sign",
    house: "House",
    planetDesc: "【Action: how to apply this energy】",
    signDesc: "【Manner: in this way】",
    houseDesc: "【Area: in this life domain】",
    dongYao: "Moving lines",
    dongYaoNone: "None",
    shiYao: "Self line",
    yingYao: "Other line",
    tarotPred: "Tarot timing",
    astroPred: "Astro timing",
    baseDuration: "Base duration",
    unit: "Unit",
    adjustNum: "Adjustment",
    tarotOrder: "Tarot draw order",
    astroDice: "Astro dice",
    noWithinYear: "None within a year",
    calculate: "Calculate",
    dateTime: "Cast time",
    castMethod: "Method",
    timeMethod: "Time",
    numberMethod: "Number",
    numberValue: "Number",
    scope: "Scope",
    diFenMethod: "Earth-branch method",
    branchMethod: "Select branch",
    branch: "Branch",
    topic: "Topic",
    startDate: "Start",
    endDate: "End",
    algorithmUnavailable: "The local algorithm bundle is unavailable. Refresh and try again.",
    langBtn: "中文",
    langTitle: "Switch to 中文",
    helpText: "1. Choose a method: Combined=multi-system overview; Tarot/Old Style Oracle/Runes=psychology, relationships and guidance; Lenormand=real-world events and messages; Astro Dice=quick influence/area check; Fortune Slip=overall oracle; I Ching=specific outcomes and timing; Qimen=action, timing and direction; Da Liu Ren=complex people/events; Xiao Liu Ren=quick everyday matters; Meihua=immediate trend/timing; Taiyi=macro trends; Jin Kou Jue=near-term concrete matters; Date Selection=choose dates.\n\n2. Questions: keep to one matter per reading; love/marriage questions require gender; avoid repeated readings unless the situation has materially changed.\n\n3. Other: Include special cards enables Tarot specials, Lenormand extensions and Oracle accent cards; each module keeps the latest 30 history items; Copy Result is ready for AI interpretation.",
    liuYaoSummary: (ben, dong, shi, ying, bian, hu, cuo, zong) => {
      const dongText = dong.length ? dong.join(", ") : "None";
      return `Primary ${ben[0]}, moving ${dongText}, self ${ben[shi]}, other ${ben[ying]}, changed ${bian[0]}, mutual ${hu[0]}, opposite ${cuo[0]}, inverted ${zong[0]};`;
    }
  }
};

function initLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch (e) {}
  const nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  return /^zh\b/.test(nav) ? 'zh' : 'en';
}

let lang = initLang();
const L = () => STR[lang];
const TRADITIONAL_METHODS = ['qimen','liuren','xiaoliuren','meihua','taiyi','jinkoujue','almanac'];

function setLang(next) {
  if (next !== 'zh' && next !== 'en') return;
  lang = next;
  try { localStorage.setItem(LANG_KEY, next); } catch (e) {}
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  applyStaticI18n();
  renderAll();
}

function toggleLang() {
  setLang(lang === 'zh' ? 'en' : 'zh');
}

function applyStaticI18n() {
  const s = L();
  $('closing-notice-title').textContent = s.closingNoticeTitle;
  $('closing-notice-body').textContent = s.closingNoticeBody;
  $('closing-notice-ok').textContent = s.closingNoticeOK;
  $('upper-label').textContent = s.upperTrigram;
  $('lower-label').textContent = s.lowerTrigram;
  $('moving-label').textContent = s.movingLines;
  $('input-label').textContent = s.inputLabel;
  $('copy').textContent = s.copy;
  $('clear').textContent = s.clear;
  $('histbtn').textContent = s.history;
  $('helpbtn').textContent = s.help;
  $('hist-copy').textContent = s.histCopyAll;
  $('hist-clear').textContent = s.histClearAll;
  $('hist-close').textContent = s.close;
  $('help-ok').textContent = s.ok;
  $('help-title').textContent = s.helpTitle;
  $('toast').textContent = s.copied;
  const lb = $('langbtn');
  lb.textContent = s.langBtn;
  lb.title = s.langTitle;
}

const state = {
  curModule: 0, curTab: 0, curHomeTab: 0,
  includeSpecial: false,
  questionCategory: '', gender: '', searchTarget: 'elder',
  copyText: "",
  drawnGen: [], drawnMajor: [],
  sessGen: -1, sessMaj: -1,
  tarotSessionKeyGen: '', tarotSessionKeyMaj: '',
  drawnLenormand: [], sessLenormand: -1, lenormandSessionKey: '',
  drawnRunes: [], sessRunes: -1, runeSessionKey: '',
  drawnOracle: [], sessOracle: -1, oracleSessionKey: '',
  histories: Array.from({length:15},()=>[]),
  pageHtml: new Array(18).fill(null),
  pageCopy: new Array(18).fill(null),
  segs: []
};
const SPECIAL_DECK_UNLOCK_KEY = 'specialDeckUnlockedV1';
const ORACLE_AI_NOTICE = '提示：复古神谕是本项目的独立牌组，AI 可能无法仅凭以上摘要准确理解完整牌义。';

// ================= 工具 =================
function randomIndex(n) {
  if (!Number.isSafeInteger(n) || n <= 0) throw new Error(`随机范围无效：${n}`);
  if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
    throw new Error('当前环境不支持系统安全随机数。');
  }
  const range = 0x100000000;
  const limit = range - (range % n);
  const value = new Uint32Array(1);
  do { globalThis.crypto.getRandomValues(value); } while (value[0] >= limit);
  return value[0] % n;
}
const rnd = randomIndex;
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function fixedEast8Context() {
  return {
    calculationTimezoneMode: 'fixedEast8',
    calculationTimezoneOffsetMinutes: 480,
  };
}

function drawUnique(items, count) {
  const pool = items.slice();
  const result = [];
  while (result.length < count && pool.length) {
    result.push(pool.splice(rnd(pool.length), 1)[0]);
  }
  return result;
}

function seg(text, opt) { state.segs.push(Object.assign({text}, opt || {})); }
function segC(text) { seg(text, {bold:true, big:true}); }


function orientedName(source,rune=false){
 const reversed=rune?source.endsWith('逆位'):source.startsWith('逆位');
 let base=reversed?(rune?source.slice(0,-2):source.slice(2)):source;
 if(rune)base=base.replace(/[（）()]/g,' ').replace(/ +/g,' ');
 return base.trim()+'（'+(lang==='zh'?(reversed?'逆位':'正位'):(reversed?'Reversed':'Upright'))+'）';
}

function renderTraditionalDiagram(){
 const f=state.readingFacts||{}, label=(zh,en)=>lang==='zh'?zh:en;
 if(state.curModule===1 && Array.isArray(f.primary?.lines) && f.primary.lines.length===6){
  const primary=f.primary.lines.map(line=>String(line.yaoType).includes('阳'));
  const figure=(title,name,lines)=>'<div><small>'+esc(title)+'</small><h3>'+esc(name||'')+'</h3>'+[...lines].reverse().map(y=>'<div class="hex-line'+(y?' yang':' yin')+'"><i></i>'+(y?'':'<i></i>')+'</div>').join('')+'</div>';
  const primaryFigures=figure(label('本卦','Primary'),f.primary.name,primary)+figure(label('变卦','Changed'),f.changed?.name,(f.changed?.lines||[]).map(line=>String(line.yaoType).includes('阳')));
  const otherFigures=figure(label('互卦','Mutual'),f.mutual,[1,2,3,2,3,4].map(i=>primary[i]))+figure(label('错卦','Opposite'),f.opposite,primary.map(y=>!y))+figure(label('综卦','Reversed'),f.reversed,[...primary].reverse());
  return '<section class="result-block"><div class="hexagram-three hexagram-two">'+primaryFigures+'</div><div class="hexagram-three">'+otherFigures+'</div></section>';
 }
 if(state.curModule===7 && Array.isArray(f.palaces)){
  return '<div class="palace-grid">'+[4,9,2,3,5,7,8,1,6].map(n=>{
   const p=f.palaces.find(p=>p.gong===n)||{},sky=p.tianPan||{},ground=p.diPan||{},human=p.renPan||{},spirit=p.shenPan||{};
   const fields=[[label('方位','Direction'),p.direction],[label('五行','Phase'),p.element],[label('天盘','Heaven stem'),sky.stem],[label('九星','Star'),sky.star],[label('寄星','Companion star'),sky.companionStar],[label('寄干','Companion stem'),sky.companionStem],[label('地盘','Earth stem'),ground.stem],[label('八门','Door'),human.door],[label('八神','Spirit'),spirit.god]].filter(pair=>pair[1]);
   return '<details class="palace"><summary><h3>'+esc(p.name||'')+'</h3><div>'+esc((sky.star||'—')+' · '+(human.door||'—'))+'</div><div>'+esc(sky.stem||'—')+' ›</div></summary><dl>'+fields.map(([k,v])=>'<dt>'+esc(k)+'</dt><dd>'+esc(v)+'</dd>').join('')+'</dl></details>';
  }).join('')+'</div>';
 }
 if(state.curModule===10 && f.mainHexagram){
  const trigrams={'乾':[1,1,1],'兑':[1,1,0],'离':[1,0,1],'震':[1,0,0],'巽':[0,1,1],'坎':[0,1,0],'艮':[0,0,1],'坤':[0,0,0]};
  return '<div class="hexagram-three">'+[[label('本卦','Primary'),f.mainHexagram],[label('互卦','Mutual'),f.interHexagram],[label('变卦','Changed'),f.changedHexagram]].map(([name,h])=>{
   h=h||{};const lines=[...(trigrams[h.lower]||[]),...(trigrams[h.upper]||[])].reverse();
   return '<div><small>'+name+'</small><h3>'+esc(h.name||'')+'</h3>'+lines.map(y=>'<div class="hex-line'+(y?' yang':' yin')+'"><i></i>'+(y?'':'<i></i>')+'</div>').join('')+'</div>';
  }).join('')+'</div>';
 }
 if(state.curModule===11 && f.taiyiPalace){
  // Matches the fixed upstream Taiyi palace and point tables.
  const points={'戌':1,'乾':1,'巳':2,'午':2,'丑':3,'艮':3,'寅':4,'卯':4,'申':6,'酉':6,'未':7,'坤':7,'亥':8,'子':8,'辰':9,'巽':9};
  const names={1:'乾',2:'离',3:'艮',4:'震',5:'中宫',6:'兑',7:'坤',8:'坎',9:'巽'};
  return '<div class="palace-grid taiyi-grid">'+[9,2,7,4,5,6,3,8,1].map(n=>'<div class="palace'+(f.taiyiPalace===n?' active-palace':'')+'"><b class="palace-number">'+n+'</b><div>'+names[n]+'</div>'+[[label('太乙','Taiyi'),'taiyiPosition'],[label('文昌','Wenchang'),'wenChangPosition'],[label('始击','Shiji'),'shiJiPosition'],[label('计神','Jishen'),'jiShenPosition']].filter(pair=>points[f[pair[1]]]===n).map(([name,key])=>'<p>'+name+' · '+esc(f[key])+'</p>').join('')+'</div>').join('')+'</div>';
 }
 return '';
}

function renderSegs() {
  if([2,3,4,14].includes(state.curModule) && !(state.curModule===2&&state.curTab===1) && !state.segs.some(part=>part.red)){
    const rows=[];
    state.segs.forEach(part=>{
      if(part.italic)return;
      if(part.bold&&part.text.includes('\n'))rows.push({title:part.text.trim(),body:''});
      else if(rows.length)rows[rows.length-1].body+=part.text;
    });
    return '<div class="reading-cards">'+rows.map(row=>{
      const rune=state.curModule===4, first=Array.from(row.title)[0], symbol=first&&first.codePointAt(0)>=0x16A0&&first.codePointAt(0)<=0x16FF?first:'';
      const reversed=rune&&row.title.endsWith('逆位');
      const formatted=[2,4].includes(state.curModule)?orientedName(row.title,rune):row.title;
      const title=rune?formatted.slice(symbol.length).trim():formatted;
      return '<section class="reading-card'+(rune?' rune-row':'')+'">'+(rune?'<div class="rune-symbol'+(symbol?'':' blank')+(reversed?' reversed':'')+'" aria-hidden="true">'+esc(symbol)+'</div>':'')+'<div><strong>'+esc(title)+'</strong><p>'+esc(row.body.trim())+'</p></div></section>';
    }).join('')+'</div>'+state.segs.filter(part=>part.italic).map(part=>'<p class="reading-note">'+esc(part.text)+'</p>').join('');
  }

  const groups=[];
  let current={title:'',parts:[]};
  const finish=()=>{
    if(current.title || current.parts.some(part=>part.text.trim())) groups.push(current);
  };
  state.segs.forEach(segment=>{
    const lines=segment.text.split('\n');
    lines.forEach((line,index)=>{
      const clean=line.trim();
      const heading=clean && (segment.big || /^【[^】]+】$/.test(clean) || (segment.bold && lines.length>1));
      if(heading){ finish(); current={title:clean,parts:[]}; }
      else current.parts.push({...segment,text:line+(index<lines.length-1?'\n':'')});
    });
  });
  finish();
  const html=groups.map(group=>'<section class="result-block">'+
    (group.title?'<h3>'+esc(group.title)+'</h3>':'')+
    '<div class="result-text">'+group.parts.map(part=>{
      const cls=[part.bold&&'b',part.italic&&'i',part.red&&'red',part.big&&'big'].filter(Boolean).join(' ');
      return '<span class="'+cls+'">'+esc(part.text)+'</span>';
    }).join('')+'</div></section>').join('');
  if(state.curModule===0 || state.curModule===6)return html;
  const diagram=renderTraditionalDiagram();
  if(diagram)return diagram+'<div class="result-text">'+html+'</div>';

  return html;
}

function timeStamp() {
  const t = new Date(), p = n => String(n).padStart(2,'0');
  const s = L();
  return `${t.getFullYear()}-${p(t.getMonth()+1)}-${p(t.getDate())} ${t.getHours()<12?s.am:s.pm}${p(t.getHours())}：${p(t.getMinutes())}`;
}

function toClipboard(s) {
  const done = () => showToast();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(s).then(done, () => fallbackCopy(s, done));
  } else fallbackCopy(s, done);
}
function fallbackCopy(s, done) {
  const ta = document.createElement('textarea');
  ta.value = s; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta); done();
}
let toastTimer = null;
function showToast() {
  const el = document.getElementById('toast');
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1200);
}

// ================= 页面状态 =================
function pageIndex() {
  if (state.curModule === 0) return state.curHomeTab;
  if (state.curModule === 1) return 2;
  if (state.curModule === 2) return 3 + state.curTab;
  if (state.curModule <= 6) return 6 + (state.curModule - 3);
  if (state.curModule === 14) return 17;
  return 10 + (state.curModule - 7);
}
function saveState() {
  const p = pageIndex();
  state.pageHtml[p] = $('out').innerHTML;
  state.pageCopy[p] = state.copyText;
}
function restoreState() {
  const p = pageIndex();
  state.segs = [];
  if (state.pageHtml[p] == null) { state.copyText = ""; setOutHtml(""); }
  else { state.copyText = state.pageCopy[p]; setOutHtml(state.pageHtml[p]); }
}
function setOutHtml(h) { document.getElementById('out').innerHTML = h; updateActionState(); }
function flushOut() { setOutHtml(renderSegs()); }

// ================= 六爻 =================
function lineOfToss(heads) {
  switch (heads) {
    case 3: return ["阳○","阴","阴"];
    case 2: return ["阳","阳","阴"];
    case 1: return ["阴","阴","阳"];
    default: return ["阴○","阳","阳"];
  }
}
const elem = (a,b,c) => TRI_ELEM[(a+b+c).replace(/○/g,'')];
const hexg = (up,low) => HEXAGRAMS[up+low];
const TRIGRAM_LINES = {
  天:["阳","阳","阳"], 泽:["阴","阳","阳"], 火:["阳","阴","阳"], 雷:["阴","阴","阳"],
  风:["阳","阳","阴"], 水:["阴","阳","阴"], 山:["阳","阴","阴"], 地:["阴","阴","阴"]
};
const flipLine = line => line === "阳" ? "阴" : "阳";
const LIUYAO_ELEMENTS=['木','火','土','金','水'];
const LIUYAO_BRANCH_ELEMENTS={子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
const LIUYAO_NAJIA={
  天:{lower:['子','寅','辰'],upper:['午','申','戌']},泽:{lower:['巳','卯','丑'],upper:['亥','酉','未']},
  火:{lower:['卯','丑','亥'],upper:['酉','未','巳']},雷:{lower:['子','寅','辰'],upper:['午','申','戌']},
  风:{lower:['丑','亥','酉'],upper:['未','巳','卯']},水:{lower:['寅','辰','午'],upper:['申','戌','子']},
  山:{lower:['辰','午','申'],upper:['戌','子','寅']},地:{lower:['未','巳','卯'],upper:['丑','亥','酉']}
};
const LIUYAO_PALACES={
  乾:['乾为天','天风姤','天山遁','天地否','风地观','山地剥','火地晋','火天大有'],
  兑:['兑为泽','泽水困','泽地萃','泽山咸','水山蹇','地山谦','雷山小过','雷泽归妹'],
  离:['离为火','火山旅','火风鼎','火水未济','山水蒙','风水涣','天水讼','天火同人'],
  震:['震为雷','雷地豫','雷水解','雷风恒','地风升','水风井','泽风大过','泽雷随'],
  巽:['巽为风','风天小畜','风火家人','风雷益','天雷无妄','火雷噬嗑','山雷颐','山风蛊'],
  坎:['坎为水','水泽节','水雷屯','水火既济','泽火革','雷火丰','地火明夷','地水师'],
  艮:['艮为山','山火贲','山天大畜','山泽损','火泽睽','天泽履','风泽中孚','风山渐'],
  坤:['坤为地','地雷复','地泽临','地天泰','雷天大壮','泽天夬','水天需','水地比']
};
const LIUYAO_PALACE_INFO={乾:['金','天'],兑:['金','泽'],离:['火','火'],震:['木','雷'],巽:['木','风'],坎:['水','水'],艮:['土','山'],坤:['土','地']};

function liuYaoSixRelation(self,other){
  if(self===other) return '兄弟';
  const a=LIUYAO_ELEMENTS.indexOf(self), b=LIUYAO_ELEMENTS.indexOf(other);
  if((a+1)%5===b) return '子孙';
  if((b+1)%5===a) return '父母';
  if((a+2)%5===b) return '妻财';
  return '官鬼';
}
function liuYaoElementRelation(from,to){
  if(from===to) return '比和';
  const a=LIUYAO_ELEMENTS.indexOf(from), b=LIUYAO_ELEMENTS.indexOf(to);
  if((a+1)%5===b) return `${from}生${to}`;
  if((a+2)%5===b) return `${from}克${to}`;
  if((b+1)%5===a) return `${to}生${from}`;
  return `${to}克${from}`;
}
function liuYaoRequestedRelation(){
  const c=state.questionCategory;
  if(['loveSingle','lovePartner','marriage'].includes(c)) return state.gender==='male'?'妻财':'官鬼';
  return {wealth:'妻财',career:'官鬼',litigation:'官鬼',health:'官鬼',study:'父母',search:{elder:'父母',peer:'兄弟',junior:'子孙',property:'妻财'}[state.searchTarget]}[c];
}
function liuYaoFocusSummary(ben,upper,lower){
  if(state.curModule!==1 && !(state.curModule===0 && state.curHomeTab===0)) return '';
  if(!state.questionCategory) return '';
  const palace=Object.keys(LIUYAO_PALACES).find(key=>LIUYAO_PALACES[key].includes(ben[0]));
  if(!palace) return '';
  const [palaceElement,pureTrigram]=LIUYAO_PALACE_INFO[palace];
  const branches=[...LIUYAO_NAJIA[lower].lower,...LIUYAO_NAJIA[upper].upper];
  const lines=branches.map((branch,index)=>({index,branch,element:LIUYAO_BRANCH_ELEMENTS[branch],relation:liuYaoSixRelation(palaceElement,LIUYAO_BRANCH_ELEMENTS[branch])}));
  const category={loveSingle:'婚恋·未婚',lovePartner:'婚恋·已有对象',marriage:'婚姻·已婚',wealth:'财运',career:'事业',litigation:'官司诉讼',health:'健康疾病',study:'考试／学业',travel:'出行／远行',search:'寻人寻物'}[state.questionCategory];
  if(state.questionCategory==='travel') return `事项定位${category}，用神六亲世爻本身，用神爻位${ben[1]}爻，是否伏神否；`;
  const requested=liuYaoRequestedRelation();
  const positions=lines.filter(x=>x.relation===requested).map(x=>POS[x.index]+'爻');
  if(positions.length) return `事项定位${category}，用神六亲${requested}，用神爻位${positions.join('、')}，是否伏神否；`;
  const hiddenBranches=[...LIUYAO_NAJIA[pureTrigram].lower,...LIUYAO_NAJIA[pureTrigram].upper];
  const hidden=hiddenBranches.map((branch,index)=>({index,branch,element:LIUYAO_BRANCH_ELEMENTS[branch],relation:liuYaoSixRelation(palaceElement,LIUYAO_BRANCH_ELEMENTS[branch])})).filter(x=>x.relation===requested);
  const details=hidden.map(item=>{
    const flying=lines[item.index], relation=liuYaoElementRelation(flying.element,item.element);
    const note=relation===`${flying.element}生${item.element}`?'出现有助':relation===`${flying.element}克${item.element}`?'出现受制':'需结合旺衰';
    return `${POS[item.index]}爻伏神${item.branch}${requested}，飞神${flying.branch}${flying.relation}，${relation}（${note}）`;
  });
  return `事项定位${category}，用神六亲${requested}，用神爻位伏藏，是否伏神是，伏神信息${details.join('；')}；`;
}

function selectedLiuYaoLines() {
  const up=TRIGRAM_LINES[$('liu-upper').value], low=TRIGRAM_LINES[$('liu-lower').value];
  const h=[],z=[],c=[];
  h[5]=up[0]; h[4]=up[1]; h[3]=up[2];
  h[2]=low[0]; h[1]=low[1]; h[0]=low[2];
  const moving = new Set(Array.from(document.querySelectorAll('#moving-lines input:checked'), el=>Number(el.value)));
  for(let i=0;i<6;i++){
    const base=h[i];
    z[i]=moving.has(i) ? flipLine(base) : base;
    c[i]=flipLine(base);
    if(moving.has(i)) h[i]+='○';
  }
  return {h,z,c};
}

function divineLiuYao(lines, useSelection=false) {
  let h=[],z=[],c=[];
  if(useSelection){
    ({h,z,c}=selectedLiuYaoLines());
  }else{
    for (let i=0;i<6;i++){
      let heads=0;
      for (let j=0;j<3;j++) if (rnd(2)===0) heads++;
      const t=lineOfToss(heads); h.push(t[0]); z.push(t[1]); c.push(t[2]);
    }
  }
  const ben  = hexg(elem(h[5],h[4],h[3]), elem(h[2],h[1],h[0]));
  const bian = hexg(elem(z[5],z[4],z[3]), elem(z[2],z[1],z[0]));
  const hu   = hexg(elem(h[4],h[3],h[2]), elem(h[3],h[2],h[1]));
  const cuog = hexg(elem(c[5],c[4],c[3]), elem(c[2],c[1],c[0]));
  const zong = hexg(elem(h[0],h[1],h[2]), elem(h[3],h[4],h[5]));
  const dong=[];
  for (let i=0;i<6;i++) if (h[i].includes('○')) dong.push(POS[i]);
  const rows = L().liuYaoRows;
  lines.push([rows[0][0], ben[0],  ben[3],  rows[0][1]]);
  lines.push([rows[1][0], bian[0], bian[3], rows[1][1]]);
  lines.push([rows[2][0], hu[0],   hu[3],   rows[2][1]]);
  lines.push([rows[3][0], cuog[0], cuog[3], rows[3][1]]);
  lines.push([rows[4][0], zong[0], zong[3], rows[4][1]]);
  const s = L();
  const upper=elem(h[5],h[4],h[3]), lower=elem(h[2],h[1],h[0]);
  return s.liuYaoSummary(ben, dong, 1, 2, bian, hu, cuog, zong)+liuYaoFocusSummary(ben,upper,lower);
}

function selectedLiuYaoValues(){
  const {h}=selectedLiuYaoLines();
  return h.map(line=>{
    const moving=line.includes('○'), yang=line.startsWith('阳');
    return moving?(yang?9:6):(yang?7:8);
  });
}

function frozenCoinThrows(){
  return Array.from({length:6},()=>{
    const coins=Array.from({length:3},()=>rnd(2)===0?2:3);
    return {coins,total:coins[0]+coins[1]+coins[2]};
  });
}

function calculateSharedLiuYao(q,castTime,{forceRandom=false,coinThrows=null}={}){
  const useSelection=!forceRandom&&$('liu-upper')?.value!==''&&$('liu-lower')?.value!=='';
  const options={question:q,...focusOptions(),...fixedEast8Context()};
  if(useSelection){
    options.generationMethod='manual';
    options.yaos=selectedLiuYaoValues();
  }else{
    options.generationMethod='coins';
    options.coinThrows=coinThrows||frozenCoinThrows();
  }
  const response=calculateTraditional('liuyao',castTime.getTime(),options);
  return {response,options};
}

function divineSharedLiuYao(q){
  const castTime=new Date();
  const {response,options}=calculateSharedLiuYao(q,castTime);
  if(!response.ok){ window.alert(response.error); return false; }
  state.readingFacts=response.result.calculatedFacts;
  state.copyText=response.result.aiPrompt;
  state.segs=[]; seg(response.result.display); flushOut();
  addHistory({kind:'liuyao',schemaVersion:3,methodVersion:response.result.methodVersion,input:response.result.input,coinThrows:options.coinThrows||null,yaoValues:response.result.input.yaoValues,calculatedFacts:response.result.calculatedFacts,aiPrompt:response.result.aiPrompt});
  return true;
}

// ================= 占星骰子 =================
function cjk(s) {
  const m = s.match(/[一-龥]+/);
  return m ? m[0] : s;
}
function divineAstro(lines) {
  const s = L();
  const p = PLANETS[rnd(PLANETS.length)], sg = SIGNS[rnd(SIGNS.length)], h = HOUSES[rnd(HOUSES.length)];
  lines.push([s.planet, p[0], p[1], s.planetDesc]);
  lines.push([s.sign, sg[0], sg[1], s.signDesc]);
  lines.push([s.house, h[0], h[1], s.houseDesc]);
  return cjk(p[0])+"、"+cjk(sg[0])+"、"+h[0]+"；";
}

// ================= 雷诺曼 / 卢恩 =================
function lenormandDraw(q) {
  const hi=state.includeSpecial?LENORMAND.length:LENORMAND_SPECIAL_START;
  const sessionKey=`${hi}|${q}`;
  if(state.lenormandSessionKey!==sessionKey){
    state.drawnLenormand=[]; state.sessLenormand=-1;
    state.lenormandSessionKey=sessionKey;
  }
  const drawn=state.drawnLenormand;
  const available=Array.from({length:hi},(_,i)=>i).filter(i=>!drawn.includes(i));
  if(!available.length) return;
  drawn.push(available[rnd(available.length)]);
  state.copyText=copyBlock(q,L().mods[3],drawn.map(i=>LENORMAND[i][0]).join('、'));
  const h=state.histories[3];
  const entry=makeHistoryEntry(state.copyText,{kind:'lenormand-session',schemaVersion:1,includeSpecial:state.includeSpecial,draws:[...drawn]});
  if(state.sessLenormand>=0&&state.sessLenormand<h.length) h[state.sessLenormand]=entry;
  else {
    h.push(entry);
    if(h.length>30) h.shift();
    state.sessLenormand=h.length-1;
  }
  saveHistories();
  state.segs=[];
  seg(state.copyText+'\n\n'+L().briefNote+'\n');
  drawn.forEach((index,k)=>{
    const card=LENORMAND[index];
    seg(`${card[0]}\n`,{bold:true});
    seg('：'+card[1]);
    if(k<drawn.length-1) seg('\n');
  });
  flushOut();
}

function divineLenormand(lines) {
  const idx=[];
  const hi=state.includeSpecial?LENORMAND.length:LENORMAND_SPECIAL_START;
  while (idx.length<3){ const i=rnd(hi); if(!idx.includes(i)) idx.push(i); }
  const pre = L().cardPre, names=[];
  idx.forEach((v,k)=>{ names.push(LENORMAND[v][0]); lines.push([pre[k],LENORMAND[v][0],LENORMAND[v][1],""]); });
  return names.join("、")+"；";
}

function drawOracleCards(){
  const hi=state.includeSpecial?ORACLE.length:ORACLE_SPECIAL_START;
  const idx=drawUnique(Array.from({length:hi},(_,i)=>i),3);
  return idx.map(i=>({card:ORACLE[i],upright:rnd(2)===0}));
}

function oraclePromptSummary(drawn){
  return drawn.map(({card,upright})=>`${card[2]}（${upright?'正位':'逆位'}；领域：${card[3]}；流向：${card[4]}）`).join('、')+'；';
}

function resetOracleSession(){state.drawnOracle=[];state.sessOracle=-1;state.oracleSessionKey='';}
function oraclePoolExhausted(){
 const q=$('q').value.trim()||L().emptyQuestion;
 const key=[q,state.questionCategory,state.gender,state.questionCategory==='search'?state.searchTarget:'',state.includeSpecial].join('|');
 const hi=state.includeSpecial?ORACLE.length:ORACLE_SPECIAL_START;
 return state.oracleSessionKey===key && state.drawnOracle.length>=hi;
}
function divineOracle(q){
 const key=[q,state.questionCategory,state.gender,state.questionCategory==='search'?state.searchTarget:'',state.includeSpecial].join('|');
 if(state.oracleSessionKey!==key){resetOracleSession();state.oracleSessionKey=key;}
 const hi=state.includeSpecial?ORACLE.length:ORACLE_SPECIAL_START;
 const used=new Set(state.drawnOracle.map(item=>item.index));
 const available=Array.from({length:hi},(_,i)=>i).filter(i=>!used.has(i));
 if(!available.length)return;
 state.drawnOracle.push({index:available[rnd(available.length)],upright:rnd(2)===0});
 const drawn=state.drawnOracle.map(item=>({card:ORACLE[item.index],upright:item.upright}));
 state.copyText=copyBlock(q,L().mods[14],oraclePromptSummary(drawn));
 const history=state.histories[14],entry=makeHistoryEntry(state.copyText,{kind:'oracle-session',schemaVersion:1,draws:state.drawnOracle.map(item=>({...item}))});
 if(state.sessOracle>=0&&state.sessOracle<history.length)history[state.sessOracle]=entry;
 else{history.push(entry);if(history.length>30)history.shift();state.sessOracle=history.length-1;}
 saveHistories();state.segs=[];
 drawn.forEach(({card,upright})=>{
  seg(`${card[2]}（${upright?'正位':'逆位'}）\n`,{bold:true});
  seg(`${card[5]}；${upright?card[6]:card[7]}。\n\n`);
 });
 seg(ORACLE_AI_NOTICE,{italic:true});flushOut();
}

function buildRuneEntities() {
  const byName=new Map();
  RUNES.forEach((row,index)=>{
    const base=row[2];
    if(!byName.has(base)) byName.set(base,{id:`rune-${String(byName.size+1).padStart(2,'0')}`,base,uprightIndex:null,reversedIndex:null});
    const entity=byName.get(base);
    if(row[0].endsWith('逆位')) entity.reversedIndex=index;
    else entity.uprightIndex=index;
  });
  return [...byName.values()];
}
const RUNE_ENTITIES=buildRuneEntities();

function drawRuneRecords(count=3) {
  return drawUnique(RUNE_ENTITIES,count).map(entity=>{
    const reversed=entity.reversedIndex!==null && rnd(2)===1;
    const rowIndex=reversed?entity.reversedIndex:entity.uprightIndex;
    if(rowIndex===null) throw new Error(`符文资料缺少可用牌面：${entity.base}`);
    return {entityId:entity.id,baseName:entity.base,orientation:reversed?'reversed':'upright',rowIndex};
  });
}

function divineRunes(lines) {
  const drawn=drawRuneRecords();
  const pre = L().runePre, names=[];
  drawn.forEach((record,k)=>{
    const row=RUNES[record.rowIndex];
    names.push(row[0]);
    lines.push([pre[k],row[0],row[1],""]);
  });
  return names.join("、")+"；";
}

function runeSessionKey(q){
  return [q,state.questionCategory,state.gender,state.questionCategory==='search'?state.searchTarget:''].join('|');
}
function resetRuneSession(){
  state.drawnRunes=[]; state.sessRunes=-1; state.runeSessionKey='';
}
function runePoolExhausted(){
  const q=$('q').value.trim()||L().emptyQuestion;
  return state.runeSessionKey===runeSessionKey(q) && state.drawnRunes.length>=RUNE_ENTITIES.length;
}
function runeDraw(q){
  const key=runeSessionKey(q);
  if(state.runeSessionKey!==key){ resetRuneSession(); state.runeSessionKey=key; }
  const used=new Set(state.drawnRunes.map(record=>record.entityId));
  const available=RUNE_ENTITIES.filter(entity=>!used.has(entity.id));
  if(!available.length) return;
  const entity=available[rnd(available.length)];
  const reversed=entity.reversedIndex!==null && rnd(2)===1;
  const rowIndex=reversed?entity.reversedIndex:entity.uprightIndex;
  state.drawnRunes.push({entityId:entity.id,rowIndex});
  state.copyText=copyBlock(q,L().mods[4],state.drawnRunes.map(record=>RUNES[record.rowIndex][0]).join('、'));
  const history=state.histories[4];
  const entry=makeHistoryEntry(state.copyText,{kind:'rune-session',schemaVersion:1,draws:state.drawnRunes.map(record=>({...record}))});
  if(state.sessRunes>=0 && state.sessRunes<history.length) history[state.sessRunes]=entry;
  else { history.push(entry); if(history.length>30)history.shift(); state.sessRunes=history.length-1; }
  saveHistories();
  state.segs=[];
  state.drawnRunes.forEach((record,index)=>{
    const row=RUNES[record.rowIndex];
    seg(`${row[0]}\n`,{bold:true}); seg(row[1]+'\n\n');
  });
  flushOut();
}

// ================= 灵签 =================
function qianTable() {
  return (lang === 'en' && typeof QIAN_EN !== 'undefined') ? QIAN_EN : QIAN;
}
function qianSourceStatus(){ return {complete:true,note:''}; }
function qianAiPrompt(q,s){
  const focus=focusDescription()||'未指定';
  return [
    '【占卜解读输入】','',`问题：${q}`,`所测事项：${focus}`,'方法：玄天灵签','方法口径：玄天上帝感应签，应用本地随机抽签','',
    '【计算事实】',`签号：${s[0]}`,`等级：${s[1]}`,`签名：${s[2]}`,`圣意：${s[3]}`,`谋望：${s[4]}`,`家宅：${s[5]}`,`婚姻：${s[6]}`,`失物：${s[7]}`,`官事：${s[8]}`,`行人：${s[9]}`,`占病：${s[10]}`,`解曰：${s[11]}`,'',
    '【资料边界】','以上为应用已抽得的签文，不重新抽签，不改写签文原文。','',
    '【解读要求】','结合用户问题优先解释相关栏目，同时以圣意与解曰校正，不把不相关栏目强行套用。'
  ].join('\n');
}
function divineQian(q) {
  const table = qianTable();
  const index=rnd(table.length), s = table[index], sourceStatus=qianSourceStatus(index);
  const labels = L().qianLabels;
  const head = s[0]+"　"+s[1]+"　"+s[2];
  const body=[head,...labels.map((lb,i)=>lb+"："+s[i+3]),...(sourceStatus.complete?[]:[`资料状态：${sourceStatus.note}`])].join('\n');
  state.copyText = qianAiPrompt(q,s);
  addHistory({kind:'qian',schemaVersion:2,sourceIndex:index+1,sourceComplete:sourceStatus.complete,sourceNote:sourceStatus.note});
  state.segs = [];
  appendQian(s);
  if(!sourceStatus.complete){ seg("\n资料状态：",{bold:true}); seg(sourceStatus.note); }
  flushOut();
}
function qianVerseLines(value){
  if(!/[，。；！？]/.test(value))return value;
  let count=0;
  return value.replace(/[\r\n]/g,'').replace(/[，。；！？]/g,mark=>mark+(++count%2===0?'\n':'')).replace(/\n+$/,'');
}
function qianCopySection(source){
  const labels=lang==='zh'?['签号','等级','签名',...L().qianLabels]:['Number','Grade','Title',...L().qianLabels];
  return ['【玄天灵签】',...labels.map((label,index)=>label+'：'+source[index])].join('\n');
}
function appendQian(s) {
  const labels = L().qianLabels;
  segC(s[0]+"　"+s[1]+"　"+s[2]+"\n");
  labels.forEach((lb,i)=>{
    seg(lb+"：\n",{bold:true});
    seg(qianVerseLines(s[i+3]));
    if (i<labels.length-1) seg("\n\n");
  });
}

// ================= 塔罗 =================
function tarotBaseName(name){ return name.startsWith('逆位')?name.slice(2):name; }

function buildTarotEntities(){
  const byName=new Map();
  TAROT.forEach((row,index)=>{
    const base=tarotBaseName(row[0]);
    if(!byName.has(base)) byName.set(base,{id:`tarot-${String(byName.size+1).padStart(3,'0')}`,base,uprightIndex:null,reversedIndex:null,special:index>=SPECIAL_TAROT_START});
    const entity=byName.get(base);
    entity.special=entity.special||index>=SPECIAL_TAROT_START;
    if(row[0].startsWith('逆位')) entity.reversedIndex=index;
    else entity.uprightIndex=index;
  });
  return [...byName.values()];
}
const TAROT_ENTITIES=buildTarotEntities();
const STANDARD_TAROT_ENTITIES=TAROT_ENTITIES.filter(entity=>!entity.special);
const MAJOR_TAROT_ENTITIES=STANDARD_TAROT_ENTITIES.filter(entity=>entity.uprightIndex>=56&&entity.uprightIndex<=77);

function tarotProfileEntities(profile){
  if(profile==='major22') return MAJOR_TAROT_ENTITIES;
  if(profile==='generalAll') return TAROT_ENTITIES;
  return STANDARD_TAROT_ENTITIES;
}

function tarotRecord(entity){
  const reversed=entity.reversedIndex!==null&&rnd(2)===1;
  const rowIndex=reversed?entity.reversedIndex:entity.uprightIndex;
  if(rowIndex===null) throw new Error(`塔罗资料缺少可用牌面：${entity.base}`);
  return {entityId:entity.id,baseName:entity.base,orientation:reversed?'reversed':'upright',rowIndex,special:entity.special};
}

function drawTarotRecords(profile,count){
  return drawUnique(tarotProfileEntities(profile),count).map(tarotRecord);
}

function resetTarotSessions() {
  state.drawnLenormand=[]; state.sessLenormand=-1; state.lenormandSessionKey='';
  state.pageHtml[6]=null; state.pageCopy[6]=null;
  if(state.curModule===3) restoreState();
  state.drawnGen = [];
  state.sessGen = -1;
  state.tarotSessionKeyGen = '';
  state.pageHtml[3] = null; state.pageCopy[3] = null;
  if (state.curModule===2 && state.curTab===0) restoreState();
}

function divineTarot(q) {
  if (state.curTab===0) tarotDraw(q, true);
  else if (state.curTab===1) tarotYesNo(q);
  else tarotDraw(q, false);
}

function tarotDraw(q, gen) {
  const profile=gen?(state.includeSpecial?'generalAll':'standard78'):'major22';
  const sessionKey=`${profile}|${q}`;
  const drawn = gen ? state.drawnGen : state.drawnMajor;
  const currentKey=gen?state.tarotSessionKeyGen:state.tarotSessionKeyMaj;
  if(currentKey!==sessionKey){
    drawn.length=0;
    if(gen){ state.sessGen=-1; state.tarotSessionKeyGen=sessionKey; }
    else { state.sessMaj=-1; state.tarotSessionKeyMaj=sessionKey; }
  }
  const available=tarotProfileEntities(profile).filter(entity=>!drawn.some(record=>record.entityId===entity.id));
  if(available.length) drawn.push(tarotRecord(available[rnd(available.length)]));
  const names = drawn.map(record=>TAROT[record.rowIndex][0]);
  state.copyText = copyBlock(q,`${L().mods[2]}·${L().tarotTabs[state.curTab]}`,names.join("、"));
  const h = state.histories[2];
  const entry = makeHistoryEntry(state.copyText,{kind:'tarot-session',schemaVersion:2,profile,draws:drawn.map(record=>({...record}))});
  const idx = gen ? state.sessGen : state.sessMaj;
  if (idx>=0 && idx<h.length) h[idx]=entry;
  else {
    h.push(entry);
    if (h.length>30){ h.shift(); if(state.sessGen>0)state.sessGen--; if(state.sessMaj>0)state.sessMaj--; }
    if (gen) state.sessGen=h.length-1; else state.sessMaj=h.length-1;
  }
  saveHistories();
  const s = L();
  state.segs=[];
  if (gen) {
    const specials = drawn.filter(record=>record.special).map(record=>TAROT[record.rowIndex][0]);
    seg(s.specialCards,{bold:true});
    seg("："+(specials.length?specials.join("、"):s.none)+"\n");
  }
  drawn.forEach((record,k)=>{
    const row=TAROT[record.rowIndex];
    seg(`${row[0]}\n`,{bold:true});
    seg(row[1]);
    if (k<drawn.length-1) seg("\n\n");
  });
  flushOut();
}

function tarotYesNo(q) {
  const y = YESNO[rnd(YESNO.length)];
  state.copyText = copyBlock(q,`${L().mods[2]}·${L().tarotTabs[state.curTab]}`,y[0]+"，"+y[1]+"："+y[2]+"（"+y[3]+"）");
  addHistory();
  state.segs=[];
  seg(state.copyText+"\n\n");
  segC(y[0]+"\n");
  seg(y[1],{bold:true});
  seg("："+y[2]+"。"+y[3]+"。");
  flushOut();
}

// ================= 首页 =================
function divineHome(q) {
  const castTime=new Date();
  const includeSpecial=state.includeSpecial;
  const focus={...focusOptions()};
  const dummy=[];
  const tarotProfile=includeSpecial?'generalAll':'standard78';
  const tarotDraws=drawTarotRecords(tarotProfile,3);
  const tarot = tarotDraws.map(record=>orientedName(TAROT[record.rowIndex][0])).join("、")+"；";
  const len = divineLenormand(dummy);
  const runes = divineRunes(dummy);
  const astro = divineAstro(dummy);
  const coinThrows=frozenCoinThrows();
  const liuyaoCalculation=calculateSharedLiuYao(q,castTime,{forceRandom:true,coinThrows});
  const oracleCards = drawOracleCards();
  const oracle = oraclePromptSummary(oracleCards);
  const qTable = qianTable();
  const qianIndex=rnd(qTable.length), qs = qTable[qianIndex], qianStatus=qianSourceStatus(qianIndex);
  const qianHead = qs[0]+"　"+qs[1]+"　"+qs[2];
  const calculationContext=fixedEast8Context();
  const traditionalResults = [
    ['qimen','奇门遁甲',{}],
    ['liuren','大六壬',{}],
    ['xiaoliuren','小六壬',{}],
    ['meihua','梅花易数',{method:'time'}],
    ['taiyi','太乙神数',{scope:'day'}],
    ['jinkoujue','金口诀',{method:'time'}],
  ].map(([method,label,options])=>{
    const methodOptions={question:q,...options,...focus,...calculationContext};
    const response=calculateTraditional(method,castTime.getTime(),methodOptions);
    return {label,response};
  });
  const sections=['【综合占卜解读输入】',`问题：${q}`];
  const focusText=focusDescription();
  sections.push(`事项／性别：${focusText||'未指定'}`);
  sections.push(
    `统一起卦时间：${east8DateTimeValue(castTime)}（UTC+08:00）`,
    '',
    '【卡牌与卦象】',
    `塔罗牌：${tarot}`,
    `雷诺曼牌：${len}`,
    `复古神谕：${oracle}`,
    `卢恩符文：${runes}`,
    `占星骰子：${astro}`
  );
  sections.push('', '【传统术数】');
  sections.push(liuyaoCalculation.response.ok?`【六爻纳甲】\n${liuyaoCalculation.response.result.aiPromptSection}`:`六爻纳甲：计算失败（${liuyaoCalculation.response.error}）`);
  traditionalResults.forEach(({label,response})=>sections.push(response.ok?`【${label}】\n${response.result.aiPromptSection}`:`${label}：计算失败（${response.error||'没有返回事实段'}）`));
  sections.push('', '【解读要求】','先按各体系自身规则分别判断，再综合共同指向与矛盾；不为求一致而删去冲突信息。\n结论分为强共识、弱共识、单一体系提示和资料不足。\n用神或类神有多个候选时分别讨论，不自行指定一个。\n应期只依据已给出的应期证据，不硬造唯一日期。\n只依据以上数据，不重新抽牌、掷骰或排盘。');
  state.copyText=sections.join('\n')+'\n\n'+qianCopySection(qs);
  addHistoryText(state.copyText+"\n"+qianHead,{kind:'combined',schemaVersion:3,castTimestampUtc:castTime.getTime(),calculationContext,focus,includeSpecial,tarotDraws,liuyao:liuyaoCalculation.response.ok?{methodVersion:liuyaoCalculation.response.result.methodVersion,input:liuyaoCalculation.response.result.input,coinThrows,calculatedFacts:liuyaoCalculation.response.result.calculatedFacts,aiPrompt:liuyaoCalculation.response.result.aiPrompt}:null,qian:{sourceIndex:qianIndex+1,sourceComplete:qianStatus.complete}});
  state.segs=[];
  segC('卡牌与卦象\n');
  seg(['塔罗牌：'+tarot,'雷诺曼牌：'+len,'复古神谕：'+oracleCards.map(item=>item.card[2]+(item.upright?'（正位）':'（逆位）')).join('、'),'卢恩符文：'+runes.replace(/[；;]$/,'').split('、').map(raw=>orientedName(raw,true).replace(/^[\u16a0-\u16ff]/u,'').trim()).join('、'),'占星骰子：'+astro].join('\n')+'\n\n');
  segC('传统术数\n');
  if(liuyaoCalculation.response.ok){segC('六爻纳甲\n');seg(liuyaoCalculation.response.result.display+'\n\n');}
  traditionalResults.forEach(({label,response})=>{segC(label+'\n');seg((response.ok?response.result.display:response.error)+'\n\n');});
  appendQian(qs);
  flushOut();
}

function divineDate(q) {
  const castTime=new Date();
  const pool=[]; for(let i=4;i<=55;i++) pool.push(i);
  const drawn=[]; let ace=null;
  for (let n=1;n<=25;n++){
    const p=rnd(pool.length);
    const name=TAROT[pool[p]][0];
    pool.splice(p,1);
    drawn.push(name);
    if (["权杖1","圣杯1","宝剑1","星币1"].includes(name)){ ace=name; break; }
  }
  const s = L();
  let tarotResult=null;
  if (ace===null) tarotResult=`${s.noWithinYear}（25张内未见 Ace 的自定义牌阵规则，不等同客观一年内必无）`;
  else {
    let season=null;
    for (const row of DATE12){
      if (row[0]!==ace) continue;
      season=row[1];
      if (tarotResult===null && drawn.includes(row[2])){
        tarotResult=row[4];
        for (let d=5;d<=9;d+=2) if (drawn.includes(row[d])){ tarotResult=row[d+1]; break; }
      }
    }
    if (tarotResult===null) tarotResult=season+"季";
  }
  const p2=PLANETS[rnd(PLANETS.length)], sg2=SIGNS[rnd(SIGNS.length)], h2=HOUSES[rnd(HOUSES.length)];
  let body = `${s.tarotPred}（自定义日期启发式，DATE12 水瓶区间源表存在重叠，未擅自改写）：${tarotResult}\n\n${s.astroPred}\n${s.baseDuration}：${p2[2]}\n${s.unit}：${sg2[2]}\n${s.adjustNum}：${h2[2]}`;
  const timingLines=[], traditionalTiming={};
  [['qimen','奇门应期',{}],['liuren','六壬应期',{}],['meihua','梅花应期',{method:'time'}]].forEach(([method,label,options])=>{
    const response=calculateTraditional(method,castTime.getTime(),{question:q,...options,...fixedEast8Context()});
    const value=response.ok&&response.result.timingSummary?response.result.timingSummary:`计算失败（${response.error||'没有返回应期摘要'}）`;
    traditionalTiming[method]=value;
    timingLines.push(`${label}：${value}`);
  });
  const start=$('traditional-start')?.value||localDateValue();
  const fallbackEnd=new Date(); fallbackEnd.setDate(fallbackEnd.getDate()+30);
  const end=$('traditional-end')?.value||localDateValue(fallbackEnd);
  const topic=$('traditional-topic')?.value||'custom';
  const astrologyResult=`${s.baseDuration}：${p2[2]}；${s.unit}：${sg2[2]}；${s.adjustNum}：${h2[2]}`;
  const almanac=calculateTraditional('almanac',new Date(`${start}T12:00`).getTime(),{question:q,topic,startDate:start,endDate:end,symbolicTiming:{tarot:tarotResult,astrology:astrologyResult},traditionalTiming:{qimen:traditionalTiming.qimen,liuren:traditionalTiming.liuren,meihua:traditionalTiming.meihua},...fixedEast8Context()});
  if(timingLines.length) body += "\n\n【应期参考】\n"+timingLines.join("\n");
  body += almanac.ok && almanac.result.display ? "\n\n"+almanac.result.display : `\n\n择日黄历：计算失败（${almanac.error||'没有返回盘面'}）`;
  state.copyText=almanac.ok?almanac.result.aiPrompt:`【择日解读输入】\n问题：${q}\n计算失败：${almanac.error||'没有返回盘面'}`;
  addHistory({kind:'timing',schemaVersion:2,castTimestampUtc:castTime.getTime(),tarotOrder:drawn,tarotResult,astroDice:{planet:p2[0],sign:sg2[0],house:h2[0]},date12SourceStatus:'水瓶区间源表重叠，未改写'});
  state.segs=[];
  seg(body+"\n\n"+s.briefNote+"\n");
  seg(s.tarotOrder,{bold:true});
  seg("："+drawn.join("、")+"\n");
  seg(s.astroDice,{bold:true});
  seg("："+cjk(p2[0])+"、"+cjk(sg2[0])+"、"+h2[0]);
  flushOut();
}

// ================= 历史 =================
function makeHistoryEntry(text,record=null){
  return {schemaVersion:2,createdAt:new Date().toISOString(),text:timeStamp()+"  "+text,...(record?{record}:{})};
}
function historyText(item){ return typeof item==='string'?item:String(item?.text||''); }
function addHistory(record=null){ addHistoryText(state.copyText,record); }
function addHistoryText(text,record=null){
  const h = state.histories[state.curModule];
  h.push(makeHistoryEntry(text,record));
  if (h.length>30){ h.shift(); if(state.sessGen>0)state.sessGen--; if(state.sessMaj>0)state.sessMaj--; }
  saveHistories();
}
function saveHistories(){
  try { localStorage.setItem('divination_history', JSON.stringify(state.histories)); } catch(e){}
}
function loadHistories(){
  try {
    const d = JSON.parse(localStorage.getItem('divination_history'));
    if (Array.isArray(d) && (d.length===7 || d.length===14 || d.length===15)) {
      const migrated = Array.from({length:15},(_,i)=>Array.isArray(d[i])?d[i].slice(-30):[]);
      state.histories = migrated;
    }
  } catch(e){}
}

// ================= UI =================
function $(id){ return document.getElementById(id); }

function goText(){
  const s = L();
  switch(state.curModule){
    case 0: return s.goHome; case 1: return s.goLiuYao;
    case 4: return runePoolExhausted()?(lang==='zh'?'已抽完':'All drawn'):(lang==='zh'?'抽取一枚':'Draw one rune');
    case 5: return s.goDice; case 6: return s.goQian;
    case 7: case 8: case 9: case 10: case 11: case 12: case 13: return s.calculate;
    default: return s.goDraw;
  }
}

const moduleTrail=[];
function resetPageScroll(){
  window.scrollTo({top:0,left:0,behavior:'instant'});
  ['out','configuration','navigation'].forEach(id=>$(id).scrollTo({top:0,left:0,behavior:'instant'}));
}
function navigateModule(index){
  if(index===state.curModule)return;
  saveState(); if(index===0)moduleTrail.length=0; else moduleTrail.push(state.curModule); state.curModule=index;
  restoreState(); renderAll(); resetPageScroll();
}
function goBack(){
  if(state.curModule===0)return;
  saveState(); state.curModule=moduleTrail.pop()??0;
  restoreState(); renderAll(); resetPageScroll();
}

function renderTabs(){
  const s = L();
  $('navigation').setAttribute('aria-label',lang==='zh'?'占卜方式':'Divination method');
  $('brand-name').textContent=lang==='zh'?'观兆问筮':'Oracle Atlas';
  $('back').hidden=state.curModule===0;
  $('back').textContent=lang==='zh'?'‹ 返回':'‹ Back';
  $('method-title').textContent=state.curModule===0?(lang==='zh'?'综合结果':'Combined result'):s.mods[state.curModule];
  $('out').dataset.empty=lang==='zh'?'占卜结果将在这里显示':'Your result will appear here';
  const mobileBar=$('mobilebar'); mobileBar.innerHTML='';
  [0,13,14,null,2,3,4,5,1,7,8,9,10,11,12,6].forEach(item=>{
    if(item===null){
      const gap=document.createElement('span'); gap.className='nav-empty'; gap.setAttribute('aria-hidden','true'); mobileBar.appendChild(gap); return;
    }
    const button=document.createElement('button'); button.type='button';
    button.className='tab'+(state.curModule===item?' sel':'');
    button.textContent=s.mobileTabs[item]; button.title=s.mods[item];
    button.setAttribute('aria-pressed',String(state.curModule===item));
    button.onclick=()=>navigateModule(item);
    mobileBar.appendChild(button);
  });
  const sub=$('subbar'); sub.innerHTML=''; sub.style.display='none';
  $('liurow').style.display=state.curModule===1?'flex':'none';
  renderFocusInputs();
  renderTraditionalInputs();
  sub.classList.remove('en-special');
  if (state.curModule===2){
    sub.style.display='flex';
    const enSpecial = lang === 'en';
    if (enSpecial) sub.classList.add('en-special');
    const tabHost = enSpecial ? document.createElement('div') : sub;
    if (enSpecial) { tabHost.id = 'subrow'; sub.appendChild(tabHost); }
    s.tarotTabs.forEach((t,i)=>{
      const b=document.createElement('button');
      b.className='tab'+(state.curTab===i?' sel':'');
      b.textContent=t;
      b.onclick=()=>{ saveState(); state.curTab=i; restoreState(); renderAll(); };
      tabHost.appendChild(b);
    });
    const lb=document.createElement('label'); lb.className='chk';
    const c=document.createElement('input'); c.type='checkbox'; c.checked=state.includeSpecial;
    c.onchange=()=>{
      requestSpecialDeckChange(c.checked,c);
    };
    lb.appendChild(c); lb.appendChild(document.createTextNode(s.includeSpecial));
    sub.appendChild(lb);
  }
  updateActionState();
}

function updateActionState(){
  $('go').textContent=goText();
  $('go').disabled=(state.curModule===4&&runePoolExhausted())||(state.curModule===14&&oraclePoolExhausted());
  $('copy').disabled=!state.copyText;
}
function renderAll(){ renderTabs(); }

function localDateTimeValue(date=new Date()){
  const p=n=>String(n).padStart(2,'0');
  return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

function east8DateTimeValue(date){
  const shifted=new Date(date.getTime()+480*60000), p=n=>String(n).padStart(2,'0');
  return `${shifted.getUTCFullYear()}-${p(shifted.getUTCMonth()+1)}-${p(shifted.getUTCDate())} ${p(shifted.getUTCHours())}:${p(shifted.getUTCMinutes())}`;
}

function localDateValue(date=new Date()){
  const p=n=>String(n).padStart(2,'0');
  return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}`;
}

function option(value,label){ return `<option value="${value}">${label}</option>`; }

function focusEnabled(){
  return state.curModule!==13;
}

function focusDescription(){
  const category={loveSingle:'婚恋·未婚',lovePartner:'婚恋·已有对象',marriage:'婚姻·已婚',wealth:'财运',career:'事业',litigation:'官司诉讼',health:'健康疾病',study:'考试／学业',travel:'出行／远行',search:'寻人寻物'}[state.questionCategory]||'';
  const details=[];
  if(state.gender==='male') details.push('男测');
  if(state.gender==='female') details.push('女测');
  if(state.questionCategory==='search') details.push('寻'+{elder:'长辈',peer:'平辈',junior:'晚辈',property:'财物'}[state.searchTarget]);
  if(!category) return details.join('·');
  return category+(details.length?`（${details.join('·')}）`:'');
}

function withFocusContext(text){
  const description=focusDescription();
  if(!focusEnabled() || !description) return text;
  return `${lang==='en'?'Question type / gender':'所测何事／性别'}：${description}\n${text}`;
}

function copyHeader(q){
  const lines=[`${lang==='en'?'Question':'问题'}：${q}`];
  const description=focusDescription();
  if(focusEnabled() && description) lines.push(`${lang==='en'?'Question type / gender':'所测何事／性别'}：${description}`);
  return lines.join('\n');
}

function copyBlock(q,title,body){
  const context=[focusEnabled()?focusDescription():'',title].filter(Boolean);
  const prefix=context.length?`（${context.join('／')}）`:'';
  return `${prefix}${q}：${body}`;
}

function traditionalCopyBlock(q,fallbackTitle,display){
  const lines=display.split('\n');
  const match=lines[0]&&lines[0].match(/^【(.+)】$/);
  const title=match?match[1]:fallbackTitle;
  if(match) lines.shift();
  return copyBlock(q,title,lines.join('\n'));
}

function focusOptions(){
  if(!focusEnabled() || !state.questionCategory) return {};
  if(['loveSingle','lovePartner','marriage'].includes(state.questionCategory) && !state.gender) return {};
  return {
    questionCategory:state.questionCategory,
    ...(['loveSingle','lovePartner','marriage'].includes(state.questionCategory)?{gender:state.gender}:{}),
    ...(state.questionCategory==='search'?{searchTarget:state.searchTarget}:{})
  };
}

function renderFocusInputs(){
  const row=$('focusrow');
  if(!focusEnabled()){ row.style.display='none'; row.innerHTML=''; return; }
  const en=lang==='en';
  const categories=[
    ['',en?'None':'不选'],
    ['loveSingle',en?'Love · single':'婚恋·未婚'],['lovePartner',en?'Love · partnered':'婚恋·已有对象'],
    ['marriage',en?'Marriage':'婚姻·已婚'],['wealth',en?'Wealth':'财运'],['career',en?'Career':'事业'],
    ['litigation',en?'Litigation':'官司诉讼'],['health',en?'Health':'健康疾病'],['study',en?'Study / exam':'考试／学业'],
    ['travel',en?'Travel':'出行／远行'],['search',en?'Find person / item':'寻人寻物']
  ];
  row.style.display='flex';
  row.innerHTML=`<label>${en?'Question type':'所测何事'}<select id="focus-category">${categories.map(x=>option(x[0],x[1])).join('')}</select></label><label>${en?'Gender':'性别'}<select id="focus-gender">${option('',en?'None':'不选')}${option('male',en?'Male':'男')}${option('female',en?'Female':'女')}</select></label><label id="focus-target-wrap">${en?'Target':'寻找对象'}<select id="focus-target">${option('elder',en?'Elder':'长辈')}${option('peer',en?'Peer':'平辈')}${option('junior',en?'Junior':'晚辈')}${option('property',en?'Property':'财物')}</select></label>`;
  $('focus-category').value=state.questionCategory;
  $('focus-gender').value=state.gender;
  $('focus-target').value=state.searchTarget;
  const refresh=()=>{
    $('focus-target-wrap').style.display=state.questionCategory==='search'?'flex':'none';
  };
  $('focus-category').onchange=()=>{ state.questionCategory=$('focus-category').value; refresh(); };
  $('focus-gender').onchange=()=>{ state.gender=$('focus-gender').value; };
  $('focus-target').onchange=()=>{ state.searchTarget=$('focus-target').value; };
  refresh();
}

function renderTraditionalInputs(){
  const row=$('traditionalrow');
  if(state.curModule<7 || state.curModule>13){ row.style.display='none'; row.classList.remove('almanac'); row.innerHTML=''; return; }
  const s=L(), savedTime=row.dataset.time||localDateTimeValue();
  row.style.display='flex';
  row.innerHTML=`<label>${s.dateTime}<input id="traditional-time" type="datetime-local" value="${savedTime}"></label>`;
  const method=TRADITIONAL_METHODS[state.curModule-7];
  row.classList.toggle('almanac',method==='almanac');
  if(method==='meihua'){
    row.insertAdjacentHTML('beforeend',`<fieldset class="cast-methods"><legend>${s.castMethod}</legend><label><input type="radio" name="meihua-method" value="time" checked>${lang==='zh'?'时间起卦':'Time'}</label><label><input type="radio" name="meihua-method" value="number">${lang==='zh'?'数字起卦':'Number'}</label></fieldset><label id="traditional-number-wrap" style="display:none">${s.numberValue}<input id="traditional-number" type="number" min="1" step="1" value="1"></label>`);
    row.querySelectorAll('[name="meihua-method"]').forEach(input=>input.onchange=()=>{ $('traditional-number-wrap').style.display=input.value==='number'?'flex':'none'; });
  }else if(method==='taiyi'){
    row.insertAdjacentHTML('beforeend',`<fieldset class="cast-methods"><legend>${lang==='zh'?'起局方式':'Casting method'}</legend><label><input type="radio" name="taiyi-method" value="time" checked>${lang==='zh'?'时间起局':'Time'}</label><label><input type="radio" name="taiyi-method" value="manual">${lang==='zh'?'数字起局':'Bureau number'}</label></fieldset><div id="taiyi-manual" style="display:none"><label>${lang==='zh'?'局数（1–72）':'Bureau (1–72)'}<input id="taiyi-bureau" type="number" min="1" max="72" step="1" value="1"></label><label>${lang==='zh'?'阴阳遁':'Direction'}<select id="taiyi-direction">${option('阳遁',lang==='zh'?'阳遁':'Yang')}${option('阴遁',lang==='zh'?'阴遁':'Yin')}</select></label></div><label>${s.scope}<select id="traditional-scope">${option('year','年计')}${option('month','月计')}${option('day','日计')}${option('hour','时计')}</select></label>`);
    row.querySelectorAll('[name="taiyi-method"]').forEach(input=>input.onchange=()=>{ $('taiyi-manual').style.display=input.value==='manual'?'grid':'none'; });
  }else if(method==='jinkoujue'){
    row.insertAdjacentHTML('beforeend',`<label>${s.diFenMethod}<select id="traditional-method">${option('time',s.timeMethod)}${option('branch',s.branchMethod)}${option('number',s.numberMethod)}</select></label><label id="traditional-branch-wrap" style="display:none">${s.branch}<select id="traditional-branch">${'子丑寅卯辰巳午未申酉戌亥'.split('').map(x=>option(x,x)).join('')}</select></label><label id="traditional-number-wrap" style="display:none">${s.numberValue}<input id="traditional-number" type="number" min="1" step="1" value="1"></label>`);
    $('traditional-method').onchange=()=>{
      $('traditional-branch-wrap').style.display=$('traditional-method').value==='branch'?'flex':'none';
      $('traditional-number-wrap').style.display=$('traditional-method').value==='number'?'flex':'none';
    };
  }else if(method==='almanac'){
    const start=localDateValue(), endDate=new Date(); endDate.setDate(endDate.getDate()+30); const end=localDateValue(endDate);
    const topics=[['marriage','婚嫁'],['move','搬迁'],['opening','开业'],['contract','签约'],['travel','出行'],['medical','求医'],['study','求学'],['burial','安葬'],['renovation','动土'],['custom','通用']];
    row.innerHTML=`<div class="almanac-topic"><label>${s.topic}<select id="traditional-topic">${topics.map(x=>option(x[0],x[1])).join('')}</select></label></div><div class="almanac-dates"><label>${s.startDate}<input id="traditional-start" type="date" value="${start}"></label><label>${s.endDate}<input id="traditional-end" type="date" value="${end}"></label></div>`;
  }
  const timeInput=$('traditional-time');
  if(timeInput) timeInput.onchange=()=>{ row.dataset.time=timeInput.value; };
}

function traditionalOptions(method,question=''){
  const focus=focusOptions();
  const context=fixedEast8Context();
  if(method==='meihua') return {question,method:document.querySelector('[name="meihua-method"]:checked').value,number:Number($('traditional-number').value),...focus,...context};
  if(method==='taiyi') {
    const castMethod=document.querySelector('[name="taiyi-method"]:checked').value;
    return {question,scope:$('traditional-scope').value,method:castMethod,...(castMethod==='manual'?{bureau:Number($('taiyi-bureau').value),yinYang:$('taiyi-direction').value}:{}),...focus,...context};
  }
  if(method==='jinkoujue') return {question,method:$('traditional-method').value,branch:$('traditional-branch').value,number:Number($('traditional-number').value),...focus,...context};
  if(method==='almanac') return {question,topic:$('traditional-topic').value,startDate:$('traditional-start').value,endDate:$('traditional-end').value,...context};
  return {question,...focus,...context};
}

function calculateTraditional(method,timestamp,options={}){
  if(typeof ZhanbuAlgorithms==='undefined' || typeof ZhanbuAlgorithms.calculate!=='function'){
    return {ok:false,error:L().algorithmUnavailable};
  }
  try {
    return JSON.parse(ZhanbuAlgorithms.calculate(method,timestamp,JSON.stringify(options)));
  } catch(error) {
    return {ok:false,error:String(error)};
  }
}

function divineTraditional(q){
  const method=TRADITIONAL_METHODS[state.curModule-7];
  const timeInput=$('traditional-time');
  const timestamp=timeInput ? new Date(timeInput.value).getTime() : new Date(`${$('traditional-start').value}T12:00`).getTime();
  const response=calculateTraditional(method,timestamp,traditionalOptions(method,q));
  if(!response.ok){ window.alert(response.error); return false; }
  state.readingFacts=response.result.calculatedFacts;
  state.copyText=response.result.aiPrompt;
  state.segs=[]; seg(response.result.display); flushOut(); addHistory();
  return true;
}

function divine(){
  if(focusEnabled() && ['loveSingle','lovePartner','marriage'].includes(state.questionCategory) && !state.gender){
    window.alert(L().requiredGender);
    return;
  }
  if(state.curModule===1){
    const upper=$('liu-upper').value, lower=$('liu-lower').value;
    const hasMoving=document.querySelector('#moving-lines input:checked')!==null;
    const hasManual=upper!=='' || lower!=='' || hasMoving;
    if(hasManual && (upper==='' || lower==='')){
      window.alert(L().completeTrigrams);
      return;
    }
  }
  let q=$('q').value.trim();
  if (!q) q=L().emptyQuestion;
  if (state.curModule===0){ divineHome(q); }
  else if (state.curModule===6) divineQian(q);
  else if (state.curModule===2) divineTarot(q);
  else if (state.curModule===3) lenormandDraw(q);
  else if (state.curModule===13){ divineDate(q); }
  else if (state.curModule===14) divineOracle(q);
  else if (state.curModule>=7 && state.curModule<=13){ if(!divineTraditional(q)) return; }
  else if (state.curModule===1){ if(!divineSharedLiuYao(q)) return; }
  else {
    if(state.curModule===4){ runeDraw(q); saveState(); return; }
    const lines=[];
    let result;
    if (state.curModule===4) result=divineRunes(lines);
    else result=divineAstro(lines);
    state.copyText=copyBlock(q,L().mods[state.curModule],result);
    state.segs=[];
    addHistory();
    const s = L();
    seg(state.copyText+"\n\n"+s.briefNote+"\n");
    lines.forEach((ln,i)=>{
      seg(ln[0]);
      seg(ln[1],{bold:true});
      seg("："+ln[2]+"。");
      if (ln[3]) seg(ln[3],{italic:true});
      if (i<lines.length-1) seg("\n");
    });
    flushOut();
  }
  saveState();
}

function clearPage(){
  if(state.curModule===14)resetOracleSession();
  if(state.curModule===4) resetRuneSession();
  if(state.curModule===3){ state.drawnLenormand=[]; state.sessLenormand=-1; state.lenormandSessionKey=''; }
  $('q').value=''; state.copyText='';
  state.questionCategory=''; state.gender='';
  if(state.curModule===1){
    $('liu-upper').value=''; $('liu-lower').value='';
    document.querySelectorAll('#moving-lines input').forEach(el=>{ el.checked=false; });
  }
  state.segs=[]; setOutHtml('');
  state.drawnGen=[]; state.drawnMajor=[];
  state.sessGen=-1; state.sessMaj=-1;
  state.tarotSessionKeyGen=''; state.tarotSessionKeyMaj='';
  const p=pageIndex();
  state.pageHtml[p]=null; state.pageCopy[p]=null;
  renderFocusInputs();
  updateActionState();
}

function openSpecialWarn(){
  const s = L();
  $('special-title').textContent = s.specialWarnTitle;
  $('special-body').textContent = s.specialWarnText;
  $('special-ok').textContent = s.ok;
  $('special-warn').style.display = 'flex';
}

let pendingSpecialCheckbox=null;
function specialDeckUnlocked(){
  try { return localStorage.getItem(SPECIAL_DECK_UNLOCK_KEY)==='1'; } catch(e) { return false; }
}
function requestSpecialDeckChange(enabled,checkbox){
  if(!enabled){
    state.includeSpecial=false;
    checkbox.checked=false;
    resetTarotSessions();
    return;
  }
  if(specialDeckUnlocked()){
    state.includeSpecial=true;
    checkbox.checked=true;
    resetTarotSessions();
    return;
  }
  state.includeSpecial=false;
  checkbox.checked=false;
  pendingSpecialCheckbox=checkbox;
  $('special-code').value='';
  $('special-code-error').textContent='';
  $('special-unlock').style.display='flex';
  setTimeout(()=>$('special-code').focus(),0);
}

function confirmSpecialDeckUnlock(){
  if($('special-code').value!=='820813'){
    $('special-code-error').textContent='验证码不正确';
    return;
  }
  try { localStorage.setItem(SPECIAL_DECK_UNLOCK_KEY,'1'); } catch(e) {}
  state.includeSpecial=true;
  if(pendingSpecialCheckbox) pendingSpecialCheckbox.checked=true;
  pendingSpecialCheckbox=null;
  $('special-code').value='';
  $('special-code-error').textContent='';
  $('special-unlock').style.display='none';
  resetTarotSessions();
  openSpecialWarn();
}

function openHistory(){
  const mod=state.curModule;
  const s = L();
  $('hist-title').textContent=s.histTitleFmt(s.mods[mod]);
  renderHistoryBody(mod);
  $('hist-copy').onclick=()=>{
    const h=state.histories[mod];
    if (h.length) toClipboard(h.map(historyText).join('\n\n'));
  };
  $('hist-clear').onclick=()=>{
    state.histories[mod]=[];
    if(mod===4) resetRuneSession();
    if(mod===14)resetOracleSession();
    if(mod===3){ state.drawnLenormand=[]; state.sessLenormand=-1; state.lenormandSessionKey=''; }
    if (mod===2){ state.sessGen=-1; state.sessMaj=-1; state.tarotSessionKeyGen=''; state.tarotSessionKeyMaj=''; }
    saveHistories(); renderHistoryBody(mod);
  };
  $('hist').style.display='flex';
}
function renderHistoryBody(mod){
  const h=state.histories[mod];
  $('hist-body').innerHTML=h.map(item=>{
    const value=historyText(item), sepI=value.indexOf('  ');
    if (sepI>0) return '<span class="b">'+esc(value.slice(0,sepI))+'</span>'+esc(value.slice(sepI));
    return esc(value);
  }).join('\n\n');
}

// ================= 初始化 =================
window.addEventListener('DOMContentLoaded', ()=>{
  $('back').onclick=goBack;
  let swipeStart=null;
  document.addEventListener('touchstart',event=>{
    const modalOpen=[...document.querySelectorAll('.modal')].some(modal=>getComputedStyle(modal).display!=='none');
    swipeStart=event.touches.length===1 && !modalOpen && event.touches[0].clientX<32 ? {x:event.touches[0].clientX,y:event.touches[0].clientY}:null;
  },{passive:true});
  document.addEventListener('touchend',event=>{
    const start=swipeStart; swipeStart=null;
    if(!start || !window.matchMedia('(orientation: portrait)').matches || !event.changedTouches.length)return;
    const dx=event.changedTouches[0].clientX-start.x,dy=event.changedTouches[0].clientY-start.y;
    if(dx>80 && Math.abs(dy)<dx/2)goBack();
  },{passive:true});
  document.addEventListener('touchcancel',()=>{swipeStart=null;},{passive:true});

  const requestedMethod = new URLSearchParams(window.location.search).get('method');
  const requestedIndex = TRADITIONAL_METHODS.indexOf(requestedMethod);
  if (requestedIndex >= 0) state.curModule = 7 + requestedIndex;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  loadHistories();
  applyStaticI18n();
  const themeQuery=window.matchMedia('(prefers-color-scheme: dark)');
  const syncTheme=()=>document.querySelector('meta[name="theme-color"]').setAttribute('content',themeQuery.matches?'#101b17':'#e8e4dd');
  syncTheme(); themeQuery.addEventListener('change',syncTheme);
  renderAll();
  $('go').onclick=divine;
  $('q').addEventListener('keydown',e=>{ if(e.key==='Enter') divine(); });
  $('q').addEventListener('input',updateActionState);
  document.addEventListener('change',updateActionState);
  $('copy').onclick=()=>{ if(state.copyText) toClipboard(state.copyText); };
  $('clear').onclick=clearPage;
  $('histbtn').onclick=openHistory;
  $('helpbtn').onclick=()=>{ $('help-body').textContent=L().helpText; $('help').style.display='flex'; };
  $('langbtn').onclick=toggleLang;
  $('special-confirm').onclick=confirmSpecialDeckUnlock;
  $('special-code').addEventListener('keydown',e=>{ if(e.key==='Enter') confirmSpecialDeckUnlock(); });
  $('special-cancel').onclick=()=>{ pendingSpecialCheckbox=null; state.includeSpecial=false; };
  document.querySelectorAll('.modal-close').forEach(b=>{
    b.onclick=()=>{
      if(b.id==='special-cancel'){ pendingSpecialCheckbox=null; state.includeSpecial=false; }
      b.closest('.modal').style.display='none';
    };
  });
  document.querySelectorAll('.modal').forEach(m=>{
    if(m.id==='closing-notice') return;
    m.addEventListener('click',e=>{ if(e.target===m) m.style.display='none'; });
  });
  const notice = $('closing-notice');
  const previousFocus = document.activeElement;
  const closeNotice = ()=>{
    notice.style.display='none';
    (previousFocus && previousFocus !== document.body ? previousFocus : $('langbtn')).focus();
  };
  $('closing-notice-ok').onclick=closeNotice;
  notice.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      e.preventDefault();
      closeNotice();
    } else if(e.key==='Tab'){
      e.preventDefault();
      $('closing-notice-ok').focus();
    }
  });
  notice.style.display='flex';
  $('closing-notice-ok').focus();
});
