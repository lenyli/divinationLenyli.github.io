(() => {
  const cup = document.getElementById('cup');
  const cupWrap = document.getElementById('cupWrap');
  const shakeLotus = document.getElementById('shakeLotus');
  const sticksBox = document.getElementById('sticks');
  const flyStick = document.getElementById('flyStick');
  const card = document.getElementById('card');
  const lotNo = document.getElementById('lotNo');
  const verse = document.getElementById('verse');
  const shakeBtn = document.getElementById('shakeBtn');
  const againBtn = document.getElementById('againBtn');
  const roundReset = document.getElementById('roundReset');
  const mobileRoundReset = document.getElementById('mobileRoundReset');
  const mobileShowSign = document.getElementById('mobileShowSign');
  const mobileShowTranslation = document.getElementById('mobileShowTranslation');
  const copyCurrentResultBtn = document.getElementById('copyCurrentResult');
  const oracleLayout = document.getElementById('oracleLayout');
  const lotRecordsPanel = document.getElementById('lotRecordsPanel');
  const translationPanel = document.getElementById('translationPanel');
  const roundCount = document.getElementById('roundCount');
  const lotRecords = document.getElementById('lotRecords');
  const lotRecordsEmpty = document.getElementById('lotRecordsEmpty');
  const translationRecords = document.getElementById('translationRecords');
  const translationRecordsEmpty = document.getElementById('translationRecordsEmpty');
  const invocation = document.getElementById('invocation');
  const hint = document.getElementById('hint');
  const scrollResult = document.getElementById('scrollResult');
  const scrollLotNo = document.getElementById('scrollLotNo');
  const scrollVerse = document.getElementById('scrollVerse');
  const TIP_COLORS = ['#2459a6', '#e4bd2b', '#b33137', '#f4efe2', '#df7626'];
  const bgLotusLayer = document.getElementById('bgLotusLayer');

  // 将莲花纹动画对齐到背景图中的莲花圆章（背景为 center/cover 铺放）
  const BG_MEDALLION = {
    landscape: { w: 1672, h: 941, cx: 838.5, cy: 448, diam: 409 },
    portrait:  { w: 941, h: 1672, cx: 467.5, cy: 859, diam: 344 }
  };
  function positionShakeLotus() {
    const vw = bgLotusLayer.clientWidth;
    const vh = bgLotusLayer.clientHeight;
    if (!vw || !vh) return;
    const m = window.matchMedia('(orientation:portrait)').matches
      ? BG_MEDALLION.portrait : BG_MEDALLION.landscape;
    const scale = Math.max(vw / m.w, vh / m.h);
    const x = vw / 2 + (m.cx - m.w / 2) * scale;
    const y = vh / 2 + (m.cy - m.h / 2) * scale;
    const size = m.diam * scale * 1.04;
    shakeLotus.style.left = `${x}px`;
    shakeLotus.style.top = `${y}px`;
    shakeLotus.style.width = `${size}px`;
  }
  window.addEventListener('resize', positionShakeLotus);
  window.addEventListener('orientationchange', positionShakeLotus);
  positionShakeLotus();

  // 筒内签支（装饰）
  const N = 11;
  for (let i = 0; i < N; i++) {
    const s = document.createElement('div');
    s.className = 'stick';
    const angle = (i - (N - 1) / 2) * 5.5;
    const dx = (i - (N - 1) / 2) * 9.5;
    s.style.transform = `translateX(${dx - 4.5}px) rotate(${angle}deg)`;
    s.style.animationDelay = `${(i % 4) * 55}ms`;
    sticksBox.appendChild(s);
  }

  const CN_NUM = ['', '一','二','三','四','五','六','七','八','九'];
  function cnTens(n, full) {
    if (n < 10) return CN_NUM[n];
    const t = Math.floor(n / 10), o = n % 10;
    const s = (t === 1 && !full) ? '十' : CN_NUM[t] + '十';
    return o ? s + CN_NUM[o] : s;
  }
  function cnNumber(n) {
    if (n < 100) return cnTens(n, false);
    const h = Math.floor(n / 100), r = n % 100;
    const s = CN_NUM[h] + '百';
    if (!r) return s;
    return s + (r < 10 ? '零' + CN_NUM[r] : cnTens(r, true));
  }

  function randomLot() {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return LOTS[buf[0] % LOTS.length];
  }

  function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  function appendTextRecord(container, lot, lines) {
    const entry = document.createElement('article');
    entry.className = 'record-entry';
    lines.forEach((text, index) => {
      const p = document.createElement('p');
      if (index === 0) {
        const label = document.createElement('strong');
        label.textContent = `【第${cnNumber(lot.id)}签】`;
        p.appendChild(label);
      }
      p.appendChild(document.createTextNode(text));
      entry.appendChild(p);
    });
    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;
  }

  function appendRecords(lot) {
    lotRecordsPanel.hidden = false;
    translationPanel.hidden = false;
    oracleLayout.classList.remove('empty-round');
    lotRecordsEmpty.hidden = true;
    translationRecordsEmpty.hidden = true;
    appendTextRecord(lotRecords, lot, [
      lot.lines.slice(0, 4).join('，'),
      lot.lines.slice(4).join('，')
    ]);
    appendTextRecord(translationRecords, lot, [lot.translation]);
    if (isMobileLayout()) fadeMobileResult();
  }

  let busy = false;
  let drawCount = 0;
  let invocationSeen = false;

  function isMobileLayout() {
    return window.matchMedia('(max-width:600px)').matches;
  }

  function setMobileResultView(view) {
    const showingTranslation = view === 'translation';
    oracleLayout.dataset.mobileView = showingTranslation ? 'translation' : 'sign';
    mobileShowSign.setAttribute('aria-pressed', String(!showingTranslation));
    mobileShowTranslation.setAttribute('aria-pressed', String(showingTranslation));
    fadeMobileResult();
  }

  function fadeMobileResult() {
    if (!isMobileLayout()) return;
    const panel = oracleLayout.dataset.mobileView === 'translation' ? translationPanel : lotRecordsPanel;
    if (panel.hidden) return;
    panel.classList.remove('mobile-result-fade');
    void panel.offsetWidth;
    panel.classList.add('mobile-result-fade');
    setTimeout(() => panel.classList.remove('mobile-result-fade'), 320);
  }

  async function copyCurrentResult() {
    const source = oracleLayout.dataset.mobileView === 'translation' ? translationRecords : lotRecords;
    const text = Array.from(source.querySelectorAll('.record-entry'))
      .map(entry => entry.innerText.trim())
      .filter(Boolean)
      .join('\n\n');
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    const original = copyCurrentResultBtn.textContent;
    copyCurrentResultBtn.textContent = '已复制';
    setTimeout(() => { copyCurrentResultBtn.textContent = original; }, 1200);
  }

  function openScrollResult(lot) {
    const title = `第${cnNumber(lot.id)}签`;
    scrollLotNo.textContent = title;
    scrollVerse.innerHTML = '';
    lot.lines.forEach(line => {
      const span = document.createElement('span');
      span.textContent = line;
      scrollVerse.appendChild(span);
    });
    scrollResult.classList.add('open');
  }

  function closeScrollResult() {
    if (!scrollResult.classList.contains('open')) return;
    scrollResult.classList.remove('open');
    if (drawCount < 7) prepareNextDraw();
  }

  function updateRoundStatus() {
    roundCount.textContent = `已探 ${drawCount} / 7 策`;
    roundReset.disabled = drawCount < 3 || busy;
    mobileRoundReset.disabled = roundReset.disabled;
  }

  function requestShake() {
    if (busy || drawCount >= 7) return;
    if (!invocationSeen) {
      invocation.classList.add('open');
      return;
    }
    shake();
  }

  function shake() {
    busy = true;
    shakeBtn.disabled = true;
    updateRoundStatus();
    hint.textContent = '摇签中……';
    vibrate([60, 60, 60, 60, 60, 60, 120]);

    shakeLotus.classList.remove('pulse');
    void shakeLotus.offsetWidth;
    shakeLotus.classList.add('pulse');
    cup.classList.add('shake');
    setTimeout(() => {
      cup.classList.remove('shake');
      shakeLotus.classList.remove('pulse');
      flyStick.classList.add('fly');
      vibrate(80);
    }, 1600);

    setTimeout(() => {
      const lot = randomLot();
      flyStick.style.setProperty('--tip-color', TIP_COLORS[(lot.id - 1) % TIP_COLORS.length]);
      lotNo.textContent = `第${cnNumber(lot.id)}签`;
      verse.innerHTML = '';
      lot.lines.forEach(line => {
        const sp = document.createElement('span');
        sp.textContent = line;
        verse.appendChild(sp);
      });

      drawCount += 1;
      appendRecords(lot);
      card.classList.remove('show');
      card.style.opacity = '';
      cupWrap.classList.add('hidden');
      openScrollResult(lot);

      shakeBtn.style.display = 'none';
      if (drawCount < 7) {
        againBtn.style.display = '';
        againBtn.textContent = drawCount < 3 ? `继续探策（尚需${3 - drawCount}策）` : '继续探策';
        hint.textContent = drawCount < 3 ? '本轮至少探取三策' : '已满三策，可继续探取或刷新问题';
      } else {
        againBtn.style.display = 'none';
        hint.textContent = '本轮已满七策，请刷新开始新问题';
      }
      busy = false;
      updateRoundStatus();
    }, 2500);
  }

  function prepareNextDraw() {
    if (busy || drawCount >= 7) return;
    scrollResult.classList.remove('open');
    card.classList.remove('show');
    card.style.opacity = '';
    flyStick.classList.remove('fly');
    cupWrap.classList.remove('hidden');
    againBtn.style.display = 'none';
    shakeBtn.style.display = '';
    shakeBtn.disabled = false;
    hint.textContent = `本轮已探${drawCount}策，点击继续摇签`;
  }

  function resetRound() {
    if (busy || drawCount < 3) return;
    drawCount = 0;
    invocationSeen = false;
    lotRecords.querySelectorAll('.record-entry').forEach(entry => entry.remove());
    translationRecords.querySelectorAll('.record-entry').forEach(entry => entry.remove());
    lotRecordsEmpty.hidden = false;
    translationRecordsEmpty.hidden = false;
    lotRecordsPanel.hidden = true;
    translationPanel.hidden = true;
    oracleLayout.classList.add('empty-round');
    setMobileResultView('sign');
    prepareNextDraw();
    hint.textContent = '新问题开始，点击摇签先诵灌顶颂';
    updateRoundStatus();
  }

  shakeBtn.addEventListener('click', requestShake);
  cup.addEventListener('click', requestShake);
  againBtn.addEventListener('click', prepareNextDraw);
  roundReset.addEventListener('click', resetRound);
  mobileRoundReset.addEventListener('click', resetRound);
  mobileShowSign.addEventListener('click', () => setMobileResultView('sign'));
  mobileShowTranslation.addEventListener('click', () => setMobileResultView('translation'));
  copyCurrentResultBtn.addEventListener('click', copyCurrentResult);
  invocation.addEventListener('click', () => {
    invocation.classList.remove('open');
    invocationSeen = true;
    hint.textContent = '灌顶颂已诵，点击摇签';
  });
  scrollResult.addEventListener('click', closeScrollResult);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeScrollResult();
  });

  // 经文缘起弹层
  const preface = document.getElementById('preface');
  document.getElementById('prefaceBtn').addEventListener('click', e => {
    e.stopPropagation();
    preface.classList.add('open');
  });
  document.getElementById('prefaceClose').addEventListener('click', () => preface.classList.remove('open'));
  preface.addEventListener('click', e => { if (e.target === preface) preface.classList.remove('open'); });

  // 摇晃手机触发（可用时）
  let lastMag = 0, lastTrig = 0;
  function onMotion(e) {
    const a = e.accelerationIncludingGravity;
    if (!a) return;
    const mag = Math.abs(a.x || 0) + Math.abs(a.y || 0) + Math.abs(a.z || 0);
    const now = Date.now();
    if (Math.abs(mag - lastMag) > 22 && now - lastTrig > 3000 && !busy &&
        shakeBtn.style.display !== 'none' && drawCount < 7) {
      lastTrig = now;
      requestShake();
    }
    lastMag = mag;
  }
  function enableMotion() {
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {
      const ask = () => {
        DeviceMotionEvent.requestPermission()
          .then(state => { if (state === 'granted') window.addEventListener('devicemotion', onMotion); })
          .catch(() => {});
        document.body.removeEventListener('click', ask);
      };
      document.body.addEventListener('click', ask, { once: true });
    } else if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', onMotion);
    }
  }

  updateRoundStatus();
  enableMotion();
})();
