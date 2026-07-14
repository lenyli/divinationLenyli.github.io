// 占卜逻辑：完整移植自 Divination.cs
'use strict';

const MODS = ["首页","六爻","塔罗","雷诺曼","卢恩符文","占星骰子","玄天上帝感应灵签"];
const MOD_TABS = ["首页","六爻","塔罗","雷诺曼","卢恩符文","占星骰子","灵签"];
const TAROT_TABS = ["通用","YES OR NO","大牌"];
const HOME_TABS = ["综合占卜","日期预测"];
const SPECIAL_TAROT_START = 156;
const HELP_TEXT = "1. 首页-综合占卜：一次生成塔罗三张牌、雷诺曼三张、卢恩三枚、占星骰子、六爻。灵签只在历史记录中追加签头，界面结果和复制结果不包含灵签。\n\n"
  + "2. 首页-日期预测：理论上无法验证准确时间，仅供参考，自行甄别。\n\n"
  + "3. 塔罗-通用：默认不包含特殊牌；勾选“包含特殊牌”后，通用塔罗与首页综合占卜的塔罗部分都会纳入特殊牌。YES OR NO 与大牌不受此选项影响。\n\n"
  + "4. 历史记录会保存30条，下次打开程序仍可查看。\n\n"
  + "5. 复制结果可直接粘贴到AI解读。";

