// 占卜逻辑：完整移植自 Divination.cs
'use strict';

const LANG_KEY = 'divination_lang';
const SPECIAL_TAROT_START = 156;

const STR = {
  zh: {
    mods: ["首页","六爻","塔罗","雷诺曼","卢恩符文","占星骰子","玄天上帝感应灵签","奇门遁甲","大六壬","小六壬","梅花易数","太乙神数","金口诀","择日/黄历"],
    modTabs: ["首页","六爻","塔罗","雷诺曼","卢恩符文","占星骰子","灵签"],
    newMethodTabs: ["奇门遁甲","大六壬","小六壬","梅花易数","太乙神数","金口诀","择日/黄历"],
    tarotTabs: ["通用","YES OR NO","大牌"],
    homeTabs: ["综合占卜","日期预测"],
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
    specialWarnTitle: "特殊塔罗牌说明",
    specialWarnText: "如果没有特殊牌义的解读包，建议给 AI 的解读不要使用特殊牌。",
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
    helpText: "1. 首页-综合占卜：一次生成塔罗三张牌、雷诺曼三张、卢恩三枚、占星骰子、六爻。灵签只在历史记录中追加签头，界面结果和复制结果不包含灵签。\n\n"
      + "2. 首页-日期预测：理论上无法验证准确时间，仅供参考，自行甄别。\n\n"
      + "3. 塔罗-通用：默认不包含特殊牌；勾选“包含特殊牌”后，通用塔罗与首页综合占卜的塔罗部分都会纳入特殊牌。YES OR NO 与大牌不受此选项影响。若无特殊牌义解读包，建议给 AI 的解读不要使用特殊牌。\n\n"
      + "4. 历史记录会保存30条，下次打开程序仍可查看。\n\n"
      + "5. 复制结果可直接粘贴到AI解读。",
    liuYaoSummary: (ben, dong, shi, ying, bian, hu, cuo, zong) => {
      const dongText = dong.length ? dong.join("、") : "无";
      return `本卦${ben[0]}，动爻${dongText}，世爻${ben[shi]}，应爻${ben[ying]}，变卦${bian[0]}，互卦${hu[0]}，错卦${cuo[0]}，综卦${zong[0]}；`;
    }
  },
  en: {
    mods: ["Home","I Ching","Tarot","Lenormand","Runes","Astro Dice","Fortune Slip","Qimen","Da Liu Ren","Xiao Liu Ren","Meihua Yishu","Taiyi","Jin Kou Jue","Date Selection"],
    modTabs: ["Home","I Ching","Tarot","Lenormand","Runes","Astro Dice","Slip"],
    newMethodTabs: ["Qimen","Da Liu Ren","Xiao Liu Ren","Meihua Yishu","Taiyi","Jin Kou Jue","Date Selection"],
    tarotTabs: ["General","YES OR NO","Major"],
    homeTabs: ["Combined","Date forecast"],
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
    specialWarnTitle: "About special Tarot cards",
    specialWarnText: "If you do not have a meaning pack for special cards, do not include special cards when sending a reading to AI.",
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
    helpText: "1. Home - Combined: draws 3 Tarot, 3 Lenormand, 3 Runes, astro dice, and I Ching in one go. The fortune slip is appended to history only; on-screen and copied results exclude the slip body.\n\n"
      + "2. Home - Date forecast: timing cannot be verified; for reference only.\n\n"
      + "3. Tarot - General: special cards off by default. When enabled, they apply to General and Home combined Tarot. YES OR NO and Major Arcana are unaffected. Without a special-card meaning pack, avoid including special cards in AI readings.\n\n"
      + "4. History keeps the last 30 entries per module.\n\n"
      + "5. Copy results and paste into an AI for interpretation.\n\n"
      + "Note: card names, runes, and hexagrams remain in Chinese; fortune-slip text is translated in English mode.",
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
  copyText: "",
  drawnGen: [], drawnMajor: [],
  sessGen: -1, sessMaj: -1,
  histories: Array.from({length:14},()=>[]),
  pageHtml: new Array(17).fill(null),
  pageCopy: new Array(17).fill(null),
  segs: []
};

// ================= 工具 =================
const rnd = n => Math.floor(Math.random() * n);
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function seg(text, opt) { state.segs.push(Object.assign({text}, opt || {})); }
function segC(text) { seg(text, {bold:true, red:true, big:true}); }

function renderSegs() {
  return state.segs.map(s => {
    const cls = [s.bold&&'b', s.italic&&'i', s.red&&'red', s.big&&'big'].filter(Boolean).join(' ');
    return cls ? `<span class="${cls}">${esc(s.text)}</span>` : esc(s.text);
  }).join('');
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
  return 10 + (state.curModule - 7);
}
function saveState() {
  const p = pageIndex();
  state.pageHtml[p] = renderSegs();
  state.pageCopy[p] = state.copyText;
}
function restoreState() {
  const p = pageIndex();
  state.segs = [];
  if (state.pageHtml[p] == null) { state.copyText = ""; setOutHtml(""); }
  else { state.copyText = state.pageCopy[p]; setOutHtml(state.pageHtml[p]); }
}
function setOutHtml(h) { document.getElementById('out').innerHTML = h; }
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
  return s.liuYaoSummary(ben, dong, 1, 2, bian, hu, cuog, zong);
}

