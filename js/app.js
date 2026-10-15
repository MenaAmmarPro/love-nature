"use strict";

/*
 * love-nature — page logic.
 *
 * "Our Garden": six plots the two of you tend together. Plant a seed, water it
 * on different days, and it grows from seed to sprout to bud to bloom.
 * Everything is kept in localStorage on this device only.
 */

(function () {
  var STORE = "mena-garden";
  var PLOTS = 6;

  var SPECIES = [
    { name: "Snowdrop", petals: 5, hue: 275, verse: "first one through the cold" },
    { name: "Moonflower", petals: 6, hue: 300, verse: "opens only for the night" },
    { name: "Daisy", petals: 8, hue: 50, verse: "plain and endlessly kind" },
    { name: "White Rose", petals: 7, hue: 340, verse: "the old promise, kept" },
    { name: "Jasmine", petals: 5, hue: 62, verse: "small, and fills the whole evening" },
    { name: "Lily", petals: 6, hue: 42, verse: "quiet, and sure of itself" },
    { name: "Baby's Breath", petals: 5, hue: 320, verse: "the many little things" },
    { name: "Magnolia", petals: 6, hue: 330, verse: "blooms before it has leaves" },
    { name: "Cosmos", petals: 8, hue: 288, verse: "grows anywhere it's welcome" },
    { name: "Camellia", petals: 7, hue: 350, verse: "soft, in the middle of winter" }
  ];

  var STAGES = ["Seed", "Sprout", "Bud", "Bloom"];

  var state = { plots: [] };

  /* ---------------- helpers ---------------- */

  function pad2(n) { return String(n).padStart(2, "0"); }

  function dayISO(date) {
    var d = date || new Date();
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function hashStr(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rngFrom(seed) {
    var s = seed >>> 0;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function newSeed() {
    var sp = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    return {
      species: sp.name,
      petals: sp.petals,
      hue: sp.hue,
      verse: sp.verse,
      plantedAt: dayISO(),
      waters: [],
      bloomedAt: null
    };
  }

  function stageOf(plant) {
    return Math.min(plant.waters.length, 3);
  }

  /* ---------------- storage ---------------- */

  function load() {
    state.plots = new Array(PLOTS).fill(null);
    var raw = null;
    try { raw = localStorage.getItem(STORE); } catch (e) { return; }
    if (!raw) return;
    var s = null;
    try { s = JSON.parse(raw); } catch (e) { s = null; }
    if (s && Array.isArray(s.plots)) {
      for (var i = 0; i < PLOTS; i += 1) {
        var p = s.plots[i];
        if (p && typeof p === "object" && typeof p.species === "string") {
          state.plots[i] = {
            species: String(p.species).slice(0, 40),
            petals: isFinite(p.petals) ? Math.max(3, Math.min(12, Math.floor(p.petals))) : 6,
            hue: isFinite(p.hue) ? Math.floor(p.hue) : 300,
            verse: typeof p.verse === "string" ? p.verse : "just for us",
            plantedAt: typeof p.plantedAt === "string" ? p.plantedAt : dayISO(),
            waters: Array.isArray(p.waters) ? p.waters.slice(-3) : [],
            bloomedAt: typeof p.bloomedAt === "string" ? p.bloomedAt : null
          };
        }
      }
    }
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* ---------------- actions ---------------- */

  function note(message) {
    setText("garden-note", message);
  }

  function plantPlot(i) {
    if (state.plots[i]) return false;
    state.plots[i] = newSeed();
    save();
    render();
    note("A seed, just for us. Come back tomorrow to water it \u2665");
    return true;
  }

  function waterPlot(i) {
    var p = state.plots[i];
    if (!p || stageOf(p) >= 3) return false;
    var today = dayISO();
    if (p.waters.indexOf(today) >= 0) return false;
    p.waters.push(today);
    var stage = stageOf(p);
    if (stage >= 3) {
      p.bloomedAt = today;
      note("It bloomed \u2014 " + p.species + ", " + p.verse + " \u2665");
    } else {
      note("Watered. It's a " + STAGES[stage].toLowerCase() + " now \u2014 see you tomorrow \u2665");
    }
    save();
    render();
    return true;
  }

  function pullPlot(i) {
    if (!state.plots[i]) return false;
    state.plots[i] = null;
    save();
    render();
    note("A fresh patch of earth, whenever you're ready.");
    return true;
  }

  function plantAll() {
    var n = 0;
    for (var i = 0; i < PLOTS; i += 1) {
      if (!state.plots[i]) { state.plots[i] = newSeed(); n += 1; }
    }
    save();
    render();
    note(n ? ("Planted " + n + " seed" + (n === 1 ? "" : "s") + " \u2665") : "Every plot is already growing.");
  }

  function resetGarden() {
    state.plots = new Array(PLOTS).fill(null);
    save();
    render();
    note("A clean garden \u2014 ready to grow again.");
  }

  /* ---------------- drawing ---------------- */

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(value);
  }

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function buildFlower(plant) {
    var wrap = el("div", "plant");
    var stem = el("div", "stem");
    wrap.appendChild(stem);

    var left = el("div", "leaf is-left");
    var right = el("div", "leaf is-right");
    wrap.appendChild(left);
    wrap.appendChild(right);

    var flower = el("div", "flower");
    flower.style.setProperty("--petals", String(plant.petals));
    flower.style.setProperty("--hue", String(plant.hue));
    for (var i = 0; i < plant.petals; i += 1) {
      var petal = el("span", "petal");
      petal.style.setProperty("--i", String(i));
      flower.appendChild(petal);
    }
    flower.appendChild(el("div", "core"));
    wrap.appendChild(flower);
    return wrap;
  }

  function renderPlot(i, plant) {
    var plot = el("div", "plot");
    plot.setAttribute("data-index", String(i));

    if (!plant) {
      plot.className = "plot is-empty";
      var plantBtn = el("button", "plot-button is-primary plot-plant");
      plantBtn.type = "button";
      plantBtn.textContent = "Plant a seed \u271b";
      plantBtn.addEventListener("click", function () { plantPlot(i); });
      plot.appendChild(plantBtn);
      return plot;
    }

    var stage = stageOf(plant);
    plot.className = "plot stage-" + stage + (stage >= 3 ? " is-bloom" : "");

    var scene = el("div", "plot-scene");
    scene.appendChild(el("div", "plot-soil"));
    if (stage === 0) {
      scene.appendChild(el("div", "seed"));
    } else {
      scene.appendChild(buildFlower(plant));
    }
    plot.appendChild(scene);

    var info = el("div", "plot-info");
    info.appendChild(el("span", "plot-species")).textContent = plant.species;
    info.appendChild(el("span", "plot-stage")).textContent = STAGES[stage];
    if (stage >= 3) {
      info.appendChild(el("span", "plot-verse")).textContent = "\u201c" + plant.verse + "\u201d";
    }
    plot.appendChild(info);

    var actions = el("div", "plot-actions");
    if (stage < 3) {
      var w = el("button", "plot-button plot-water");
      w.type = "button";
      w.textContent = "Water \u271b";
      if (plant.waters.indexOf(dayISO()) >= 0) {
        w.disabled = true;
        w.textContent = "Watered today \u2713";
      } else {
        w.addEventListener("click", function () { waterPlot(i); });
      }
      actions.appendChild(w);
    }
    var pull = el("button", "plot-pull");
    pull.type = "button";
    pull.textContent = "Pull";
    pull.addEventListener("click", function () { pullPlot(i); });
    actions.appendChild(pull);
    plot.appendChild(actions);

    return plot;
  }

  function renderGarden() {
    var grid = document.getElementById("garden-grid");
    if (!grid) return;
    grid.textContent = "";
    for (var i = 0; i < PLOTS; i += 1) {
      grid.appendChild(renderPlot(i, state.plots[i]));
    }
  }

  function renderMeadow() {
    var meadow = document.getElementById("meadow");
    if (!meadow) return;
    meadow.textContent = "";
    var rand = rngFrom(hashStr("meadow-" + dayISO()));
    for (var i = 0; i < 26; i += 1) {
      var x = rand() * 100;
      var h = 26 + rand() * 34;
      var stem = el("div", "meadow-stem");
      stem.style.left = x.toFixed(1) + "%";
      stem.style.height = h.toFixed(0) + "px";
      meadow.appendChild(stem);

      var bloom = el("div", "meadow-bloom");
      var size = 5 + rand() * 6;
      bloom.style.left = x.toFixed(1) + "%";
      bloom.style.bottom = h.toFixed(0) + "px";
      bloom.style.width = size.toFixed(0) + "px";
      bloom.style.height = size.toFixed(0) + "px";
      meadow.appendChild(bloom);
    }
  }

  function render() {
    renderGarden();
    renderMeadow();
  }

  /* ---------------- events ---------------- */

  function wireDetails() {
    var replant = document.getElementById("replant-all");
    if (replant) replant.addEventListener("click", plantAll);

    var share = document.getElementById("share-button");
    if (share) share.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: document.title, url: url }).catch(function () {});
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { setText("save-note", "Link copied \u2665"); })
          .catch(function () { setText("save-note", url); });
        return;
      }
      setText("save-note", url);
    });

    var reset = document.getElementById("reset-garden");
    if (reset) reset.addEventListener("click", function () {
      resetGarden();
      setText("save-note", "A clean garden \u2014 ready to grow again.");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    load();
    render();
    wireDetails();

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function () {});
      });
    }
  });
})();
