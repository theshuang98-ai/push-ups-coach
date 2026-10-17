/* ============================================================
   Push Ups Coach — app logic
   ============================================================ */
(function () {
  var $app = document.getElementById('app');

  /* ---------------- Icons (stroke style) ---------------- */
  var PATHS = {
    back: '<path d="M15 18l-6-6 6-6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1H9V4z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    record: '<path d="M4 19V9m5 10V5m5 14v-7m5 7V8"/>',
    speaker: '<path d="M4 9v6h4l5 5V4L8 9H4z"/>',
    speakerOff: '<path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M22 9l-5 5M17 9l5 5"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    trash: '<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/>',
    home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
    skip: '<path d="M5 4l10 8-10 8V4zM19 4v16"/>',
    forward: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 2.6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 2.6h5l.3-2.6a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    meh: '<circle cx="12" cy="12" r="9"/><path d="M8 15h8M9 9h.01M15 9h.01"/>',
    frown: '<circle cx="12" cy="12" r="9"/><path d="M8 17s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'
  };
  function icon(name, s) {
    s = s || 24;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (PATHS[name] || '') + '</svg>';
  }

  /* push-up figure (yellow) for hero */
  var FIG = '<svg viewBox="0 0 200 140"><circle cx="46" cy="48" r="15" fill="#FFD200"/>' +
    '<g fill="none" stroke="#FFD200" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="60" y1="58" x2="150" y2="58"/><line x1="74" y1="60" x2="74" y2="112"/>' +
    '<line x1="148" y1="60" x2="172" y2="112"/><line x1="62" y1="113" x2="84" y2="113"/>' +
    '<line x1="158" y1="113" x2="182" y2="113"/></g></svg>';

  /* head-over-phone figure for modal */
  var HEADPHONE = '<svg viewBox="0 0 120 120"><g fill="none" stroke="#cfcfcf" stroke-width="3" stroke-linecap="round">' +
    '<path d="M30 20c-14 10-18 30-10 46 4 8 4 14 0 20l20 0c10 0 18-8 18-18 8-4 12-12 12-22 0-16-14-30-40-26z"/>' +
    '<rect x="38" y="92" width="50" height="14" rx="3" fill="#cfcfcf" stroke="none"/>' +
    '<path d="M30 86a16 16 0 0 1 8-4M44 86a16 16 0 0 1 8-4" stroke="#5aa9ff"/></g></svg>';

  /* ---------------- Helpers ---------------- */
  function $(s, r) { return (r || $app).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || $app).querySelectorAll(s)); }
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 1900);
  }
  function fmtDate(ts) {
    var d = new Date(ts);
    var now = new Date();
    var mm = d.getMonth() + 1, dd = d.getDate();
    var hh = String(d.getHours()).padStart(2, '0'), mi = String(d.getMinutes()).padStart(2, '0');
    var pref = (d.toDateString() === now.toDateString()) ? '今天' : mm + '/' + dd;
    return pref + ' ' + hh + ':' + mi;
  }

  /* ---------------- Timers ---------------- */
  var timers = [];
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function every(fn, ms) { var t = setInterval(fn, ms); timers.push(t); return t; }
  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    timers = [];
  }

  /* ---------------- Wake lock ---------------- */
  var wakeLock = null;
  function lockScreen() {
    var nav = navigator;
    if (nav.wakeLock && nav.wakeLock.request) {
      nav.wakeLock.request('screen').then(function (wl) { wakeLock = wl; }).catch(function () {});
    }
  }
  function releaseLock() {
    if (wakeLock) { try { wakeLock.release(); } catch (e) {} wakeLock = null; }
  }
  document.addEventListener('visibilitychange', function () {
    if (wakeLock && document.visibilityState === 'visible') lockScreen();
  });

  /* ---------------- Plan / progress ---------------- */
  function P() { return Store.getProgress(); }
  function todayPlan() { return PLAN[P().level][P().day]; }

  /* ---------------- Workout state ---------------- */
  var W = null;
  function newWorkout(mode) {
    var tp = mode === 'train' ? todayPlan() : null;
    W = {
      mode: mode,
      targetSets: tp ? tp.sets.slice() : null,
      setIndex: 0,
      doneSets: [],
      count: 0,
      startedAt: Date.now(),
      timeLeft: 120,
      canCount: true,
      setFinishing: false
    };
    return W;
  }

  /* ---------------- Router ---------------- */
  var view = 'home';
  function go(v) {
    clearTimers();
    releaseLock();
    view = v;
    render();
    window.scrollTo(0, 0);
  }
  function render() {
    var fn = VIEWS[view] || VIEWS.home;
    $app.innerHTML = '<div class="screen bg-dark">' + fn.template() + '</div>';
    if (fn.bind) fn.bind($app.firstElementChild);
  }

  /* global action delegation */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var act = el.getAttribute('data-action');
    ACTIONS[act] && ACTIONS[act](el, e);
  });

  /* ============================================================
     VIEWS
     ============================================================ */
  var VIEWS = {};

  /* ---------- HOME ---------- */
  VIEWS.home = {
    template: function () {
      var s = Store.getStats();
      var needTest = !P().testDone;
      return '' +
        '<div class="topbar"><button class="icon-btn" data-action="menu">' + icon('menu') + '</button>' +
        '<div class="spacer"></div><button class="icon-btn" data-action="goSettings">' + icon('gear') + '</button></div>' +
        '<div class="stat-strip">' +
        '<div class="stat-chip"><div class="v">' + s.best + '</div><div class="k">RECORD 最佳</div></div>' +
        '<div class="stat-chip"><div class="v">' + s.total + '</div><div class="k">TOTAL 累计</div></div>' +
        '<div class="stat-chip"><div class="v">' + s.average + '</div><div class="k">AVERAGE 平均</div></div>' +
        '</div>' +
        '<div class="hero">' +
        '<div class="hero-fig">' + FIG + '</div>' +
        '<div class="wordmark"><span class="w1">PUSH</span><span class="w2">UPS</span></div>' +
        '<div class="tagline">YOUR PERSONAL FITNESS TRAINER</div>' +
        (needTest ? '<div class="lead" style="text-align:center;margin-top:6px">先完成一次初始测试，<br>为你定制训练起点</div>' : '') +
        '</div>' +
        '<div class="stack">' +
        '<button class="btn btn-block" data-action="goTraining">' + icon('clipboard') + 'TRAINING</button>' +
        '<div class="btn-row">' +
        '<button class="btn" data-action="goPractice">' + icon('plus') + 'PRACTICE</button>' +
        '<button class="btn btn-ghost" data-action="goRecord">' + icon('record') + 'RECORD</button>' +
        '</div></div>';
    }
  };

  /* ---------- TRAINING DETAIL ---------- */
  VIEWS.training = {
    template: function () {
      var p = P(), tp = todayPlan();
      var dots = '';
      for (var i = 0; i < 6; i++) {
        dots += '<span class="dot' + (i === p.day ? ' active' : '') + '"></span>';
        if (i < 5) dots += '<span class="dot-line"></span>';
      }
      var sets = tp.sets.map(function (n) { return '<span class="n">' + n + '</span>'; }).join('');
      var pct = Math.round((p.day) / 6 * 100);
      return '' +
        '<div class="topbar"><button class="icon-btn" data-action="goHome">' + icon('back') + '</button>' +
        '<div class="title">LEVEL ' + (p.level + 1) + '</div><div class="spacer"></div></div>' +
        '<div class="scroll">' +
        '<div class="card"><div class="card-head">TRAINING</div><div class="card-body">' +
        '<div class="dots">' + dots + '</div>' +
        '<div class="card-label">Progress of current level</div>' +
        '<div class="progress"><i style="width:' + pct + '%"></i></div>' +
        '<div class="plan-row"><div><div class="muted-paper">Sets of push ups for today</div>' +
        '<div class="plan-sets">' + sets + '</div></div>' +
        '<div style="text-align:right"><div class="muted-paper">Total</div><div class="plan-total">' + tp.total + '</div></div>' +
        '</div></div></div></div>' +
        '<div class="stack mt"><button class="btn btn-block" data-action="startTrain">START</button>' +
        '<button class="btn btn-dark btn-block" data-action="goHome">EXIT</button></div>';
    }
  };

  /* ---------- COUNTER ---------- */
  VIEWS.counter = {
    template: function () {
      var head = '';
      if (W.mode === 'train') {
        var pips = W.targetSets.map(function (t, i) {
          var cls = 'setpip';
          if (i < W.setIndex) cls += ' done';
          else if (i === W.setIndex) cls += ' active';
          return '<span class="' + cls + '">' + t + '</span>';
        }).join('');
        head = '<div class="card-label" style="color:var(--muted)">Sets of Pushups For Today</div>' +
          '<div class="setpips">' + pips + '</div>';
      } else {
        head = '<div class="card-label" style="color:var(--muted)">' +
          (W.mode === 'test' ? 'TEST · 2 分钟力竭' : 'FREE PRACTICE · 自由练习') + '</div>' +
          '<div id="timer" style="font-size:26px;font-weight:900;color:var(--yellow)">2:00</div>';
      }
      var circleNum = W.mode === 'train' ? W.targetSets[W.setIndex] : 0;
      return '' +
        '<div style="text-align:center">' + head + '</div>' +
        '<div class="counter-wrap"><div class="circle" id="circle">' + circleNum + '</div>' +
        '<div class="circle-hint" id="hint">' +
        (W.mode === 'train' ? '鼻子/下巴触碰屏幕计数' : '触碰屏幕计数，完成后点 Complete') +
        '</div></div>' +
        '<div class="hazard"></div>' +
        '<div class="btn-row"><button class="icon-btn" data-action="toggleSound" id="soundBtn">' +
        icon(Store.getSettings().sound ? 'speaker' : 'speakerOff') + '</button>' +
        '<button class="btn" style="flex:1" data-action="completeSet">Complete</button></div>';
    },
    bind: function (root) {
      lockScreen();
      var canCount = true;
      function down(e) {
        if (e.target.closest('button')) return;
        e.preventDefault();
        if (!canCount) return;
        canCount = false;
        doCount();
      }
      function up() { canCount = true; }
      root.addEventListener('touchstart', down, { passive: false });
      root.addEventListener('touchend', up);
      root.addEventListener('touchcancel', up);
      root.addEventListener('mousedown', function (e) { if (!e.target.closest('button')) { canCount = false; doCount(); } });
      root.addEventListener('mouseup', up);

      if (W.mode === 'test') {
        W.timeLeft = 120;
        every(function () {
          W.timeLeft--;
          var m = Math.floor(W.timeLeft / 60), s = W.timeLeft % 60;
          var el = $('#timer');
          if (el) el.textContent = m + ':' + String(s).padStart(2, '0');
          if (W.timeLeft <= 3 && W.timeLeft > 0) SFX.tick();
          if (W.timeLeft <= 0) {
            toast('时间到！');
            finishSet(true);
          }
        }, 1000);
      }
    }
  };

  /* counter per-touch */
  function doCount() {
    W.count++;
    SFX.count();
    updateCircle();
    if (W.mode === 'train') {
      var target = W.targetSets[W.setIndex];
      if (W.count >= target && !W.setFinishing) {
        W.setFinishing = true;
        SFX.complete();
        var c = $('#circle'); if (c) c.classList.add('done');
        var h = $('#hint'); if (h) h.innerHTML = '<b>本组完成！</b>';
        later(function () { finishSet(false); }, 1100);
      }
    }
  }
  function updateCircle() {
    var c = $('#circle');
    if (!c) return;
    if (W.mode === 'train') {
      var target = W.targetSets[W.setIndex];
      c.textContent = Math.max(0, target - W.count);
    } else {
      c.textContent = W.count;
    }
  }

  /* ---------- CORRECTION ---------- */
  VIEWS.correct = {
    template: function () {
      var s = Store.getStats();
      W.correctValue = W.count < 1 ? 1 : W.count;
      var avg = s.average, cur = W.correctValue, rec = s.best;
      var max = Math.max(avg, cur, rec, 1);
      function bar(v) { return '<div class="bar-col"><div class="bar-val">' + v + '</div>' +
        '<div class="bar" style="height:' + Math.round(v / max * 120) + 'px"></div></div>'; }
      return '' +
        '<div class="topbar"><div class="title">Correction of counts</div><div class="spacer"></div></div>' +
        '<div class="correct-top"><button class="step-btn" data-action="decCount">−</button>' +
        '<div class="correct-count"><div class="num" id="cNum">' + W.correctValue + '</div>' +
        '<div class="lab">Count</div></div>' +
        '<button class="step-btn" data-action="incCount">+</button></div>' +
        '<div class="bars">' +
        '<div class="bar-col"><div class="bar" style="height:' + Math.round(avg / max * 120) + 'px"></div><div class="bar-lab">Average</div></div>' +
        '<div class="bar-col"><div class="bar" style="height:' + Math.round(cur / max * 120) + 'px"></div><div class="bar-lab">Current</div></div>' +
        '<div class="bar-col"><div class="bar" style="height:' + Math.round(rec / max * 120) + 'px"></div><div class="bar-lab">Record</div></div>' +
        '</div>' +
        '<div class="kcal-strip" id="kcal">' + Store.kcal(W.correctValue) + ' kCal</div>' +
        '<div class="stack"><button class="btn btn-block" data-action="recordSet">' + icon('check') + 'Record</button></div>';
    }
  };

  /* ---------- REST ---------- */
  VIEWS.rest = {
    template: function () {
      var next = W.targetSets[W.setIndex];
      var R = 2 * Math.PI * 120;
      return '' +
        '<div class="rest-wrap">' +
        '<div class="circle-hint">休息一下，下一组目标 <b>' + next + '</b> 个</div>' +
        '<div class="rest-ring"><svg viewBox="0 0 260 260">' +
        '<circle class="bg" cx="130" cy="130" r="120"/>' +
        '<circle class="fg" id="fg" cx="130" cy="130" r="120" stroke-dasharray="' + R + '" stroke-dashoffset="0"/>' +
        '</svg><div class="rest-time"><div class="t" id="rt">' + Store.getSettings().rest + '</div>' +
        '<div class="l">REST</div></div></div>' +
        '<button class="btn" style="width:60%" data-action="skipRest">' + icon('skip') + 'Skip</button>' +
        '</div>';
    },
    bind: function () {
      var total = Store.getSettings().rest, left = total;
      var R = 2 * Math.PI * 120;
      every(function () {
        left--;
        var el = $('#rt'); if (el) el.textContent = left;
        var fg = $('#fg'); if (fg) fg.setAttribute('stroke-dashoffset', String(R * (1 - left / total)));
        if (left <= 0) {
          SFX.restEnd();
          go('counter');
        }
      }, 1000);
    }
  };

  /* ---------- FEEDBACK (after train) ---------- */
  VIEWS.feedback = {
    template: function () {
      var total = W.doneSets.reduce(function (a, b) { return a + b; }, 0);
      return '' +
        '<div class="topbar"><div class="spacer"></div></div>' +
        '<div class="hero"><div class="hero-fig">' + FIG + '</div>' +
        '<div style="font-size:22px;font-weight:900">今日训练完成！</div>' +
        '<div class="circle-hint">完成 <b>' + total + '</b> 个 · ' + W.doneSets.length + ' 组</div></div>' +
        '<div class="card-label">这次训练感觉如何？</div>' +
        '<div class="feedback-grid">' +
        '<button class="feedback-btn easy" data-action="fbEasy">' + icon('smile') + '轻松 EASY</button>' +
        '<button class="feedback-btn med" data-action="fbMed">' + icon('meh') + '中等 MEDIUM</button>' +
        '<button class="feedback-btn hard" data-action="fbHard">' + icon('frown') + '困难 HARD</button>' +
        '</div>';
    }
  };

  /* ---------- DONE / RESULT ---------- */
  VIEWS.done = {
    template: function () {
      var d = VIEWS.done.data;
      return '' +
        '<div class="topbar"><div class="spacer"></div></div>' +
        '<div class="hero">' +
        '<div class="hero-fig">' + FIG + '</div>' +
        '<div style="font-size:24px;font-weight:900;color:var(--yellow)">' + d.title + '</div>' +
        '<div class="circle-hint" style="font-size:16px">' + d.body + '</div></div>' +
        '<div class="stack"><button class="btn btn-block" data-action="' + d.primaryAct + '">' + d.primaryLabel + '</button>' +
        '<button class="btn btn-dark btn-block" data-action="goHome">回主页</button></div>';
    }
  };

  /* ---------- RECORDS ---------- */
  VIEWS.records = {
    template: function () {
      var recs = Store.getRecords().slice().sort(function (a, b) { return b.ts - a.ts; });
      var list = recs.map(function (r) {
        var modeName = { train: '训练', practice: '练习', test: '测试' }[r.mode] || r.mode;
        return '<div class="rec-item"><div><div class="d">' + fmtDate(r.ts) + '</div>' +
          '<div class="m">' + modeName + ' · ' + (r.sets || []).join('/') + ' · ' + r.kcal + ' kCal</div></div>' +
          '<div class="t">' + r.total + '</div></div>';
      }).join('');
      return '' +
        '<div class="topbar"><button class="icon-btn" data-action="goHome">' + icon('back') + '</button>' +
        '<div class="title">RECORD 记录</div><div class="spacer"></div></div>' +
        '<div class="tabs"><div class="tab active" data-tab="list">LIST 列表</div>' +
        '<div class="tab" data-tab="chart">DIAGRAM 图表</div></div>' +
        '<div class="scroll" id="pane-list">' + (recs.length ? list : '<div class="empty">还没有记录，开始你的第一次训练吧</div>') + '</div>' +
        '<div class="scroll" id="pane-chart" style="display:none">' +
        '<div class="chart-box" id="chartBox"></div>' +
        '<div class="seg" style="margin-top:12px"><button class="on" data-range="daily">每日</button>' +
        '<button data-range="weekly">每周</button></div></div>';
    },
    bind: function () {
      $$('.tab').forEach(function (t) {
        t.addEventListener('click', function () {
          $$('.tab').forEach(function (x) { x.classList.remove('active'); });
          t.classList.add('active');
          var which = t.getAttribute('data-tab');
          $('#pane-list').style.display = which === 'list' ? 'block' : 'none';
          $('#pane-chart').style.display = which === 'chart' ? 'block' : 'none';
          if (which === 'chart') drawChart('daily');
        });
      });
      $$('[data-range]').forEach(function (b) {
        b.addEventListener('click', function () {
          $$('[data-range]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
          drawChart(b.getAttribute('data-range'));
        });
      });
    }
  };

  function aggregate(range) {
    var recs = Store.getRecords();
    var map = {};
    function keyOf(ts) {
      var d = new Date(ts);
      if (range === 'daily') return d.getMonth() + 1 + '/' + d.getDate();
      var onejan = new Date(d.getFull(), 0, 1);
      var wk = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
      return 'W' + wk;
    }
    recs.forEach(function (r) {
      var k = keyOf(r.ts);
      map[k] = (map[k] || 0) + r.total;
    });
    var entries = Object.keys(map).map(function (k) { return { k: k, v: map[k] }; });
    if (range === 'daily') entries = entries.slice(-14); else entries = entries.slice(-10);
    return entries;
  }

  function drawChart(range) {
    var data = aggregate(range);
    var box = $('#chartBox');
    if (!box) return;
    if (!data.length) { box.innerHTML = '<div class="empty">暂无数据</div>'; return; }
    var Wp = 320, Hp = 220, pad = 28, bw = (Wp - pad * 2) / data.length * 0.6;
    var max = Math.max.apply(null, data.map(function (d) { return d.v; }));
    var bars = data.map(function (d, i) {
      var x = pad + (Wp - pad * 2) / data.length * i + ((Wp - pad * 2) / data.length - bw) / 2;
      var h = d.v / max * (Hp - pad * 2);
      var y = Hp - pad - h;
      return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="3" fill="#FFD200"/>' +
        '<text x="' + (x + bw / 2) + '" y="' + (y - 4) + '" fill="#eee" font-size="10" text-anchor="middle">' + d.v + '</text>' +
        '<text x="' + (x + bw / 2) + '" y="' + (Hp - pad + 13) + '" fill="#999" font-size="9" text-anchor="middle">' + d.k + '</text>';
    }).join('');
    box.innerHTML = '<svg viewBox="0 0 ' + Wp + ' ' + Hp + '">' +
      '<line x1="' + pad + '" y1="' + (Hp - pad) + '" x2="' + (Wp - pad) + '" y2="' + (Hp - pad) + '" stroke="#444"/>' +
      bars + '</svg>';
  }

  /* ---------- SETTINGS ---------- */
  VIEWS.settings = {
    template: function () {
      var s = Store.getSettings();
      return '' +
        '<div class="topbar"><button class="icon-btn" data-action="goHome">' + icon('back') + '</button>' +
        '<div class="title">SETTINGS 设置</div><div class="spacer"></div></div>' +
        '<div class="scroll"><div class="field"><label>声音</label>' +
        '<div class="seg"><button class="' + (s.sound ? 'on' : '') + '" data-set="sound">开启</button>' +
        '<button class="' + (!s.sound ? 'on' : '') + '" data-set="nosound">关闭</button></div></div>' +
        '<div class="field"><label>组间休息（秒）</label>' +
        '<div class="seg"><button class="' + (s.rest === 45 ? 'on' : '') + '" data-rest="45">45</button>' +
        '<button class="' + (s.rest === 60 ? 'on' : '') + '" data-rest="60">60</button>' +
        '<button class="' + (s.rest === 90 ? 'on' : '') + '" data-rest="90">90</button></div></div>' +
        '<div class="field"><label>体重（kg，用于卡路里）</label><input type="number" id="weight" value="' + s.weight + '"></div>' +
        '<div class="field"><label>年龄</label><input type="number" id="age" value="' + s.age + '"></div>' +
        '<div class="lead">数据仅保存在本机，不会上传。</div>' +
        '<button class="btn btn-block" style="margin-top:14px" data-action="retest">重新测试定级</button>' +
        '<button class="btn btn-dark btn-block" style="margin-top:10px" data-action="resetAll">清空全部数据</button>' +
        '</div><div class="stack mt"><button class="btn btn-block" data-action="saveSettings">保存</button></div>';
    },
    bind: function () {
      $$('[data-set]').forEach(function (b) {
        b.addEventListener('click', function () {
          $$('[data-set]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
        });
      });
      $$('[data-rest]').forEach(function (b) {
        b.addEventListener('click', function () {
          $$('[data-rest]').forEach(function (x) { x.classList.remove('on'); });
          b.classList.add('on');
        });
      });
    }
  };

  /* ---------- MENU (simple nav) ---------- */
  VIEWS.menu = {
    template: function () {
      return '<div class="topbar"><button class="icon-btn" data-action="goHome">' + icon('back') + '</button></div>' +
        '<div class="stack" style="margin-top:20px">' +
        '<button class="btn btn-block" data-action="goTraining">' + icon('clipboard') + 'TRAINING 训练</button>' +
        '<button class="btn btn-block" data-action="goPractice">' + icon('plus') + 'PRACTICE 自由练习</button>' +
        '<button class="btn btn-block" data-action="goTest">' + icon('forward') + 'TEST 水平测试</button>' +
        '<button class="btn btn-ghost btn-block" data-action="goRecord">' + icon('record') + 'RECORD 记录统计</button>' +
        '<button class="btn btn-dark btn-block" data-action="goSettings">' + icon('gear') + 'SETTINGS 设置</button>' +
        '</div>';
    }
  };

  /* ---------- HOW TO (modal) ---------- */
  function showHowTo(onOk) {
    var mask = document.createElement('div');
    mask.className = 'modal-mask';
    mask.innerHTML = '<div class="modal"><div class="m-fig">' + HEADPHONE + '</div>' +
      '<p>把手机放在地上，<br>用<b style="color:var(--yellow)">鼻子或下巴触碰屏幕</b>任意位置即可计数。</p>' +
      '<div class="btn-row"><button class="btn btn-dark" id="mSkip">Skip</button>' +
      '<button class="btn" id="mOk">OK</button></div></div>';
    document.body.appendChild(mask);
    function close() { document.body.removeChild(mask); }
    mask.querySelector('#mSkip').addEventListener('click', function () { close(); onOk && onOk(); });
    mask.querySelector('#mOk').addEventListener('click', function () { close(); onOk && onOk(); });
  }

  /* ============================================================
     ACTIONS
     ============================================================ */
  var ACTIONS = {
    goHome: function () { go('home'); },
    menu: function () { go('menu'); },
    goSettings: function () { go('settings'); },
    goRecord: function () { go('records'); },

    goTraining: function () {
      if (!P().testDone) {
        showHowTo(function () {
          newWorkout('test');
          go('counter');
        });
      } else {
        go('training');
      }
    },
    goPractice: function () {
      showHowTo(function () {
        newWorkout('practice');
        go('counter');
      });
    },
    goTest: function () {
      showHowTo(function () {
        newWorkout('test');
        go('counter');
      });
    },

    startTrain: function () {
      showHowTo(function () {
        newWorkout('train');
        go('counter');
      });
    },

    toggleSound: function () {
      var s = Store.getSettings();
      Store.setSettings({ sound: !s.sound });
      render();
    },

    /* complete current set (manual) */
    completeSet: function () {
      if (W.setFinishing && W.mode === 'train') return;
      finishSet(false);
    },

    /* correction +/- */
    incCount: function () {
      W.correctValue++;
      $('#cNum').textContent = W.correctValue;
      $('#kcal').textContent = Store.kcal(W.correctValue) + ' kCal';
    },
    decCount: function () {
      if (W.correctValue > 1) {
        W.correctValue--;
        $('#cNum').textContent = W.correctValue;
        $('#kcal').textContent = Store.kcal(W.correctValue) + ' kCal';
      }
    },
    recordSet: function () {
      W.doneSets.push(W.correctValue);
      afterSetRecorded();
    },

    skipRest: function () { SFX.restEnd(); go('counter'); },

    /* feedback */
    fbEasy: function () { advanceProgress(true); },
    fbMed: function () { advanceProgress(true); },
    fbHard: function () { advanceProgress(false); },

    saveSettings: function () {
      var soundOn = $$('[data-set]').filter(function (b) { return b.classList.contains('on'); })[0];
      var sound = soundOn && soundOn.getAttribute('data-set') === 'sound';
      var restB = $$('[data-rest]').filter(function (b) { return b.classList.contains('on'); })[0];
      var rest = restB ? parseInt(restB.getAttribute('data-rest')) : 60;
      var weight = parseFloat($('#weight').value) || 70;
      var age = parseInt($('#age').value) || 25;
      Store.setSettings({ sound: sound, rest: rest, weight: weight, age: age });
      toast('已保存');
      later(function () { go('home'); }, 600);
    },
    retest: function () {
      Store.resetProgress();
      toast('已重置档位，请重新测试');
      later(function () { go('home'); }, 600);
    },
    resetAll: function () {
      if (confirm('确定清空全部训练数据和记录吗？此操作不可恢复。')) {
        Store.resetAll();
        toast('已清空');
        later(function () { go('home'); }, 600);
      }
    }
  };

  /* ---------- finish set flow ---------- */
  function finishSet(auto) {
    if (W.count < 1) {
      if (W.mode === 'train') {
        // nothing done; just go back
        go('training');
      } else {
        go('home');
      }
      return;
    }
    go('correct');
  }

  function afterSetRecorded() {
    if (W.mode === 'train') {
      W.setIndex++;
      if (W.setIndex >= W.targetSets.length) {
        completeTrainWorkout();
      } else {
        W.count = 0; W.setFinishing = false;
        go('rest');
      }
    } else {
      // practice or test
      var total = W.doneSets.reduce(function (a, b) { return a + b; }, 0);
      var kcal = Store.kcal(total);
      var dur = Math.round((Date.now() - W.startedAt) / 1000);
      Store.addRecord({
        mode: W.mode, sets: W.doneSets.slice(), total: total, kcal: kcal, durationSec: dur
      });
      if (W.mode === 'test') {
        var lv = mapLevel(total);
        Store.setProgress({ testDone: true, level: lv[0], day: lv[1] });
        VIEWS.done.data = {
          title: '测试完成：' + total + ' 个',
          body: '为你推荐从 Level ' + (lv[0] + 1) + ' 开始训练',
          primaryAct: 'goTraining', primaryLabel: '开始训练'
        };
        go('done');
      } else {
        var s = Store.getStats();
        VIEWS.done.data = {
          title: '完成 ' + total + ' 个',
          body: '累计 ' + s.total + ' · 最佳 ' + s.best,
          primaryAct: 'goPractice', primaryLabel: '再来一组'
        };
        go('done');
      }
    }
  }

  function completeTrainWorkout() {
    var total = W.doneSets.reduce(function (a, b) { return a + b; }, 0);
    var kcal = Store.kcal(total);
    var dur = Math.round((Date.now() - W.startedAt) / 1000);
    var p = P();
    Store.addRecord({
      mode: 'train', sets: W.doneSets.slice(), total: total, kcal: kcal,
      durationSec: dur, level: p.level, day: p.day
    });
    SFX.finish();
    go('feedback');
  }

  function advanceProgress(advance) {
    var p = P();
    if (advance) {
      var day = p.day + 1, level = p.level;
      if (day >= 6) { day = 0; level++; }
      if (level >= 6) {
        // completed all levels
        VIEWS.done.data = {
          title: '恭喜完成全部训练！',
          body: '你已具备连续完成 100+ 俯卧撑的能力',
          primaryAct: 'goRecord', primaryLabel: '查看我的记录'
        };
        go('done');
        return;
      }
      Store.setProgress({ level: level, day: day });
    }
    go('training');
  }

  // Map test result to a training day: the last day whose target single-set
  // max (m) is <= what you can do, so every set is achievable.
  function mapLevel(n) {
    var best = [0, 0];
    for (var l = 0; l < PLAN.length; l++) {
      for (var d = 0; d < PLAN[l].length; d++) {
        if (PLAN[l][d].m <= n) best = [l, d];
      }
    }
    return best;
  }

  /* ---------------- Init ---------------- */
  SFX.unlock();
  document.addEventListener('touchstart', function once() {
    SFX.unlock();
    document.removeEventListener('touchstart', once);
  });
  go('home');
})();