// ================= 占星骰子 =================
function cjk(s) {
  const m = s.match(/[一-龥]+/);
  return m ? m[0] : s;
}
function divineAstro(lines) {
  const s = L();
  const p = PLANETS[rnd(12)], sg = SIGNS[rnd(12)], h = HOUSES[rnd(12)];
  lines.push([s.planet, p[0], p[1], s.planetDesc]);
  lines.push([s.sign, sg[0], sg[1], s.signDesc]);
  lines.push([s.house, h[0], h[1], s.houseDesc]);
  return cjk(p[0])+"、"+cjk(sg[0])+"、"+h[0]+"；";
}

// ================= 雷诺曼 / 卢恩 =================
function divineLenormand(lines) {
  const idx=[];
  while (idx.length<3){ const i=rnd(LENORMAND.length); if(!idx.includes(i)) idx.push(i); }
  const pre = L().cardPre, names=[];
  idx.forEach((v,k)=>{ names.push(LENORMAND[v][0]); lines.push([pre[k],LENORMAND[v][0],LENORMAND[v][1],""]); });
  return names.join("、")+"；";
}
function divineRunes(lines) {
  const idx=[], used=[];
  while (idx.length<3){ const i=rnd(RUNES.length); if(!used.includes(RUNES[i][2])){ idx.push(i); used.push(RUNES[i][2]); } }
  const pre = L().runePre, names=[];
  idx.forEach((v,k)=>{ names.push(RUNES[v][0]); lines.push([pre[k],RUNES[v][0],RUNES[v][1],""]); });
  return names.join("、")+"；";
}

// ================= 灵签 =================
function qianTable() {
  return (lang === 'en' && typeof QIAN_EN !== 'undefined') ? QIAN_EN : QIAN;
}
function divineQian(q) {
  const table = qianTable();
  const s = table[rnd(table.length)];
  const labels = L().qianLabels;
  const head = s[0]+"　"+s[1]+"　"+s[2];
  let sb = q+"："+head;
  labels.forEach((lb,i)=>{ sb += "\n"+lb+"："+s[i+3]; });
  state.copyText = sb;
  addHistory();
  state.segs = [];
  appendQian(s);
  flushOut();
}
function appendQian(s) {
  const labels = L().qianLabels;
  segC(s[0]+"　"+s[1]+"　"+s[2]+"\n");
  labels.forEach((lb,i)=>{
    seg(lb+"：",{bold:true});
    seg(s[i+3]);
    if (i<labels.length-1) seg("\n");
  });
}

// ================= 塔罗 =================
const tarotGeneralHi = () => state.includeSpecial ? TAROT.length : SPECIAL_TAROT_START;

function resetTarotSessions() {
  state.drawnGen = [];
  state.sessGen = -1;
  state.pageHtml[3] = null; state.pageCopy[3] = null;
  if (state.curModule===2 && state.curTab===0) restoreState();
}

