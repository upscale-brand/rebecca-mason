(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  /* Palette switcher */
  var KEY = "verdant_palette";
  var themes = ["sage", "clay", "harbor", "plum", "night", "custom"];
  function applyTheme(t) {
    if (themes.indexOf(t) === -1) t = "sage";
    doc.setAttribute("data-theme", t);
    if (t !== "custom") doc.removeAttribute("style");
    document.querySelectorAll("[data-set-theme]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-set-theme") === t ? "true" : "false");
    });
  }
  applyTheme(doc.getAttribute("data-theme"));
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-theme]");
    if (!b) return;
    var t = b.getAttribute("data-set-theme");
    applyTheme(t);
    try { localStorage.setItem(KEY, t); } catch (err) {}
  });

  /* Header state */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("main-nav");
  function closeMenu() {
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    nav.classList.remove("open");
    document.body.style.overflow = "";
  }
  if (toggle && nav) {
    nav.querySelectorAll('a[href^="#"]').forEach(function (link) { link.addEventListener("click", closeMenu); });
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      if (open) { closeMenu(); return; }
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      nav.classList.add("open");
      document.body.style.overflow = "hidden";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 960) closeMenu(); });
  }

  /* Scroll reveal */
  var items = document.querySelectorAll("[data-reveal], .line-draw");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }
  /* Stagger children */
  document.querySelectorAll("[data-stagger]").forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) {
      c.setAttribute("data-reveal", c.getAttribute("data-reveal") || "");
      c.style.setProperty("--d", (i * 0.07).toFixed(2) + "s");
      if (io) io.observe(c); else c.classList.add("in");
    });
  });

  /* Plate explorer tabs */
  var tabs = document.querySelectorAll('[role="tab"]');
  tabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () { select(tab); });
    tab.addEventListener("keydown", function (e) {
      var list = Array.prototype.slice.call(tab.parentNode.querySelectorAll('[role="tab"]'));
      var i = list.indexOf(tab), n = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") n = list[(i + 1) % list.length];
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = list[(i - 1 + list.length) % list.length];
      if (n) { e.preventDefault(); n.focus(); select(n); }
    });
  });
  function select(tab) {
    var diagram = document.querySelector(".plate-diagram");
    if (diagram) diagram.dataset.active = tab.id.replace(/^tab-/, "");
    var list = tab.parentNode.querySelectorAll('[role="tab"]');
    list.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (p) { p.hidden = !on; p.classList.toggle("is-in", on); }
    });
  }

  /* Resource filter */
  var filters = document.querySelectorAll("[data-filter]");
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      var key = f.getAttribute("data-filter");
      filters.forEach(function (o) { o.setAttribute("aria-pressed", o === f ? "true" : "false"); });
      var shown = 0;
      document.querySelectorAll("[data-category]").forEach(function (c) {
        var on = key === "all" || c.getAttribute("data-category") === key;
        c.classList.toggle("is-hidden", !on);
        if (on) shown++;
      });
      var live = document.getElementById("filter-status");
      if (live) live.textContent = shown + " guides shown";
    });
  });

  /* Forms (client-side validation; connect to your form handler) */
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, first = null;
      form.querySelectorAll("[required]").forEach(function (el) {
        var err = document.getElementById(el.id + "-error");
        var valid = el.checkValidity() && el.value.trim() !== "";
        el.setAttribute("aria-invalid", valid ? "false" : "true");
        if (err) err.textContent = valid ? "" : (el.type === "email" && el.value ? "Please enter a valid email address." : "This field is required.");
        if (!valid && !first) first = el;
        ok = ok && valid;
      });
      var status = form.querySelector(".form-status");
      if (!ok) { if (first) first.focus(); return; }
      if (status) {
        status.hidden = false;
        status.textContent = form.getAttribute("data-success") || "Thank you. Your message has been received.";
        status.focus();
      }
      form.reset();
    });
  });

  var yr = document.querySelectorAll("[data-year]");
  yr.forEach(function (y) { y.textContent = new Date().getFullYear(); });
  var marquee = document.querySelector(".practice-marquee");
  if (marquee) {
    var motionButton = marquee.querySelector(".marquee-toggle");
    var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      marquee.classList.add("is-paused");
      motionButton.setAttribute("aria-pressed", "true");
      motionButton.textContent = "Start motion";
    }
    motionButton.addEventListener("click", function () {
      var paused = !marquee.classList.contains("is-paused");
      marquee.classList.toggle("is-paused", paused);
      if (!paused) marquee.classList.add("motion-enabled");
      motionButton.setAttribute("aria-pressed", paused ? "true" : "false");
      motionButton.textContent = paused ? "Resume motion" : "Pause motion";
    });
  }})();

