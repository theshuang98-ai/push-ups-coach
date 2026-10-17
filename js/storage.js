/* ============ Local storage ============ */
(function () {
  var KEY = 'pushups_data_v1';

  var DEFAULT = {
    settings: { sound: true, rest: 60, weight: 70, age: 25 },
    progress: { testDone: false, level: 0, day: 0 },
    records: []
  };

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT));
      var d = JSON.parse(raw);
      // merge defaults to be resilient
      d.settings = Object.assign({}, DEFAULT.settings, d.settings || {});
      d.progress = Object.assign({}, DEFAULT.progress, d.progress || {});
      d.records = Array.isArray(d.records) ? d.records : [];
      return d;
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT));
    }
  }

  var data = load();

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  function getSettings() { return data.settings; }
  function setSettings(patch) {
    data.settings = Object.assign(data.settings, patch);
    persist();
  }
  function getProgress() { return data.progress; }
  function setProgress(patch) {
    data.progress = Object.assign(data.progress, patch);
    persist();
  }
  function getRecords() { return data.records; }

  function addRecord(rec) {
    rec.id = Date.now() + '' + Math.floor(Math.random() * 1000);
    rec.ts = Date.now();
    data.records.push(rec);
    persist();
    return rec;
  }

  function deleteRecord(id) {
    data.records = data.records.filter(function (r) { return r.id !== id; });
    persist();
  }

  // stats
  function getStats() {
    var recs = data.records;
    var total = 0, best = 0, sum = 0;
    recs.forEach(function (r) {
      total += r.total;
      sum += r.total;
      // best single set, or whole total for non-split (test/practice)
      var top = 0;
      if (r.sets && r.sets.length) {
        r.sets.forEach(function (s) { if (s > top) top = s; });
      } else { top = r.total; }
      if (top > best) best = top;
    });
    var avg = recs.length ? Math.round(sum / recs.length) : 0;
    return { total: total, best: best, average: avg, sessions: recs.length };
  }

  function resetAll() {
    data = JSON.parse(JSON.stringify(DEFAULT));
    persist();
  }

  // calories: ~0.5 kcal per push-up (weight-adjusted)
  function kcal(count) {
    var w = data.settings.weight || 70;
    var per = 0.007 * w; // 70kg -> 0.49
    return Math.round(count * per * 100) / 100;
  }

  window.Store = {
    getSettings: getSettings,
    setSettings: setSettings,
    getProgress: getProgress,
    setProgress: setProgress,
    getRecords: getRecords,
    addRecord: addRecord,
    deleteRecord: deleteRecord,
    getStats: getStats,
    resetAll: resetAll,
    kcal: kcal
  };
})();