function divineTarot(q) {
  if (state.curTab===0) tarotDraw(q, true, 0, tarotGeneralHi());
  else if (state.curTab===1) tarotYesNo(q);
  else tarotDraw(q, false, 56, 100);
}

function tarotDraw(q, gen, lo, hi) {
  const drawn = gen ? state.drawnGen : state.drawnMajor;
  if (drawn.length < hi-lo) {
    let i;
    do { i = lo + rnd(hi-lo); } while (drawn.includes(i));
    drawn.push(i);
  }
  const names = drawn.map(i=>TAROT[i][0]);
  state.copyText = q+"："+names.join("、")+"；";
  const h = state.histories[2];
  const entry = timeStamp()+"  "+state.copyText;
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
  seg(state.copyText+"\n\n"+s.briefNote+"\n");
  if (gen) {
    const specials = drawn.filter(i=>i>=SPECIAL_TAROT_START).map(i=>TAROT[i][0]);
    seg(s.specialCards,{bold:true});
    seg("："+(specials.length?specials.join("、"):s.none)+"\n");
  }
  drawn.forEach((d,k)=>{
    seg(TAROT[d][0],{bold:true});
    seg("："+TAROT[d][1]);
    if (k<drawn.length-1) seg("\n");
  });
  flushOut();
}

function tarotYesNo(q) {
  const y = YESNO[rnd(YESNO.length)];
  state.copyText = q+"："+y[0]+"，"+y[1]+"："+y[2]+"（"+y[3]+"）";
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
  const dummy=[];
  const hi = tarotGeneralHi(), tarotIdx=[];
  while (tarotIdx.length<3 && tarotIdx.length<hi){
    const i=rnd(hi); if(!tarotIdx.includes(i)) tarotIdx.push(i);
  }
  const tarot = tarotIdx.map(i=>TAROT[i][0]).join("、")+"；";
  const len = divineLenormand(dummy);
  const runes = divineRunes(dummy);
  const astro = divineAstro(dummy);
  const liuyao = divineLiuYao(dummy);
  const qTable = qianTable();
  const qs = qTable[rnd(qTable.length)];
  const qianHead = qs[0]+"　"+qs[1]+"　"+qs[2];
  state.copyText = q+"："+tarot+len+runes+astro+liuyao;
  const traditionalLines = [
    ['qimen','奇门遁甲',{}],
    ['liuren','大六壬',{}],
    ['xiaoliuren','小六壬',{}],
    ['meihua','梅花易数',{method:'time'}],
    ['taiyi','太乙神数',{scope:'day'}],
    ['jinkoujue','金口诀',{method:'time'}],
  ].flatMap(([method,label,options])=>{
    const response=calculateTraditional(method,Date.now(),options);
    return response.ok && response.result.summary ? [`${label}：${response.result.summary}`] : [];
  });
  if(traditionalLines.length){
    state.copyText += "\n\n―― 传统术数合参 ――\n"+traditionalLines.join("\n")
      +"\n择日／黄历：需要事项和日期范围，请在对应页面单独计算。";
  }
  addHistoryText(state.copyText+"\n"+qianHead);
  state.segs=[];
  seg(state.copyText+"\n");
  appendQian(qs);
  flushOut();
}

