/* Scriptlab360 front end. Plain JavaScript, no libraries, no build step.
   Each block runs only on the page that has the markup it needs, so the
   same file is loaded everywhere. Replace the mock bits with calls to Django. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Landing: the typing hero ---------- */
  var heroLine = $("[data-hero-line]");
  if (heroLine) {
    var DEMOS = [
      { lang: "ml", native: "മലയാളം", cue: "GAURI", words: [["nee", "നീ"], ["evide", "എവിടെ"], ["aayirunnu?", "ആയിരുന്നു?"]] },
      { lang: "ta", native: "தமிழ்", cue: "MEENA", words: [["nee", "நீ"], ["engae", "எங்கே"], ["irundhaai?", "இருந்தாய்?"]] },
      { lang: "hi", native: "हिन्दी", cue: "ANJALI", words: [["tum", "तुम"], ["kahaan", "कहाँ"], ["the?", "थे?"]] },
      { lang: "te", native: "తెలుగు", cue: "SITA", words: [["nuvvu", "నువ్వు"], ["ekkada", "ఎక్కడ"], ["unnaavu?", "ఉన్నావు?"]] },
      { lang: "kn", native: "ಕನ್ನಡ", cue: "KAVYA", words: [["neenu", "ನೀನು"], ["elli", "ಎಲ್ಲಿ"], ["iddhe?", "ಇದ್ದೆ?"]] },
      { lang: "bn", native: "বাংলা", cue: "RIYA", words: [["tumi", "তুমি"], ["kothay", "কোথায়"], ["chhile?", "ছিলে?"]] }
    ];
    var KEY_MS = 90, COMMIT_MS = 320, HOLD_MS = 2600;
    var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var step = { demo: 0, word: 0, chars: 0 }, pinned = false, timer = null;
    var cue = $("[data-hero-cue]"), latinEl = $("[data-hero-latin]"), figure = $("[data-hero-figure]");
    var buttons = $$("[data-demo]");

    var esc = function (s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
    var render = function () {
      var demo = DEMOS[step.demo];
      var word = reduced ? demo.words.length : step.word, chars = reduced ? 0 : step.chars;
      var html = "";
      demo.words.forEach(function (w, i) {
        if (i < word) html += '<span class="hero-word">' + esc(w[1]) + "</span>";
        else if (i === word && chars > 0) html += '<span class="hero-typing">' + esc(w[0].slice(0, chars)) + '<span class="hero-caret"></span></span>';
      });
      if (word === 0 && chars === 0) html += '<span class="hero-caret"></span>';
      var full = demo.words.map(function (w) { return w[0]; }).join(" ");
      var typed = demo.words.map(function (w, i) { return i < word ? w[0] : i === word ? w[0].slice(0, chars) : ""; }).join(" ").replace(/\s+$/, "");
      heroLine.innerHTML = html;
      heroLine.setAttribute("lang", demo.lang);
      cue.textContent = demo.cue;
      latinEl.innerHTML = '<span class="text-ink">' + esc(typed) + '</span><span class="text-line-2">' + esc(full.slice(typed.length)) + "</span>";
      figure.setAttribute("aria-label", "Typing “" + full + "” in English letters writes “" + demo.words.map(function (w) { return w[1]; }).join(" ") + "” in " + demo.native + ".");
      buttons.forEach(function (b, i) { b.setAttribute("aria-pressed", String(i === step.demo)); });
    };
    var tick = function () {
      var words = DEMOS[step.demo].words, delay;
      if (step.word >= words.length) {
        if (pinned) return;
        step = { demo: (step.demo + 1) % DEMOS.length, word: 0, chars: 0 }; delay = HOLD_MS;
      } else if (step.chars < words[step.word][0].length) {
        delay = step.chars === 0 && step.word === 0 ? 500 : KEY_MS;
        step = { demo: step.demo, word: step.word, chars: step.chars + 1 };
      } else {
        step = { demo: step.demo, word: step.word + 1, chars: 0 }; delay = COMMIT_MS;
      }
      timer = setTimeout(function () { render(); tick(); }, delay);
    };
    buttons.forEach(function (b, i) {
      b.addEventListener("click", function () {
        pinned = true; clearTimeout(timer);
        step = { demo: i, word: 0, chars: 0 }; render(); if (!reduced) tick();
      });
    });
    render(); if (!reduced) tick();
  }

  /* ---------- Landing: notes and the lines they point at ---------- */
  $$("[data-note]").forEach(function (el) {
    var id = el.getAttribute("data-note");
    var set = function (on) {
      $$('[data-note="' + id + '"]').forEach(function (n) {
        if (n.tagName === "MARK") { if (on) n.setAttribute("data-active", ""); else n.removeAttribute("data-active"); }
        else n.setAttribute("aria-pressed", String(on));
      });
    };
    ["mouseenter", "focus"].forEach(function (e) { el.addEventListener(e, function () { set(true); }); });
    ["mouseleave", "blur"].forEach(function (e) { el.addEventListener(e, function () { set(false); }); });
    if (el.tagName === "BUTTON") el.addEventListener("click", function () { set(el.getAttribute("aria-pressed") !== "true"); });
  });

  /* ---------- Scripts dashboard ---------- */
  var grid = $("[data-script-grid]");
  if (grid) {
    var empty = $("[data-empty]");
    var sync = function () {
      var none = $$("li", grid).length === 0;
      grid.hidden = none; empty.hidden = !none;
    };
    if (/[?&]empty\b/.test(location.search)) $$("li", grid).forEach(function (li) { li.remove(); });
    sync();
    grid.addEventListener("click", function (e) {
      var del = e.target.closest("[data-delete]");
      if (!del) return;
      var li = del.closest("li");
      if (confirm("Delete “" + li.getAttribute("data-title") + "” and all its drafts from this device? This can’t be undone.")) { li.remove(); sync(); }
    });
    var file = $("[data-upload]");
    $("[data-upload-btn]").addEventListener("click", function () { file.click(); });
    file.addEventListener("change", function () { if (file.files[0]) location.href = "editor.html?analyze=1"; });
  }

  /* ---------- Editor ---------- */
  var paper = $("#paper");
  if (paper) {
    /* Side panels: one open at a time. */
    var toggles = $$("[data-panel-toggle]"), panels = $$("[data-panel]");
    var open = function (name) {
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== name; });
      toggles.forEach(function (t) { t.setAttribute("aria-pressed", String(t.getAttribute("data-panel-toggle") === name)); });
    };
    toggles.forEach(function (t) {
      t.addEventListener("click", function () {
        var name = t.getAttribute("data-panel-toggle");
        open(t.getAttribute("aria-pressed") === "true" ? "" : name);
      });
    });
    $$("[data-panel-close]").forEach(function (b) { b.addEventListener("click", function () { open(""); }); });
    if (/[?&]analyze=1/.test(location.search)) open("report");

    /* Tab groups inside panels (story steps, voice modes). */
    $$("[data-tabs]").forEach(function (group) {
      var btns = $$("[data-tab]", group), root = group.closest("aside");
      btns.forEach(function (b) {
        b.addEventListener("click", function () {
          btns.forEach(function (x) { x.setAttribute("aria-current", x === b ? "page" : "false"); });
          $$("[data-tab-body]", root).forEach(function (body) {
            if (body.getAttribute("data-tabs-for") === group.getAttribute("data-tabs")) body.hidden = body.getAttribute("data-tab-body") !== b.getAttribute("data-tab");
          });
        });
      });
    });
    $$("[data-reveal]").forEach(function (b) {
      b.addEventListener("click", function () { var t = $(b.getAttribute("data-reveal")); t.hidden = !t.hidden; });
    });

    /* Scene list. */
    var nav = $("#scene-nav"), showBtn = $("#scene-show");
    $$("[data-goto]", nav).forEach(function (b) {
      b.addEventListener("click", function () {
        var t = $("#" + b.getAttribute("data-goto")); t.scrollIntoView({ block: "center", behavior: "smooth" }); t.focus();
      });
    });
    $("#scene-hide").addEventListener("click", function () { nav.hidden = true; showBtn.hidden = false; });
    showBtn.addEventListener("click", function () { nav.hidden = false; showBtn.hidden = true; });

    /* Screenplay blocks. Tab changes the element, Enter moves on. This is a
       stand-in for the real editor: swap it for whatever you build on Django. */
    var KINDS = ["sceneHeading", "action", "character", "dialogue", "parenthetical", "transition", "song"];
    var HINT = { sceneHeading: "INT. PLACE - DAY", action: "What we see and hear", character: "NAME", dialogue: "What they say", parenthetical: "(how)", transition: "CUT TO:", song: "The song, and what it does" };
    var NEXT = { sceneHeading: "action", action: "action", character: "dialogue", dialogue: "character", parenthetical: "dialogue", transition: "sceneHeading", song: "action" };
    var kindSel = $("#element-select"), current = null;
    var setKind = function (el, kind) {
      el.setAttribute("data-kind", kind); el.setAttribute("data-placeholder", HINT[kind]);
      if (kindSel) kindSel.value = kind;
    };
    var words = $("#stat-words");
    var count = function () {
      var n = (paper.innerText.match(/\S+/g) || []).length;
      if (words) words.textContent = n.toLocaleString() + " words";
    };
    var refresh = function (el) { el.classList.toggle("is-empty", !el.textContent.trim()); };
    var make = function (kind) {
      var p = document.createElement("p");
      p.className = "sp-block is-empty"; p.contentEditable = "plaintext-only"; setKind(p, kind); return p;
    };
    paper.addEventListener("focusin", function (e) {
      var b = e.target.closest(".sp-block"); if (!b) return;
      if (current) current.classList.remove("is-current");
      current = b; b.classList.add("is-current"); if (kindSel) kindSel.value = b.getAttribute("data-kind");
    });
    paper.addEventListener("input", function (e) { refresh(e.target); count(); });
    paper.addEventListener("keydown", function (e) {
      var b = e.target.closest(".sp-block"); if (!b) return;
      var kind = b.getAttribute("data-kind");
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        var n = make(NEXT[kind]); b.after(n); n.focus();
      } else if (e.key === "Tab") {
        e.preventDefault();
        var i = KINDS.indexOf(kind); setKind(b, KINDS[(i + (e.shiftKey ? KINDS.length - 1 : 1)) % KINDS.length]);
      } else if (e.key === "Backspace" && !b.textContent && b.previousElementSibling) {
        e.preventDefault();
        var prev = b.previousElementSibling; b.remove(); prev.focus();
        var r = document.createRange(); r.selectNodeContents(prev); r.collapse(false);
        var s = getSelection(); s.removeAllRanges(); s.addRange(r);
      }
    });
    if (kindSel) kindSel.addEventListener("change", function () { if (current) { setKind(current, kindSel.value); current.focus(); } });
    $$(".sp-block", paper).forEach(refresh);
    count();

    /* Save draft: adds a row to the drafts panel. */
    var saveBtn = $("[data-save-draft]"), list = $("#draft-list");
    if (saveBtn) saveBtn.addEventListener("click", function () {
      var li = document.createElement("li");
      li.className = "rounded border border-line p-3";
      li.innerHTML = '<div class="flex items-baseline justify-between gap-2"><span class="font-medium">Draft ' + (list.children.length + 1) +
        '</span><button class="text-xs text-accent hover:underline">Restore</button></div><div class="text-xs text-dim">' + new Date().toLocaleString() + "</div>";
      list.prepend(li);
    });
  }

  /* ---------- Report: print with every row open ---------- */
  var print = $("[data-print]");
  if (print) print.addEventListener("click", function () {
    $$("main details").forEach(function (d) { d.open = true; });
    window.print();
  });
})();