const state = {
  curModule: 0, curTab: 0, curHomeTab: 0,
  includeSpecial: false,
  copyText: "",
  drawnGen: [], drawnMajor: [],
  sessGen: -1, sessMaj: -1,
  histories: [[],[],[],[],[],[],[]],
  pageHtml: new Array(10).fill(null),
  pageCopy: new Array(10).fill(null),
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
  return `${t.getFullYear()}-${p(t.getMonth()+1)}-${p(t.getDate())} ${t.getHours()<12?'上午':'下午'}${p(t.getHours())}：${p(t.getMinutes())}`;
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
  return 6 + (state.curModule - 3);
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

function divineLiuYao(lines) {
  const h=[],z=[],c=[];
  for (let i=0;i<6;i++){
    let heads=0;
    for (let j=0;j<3;j++) if (rnd(2)===0) heads++;
    const t=lineOfToss(heads); h.push(t[0]); z.push(t[1]); c.push(t[2]);
  }
  const ben  = hexg(elem(h[5],h[4],h[3]), elem(h[2],h[1],h[0]));
  const bian = hexg(elem(z[5],z[4],z[3]), elem(z[2],z[1],z[0]));
  const hu   = hexg(elem(h[4],h[3],h[2]), elem(h[3],h[2],h[1]));
  const cuog = hexg(elem(c[5],c[4],c[3]), elem(c[2],c[1],c[0]));
  const zong = hexg(elem(h[0],h[1],h[2]), elem(h[3],h[4],h[5]));
  const dong=[];
  for (let i=0;i<6;i++) if (h[i].includes('○')) dong.push(POS[i]);
  lines.push(["本卦", ben[0],  ben[3],  "【事情的现状】"]);
  lines.push(["变卦", bian[0], bian[3], "【事情的最终结果】"]);
  lines.push(["互卦", hu[0],   hu[3],   "【事情发展过程中的内在矛盾/隐藏动态】"]);
  lines.push(["错卦", cuog[0], cuog[3], "【事情的反面状态，即\"不是什么\"】"]);
  lines.push(["综卦", zong[0], zong[3], "【从另一个角度看这件事，或错误处理方式的后果】"]);
  return "本卦"+ben[0]+"，动爻"+dong.join("、")+"，世爻"+ben[1]+"，应爻"+ben[2]
       +"，变卦"+bian[0]+"，互卦"+hu[0]+"，错卦"+cuog[0]+"，综卦"+zong[0]+"；";
}

// ================= 占星骰子 =================
function cjk(s) {
  const m = s.match(/[一-龥]+/);
  return m ? m[0] : s;
}
function divineAstro(lines) {
  const p = PLANETS[rnd(12)], s = SIGNS[rnd(12)], h = HOUSES[rnd(12)];
  lines.push(["行星", p[0], p[1], "【做什么：发挥这股能量】"]);
  lines.push(["星座", s[0], s[1], "【怎么做：以这种方式】"]);
  lines.push(["宫位", h[0], h[1], "【在哪里做：在这个领域】"]);
  return cjk(p[0])+"、"+cjk(s[0])+"、"+h[0]+"；";
}

// ================= 雷诺曼 / 卢恩 =================
function divineLenormand(lines) {
  const idx=[];
  while (idx.length<3){ const i=rnd(LENORMAND.length); if(!idx.includes(i)) idx.push(i); }
  const pre=["第一张","第二张","第三张"], names=[];
  idx.forEach((v,k)=>{ names.push(LENORMAND[v][0]); lines.push([pre[k],LENORMAND[v][0],LENORMAND[v][1],""]); });
  return names.join("、")+"；";
}
function divineRunes(lines) {
  const idx=[], used=[];
  while (idx.length<3){ const i=rnd(RUNES.length); if(!used.includes(RUNES[i][2])){ idx.push(i); used.push(RUNES[i][2]); } }
  const pre=["第一枚","第二枚","第三枚"], names=[];
  idx.forEach((v,k)=>{ names.push(RUNES[v][0]); lines.push([pre[k],RUNES[v][0],RUNES[v][1],""]); });
  return names.join("、")+"；";
}

// ================= 灵签 =================
const QIAN_LABELS = ["圣意","谋望","家宅","婚姻","失物","官事","行人","占病","解曰"];
function divineQian(q) {
  const s = QIAN[rnd(QIAN.length)];
  const head = s[0]+"　"+s[1]+"　"+s[2];
  let sb = q+"："+head;
  QIAN_LABELS.forEach((lb,i)=>{ sb += "\n"+lb+"："+s[i+3]; });
  state.copyText = sb;
  addHistory();
  state.segs = [];
  appendQian(s);
  flushOut();
}
function appendQian(s) {
  segC(s[0]+"　"+s[1]+"　"+s[2]+"\n");
  QIAN_LABELS.forEach((lb,i)=>{
    seg(lb+"：",{bold:true});
    seg(s[i+3]);
    if (i<QIAN_LABELS.length-1) seg("\n");
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
  state.segs=[];
  seg(state.copyText+"\n\n―― 简要说明 ――\n");
  if (gen) {
    const specials = drawn.filter(i=>i>=SPECIAL_TAROT_START).map(i=>TAROT[i][0]);
    seg("特殊牌",{bold:true});
    seg("："+(specials.length?specials.join("、"):"无")+"\n");
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
  const qs = QIAN[rnd(QIAN.length)];
  const qianHead = qs[0]+"　"+qs[1]+"　"+qs[2];
  state.copyText = q+"："+tarot+len+runes+astro+liuyao; // 复制不含灵签
  addHistoryText(state.copyText+"\n"+qianHead);         // 历史仅追加灵签签头
  state.segs=[];
  seg(state.copyText+"\n");                             // 界面显示包含灵签全文
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
  let tarotResult=null;
  if (ace===null) tarotResult="一年内无";
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
  const p2=PLANETS[rnd(12)], s2=SIGNS[rnd(12)], h2=HOUSES[rnd(12)];
  state.copyText = q+"\n塔罗预测："+tarotResult+"\n\n占星预测：\n基础时长："+p2[2]+"\n计量单位："+s2[2]+"\n调整数字："+h2[2];
  addHistory();
  state.segs=[];
  seg(state.copyText+"\n\n―― 简要说明 ――\n");
  seg("塔罗抽牌顺序",{bold:true});
  seg("："+drawn.join("、")+"\n");
  seg("占星骰子",{bold:true});
  seg("："+cjk(p2[0])+"、"+cjk(s2[0])+"、"+h2[0]);
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
    if (Array.isArray(d) && d.length===7) state.histories = d.map(h=>h.slice(-30));
  } catch(e){}
}

// ================= UI =================
function $(id){ return document.getElementById(id); }

function goText(){
  switch(state.curModule){
    case 0: return "占 卜"; case 1: return "起 卦";
    case 5: return "掷骰子"; case 6: return "求 签";
    default: return "抽 牌";
  }
}

function renderTabs(){
  const bar=$('modbar'); bar.innerHTML='';
  MOD_TABS.forEach((t,i)=>{
    const b=document.createElement('button');
    b.className='tab'+(state.curModule===i?' sel':'');
    b.textContent=t; b.title=MODS[i];
    b.onclick=()=>{ saveState(); state.curModule=i; restoreState(); renderAll(); };
    bar.appendChild(b);
  });
  const sub=$('subbar'); sub.innerHTML=''; sub.style.display='none';
  if (state.curModule===2){
    sub.style.display='flex';
    TAROT_TABS.forEach((t,i)=>{
      const b=document.createElement('button');
      b.className='tab'+(state.curTab===i?' sel':'');
      b.textContent=t;
      b.onclick=()=>{ saveState(); state.curTab=i; restoreState(); renderAll(); };
      sub.appendChild(b);
    });
    const lb=document.createElement('label'); lb.className='chk';
    const c=document.createElement('input'); c.type='checkbox'; c.checked=state.includeSpecial;
    c.onchange=()=>{ state.includeSpecial=c.checked; resetTarotSessions(); };
    lb.appendChild(c); lb.appendChild(document.createTextNode('包含特殊牌'));
    sub.appendChild(lb);
  } else if (state.curModule===0){
    sub.style.display='flex';
    HOME_TABS.forEach((t,i)=>{
      const b=document.createElement('button');
      b.className='tab'+(state.curHomeTab===i?' sel':'');
      b.textContent=t;
      b.onclick=()=>{ saveState(); state.curHomeTab=i; restoreState(); renderAll(); };
      sub.appendChild(b);
    });
    if (state.curHomeTab===1){
      const w=document.createElement('span'); w.className='warn';
      w.textContent='未作校准，仅供参考，自行甄别';
      sub.appendChild(w);
    }
  }
  $('go').textContent=goText();
}

function renderAll(){ renderTabs(); }

function divine(){
  let q=$('q').value.trim();
  if (!q) q="（未填写问题）";
  if (state.curModule===0){ state.curHomeTab===0 ? divineHome(q) : divineDate(q); }
  else if (state.curModule===6) divineQian(q);
  else if (state.curModule===2) divineTarot(q);
  else {
    const lines=[];
    let result;
    if (state.curModule===1) result=divineLiuYao(lines);
    else if (state.curModule===3) result=divineLenormand(lines);
    else if (state.curModule===4) result=divineRunes(lines);
    else result=divineAstro(lines);
    state.copyText=q+"："+result;
    state.segs=[];
    addHistory();
    seg(state.copyText+"\n\n―― 简要说明 ――\n");
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
  state.segs=[]; setOutHtml('');
  state.drawnGen=[]; state.drawnMajor=[];
  state.sessGen=-1; state.sessMaj=-1;
  const p=pageIndex();
  state.pageHtml[p]=null; state.pageCopy[p]=null;
}

// 历史弹窗
function openHistory(){
  const mod=state.curModule;
  $('hist-title').textContent='历史记录 - '+MODS[mod]+'（最近30条）';
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
  loadHistories();
  renderAll();
  $('go').onclick=divine;
  $('q').addEventListener('keydown',e=>{ if(e.key==='Enter') divine(); });
  $('copy').onclick=()=>{ if(state.copyText) toClipboard(state.copyText); };
  $('clear').onclick=clearPage;
  $('histbtn').onclick=openHistory;
  $('helpbtn').onclick=()=>{ $('help-body').textContent=HELP_TEXT; $('help').style.display='flex'; };
  document.querySelectorAll('.modal-close').forEach(b=>{
    b.onclick=()=>{ b.closest('.modal').style.display='none'; };
  });
  document.querySelectorAll('.modal').forEach(m=>{
    m.addEventListener('click',e=>{ if(e.target===m) m.style.display='none'; });
  });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
});