/* Custom color palette */
(function () {
  "use strict";
  var root = document.documentElement;
  var defaults = { bg: "#FAFAF7", ink: "#000000", accent: "#97798E" };
  var storageKey = "verdant_custom_colors";
  function readSaved() {
    try { return JSON.parse(localStorage.getItem(storageKey) || "null"); } catch (e) { return null; }
  }
  function validHex(value, fallback) { return /^#[0-9a-f]{6}$/i.test(value || "") ? value : fallback; }
  function applyColors(colors, save) {
    colors = { bg: validHex(colors.bg, defaults.bg), ink: validHex(colors.ink, defaults.ink), accent: validHex(colors.accent, defaults.accent) };
    var style = root.style;
    style.setProperty("--bg", colors.bg);
    style.setProperty("--surface", "color-mix(in srgb, " + colors.bg + " 94%, white)");
    style.setProperty("--surface-2", "color-mix(in srgb, " + colors.bg + " 84%, " + colors.ink + ")");
    style.setProperty("--ink", colors.ink);
    style.setProperty("--ink-soft", "color-mix(in srgb, " + colors.ink + " 76%, " + colors.bg + ")");
    style.setProperty("--line", "color-mix(in srgb, " + colors.ink + " 24%, " + colors.bg + ")");
    style.setProperty("--brand", colors.accent);
    style.setProperty("--brand-ink", colors.bg);
    style.setProperty("--accent", colors.accent);
    style.setProperty("--accent-soft", "color-mix(in srgb, " + colors.accent + " 24%, " + colors.bg + ")");
    style.setProperty("--band", colors.ink);
    style.setProperty("--band-ink", colors.bg);
    root.setAttribute("data-theme", "custom");
    style.setProperty("color-scheme", "light");
    document.querySelectorAll("[data-set-theme]").forEach(function (button) { button.setAttribute("aria-pressed", "false"); });
    document.querySelectorAll("[data-custom-color]").forEach(function (input) { if (colors[input.getAttribute("data-custom-color")]) input.value = colors[input.getAttribute("data-custom-color")]; });
    if (save) {
      try { localStorage.setItem(storageKey, JSON.stringify(colors)); localStorage.setItem("verdant_palette", "custom"); } catch (e) {}
    }
    return colors;
  }
  var chosen = null;
  try { chosen = localStorage.getItem("verdant_palette"); } catch (e) {}
  if (chosen === "custom") applyColors(readSaved() || defaults, false);
  document.addEventListener("click", function (event) {
    var toggle = event.target.closest(".palette-custom-toggle");
    if (toggle) {
      var palette = toggle.closest(".palette");
      var panel = palette.querySelector(".palette-custom-controls");
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
      if (open) {
        var current = root.getAttribute("data-theme") === "custom" ? readSaved() : defaults;
        palette.querySelectorAll("[data-custom-color]").forEach(function (input) { input.value = validHex(current && current[input.dataset.customColor], defaults[input.dataset.customColor]); });
      }
      return;
    }
    var apply = event.target.closest("[data-apply-custom-palette]");
    if (apply) {
      var palette = apply.closest(".palette");
      var colors = {};
      palette.querySelectorAll("[data-custom-color]").forEach(function (input) { colors[input.dataset.customColor] = input.value; });
      applyColors(colors, true);
      document.querySelectorAll(".palette-custom-controls").forEach(function (panel) { panel.hidden = true; });
      document.querySelectorAll(".palette-custom-toggle").forEach(function (button) { button.setAttribute("aria-expanded", "false"); });
      var status = palette.querySelector(".palette-custom-status");
      if (status) status.textContent = "Your custom palette is saved on this device.";
      return;
    }
    if (event.target.closest("[data-reset-custom-palette], [data-reset-default-palette]")) {
      try { localStorage.removeItem(storageKey); localStorage.setItem("verdant_palette", "sage"); } catch (e) {}
      root.removeAttribute("style");
      root.setAttribute("data-theme", "sage");
      document.querySelectorAll("[data-set-theme]").forEach(function (button) { button.setAttribute("aria-pressed", button.dataset.setTheme === "sage" ? "true" : "false"); });
      document.querySelectorAll(".palette-custom-controls").forEach(function (panel) { panel.hidden = true; });
      document.querySelectorAll(".palette-custom-toggle").forEach(function (button) { button.setAttribute("aria-expanded", "false"); });
      return;
    }
    if (event.target.closest("[data-set-theme]")) {
      document.querySelectorAll(".palette-custom-controls").forEach(function (panel) { panel.hidden = true; });
      document.querySelectorAll(".palette-custom-toggle").forEach(function (button) { button.setAttribute("aria-expanded", "false"); });
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      document.querySelectorAll(".palette-custom-controls").forEach(function (panel) { panel.hidden = true; });
      document.querySelectorAll(".palette-custom-toggle").forEach(function (button) { button.setAttribute("aria-expanded", "false"); });
    }
  });
})();



