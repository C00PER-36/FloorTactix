/*
  FloorTactix · Grundfunktionen für alle Seiten
  Menü, sanftes Einblenden, Hinweis-Toast, Beta-Formular, Hilfsfunktionen.
*/
(function () {
  document.documentElement.classList.remove("no-js");
  const FT = (window.FT = window.FT || {});
  const cfg = window.FT_CONFIG || {};
  const locale = cfg.locale || "de-CH";

  /* ---------- Hilfsfunktionen ---------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  FT.util = {
    esc,
    $: (sel, root) => (root || document).querySelector(sel),
    $$: (sel, root) => Array.from((root || document).querySelectorAll(sel)),
    num: (n) => Number(n).toLocaleString(locale),
    chf: (n) => (cfg.currency || "CHF") + " " + Math.round(n).toLocaleString(locale),
    date: (iso) => { const d = new Date(iso); return { d: d.getDate(), m: months[d.getMonth()], wd: days[d.getDay()], t: iso.length > 10 ? iso.slice(11, 16) : "" }; },
    dateText: (iso) => { const d = new Date(iso); return days[d.getDay()] + ", " + d.getDate() + ". " + months[d.getMonth()] + (iso.length > 10 ? ", " + iso.slice(11, 16) + " Uhr" : ""); },
    icon: (name, cls) => '<svg class="' + (cls || "") + '" aria-hidden="true"><use href="#i-' + name + '"></use></svg>',
    view: (name) => document.querySelector('[data-view="' + name + '"]'),
    fill: (name, html) => { const el = document.querySelector('[data-view="' + name + '"]'); if (el) el.innerHTML = html; return el; },
    posName: { TH: "Torhüter", VE: "Verteidiger", CE: "Center", FL: "Flügel" }
  };

  /* ---------- Menü (Seitenleiste) ---------- */
  function initMenu() {
    const btn = document.querySelector("[data-menu-open]");
    const drawer = document.getElementById("drawer");
    if (!btn || !drawer) return;
    const closeBtns = document.querySelectorAll("[data-menu-close]");
    const body = document.body;
    const open = () => {
      body.classList.add("menu-open");
      btn.setAttribute("aria-expanded", "true");
      drawer.removeAttribute("inert");
      const cur = drawer.querySelector('[aria-current="page"]') || drawer.querySelector("a,button");
      setTimeout(() => cur && cur.focus(), 60);
    };
    const close = (refocus) => {
      body.classList.remove("menu-open");
      btn.setAttribute("aria-expanded", "false");
      drawer.setAttribute("inert", "");
      if (refocus) btn.focus();
    };
    drawer.setAttribute("inert", "");
    btn.addEventListener("click", open);
    closeBtns.forEach((b) => b.addEventListener("click", () => close(true)));
    document.addEventListener("keydown", (e) => {
      if (!body.classList.contains("menu-open")) return;
      if (e.key === "Escape") close(true);
      if (e.key === "Tab") {
        const f = Array.from(drawer.querySelectorAll("a,button")).filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Sanftes Einblenden ---------- */
  FT.reveal = function (root) {
    const els = (root || document).querySelectorAll(".reveal:not(.is-in)");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach((el) => io.observe(el));
  };

  /* Werte-Balken füllen sich beim ersten Anzeigen */
  FT.animateBars = function (root) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      (root || document).querySelectorAll(".bar > i[data-w]").forEach((i) => { i.style.width = i.dataset.w + "%"; });
    }));
  };

  /* ---------- Hinweis-Toast ---------- */
  let toastTimer;
  FT.toast = function (msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-on"), 3200);
  };

  /* ---------- Beta-Formular ---------- */
  function initBetaForm() {
    const form = document.getElementById("beta-form");
    if (!form) return;
    const status = document.getElementById("beta-status");
    const show = (ok, msg) => { status.className = "form-status " + (ok ? "is-ok" : "is-error"); status.textContent = msg; };

    const params = new URLSearchParams(location.search);
    if (params.get("status") === "ok") show(true, "Danke! Deine Anmeldung ist angekommen. Wir melden uns per E-Mail, sobald die Beta startet.");
    if (params.get("status") === "error") show(false, "Das hat leider nicht geklappt. Bitte prüfe deine Angaben und versuche es nochmals.");
    if (params.get("status") === "wait") show(false, "Du hast gerade erst etwas geschickt. Bitte warte ein paar Minuten.");

    form.addEventListener("submit", async (e) => {
      if (!window.fetch) return;
      e.preventDefault();
      if (!form.reportValidity()) return;
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) { form.reset(); show(true, "Danke! Deine Anmeldung ist angekommen. Wir melden uns per E-Mail, sobald die Beta startet."); }
        else show(false, data.message || "Das hat leider nicht geklappt. Bitte versuche es später nochmals.");
      } catch (err) {
        show(false, "Das Formular funktioniert erst, wenn die Seite online auf einem Server mit PHP liegt.");
      } finally { btn.disabled = false; }
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    initMenu();
    initBetaForm();
    const page = document.body.dataset.page;
    const render = FT.views && FT.views[page];
    if (render) {
      try { await render(); }
      catch (err) { console.warn("FloorTactix: Daten konnten nicht geladen werden.", err); }
    }
    FT.reveal();
    FT.animateBars();
  });
})();