function divineDate(q) {
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
  if (ace===null) tarotResult=s.noWithinYear;
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
  const p2=PLANETS[rnd(12)], sg2=SIGNS[rnd(12)], h2=HOUSES[rnd(12)];
  state.copyText = q+"\n"+s.tarotPred+"："+tarotResult+"\n\n"+s.astroPred+"：\n"+s.baseDuration+"："+p2[2]+"\n"+s.unit+"："+sg2[2]+"\n"+s.adjustNum+"："+h2[2];
  const timingLines=[];
  [['qimen','奇门应期',{}],['liuren','六壬应期',{}],['meihua','梅花应期',{method:'time'}]].forEach(([method,label,options])=>{
    const response=calculateTraditional(method,Date.now(),options);
    if(response.ok && response.result.timingSummary) timingLines.push(`${label}：${response.result.timingSummary}`);
  });
  const start=$('traditional-start')?.value||localDateValue();
  const fallbackEnd=new Date(); fallbackEnd.setDate(fallbackEnd.getDate()+30);
  const end=$('traditional-end')?.value||localDateValue(fallbackEnd);
  const topic=$('traditional-topic')?.value||'custom';
  const almanac=calculateTraditional('almanac',new Date(`${start}T12:00`).getTime(),{topic,startDate:start,endDate:end});
  if(almanac.ok && almanac.result.timingSummary) timingLines.push(`择日参考：${almanac.result.timingSummary}`);
  if(timingLines.length) state.copyText += "\n\n―― 应期与择日参考 ――\n"+timingLines.join("\n");
  addHistory();
  state.segs=[];
  seg(state.copyText+"\n\n"+s.briefNote+"\n");
  seg(s.tarotOrder,{bold:true});
  seg("："+drawn.join("、")+"\n");
  seg(s.astroDice,{bold:true});
  seg("："+cjk(p2[0])+"、"+cjk(sg2[0])+"、"+h2[0]);
  flushOut();
}

// ================= 历史 =================
function addHistory(){ addHistoryText(state.copyText); }
function addHistoryText(text){
  const h = state.histories[state.curModule];
  h.push(timeStamp()+"  "+text);
  if (h.length>30){ h.shift(); if(state.sessGen>0)state.sessGen--; if(state.sessMaj>0)state.sessMaj--; }
  saveHistories();
}
function saveHistories(){
  try { localStorage.setItem('divination_history', JSON.stringify(state.histories)); } catch(e){}
}
function loadHistories(){
  try {
    const d = JSON.parse(localStorage.getItem('divination_history'));
    if (Array.isArray(d) && (d.length===7 || d.length===14)) {
      const migrated = Array.from({length:14},(_,i)=>Array.isArray(d[i])?d[i].slice(-30):[]);
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
    case 5: return s.goDice; case 6: return s.goQian;
    case 7: case 8: case 9: case 10: case 11: case 12: case 13: return s.calculate;
    default: return s.goDraw;
  }
}

function renderTabs(){
  const s = L();
  const bar=$('modbar'); bar.innerHTML='';
  [0,2,3,4,5,6].forEach(i=>{
    const b=document.createElement('button');
    b.className='tab'+(state.curModule===i?' sel':'');
    b.textContent=s.modTabs[i]; b.title=s.mods[i];
    b.onclick=()=>{ saveState(); state.curModule=i; restoreState(); renderAll(); };
    bar.appendChild(b);
  });
  const methodBar=$('methodbar'); methodBar.innerHTML='';
  const liuYao=document.createElement('button');
  liuYao.className='tab'+(state.curModule===1?' sel':'');
  liuYao.textContent=s.modTabs[1]; liuYao.title=s.mods[1];
  liuYao.onclick=()=>{ saveState(); state.curModule=1; restoreState(); renderAll(); };
  methodBar.appendChild(liuYao);
  s.newMethodTabs.forEach((t,i)=>{
    const b=document.createElement('button');
    const moduleIndex=7+i;
    b.className='tab'+(state.curModule===moduleIndex?' sel':''); b.textContent=t; b.title=t;
    b.onclick=()=>{ saveState(); state.curModule=moduleIndex; restoreState(); renderAll(); };
    methodBar.appendChild(b);
  });
  const sub=$('subbar'); sub.innerHTML=''; sub.style.display='none';
  $('liurow').style.display=state.curModule===1?'flex':'none';
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
      state.includeSpecial=c.checked;
      resetTarotSessions();
      if (c.checked) openSpecialWarn();
    };
    lb.appendChild(c); lb.appendChild(document.createTextNode(s.includeSpecial));
    sub.appendChild(lb);
  } else if (state.curModule===0){
    sub.style.display='flex';
    s.homeTabs.forEach((t,i)=>{
      const b=document.createElement('button');
      b.className='tab'+(state.curHomeTab===i?' sel':'');
      b.textContent=t;
      b.onclick=()=>{ saveState(); state.curHomeTab=i; restoreState(); renderAll(); };
      sub.appendChild(b);
    });
    if (state.curHomeTab===1){
      const w=document.createElement('span'); w.className='warn';
      w.textContent=s.dateWarn;
      sub.appendChild(w);
    }
  }
  $('go').textContent=goText();
}

