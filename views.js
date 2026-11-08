/*
  FloorTactix · Seitenansichten
  Für jede Seite (body data-page="...") eine Funktion, die Daten über FT.api
  holt und in die vorbereiteten Bereiche (data-view="...") schreibt.
*/
(function () {
  const FT = (window.FT = window.FT || {});
  const api = FT.api;
  const U = FT.util;
  const { esc, chf, icon, fill, view } = U;

  /* ---------- gemeinsame Bausteine ---------- */
  let teamMap = {};
  async function loadTeams() {
    const teams = await api.getTeams();
    teamMap = {};
    teams.forEach((t) => { teamMap[t.id] = t; });
    return teams;
  }
  const team = (id) => teamMap[id] || { name: id, short: "?" };
  const ownId = () => Object.values(teamMap).find((t) => t.own)?.id;

  function crest(t, cls) {
    const own = t.own;
    const bg = own ? "var(--teal)" : (t.short.charCodeAt(0) % 2 ? "var(--white)" : "var(--muted)");
    return '<span class="crest ' + (cls || "") + '" style="background:' + bg + '" aria-hidden="true">' + esc(t.short) + "</span>";
  }
  const ovr = (p) => { const v = Object.values(p.attrs); return Math.round(v.reduce((a, b) => a + b, 0) / v.length); };
  const fullName = (p) => p.first + " " + p.last;
  const formIcon = (f) => f > 1 ? '<span class="trend-up" title="Top-Form">▲▲</span>' : f > 0 ? '<span class="trend-up" title="Gute Form">▲</span>' : f < 0 ? '<span class="trend-down" title="Formtief">▼</span>' : '<span class="muted" title="Normale Form">●</span>';
  const bar = (label, val, max, cls) => '<div><div class="bar__top"><span>' + esc(label) + "</span><b>" + esc(val) + '</b></div><div class="bar ' + (cls || "") + '"><i data-w="' + Math.round((parseFloat(val) / (max || 100)) * 100) + '"></i></div></div>';
  const resultLetter = (r, own) => {
    const ownHome = r.home === own; const gf = ownHome ? r.hs : r.as; const ga = ownHome ? r.as : r.hs;
    if (gf > ga) return r.ot ? { k: "f-o", t: "S", title: "Sieg nach Verlängerung" } : { k: "f-w", t: "S", title: "Sieg" };
    return r.ot ? { k: "f-o", t: "N", title: "Niederlage nach Verlängerung" } : { k: "f-l", t: "N", title: "Niederlage" };
  };
  const ownScoreFirst = (r, own) => r.home === own ? r.hs + ":" + r.as : r.as + ":" + r.hs;

  /* ---------- Spielfeld (SVG) ---------- */
  // Masse: 40 x 20 m, 10 Einheiten pro Meter. Eigenes Team spielt nach rechts.
  function rinkSVG(dots, label) {
    // Torraum 4 x 5 m, Torhüterraum 1 x 2,5 m, Tor 1,6 m breit (Torlinie bei 3,5 m)
    const goalArea = (flip) => {
      const m = (x, w) => flip ? 400 - x - w : x;
      return '<rect class="mark" x="' + m(30.5, 40) + '" y="75" width="40" height="50"/>' +
        '<rect class="mark" x="' + m(37, 10) + '" y="87.5" width="10" height="25"/>' +
        '<rect class="goal" x="' + m(30.5, 6.5) + '" y="92" width="6.5" height="16" rx="1"/>';
    };
    let s = '<svg class="rink" viewBox="0 0 400 200" role="img" aria-label="' + esc(label) + '">';
    s += '<rect class="floor" x="2" y="2" width="396" height="196" rx="16"/>';
    s += '<line class="mark" x1="200" y1="2" x2="200" y2="198"/><circle class="mark" cx="200" cy="100" r="3"/>';
    s += goalArea(false) + goalArea(true);
    [[35, 15], [35, 185], [365, 15], [365, 185], [200, 15], [200, 185]].forEach((p) => { s += '<circle class="mark" cx="' + p[0] + '" cy="' + p[1] + '" r="1.5"/>'; });
    dots.forEach((d) => {
      const cls = d.gk ? "dot dot-gk" : d.away ? "dot dot-away" : "dot dot-home";
      s += '<g class="' + cls + '" style="transform:translate(' + d.x + "px," + d.y + 'px)"><circle r="12"/><text>' + esc(d.label) + "</text>" +
        (d.name ? '<text class="name" y="27">' + esc(d.name) + "</text>" : "") + "</g>";
    });
    return s + "</svg>";
  }

  const UNIT_POS = {
    line: { VE: [[118, 58], [118, 142]], CE: [[200, 100]], FL: [[280, 42], [280, 158]] },
    pp: { VE: [[222, 62], [222, 138]], CE: [[268, 100]], FL: [[322, 44], [322, 156]] },
    bp: { VE: [[86, 76], [86, 124]], FL: [[140, 64], [140, 136]] }
  };
  function unitDots(unit, kind, byId, gkId) {
    const pos = UNIT_POS[kind]; const dots = [];
    const gk = byId[gkId];
    if (gk) dots.push({ x: 48, y: 100, gk: true, label: gk.nr, name: gk.last });
    ["VE", "CE", "FL"].forEach((role) => {
      if (!pos[role] || !unit[role]) return;
      const ids = Array.isArray(unit[role]) ? unit[role] : [unit[role]];
      ids.forEach((id, i) => { const p = byId[id]; if (p && pos[role][i]) dots.push({ x: pos[role][i][0], y: pos[role][i][1], label: p.nr, name: p.last }); });
    });
    return dots;
  }

  function tabsHTML(items, sel, group) {
    return '<div class="tabs" role="tablist" aria-label="' + esc(group) + '">' + items.map((it, i) =>
      '<button class="tab" role="tab" type="button" data-i="' + i + '" aria-selected="' + (i === sel) + '">' + esc(it) + "</button>").join("") + "</div>";
  }
  function bindTabs(root, onSel) {
    root.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => {
      root.querySelectorAll(".tab").forEach((x) => x.setAttribute("aria-selected", "false"));
      b.setAttribute("aria-selected", "true");
      onSel(+b.dataset.i);
    }));
  }

  /* ============ Seiten ============ */
  const views = {};

  /* ---------- Home / Dashboard ---------- */
  views.home = async function () {
    await loadTeams();
    const [fixtures, standings, fin, news, results] = await Promise.all([api.getFixtures(), api.getStandings(), api.getFinances(), api.getNews(), api.getResults()]);
    const own = ownId();
    const n = fixtures[0];
    const h = team(n.home), a = team(n.away);
    fill("next-match",
      '<div class="scoreboard" style="margin:6px 0 18px"><div class="team">' + crest(h) + "<span>" + esc(h.name) + '</span></div><div><div class="result" style="font-size:2rem">vs.</div></div><div class="team">' + crest(a) + "<span>" + esc(a.name) + "</span></div></div>" +
      '<p class="muted" style="margin:0;text-align:center">' + esc(U.dateText(n.date)) + "<br>" + esc(n.venue) + " · " + esc(n.comp) + "</p>");

    const sorted = standings.slice().sort((x, y) => y.pts - x.pts);
    const rows = sorted.slice(0, 5).map((r, i) => '<tr class="' + (r.team === own ? "is-own" : "") + '"><td class="rank">' + (i + 1) + '</td><td><div class="team-cell">' + crest(team(r.team)) + "<span>" + esc(team(r.team).name) + '</span></div></td><td class="r"><b>' + r.pts + "</b></td></tr>").join("");
    fill("mini-table", '<div class="table-wrap"><table class="data"><thead><tr><th>#</th><th>Team</th><th class="r">Pkt</th></tr></thead><tbody>' + rows + "</tbody></table></div>");

    const form = results.slice(0, 5).map((r) => { const l = resultLetter(r, own); return '<span class="' + l.k + '" title="' + l.title + '">' + l.t + "</span>"; }).join("");
    fill("balance", '<div class="big-num">' + esc(chf(fin.balance)) + '</div><div class="kpi-label"><span class="trend-up">+ ' + esc(chf(fin.change)) + "</span> seit letzter Woche</div>" +
      '<div style="margin-top:20px"><div class="kpi-label" style="margin:0 0 8px">Form der letzten 5 Spiele</div><div class="form-strip">' + form + "</div></div>");

    fill("latest-news", '<ul class="list">' + news.slice(0, 3).map((x) => '<li><div class="grow"><span class="badge badge--teal">' + esc(x.tag) + '</span><h3 style="margin-top:6px">' + esc(x.title) + '</h3><div class="meta">' + esc(U.dateText(x.date)) + "</div></div></li>").join("") + "</ul>");
  };

  /* ---------- Spielplan ---------- */
  views.spielplan = async function () {
    await loadTeams();
    const [fixtures, results] = await Promise.all([api.getFixtures(), api.getResults()]);
    const own = ownId();
    fill("fixtures", '<ul class="list">' + fixtures.map((f) => {
      const d = U.date(f.date); const home = f.home === own; const opp = team(home ? f.away : f.home);
      return '<li><div class="date-chip"><b>' + d.d + "</b><span>" + d.m + '</span></div><div class="grow"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><b>' + (home ? "vs. " : "@ ") + esc(opp.name) + '</b><span class="badge ' + (f.comp === "Liga" ? "badge--outline" : "badge--teal") + '">' + esc(f.comp) + '</span></div><div class="meta">' + d.wd + ", " + d.t + " Uhr · " + esc(f.venue) + '</div></div><span class="badge badge--outline hide-sm">' + (home ? "Heim" : "Auswärts") + "</span></li>";
    }).join("") + "</ul>");
    fill("results", '<ul class="list">' + results.map((r) => {
      const home = r.home === own; const opp = team(home ? r.away : r.home); const l = resultLetter(r, own); const d = U.date(r.date);
      return '<li><div class="form-strip"><span class="' + l.k + '" title="' + l.title + '">' + l.t + '</span></div><div class="grow"><b>' + (home ? "vs. " : "@ ") + esc(opp.name) + '</b><div class="meta">Runde ' + r.round + " · " + d.d + ". " + d.m + (r.ot ? " · n.V." : "") + '</div></div><span class="score">' + ownScoreFirst(r, own) + "</span></li>";
    }).join("") + "</ul>");
    const all = results.slice().reverse();
    let w = 0, l = 0, o = 0;
    const strip = all.map((r) => { const x = resultLetter(r, own); if (x.k === "f-w") w++; else if (x.k === "f-l") l++; else o++; return '<span class="' + x.k + '" title="Runde ' + r.round + ": " + x.title + '">' + x.t + "</span>"; }).join("");
    fill("form", '<div class="form-strip" style="margin-bottom:16px">' + strip + '</div><div class="grid grid--3 grid--kpi"><div><div class="big-num">' + w + '</div><div class="kpi-label">Siege</div></div><div><div class="big-num">' + o + '</div><div class="kpi-label">nach Verlängerung</div></div><div><div class="big-num">' + l + '</div><div class="kpi-label">Niederlagen</div></div></div><p class="muted" style="margin:16px 0 0;font-size:.88rem">Von links (älteste Runde) nach rechts (neueste). Heller Rahmen bedeutet Entscheidung nach Verlängerung.</p>');
  };

  /* ---------- Live ---------- */
  views.live = async function () {
    await loadTeams();
    const m = await api.getLiveMatch();
    const h = team(m.home), a = team(m.away);
    const board = view("scoreboard");
    board.innerHTML = '<div class="scoreboard"><div class="team">' + crest(h) + "<span>" + esc(h.name) + '</span></div><div><div class="result" data-score>0:0</div><div class="clock"><span class="live-dot"></span><span data-clock>1. Drittel · 00\'</span></div></div><div class="team">' + crest(a) + "<span>" + esc(a.name) + '</span></div></div><p class="muted" style="text-align:center;margin:16px 0 0;font-size:.9rem">' + esc(m.venue) + " · " + U.num(m.spectators) + ' Zuschauer</p><div style="text-align:center;margin-top:14px"><button class="btn btn--ghost btn--small" type="button" data-restart>' + icon("refresh") + " Spiel neu starten</button></div>";
    const tick = view("ticker");
    const statsEl = view("match-stats");
    const evIcon = { goal: "ball", save: "shield", penalty: "clock", period: "flag", start: "flag", end: "flag" };
    let timer, idx, st;

    function drawStats() {
      const rows = [["Schüsse", st.shots], ["Ballbesitz %", st.possession], ["Paraden", st.saves], ["Strafminuten", st.penalties]];
      statsEl.innerHTML = rows.map((r) => {
        const tot = (r[1][0] + r[1][1]) || 1;
        return '<div class="vs-row"><span class="lbl">' + r[0] + '</span><b>' + r[1][0] + '</b><div class="vs-bar"><i style="width:' + (r[1][0] / tot * 100) + '%"></i><i style="width:' + (r[1][1] / tot * 100) + '%"></i></div><b style="text-align:right">' + r[1][1] + "</b></div>";
      }).join("") + '<div class="legend"><span><i style="background:var(--teal)"></i>' + esc(h.short) + '</span><span><i style="background:var(--muted)"></i>' + esc(a.short) + "</span></div>";
    }
    function step() {
      const e = m.events[idx];
      if (!e) return;
      const side = e.side === "home" ? 0 : 1;
      if (e.type === "goal") { st.score[side]++; st.shots[side] += 1; }
      if (e.type === "save") { st.shots[side === 0 ? 1 : 0] += 2; st.saves[side]++; st.shots[side] += 1; }
      if (e.type === "penalty") st.penalties[side] += 2;
      st.shots[0] += Math.round(Math.random() * 2); st.shots[1] += Math.round(Math.random() * 2);
      const p0 = Math.max(38, Math.min(62, st.possession[0] + Math.round((Math.random() - .45) * 6)));
      st.possession = [p0, 100 - p0];
      board.querySelector("[data-score]").textContent = st.score[0] + ":" + st.score[1];
      const per = e.min <= 20 ? "1. Drittel" : e.min <= 40 ? "2. Drittel" : "3. Drittel";
      board.querySelector("[data-clock]").textContent = e.type === "end" ? "Schluss" : per + " · " + String(e.min).padStart(2, "0") + "'";
      const li = document.createElement("li");
      li.className = e.type === "goal" ? "is-goal" : "";
      li.innerHTML = '<span class="min">' + e.min + '\'</span><span class="ev">' + icon(evIcon[e.type] || "flag") + "</span><span>" + (e.type === "goal" ? "<b>Tor!</b> " : "") + esc(e.text) + "</span>";
      tick.prepend(li);
      drawStats();
      idx++;
      if (e.type === "end") { board.classList.add("is-ended"); clearInterval(timer); }
    }
    function start() {
      clearInterval(timer);
      idx = 0; st = { score: [0, 0], shots: [0, 0], possession: [50, 50], penalties: [0, 0], saves: [0, 0] };
      tick.innerHTML = ""; board.classList.remove("is-ended");
      board.querySelector("[data-score]").textContent = "0:0";
      drawStats(); step();
      timer = setInterval(step, 2600);
    }
    board.querySelector("[data-restart]").addEventListener("click", start);
    start();
  };

  /* ---------- Mannschaft ---------- */
  views.mannschaft = async function () {
    const [squad, lu] = await Promise.all([api.getSquad(), api.getLineup()]);
    const byId = {}; squad.forEach((p) => { byId[p.id] = p; });
    const units = [].concat(
      lu.lines.map((u) => ({ u, kind: "line", title: u.name, note: "Einsatzzeit " + u.share + " %" })),
      lu.powerplay.map((u) => ({ u, kind: "pp", title: u.name, note: "5 gegen 4 in Überzahl" })),
      lu.boxplay.map((u) => ({ u, kind: "bp", title: u.name, note: "4 gegen 5 in Unterzahl" }))
    );
    const root = view("lineup");
    root.innerHTML = tabsHTML(units.map((x) => x.title.replace("Powerplay ", "PP ").replace("Boxplay ", "BP ")), 0, "Formation wählen") + '<div data-rink></div><div data-unit-list style="margin-top:16px"></div>';
    const draw = (i) => {
      const x = units[i];
      root.querySelector("[data-rink]").innerHTML = rinkSVG(unitDots(x.u, x.kind, byId, lu.goalies.start), x.title + " auf dem Spielfeld");
      const ids = [].concat(x.u.VE || [], x.u.CE || [], x.u.FL || []);
      root.querySelector("[data-unit-list]").innerHTML = '<p class="muted" style="margin:0 0 10px;font-size:.9rem">' + esc(x.title) + " · " + esc(x.note) + '</p><div class="form-strip">' + ids.map((id) => { const p = byId[id]; return '<span class="badge badge--outline" style="width:auto;height:auto;padding:5px 10px;font-family:var(--font-body);font-style:normal;text-transform:none;letter-spacing:0;font-size:.85rem">' + esc(p.pos) + " · " + esc(fullName(p)) + "</span>"; }).join("") + "</div>";
    };
    bindTabs(root, draw); draw(0);

    const g1 = byId[lu.goalies.start], g2 = byId[lu.goalies.backup];
    fill("goalies", '<ul class="list">' +
      [[g1, "Stammtorhüter"], [g2, "Ersatztorhüter"]].map((g) => '<li><span class="crest" style="background:var(--white);width:36px;height:36px">' + g[0].nr + '</span><div class="grow"><b>' + esc(fullName(g[0])) + '</b><div class="meta">' + g[1] + '</div></div><span class="score">' + ovr(g[0]) + "</span></li>").join("") + "</ul>");
    fill("subs", '<ul class="list">' + lu.subs.map((id) => { const p = byId[id]; return '<li><span class="crest" style="background:var(--line);color:var(--white);width:36px;height:36px">' + p.nr + '</span><div class="grow"><b>' + esc(fullName(p)) + '</b><div class="meta">' + U.posName[p.pos] + ", " + p.age + ' Jahre</div></div><span class="score">' + ovr(p) + "</span></li>"; }).join("") + "</ul>");

    const order = { TH: 0, VE: 1, CE: 2, FL: 3 };
    const rows = squad.slice().sort((a, b) => order[a.pos] - order[b.pos] || ovr(b) - ovr(a)).map((p) =>
      '<tr><td class="rank">' + p.nr + '</td><td><a href="spieler#' + p.id + '">' + esc(fullName(p)) + "</a></td><td>" + p.pos + '</td><td class="c hide-sm">' + p.age + '</td><td class="c"><b>' + ovr(p) + '</b></td><td class="c">' + formIcon(p.form) + '</td><td class="hide-sm">' + p.nation + '</td><td class="r hide-sm">' + esc(chf(p.value)) + "</td></tr>").join("");
    fill("squad", '<div class="table-wrap"><table class="data"><thead><tr><th>Nr</th><th>Name</th><th>Pos</th><th class="c hide-sm">Alter</th><th class="c">Stärke</th><th class="c">Form</th><th class="hide-sm">Nation</th><th class="r hide-sm">Marktwert</th></tr></thead><tbody>' + rows + '</tbody></table></div><p class="muted" style="margin:14px 0 0;font-size:.85rem">' + squad.length + " Spieler im Kader · TH Torhüter · VE Verteidiger · CE Center · FL Flügel</p>");
  };

  /* ---------- Spieler ---------- */
  views.spieler = async function () {
    const squad = await api.getSquad();
    const labels = { schuss: "Schuss", pass: "Pass", technik: "Technik", tempo: "Tempo", ausdauer: "Ausdauer", defensive: "Defensive", reflexe: "Reflexe", stellung: "Stellungsspiel", fangen: "Fangsicherheit", aufbau: "Spielaufbau", mental: "Nervenstärke" };
    const listEl = view("player-list");
    const order = { TH: 0, VE: 1, CE: 2, FL: 3 };
    const sorted = squad.slice().sort((a, b) => order[a.pos] - order[b.pos] || a.nr - b.nr);
    const sel = document.createElement("select");
    sel.className = "input show-sm"; sel.setAttribute("aria-label", "Spieler wählen");
    sel.innerHTML = sorted.map((p) => '<option value="' + p.id + '">' + p.nr + " · " + esc(fullName(p)) + " (" + p.pos + ")</option>").join("");
    listEl.innerHTML = "";
    listEl.appendChild(sel);
    listEl.insertAdjacentHTML("beforeend", '<ul class="list hide-sm" style="max-height:640px;overflow-y:auto;padding-right:6px">' + sorted.map((p) =>
      '<li><button type="button" class="tab" data-id="' + p.id + '" style="width:100%;display:flex;justify-content:space-between;border-radius:10px;text-align:left"><span>' + p.nr + " · " + esc(fullName(p)) + '</span><span>' + p.pos + " " + ovr(p) + "</span></button></li>").join("") + "</ul>");

    function show(id) {
      const p = squad.find((x) => x.id === id) || sorted[0];
      sel.value = p.id;
      listEl.querySelectorAll(".tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.id === p.id)));
      const s = p.stats;
      const statBlocks = p.pos === "TH"
        ? [["Spiele", s.gp], ["Fangquote", s.sv ? String(s.sv).replace(".", ",") + " %" : "0"], ["Gegentore/Spiel", s.ga ? String(s.ga).replace(".", ",") : "0"]]
        : [["Spiele", s.gp], ["Tore", s.g], ["Assists", s.a], ["Plus/Minus", (s.pm > 0 ? "+" : "") + s.pm]];
      fill("player-profile",
        '<div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-bottom:22px"><div class="ph ph--1x1" style="width:96px;flex:none">' + icon("user") + '</div><div class="grow" style="flex:1;min-width:180px"><span class="badge badge--teal">' + U.posName[p.pos] + '</span><h3 style="font-size:1.8rem;font-weight:800;margin:8px 0 4px">' + esc(fullName(p)) + '</h3><div class="muted">Nr. ' + p.nr + " · " + p.age + " Jahre · " + p.nation + '</div></div><div style="text-align:center"><div class="big-num">' + ovr(p) + '</div><div class="kpi-label">Stärke</div></div></div>' +
        '<div class="grid grid--2"><div><h3 style="margin-bottom:14px">Fähigkeiten</h3><div class="bars">' + Object.keys(p.attrs).map((k) => bar(labels[k] || k, p.attrs[k])).join("") + '</div></div>' +
        '<div><h3 style="margin-bottom:14px">Saison</h3><div class="grid grid--2 grid--kpi">' + statBlocks.map((b) => '<div class="card" style="padding:14px"><div class="big-num" style="font-size:1.7rem">' + esc(b[1]) + '</div><div class="kpi-label">' + b[0] + "</div></div>").join("") + '</div><h3 style="margin:20px 0 10px">Vertrag</h3><ul class="list"><li><span class="grow">Marktwert</span><b>' + esc(chf(p.value)) + '</b></li><li><span class="grow">Lohn pro Monat</span><b>' + esc(chf(p.salary)) + '</b></li><li><span class="grow">Form</span>' + formIcon(p.form) + "</li></ul></div></div>");
      FT.animateBars(view("player-profile"));
    }
    sel.addEventListener("change", () => { history.replaceState(null, "", "#" + sel.value); show(sel.value); });
    listEl.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => { history.replaceState(null, "", "#" + b.dataset.id); show(b.dataset.id); }));
    show(location.hash.slice(1) || "p10");
  };

  /* ---------- Transfermarkt ---------- */
  views.transfermarkt = async function () {
    const [list, bids] = await Promise.all([api.getTransferList(), api.getBids()]);
    const f = { pos: document.getElementById("f-pos"), age: document.getElementById("f-age"), price: document.getElementById("f-price"), sort: document.getElementById("f-sort") };
    const ageOut = document.getElementById("f-age-out"), priceOut = document.getElementById("f-price-out");
    function draw() {
      ageOut.textContent = f.age.value + " Jahre";
      priceOut.textContent = chf(+f.price.value);
      let rows = list.filter((x) => (!f.pos.value || x.pos === f.pos.value) && x.age <= +f.age.value && x.price <= +f.price.value);
      const s = f.sort.value;
      rows.sort((a, b) => s === "price" ? a.price - b.price : s === "age" ? a.age - b.age : b.ovr - a.ovr);
      fill("offers", rows.length ? '<div class="table-wrap"><table class="data"><thead><tr><th>Spieler</th><th>Pos</th><th class="c">Alter</th><th class="c">Stärke</th><th class="hide-sm">Verein</th><th class="hide-sm">Endet in</th><th class="r">Preis</th><th></th></tr></thead><tbody>' +
        rows.map((x) => '<tr><td><b>' + esc(x.name) + "</b></td><td>" + x.pos + '</td><td class="c">' + x.age + '</td><td class="c"><b>' + x.ovr + '</b></td><td class="hide-sm muted">' + esc(x.club) + '</td><td class="hide-sm muted">' + esc(x.ends) + '</td><td class="r">' + esc(chf(x.price)) + '</td><td class="r"><button class="btn btn--ghost btn--small" type="button" data-bid="' + x.id + '">Bieten</button></td></tr>').join("") +
        "</tbody></table></div>" : '<p class="empty">Keine Spieler passen zu diesen Filtern. Lockere zum Beispiel die Preisgrenze.</p>');
      view("offers").querySelectorAll("[data-bid]").forEach((b) => b.addEventListener("click", async () => {
        const x = list.find((y) => y.id === b.dataset.bid);
        await api.placeBid(x.id, x.price);
        FT.toast("Demo: Ab dem Spielstart kannst du hier echte Gebote für " + x.name + " abgeben.");
      }));
      const c = document.getElementById("f-count"); if (c) c.textContent = rows.length + " von " + list.length + " Spielern";
    }
    Object.values(f).forEach((el) => el.addEventListener("input", draw));
    draw();
    fill("bids", '<ul class="list">' + bids.map((b) => '<li><div class="grow"><b>' + esc(b.player) + '</b> <span class="muted">(' + b.pos + ')</span><div class="meta">' + esc(b.note) + '</div></div><div style="text-align:right"><div class="num" style="font-weight:600">' + esc(chf(b.amount)) + '</div><span class="badge ' + (b.status === "Führend" ? "badge--teal" : "badge--outline") + '">' + esc(b.status) + "</span></div></li>").join("") + "</ul>");
  };

  /* ---------- News ---------- */
  views.news = async function () {
    const news = await api.getNews();
    const top = news.find((n) => n.top) || news[0];
    fill("news-top", '<div class="news-top"><div class="ph ph--16x9" role="img" aria-label="Platzhalter für das Bild zur Top-Meldung">' + icon("trophy") + '</div><div><span class="badge badge--teal">' + esc(top.tag) + '</span><h3>' + esc(top.title) + '</h3><p class="muted">' + esc(top.text) + '</p><div class="meta muted" style="font-size:.88rem">' + esc(U.dateText(top.date)) + "</div></div></div>");
    const ico = { Transfer: "transfer", Cup: "trophy", Verein: "shield", International: "globe", Training: "dumbbell", Liga: "ball" };
    fill("news-more", '<div class="news-list">' + news.filter((n) => n !== top).map((n) => '<article class="news-item"><div class="ph ph--4x3" role="img" aria-label="Platzhalter für das Bild zur Meldung">' + icon(ico[n.tag] || "news") + '</div><div><span class="badge badge--outline">' + esc(n.tag) + '</span><h3 style="margin:8px 0 6px">' + esc(n.title) + "</h3><p>" + esc(n.text) + '</p><div class="muted" style="font-size:.82rem;margin-top:6px">' + esc(U.dateText(n.date)) + "</div></div></article>").join("") + "</div>");
  };

  /* ---------- Finanzen ---------- */
  views.finanzen = async function () {
    const f = await api.getFinances();
    const tin = f.income.reduce((a, b) => a + b.amount, 0), tout = f.expenses.reduce((a, b) => a + b.amount, 0);
    fill("fin-balance", '<div class="grid grid--3 grid--kpi"><div><div class="big-num">' + esc(chf(f.balance)) + '</div><div class="kpi-label">Kontostand</div></div><div><div class="big-num">' + esc(chf(tin)) + '</div><div class="kpi-label">Einnahmen bisher</div></div><div><div class="big-num">' + esc(chf(tout)) + '</div><div class="kpi-label">Ausgaben bisher</div></div></div><p style="margin:18px 0 0"><span class="trend-up">+ ' + esc(chf(f.change)) + '</span> <span class="muted">seit letzter Woche, vor allem dank Ticketverkauf beim Heimsieg.</span></p>');
    const list = (items, total, cls) => '<div class="bars">' + items.map((i) => '<div><div class="bar__top"><span>' + esc(i.label) + '</span><b>' + esc(chf(i.amount)) + '</b></div><div class="bar ' + cls + '"><i data-w="' + Math.round(i.amount / total * 100) + '"></i></div></div>').join("") + "</div>";
    fill("fin-income", list(f.income, tin, ""));
    fill("fin-expenses", list(f.expenses, tout, "bar--muted"));
    const W = 560, H = 220, pad = 28, max = Math.max(...f.months.map((m) => Math.max(m.in, m.out))) * 1.15;
    const bw = (W - pad * 2) / f.months.length;
    let s = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Balkendiagramm Einnahmen und Ausgaben pro Monat in Tausend Franken">';
    [0, 50, 100, 150].forEach((v) => { const y = H - pad - v / max * (H - pad * 2); if (v <= max) s += '<line class="ax" x1="' + pad + '" x2="' + (W - 8) + '" y1="' + y + '" y2="' + y + '"/><text x="0" y="' + (y + 4) + '">' + v + "</text>"; });
    f.months.forEach((m, i) => {
      const x = pad + i * bw + bw * .18, w = bw * .3;
      const hi = m.in / max * (H - pad * 2), ho = m.out / max * (H - pad * 2);
      if (m.in || m.out) s += '<rect class="b-in" x="' + x + '" y="' + (H - pad - hi) + '" width="' + w + '" height="' + hi + '" rx="3"><title>' + m.m + ": Einnahmen " + m.in + ' Tsd.</title></rect><rect class="b-out" x="' + (x + w + 3) + '" y="' + (H - pad - ho) + '" width="' + w + '" height="' + ho + '" rx="3"><title>' + m.m + ": Ausgaben " + m.out + " Tsd.</title></rect>";
      else s += '<text x="' + (x + w) + '" y="' + (H - pad - 6) + '" text-anchor="middle">·</text>';
      s += '<text x="' + (x + w + 1.5) + '" y="' + (H - 8) + '" text-anchor="middle">' + m.m + "</text>";
    });
    s += "</svg>";
    fill("fin-chart", s + '<div class="legend"><span><i style="background:var(--teal)"></i>Einnahmen</span><span><i style="background:var(--muted)"></i>Ausgaben</span><span>in Tausend CHF</span></div>');
  };

  /* ---------- Liga & Tabelle ---------- */
  views.liga = async function () {
    await loadTeams();
    const [st, sc, comps] = await Promise.all([api.getStandings(), api.getScorers(), api.getCompetitions()]);
    const own = ownId();
    const rows = st.slice().sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga)).map((r, i) => {
      const d = r.gf - r.ga;
      return '<tr class="' + (r.team === own ? "is-own" : "") + '"><td class="rank">' + (i + 1) + '</td><td><div class="team-cell">' + crest(team(r.team)) + '<span>' + esc(team(r.team).name) + '</span></div></td><td class="c">' + r.gp + '</td><td class="c">' + r.w + '</td><td class="c hide-sm">' + r.otw + '</td><td class="c hide-sm">' + r.otl + '</td><td class="c">' + r.l + '</td><td class="c hide-sm">' + r.gf + ":" + r.ga + '</td><td class="c">' + (d > 0 ? "+" : "") + d + '</td><td class="r"><b>' + r.pts + "</b></td></tr>";
    }).join("");
    fill("table", '<div class="table-wrap"><table class="data"><thead><tr><th>#</th><th>Team</th><th class="c">Sp</th><th class="c">S</th><th class="c hide-sm">SnV</th><th class="c hide-sm">NnV</th><th class="c">N</th><th class="c hide-sm">Tore</th><th class="c">Diff</th><th class="r">Pkt</th></tr></thead><tbody>' + rows + '</tbody></table></div><p class="muted" style="margin:14px 0 0;font-size:.85rem">Sieg 3 Punkte · Sieg nach Verlängerung (SnV) 2 · Niederlage nach Verlängerung (NnV) 1 · Plätze 1 bis 4 spielen die Playoffs.</p>');
    fill("scorers", '<div class="table-wrap"><table class="data"><thead><tr><th>#</th><th>Spieler</th><th class="hide-sm">Team</th><th class="c">T</th><th class="c">A</th><th class="r">Pkt</th></tr></thead><tbody>' + sc.map((x, i) => '<tr class="' + (x.team === own ? "is-own" : "") + '"><td class="rank">' + (i + 1) + "</td><td>" + esc(x.name) + '</td><td class="hide-sm muted">' + esc(team(x.team).short) + '</td><td class="c">' + x.g + '</td><td class="c">' + x.a + '</td><td class="r"><b>' + x.pts + "</b></td></tr>").join("") + "</tbody></table></div>");
    fill("competitions", '<ul class="list">' + comps.map((c) => '<li><span class="ico" style="width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:var(--teal-soft);color:var(--teal);flex:none">' + icon("trophy") + '</span><div class="grow"><b>' + esc(c.name) + '</b> <span class="badge badge--outline">' + esc(c.type) + '</span><div class="meta">' + esc(c.note) + '</div></div><span class="muted hide-sm" style="font-size:.9rem">' + esc(c.status) + "</span></li>").join("") + "</ul>");
  };

  /* ---------- Taktik ---------- */
  const SYSTEMS = {
    "2-1-2": { label: "2-1-2 Ausgewogen", text: "Zwei Verteidiger, ein Center, zwei Flügel. Die Grundordnung der meisten Teams.", pos: [[118, 58], [118, 142], [200, 100], [280, 42], [280, 158]] },
    "2-2-1": { label: "2-2-1 Kompakt", text: "Zwei Spieler sichern die Mitte ab, nur einer bleibt vorne. Gut gegen starke Gegner.", pos: [[112, 62], [112, 138], [188, 72], [188, 128], [272, 100]] },
    "1-3-1": { label: "1-3-1 Offensiv", text: "Breite Mitte, frühes Pressing. Riskant, aber viele Abschlüsse.", pos: [[110, 100], [198, 40], [198, 100], [198, 160], [290, 100]] }
  };
  views.taktik = async function () {
    const [t, squad, lu] = await Promise.all([api.getTactics(), api.getSquad(), api.getLineup()]);
    const byId = {}; squad.forEach((p) => { byId[p.id] = p; });
    const keys = Object.keys(SYSTEMS);
    const root = view("board");
    root.innerHTML = tabsHTML(keys.map((k) => SYSTEMS[k].label), keys.indexOf(t.system), "Spielsystem wählen") + '<div data-rink></div><p class="muted" data-sys-text style="margin:14px 0 0"></p>';
    const l1 = lu.lines[0]; const ids = [l1.VE[0], l1.VE[1], l1.CE, l1.FL[0], l1.FL[1]];
    const draw = (i) => {
      t.system = keys[i]; const sys = SYSTEMS[t.system];
      const gk = byId[lu.goalies.start];
      const dots = [{ x: 48, y: 100, gk: true, label: gk.nr, name: gk.last }].concat(sys.pos.map((p, k) => ({ x: p[0], y: p[1], label: byId[ids[k]].nr, name: byId[ids[k]].last })));
      root.querySelector("[data-rink]").innerHTML = rinkSVG(dots, "Spielsystem " + sys.label);
      root.querySelector("[data-sys-text]").textContent = sys.text;
    };
    bindTabs(root, draw); draw(Math.max(0, keys.indexOf(t.system)));

    const sliders = [["pressing", "Pressing", "abwartend", "aggressiv"], ["tempo", "Tempo", "ruhig", "schnell"], ["hardness", "Härte im Zweikampf", "fair", "hart"], ["risk", "Risiko im Spielaufbau", "sicher", "mutig"]];
    fill("style", '<div class="grid" style="gap:22px">' + sliders.map((s) => '<div class="range"><div class="range__top"><label for="t-' + s[0] + '">' + s[1] + '</label><output id="o-' + s[0] + '">' + t[s[0]] + '</output></div><input type="range" id="t-' + s[0] + '" min="0" max="100" value="' + t[s[0]] + '"><div class="range__ends"><span>' + s[2] + "</span><span>" + s[3] + "</span></div></div>").join("") + "</div>");
    sliders.forEach((s) => { const i = document.getElementById("t-" + s[0]); i.addEventListener("input", () => { t[s[0]] = +i.value; document.getElementById("o-" + s[0]).textContent = i.value; }); });

    fill("shifts", '<div class="range" style="margin-bottom:22px"><div class="range__top"><label for="t-shift">Wechsel nach</label><output id="o-shift">' + t.shift + ' Sek.</output></div><input type="range" id="t-shift" min="30" max="90" step="5" value="' + t.shift + '"><div class="range__ends"><span>30 Sek.</span><span>90 Sek.</span></div></div><div class="bars">' + lu.lines.map((l) => bar(l.name, l.share + " %", 100)).join("") + '</div><p class="muted" style="margin:16px 0 0;font-size:.9rem">Die Einsatzzeit pro Linie legst du in der Mannschaft fest. Powerplay und Boxplay übernehmen die Formationen von dort.</p>');
    const sh = document.getElementById("t-shift"); sh.addEventListener("input", () => { t.shift = +sh.value; document.getElementById("o-shift").textContent = sh.value + " Sek."; });

    document.getElementById("save-tactics").addEventListener("click", async () => { await api.saveTactics(t); FT.toast("Demo: Deine Taktik wird ab dem Spielstart gespeichert."); });
  };

  /* ---------- Training ---------- */
  views.training = async function () {
    const [tr, squad] = await Promise.all([api.getTraining(), api.getSquad()]);
    const byId = {}; squad.forEach((p) => { byId[p.id] = p; });
    const dots = (n) => n ? "●".repeat(n) + "○".repeat(3 - n) : "frei";
    fill("week", '<div class="week">' + tr.week.map((d) => '<div class="day ' + (d.match ? "is-match" : d.intensity === 0 ? "is-rest" : "") + '"><b>' + d.day + '</b><span class="type">' + esc(d.type) + (d.match ? '<br><span class="muted" style="font-weight:500;font-size:.8rem">' + esc(d.match) + "</span>" : "") + '</span><span class="int" title="Intensität">' + dots(d.intensity) + "</span></div>").join("") + "</div>");
    fill("focus", '<div class="bars">' + tr.focus.map((f) => bar(f.label, f.value + " %", 50)).join("") + '</div><p class="muted" style="margin:16px 0 0;font-size:.9rem">Je mehr Anteil ein Schwerpunkt bekommt, desto schneller wachsen die passenden Fähigkeiten. Zu viel Kondition kostet aber Frische vor dem Spiel.</p>');
    fill("progress", '<ul class="list">' + tr.progress.map((x) => { const p = byId[x.player]; return '<li><div class="grow"><b>' + esc(fullName(p)) + '</b><div class="meta">' + esc(x.attr) + " · " + U.posName[p.pos] + '</div></div><span class="num muted">' + x.from + ' →</span><span class="score">' + x.to + '</span><span class="trend-up">+' + (x.to - x.from) + "</span></li>"; }).join("") + "</ul>");
  };

  /* ---------- Verein ---------- */
  views.verein = async function () {
    const c = await api.getClub();
    const s = c.stadium;
    fill("stadium", '<div class="ph ph--16x9" role="img" aria-label="Platzhalter für ein Bild der Tigerhalle" style="margin-bottom:18px">' + icon("stadium") + '</div><div class="grid grid--3 grid--kpi" style="margin-bottom:18px"><div><div class="big-num">' + U.num(s.capacity) + '</div><div class="kpi-label">Plätze</div></div><div><div class="big-num">' + U.num(s.avgAttendance) + '</div><div class="kpi-label">Zuschauerschnitt</div></div><div><div class="big-num">' + Math.round(s.avgAttendance / s.capacity * 100) + '<small>%</small></div><div class="kpi-label">Auslastung</div></div></div><h3 style="margin-bottom:10px">Ausbaustufen</h3><ul class="list">' +
      s.levels.map((l) => '<li><span class="crest" style="background:' + (l.level <= s.level ? "var(--teal)" : "var(--line)") + ";color:" + (l.level <= s.level ? "var(--navy)" : "var(--muted)") + '">' + l.level + '</span><div class="grow"><b>' + esc(l.label) + '</b><div class="meta">' + U.num(l.capacity) + " Plätze</div></div>" + (l.level === s.level ? '<span class="badge badge--teal">Aktuell</span>' : l.level < s.level ? '<span class="badge badge--outline">Erreicht</span>' : '<span class="num muted" style="font-size:.9rem">' + esc(chf(l.cost)) + "</span>") + "</li>").join("") + '</ul><button class="btn btn--ghost btn--small" type="button" style="margin-top:16px" data-demo="Der Stadionausbau ist ab dem Spielstart möglich.">Auf Stufe 3 ausbauen</button>');
    fill("fans", bar("Stimmung", c.fans.mood + " %", 100) + '<div class="grid grid--2 grid--kpi" style="margin-top:20px"><div><div class="big-num">' + U.num(c.fans.members) + '</div><div class="kpi-label">Mitglieder <span class="trend-up">+' + c.fans.trend + "</span></div></div><div><div class=\"big-num\">" + c.fans.fanclubs + '</div><div class="kpi-label">Fanclubs</div></div></div><p class="muted" style="margin:16px 0 0;font-size:.9rem">Siege, faire Ticketpreise und Heimspiele am Wochenende heben die Stimmung. Gute Stimmung bringt mehr Zuschauer und Sponsoren.</p>');
    fill("club-data", '<div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap"><svg viewBox="0 0 64 72" width="72" height="81" role="img" aria-label="Vereinswappen der Volketswil Tigers: Schild in Türkis mit den Buchstaben VT"><path d="M32 2 60 12v24c0 18-12 29-28 34C16 65 4 54 4 36V12z" fill="#00D4AA"/><path d="M32 9 53 17v19c0 14-9 23-21 27-12-4-21-13-21-27V17z" fill="#101827"/><text x="32" y="44" text-anchor="middle" font-family="Saira" font-style="italic" font-weight="800" font-size="20" fill="#F8FAFC">VT</text></svg><ul class="list" style="flex:1;min-width:220px">' +
      [["Name", c.name], ["Gegründet", c.founded], ["Ort", c.city], ["Vereinsfarben", c.colors], ["Manager", c.manager]].map((r) => '<li><span class="grow muted">' + r[0] + "</span><b>" + esc(r[1]) + "</b></li>").join("") + "</ul></div>");
    document.querySelectorAll("[data-demo]").forEach((b) => b.addEventListener("click", () => FT.toast("Demo: " + b.dataset.demo)));
  };

  /* ---------- International ---------- */
  views.international = async function () {
    const [leagues, comps, rank] = await Promise.all([api.getLeagues(), api.getIntlCompetitions(), api.getNationalRanking()]);
    const regions = [...new Set(leagues.map((l) => l.region))];
    fill("leagues", '<div class="grid grid--3">' + regions.map((r) => { const ls = leagues.filter((l) => l.region === r); return '<div class="card reveal"><div class="card__head"><h3>' + esc(r) + '</h3><span class="muted" style="font-size:.85rem">' + ls.length + ' Länder</span></div><ul class="list">' + ls.map((l) => '<li><span class="crest" style="background:var(--line);color:var(--white);width:40px">' + l.flag + '</span><span class="grow">' + esc(l.country) + '</span><span class="muted num" style="font-size:.88rem">' + l.tiers + (l.tiers > 1 ? " Ligen" : " Liga") + " · " + l.clubs + " Klubs</span></li>").join("") + "</ul></div>"; }).join("") + "</div>");
    fill("intl-comps", '<ul class="list">' + comps.map((c) => '<li><span style="width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:var(--teal-soft);color:var(--teal);flex:none">' + icon(c.level === "Klubs" ? "trophy" : "globe") + '</span><div class="grow"><b>' + esc(c.name) + '</b> <span class="badge badge--outline">' + esc(c.level) + '</span><div class="meta">' + esc(c.note) + " · " + c.teams + ' Teams</div></div><div style="text-align:right"><div class="muted" style="font-size:.88rem">' + esc(c.status) + "</div>" + (c.qualified ? '<span class="badge badge--teal">Dabei</span>' : "") + "</div></li>").join("") + "</ul>");
    fill("ranking", '<div class="table-wrap"><table class="data"><thead><tr><th>#</th><th>Nation</th><th class="r">Punkte</th></tr></thead><tbody>' + rank.map((r) => '<tr class="' + (r.code === "SUI" ? "is-own" : "") + '"><td class="rank">' + r.rank + '</td><td><div class="team-cell"><span class="crest" style="background:var(--line);color:var(--white);width:40px">' + r.code + "</span>" + esc(r.country) + '</div></td><td class="r num">' + U.num(r.points) + "</td></tr>").join("") + "</tbody></table></div>");
  };

  /* ---------- Freundschaftsspiele ---------- */
  views.freundschaftsspiele = async function () {
    const teams = await loadTeams();
    const fr = await api.getFriendlies();
    const sel = document.getElementById("fr-opp");
    sel.innerHTML = teams.filter((t) => !t.own).map((t) => '<option>' + esc(t.name) + "</option>").join("") + '<option>Zufälliger Gegner aus dem Ausland</option>';
    const date = document.getElementById("fr-date");
    const d = new Date(Date.now() + 14 * 864e5); date.value = d.toISOString().slice(0, 10); date.min = new Date().toISOString().slice(0, 10);
    const drawOpen = () => fill("fr-open", fr.open.length ? '<ul class="list">' + fr.open.map((o) => { const dd = U.date(o.date); return '<li><div class="date-chip"><b>' + dd.d + "</b><span>" + dd.m + '</span></div><div class="grow"><b>' + (o.home ? "vs. " : "@ ") + esc(o.opponent) + '</b><div class="meta">' + (o.home ? "Heimspiel" : "Auswärtsspiel") + '</div></div><span class="badge ' + (o.status === "Angenommen" ? "badge--teal" : "badge--outline") + '">' + esc(o.status) + "</span></li>"; }).join("") + "</ul>" : '<p class="empty">Keine offenen Anfragen.</p>');
    drawOpen();
    document.getElementById("fr-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const req = { opponent: sel.value, date: date.value, home: document.querySelector('input[name="fr-home"]:checked').value === "1", status: "Wartet auf Antwort" };
      await api.requestFriendly(req);
      fr.open.unshift(req); drawOpen();
      FT.toast("Demo: Anfrage an " + req.opponent + " vorgemerkt. Echte Anfragen gehen ab dem Spielstart raus.");
    });
    fill("fr-past", '<ul class="list">' + fr.past.map((p) => { const win = p.hs > p.as, draw = p.hs === p.as; return '<li><div class="form-strip"><span class="' + (win ? "f-w" : draw ? "f-o" : "f-l") + '">' + (win ? "S" : draw ? "U" : "N") + '</span></div><div class="grow"><b>' + (p.home ? "vs. " : "@ ") + esc(p.opponent) + '</b><div class="meta">' + esc(U.dateText(p.date)) + '</div></div><span class="score">' + p.hs + ":" + p.as + "</span></li>"; }).join("") + "</ul>");
  };

  /* ---------- Statistiken ---------- */
  views.statistiken = async function () {
    const [s, squad] = await Promise.all([api.getTeamStats(), api.getSquad()]);
    fill("kpis", '<div class="grid grid--3 grid--kpi">' + s.kpis.map((k) => '<div class="card reveal"><div class="big-num">' + esc(k.value) + '</div><div class="kpi-label">' + esc(k.label) + "</div></div>").join("") + "</div>");
    const top = squad.filter((p) => p.pos !== "TH").map((p) => ({ p, pts: p.stats.g + p.stats.a })).sort((a, b) => b.pts - a.pts).slice(0, 8);
    fill("top-team", '<div class="table-wrap"><table class="data"><thead><tr><th>#</th><th>Spieler</th><th class="hide-sm">Pos</th><th class="c">T</th><th class="c">A</th><th class="c hide-sm">+/-</th><th class="r">Pkt</th></tr></thead><tbody>' + top.map((x, i) => '<tr><td class="rank">' + (i + 1) + '</td><td><a href="spieler#' + x.p.id + '">' + esc(fullName(x.p)) + '</a></td><td class="hide-sm">' + x.p.pos + '</td><td class="c">' + x.p.stats.g + '</td><td class="c">' + x.p.stats.a + '</td><td class="c hide-sm">' + (x.p.stats.pm > 0 ? "+" : "") + x.p.stats.pm + '</td><td class="r"><b>' + x.pts + "</b></td></tr>").join("") + "</tbody></table></div>");
    fill("compare", s.compare.map((c) => { const tot = c.own + c.avg; return '<div class="vs-row"><span class="lbl">' + esc(c.label) + ' pro Spiel</span><b>' + String(c.own).replace(".", ",") + '</b><div class="vs-bar"><i style="width:' + (c.own / tot * 100) + '%"></i><i style="width:' + (c.avg / tot * 100) + '%"></i></div><b style="text-align:right">' + String(c.avg).replace(".", ",") + "</b></div>"; }).join("") + '<div class="legend"><span><i style="background:var(--teal)"></i>Dein Team</span><span><i style="background:var(--muted)"></i>Liga-Schnitt</span></div>');
  };

  /* ---------- Einstellungen ---------- */
  views.einstellungen = async function () {
    const s = await api.getSettings();
    document.getElementById("s-manager").value = s.managerName;
    document.getElementById("s-club").value = s.clubName;
    document.getElementById("s-country").value = s.country;
    document.getElementById("s-lang").value = s.language;
    Object.keys(s.notifications).forEach((k) => { const el = document.getElementById("n-" + k); if (el) el.checked = s.notifications[k]; });
    document.querySelectorAll("[data-save]").forEach((b) => b.addEventListener("click", async (e) => { e.preventDefault(); await api.saveSettings(s); FT.toast("Demo: Einstellungen werden ab dem Spielstart in deinem Konto gespeichert."); }));
    document.querySelectorAll("[data-demo]").forEach((b) => b.addEventListener("click", () => FT.toast("Demo: " + b.dataset.demo)));
  };

  FT.views = views;
})();
