/* ============ Sound effects via Web Audio ============ */
(function () {
  var ctx = null;

  function ensure() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function enabled() {
    try { return window.Store.getSettings().sound; } catch (e) { return true; }
  }

  function tone(freq, start, dur, gain, type) {
    var c = ensure();
    if (!c) return;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    var t = c.currentTime + start;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.25, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  // short blip for each counted rep
  function count() {
    if (!enabled()) return;
    ensure();
    tone(880, 0, 0.09, 0.22, 'triangle');
  }

  // target reached / set complete
  function complete() {
    if (!enabled()) return;
    ensure();
    tone(660, 0, 0.12, 0.25, 'triangle');
    tone(880, 0.12, 0.18, 0.25, 'triangle');
  }

  // rest finished
  function restEnd() {
    if (!enabled()) return;
    ensure();
    tone(784, 0, 0.12, 0.25, 'triangle');
    tone(784, 0.16, 0.12, 0.25, 'triangle');
    tone(1046, 0.32, 0.22, 0.28, 'triangle');
  }

  // workout all done
  function finish() {
    if (!enabled()) return;
    ensure();
    tone(523, 0, 0.14, 0.25, 'triangle');
    tone(659, 0.14, 0.14, 0.25, 'triangle');
    tone(784, 0.28, 0.14, 0.25, 'triangle');
    tone(1046, 0.42, 0.28, 0.28, 'triangle');
  }

  function tick() {
    if (!enabled()) return;
    ensure();
    tone(500, 0, 0.05, 0.12, 'sine');
  }

  // call on first interaction to unlock audio on iOS
  function unlock() { ensure(); }

  window.SFX = {
    count: count, complete: complete, restEnd: restEnd,
    finish: finish, tick: tick, unlock: unlock
  };
})();
