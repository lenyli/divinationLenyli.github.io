(() => {
  const cup = document.getElementById('cup');
  const cupWrap = document.getElementById('cupWrap');
  const sticksBox = document.getElementById('sticks');
  const flyStick = document.getElementById('flyStick');
  const card = document.getElementById('card');
  const lotNo = document.getElementById('lotNo');
  const verse = document.getElementById('verse');
  const shakeBtn = document.getElementById('shakeBtn');
  const againBtn = document.getElementById('againBtn');
  const hint = document.getElementById('hint');

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
  // 1..99;full 为真时十位的"一"不省略(如 一百一十)
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

  let busy = false;

  function shake() {
    if (busy) return;
    busy = true;
    shakeBtn.disabled = true;
    hint.textContent = '摇签中……';
    vibrate([60, 60, 60, 60, 60, 60, 120]);

    cup.classList.add('shake');
    setTimeout(() => {
      cup.classList.remove('shake');
      flyStick.classList.add('fly');
      vibrate(80);
    }, 1600);

    setTimeout(() => {
      const lot = randomLot();
      lotNo.textContent = `第${cnNumber(lot.id)}签`;
      verse.innerHTML = '';
      lot.lines.forEach(line => {
        const sp = document.createElement('span');
        sp.textContent = line;
        verse.appendChild(sp);
      });

      cupWrap.classList.add('hidden');
      // 先无动画立正面朝背，再翻转
      card.classList.add('instant');
      card.classList.remove('show');
      card.style.opacity = '1';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        card.classList.remove('instant');
        card.classList.add('show');
      }));

      shakeBtn.style.display = 'none';
      againBtn.style.display = '';
      hint.textContent = '心诚则灵';
      busy = false;
    }, 2500);
  }

  function reset() {
    if (busy) return;
    card.classList.remove('show');
    card.style.opacity = '';
    flyStick.classList.remove('fly');
    cupWrap.classList.remove('hidden');
    againBtn.style.display = 'none';
    shakeBtn.style.display = '';
    shakeBtn.disabled = false;
    hint.textContent = '默念所问之事，点击摇签';
  }

  shakeBtn.addEventListener('click', shake);
  cup.addEventListener('click', shake);
  againBtn.addEventListener('click', reset);

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
        shakeBtn.style.display !== 'none') {
      lastTrig = now;
      shake();
    }
    lastMag = mag;
  }
  function enableMotion() {
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {
      // iOS 需要在用户手势中请求授权
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
  enableMotion();
})();