function renderAll(){ renderTabs(); }

function localDateTimeValue(date=new Date()){
  const p=n=>String(n).padStart(2,'0');
  return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}T${p(date.getHours())}:${p(date.getMinutes())}`;
}

function localDateValue(date=new Date()){
  const p=n=>String(n).padStart(2,'0');
  return `${date.getFullYear()}-${p(date.getMonth()+1)}-${p(date.getDate())}`;
}

function option(value,label){ return `<option value="${value}">${label}</option>`; }

function renderTraditionalInputs(){
  const row=$('traditionalrow');
  const isHomeDate=state.curModule===0 && state.curHomeTab===1;
  if(state.curModule<7 && !isHomeDate){ row.style.display='none'; row.innerHTML=''; return; }
  const s=L(), savedTime=row.dataset.time||localDateTimeValue();
  row.style.display='flex';
  row.innerHTML=`<label>${s.dateTime}<input id="traditional-time" type="datetime-local" value="${savedTime}"></label>`;
  const method=isHomeDate?'almanac':TRADITIONAL_METHODS[state.curModule-7];
  if(method==='meihua'){
    row.insertAdjacentHTML('beforeend',`<label>${s.castMethod}<select id="traditional-method">${option('time',s.timeMethod)}${option('number',s.numberMethod)}</select></label><label id="traditional-number-wrap" style="display:none">${s.numberValue}<input id="traditional-number" type="number" min="1" step="1" value="1"></label>`);
    $('traditional-method').onchange=()=>{ $('traditional-number-wrap').style.display=$('traditional-method').value==='number'?'flex':'none'; };
  }else if(method==='taiyi'){
    row.insertAdjacentHTML('beforeend',`<label>${s.scope}<select id="traditional-scope">${option('year','年计')}${option('month','月计')}${option('day','日计')}${option('hour','时计')}</select></label>`);
  }else if(method==='jinkoujue'){
    row.insertAdjacentHTML('beforeend',`<label>${s.diFenMethod}<select id="traditional-method">${option('time',s.timeMethod)}${option('branch',s.branchMethod)}${option('number',s.numberMethod)}</select></label><label id="traditional-branch-wrap" style="display:none">${s.branch}<select id="traditional-branch">${'子丑寅卯辰巳午未申酉戌亥'.split('').map(x=>option(x,x)).join('')}</select></label><label id="traditional-number-wrap" style="display:none">${s.numberValue}<input id="traditional-number" type="number" min="1" step="1" value="1"></label>`);
    $('traditional-method').onchange=()=>{
      $('traditional-branch-wrap').style.display=$('traditional-method').value==='branch'?'flex':'none';
      $('traditional-number-wrap').style.display=$('traditional-method').value==='number'?'flex':'none';
    };
  }else if(method==='almanac'){
    const start=localDateValue(), endDate=new Date(); endDate.setDate(endDate.getDate()+30); const end=localDateValue(endDate);
    const topics=[['marriage','婚嫁'],['move','搬迁'],['opening','开业'],['contract','签约'],['travel','出行'],['medical','求医'],['study','求学'],['burial','安葬'],['renovation','动土'],['custom','通用']];
    row.innerHTML=`<label>${s.topic}<select id="traditional-topic">${topics.map(x=>option(x[0],x[1])).join('')}</select></label><label>${s.startDate}<input id="traditional-start" type="date" value="${start}"></label><label>${s.endDate}<input id="traditional-end" type="date" value="${end}"></label>`;
  }
  const timeInput=$('traditional-time');
  if(timeInput) timeInput.onchange=()=>{ row.dataset.time=timeInput.value; };
}

function traditionalOptions(method){
  if(method==='meihua') return {method:$('traditional-method').value,number:Number($('traditional-number').value)};
  if(method==='taiyi') return {scope:$('traditional-scope').value};
  if(method==='jinkoujue') return {method:$('traditional-method').value,branch:$('traditional-branch').value,number:Number($('traditional-number').value)};
  if(method==='almanac') return {topic:$('traditional-topic').value,startDate:$('traditional-start').value,endDate:$('traditional-end').value};
  return {};
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
  const response=calculateTraditional(method,timestamp,traditionalOptions(method));
  if(!response.ok){ window.alert(response.error); return false; }
  state.copyText=`${q}\n\n${response.result.display}`;
  state.segs=[]; seg(state.copyText); flushOut(); addHistory();
  return true;
}

function divine(){
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
  if (state.curModule===0){ state.curHomeTab===0 ? divineHome(q) : divineDate(q); }
  else if (state.curModule===6) divineQian(q);
  else if (state.curModule===2) divineTarot(q);
  else if (state.curModule>=7){ if(!divineTraditional(q)) return; }
  else {
    const lines=[];
    let result;
    if (state.curModule===1) result=divineLiuYao(lines, $('liu-upper').value!=='' && $('liu-lower').value!=='');
    else if (state.curModule===3) result=divineLenormand(lines);
    else if (state.curModule===4) result=divineRunes(lines);
    else result=divineAstro(lines);
    state.copyText=q+"："+result;
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
  $('q').value=''; state.copyText='';
  if(state.curModule===1){
    $('liu-upper').value=''; $('liu-lower').value='';
    document.querySelectorAll('#moving-lines input').forEach(el=>{ el.checked=false; });
  }
  state.segs=[]; setOutHtml('');
  state.drawnGen=[]; state.drawnMajor=[];
  state.sessGen=-1; state.sessMaj=-1;
  const p=pageIndex();
  state.pageHtml[p]=null; state.pageCopy[p]=null;
}

function openSpecialWarn(){
  const s = L();
  $('special-title').textContent = s.specialWarnTitle;
  $('special-body').textContent = s.specialWarnText;
  $('special-ok').textContent = s.ok;
  $('special-warn').style.display = 'flex';
}

function openHistory(){
  const mod=state.curModule;
  const s = L();
  $('hist-title').textContent=s.histTitleFmt(s.mods[mod]);
  renderHistoryBody(mod);
  $('hist-copy').onclick=()=>{
    const h=state.histories[mod];
    if (h.length) toClipboard(h.join('\n\n'));
  };
  $('hist-clear').onclick=()=>{
    state.histories[mod]=[];
    if (mod===2){ state.sessGen=-1; state.sessMaj=-1; }
    saveHistories(); renderHistoryBody(mod);
  };
  $('hist').style.display='flex';
}
function renderHistoryBody(mod){
  const h=state.histories[mod];
  $('hist-body').innerHTML=h.map(item=>{
    const sepI=item.indexOf('  ');
    if (sepI>0) return '<span class="b">'+esc(item.slice(0,sepI))+'</span>'+esc(item.slice(sepI));
    return esc(item);
  }).join('\n\n');
}

// ================= 初始化 =================
window.addEventListener('DOMContentLoaded', ()=>{
  const requestedMethod = new URLSearchParams(window.location.search).get('method');
  const requestedIndex = TRADITIONAL_METHODS.indexOf(requestedMethod);
  if (requestedIndex >= 0) state.curModule = 7 + requestedIndex;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  loadHistories();
  applyStaticI18n();
  renderAll();
  $('go').onclick=divine;
  $('q').addEventListener('keydown',e=>{ if(e.key==='Enter') divine(); });
  $('copy').onclick=()=>{ if(state.copyText) toClipboard(state.copyText); };
  $('clear').onclick=clearPage;
  $('histbtn').onclick=openHistory;
  $('helpbtn').onclick=()=>{ $('help-body').textContent=L().helpText; $('help').style.display='flex'; };
  $('langbtn').onclick=toggleLang;
  document.querySelectorAll('.modal-close').forEach(b=>{
    b.onclick=()=>{ b.closest('.modal').style.display='none'; };
  });
  document.querySelectorAll('.modal').forEach(m=>{
    m.addEventListener('click',e=>{ if(e.target===m) m.style.display='none'; });
  });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
});
