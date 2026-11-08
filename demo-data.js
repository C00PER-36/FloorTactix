/*
  FloorTactix · DEMO-DATEN
  Alles in dieser Datei ist erfunden. Vereine, Spieler, Resultate und Beträge
  dienen nur dazu, das Spiel-Design zu zeigen. Die Struktur entspricht den
  geplanten Supabase-Tabellen (siehe docs/datenmodell.md), damit die echten
  Daten später einfach an ihre Stelle treten können.
*/
window.FT_DEMO = (function () {
  const teams = [
    { id: "t01", name: "UHC Volketswil Tigers", short: "VOL", own: true },
    { id: "t02", name: "Glattal Falcons", short: "GLA" },
    { id: "t03", name: "Seebach Sharks", short: "SEE" },
    { id: "t04", name: "Uster Wolves", short: "UST" },
    { id: "t05", name: "Wil Wildcats", short: "WIL" },
    { id: "t06", name: "Limmattal Lynx", short: "LIM" },
    { id: "t07", name: "Thurgau Thunder", short: "THU" },
    { id: "t08", name: "Zug Comets", short: "ZUG" },
    { id: "t09", name: "Rheintal Ravens", short: "RHE" },
    { id: "t10", name: "Aarau Arrows", short: "AAR" }
  ];

  // pos: TH = Torhüter, VE = Verteidiger, CE = Center, FL = Flügel
  const P = (id, first, last, pos, age, nr, a, extra) => Object.assign({ id, first, last, pos, age, nr, attrs: a, nation: "SUI", form: 0, salary: 0, value: 0, stats: { gp: 9, g: 0, a: 0, pm: 0 } }, extra || {});
  const players = [
    P("p01", "Robin", "Gerber", "TH", 27, 1, { reflexe: 82, stellung: 79, fangen: 76, aufbau: 64, ausdauer: 71, mental: 80 }, { salary: 5200, value: 180000, stats: { gp: 7, sv: 91.4, ga: 2.6 } }),
    P("p02", "Kevin", "Arnold", "TH", 22, 30, { reflexe: 74, stellung: 70, fangen: 72, aufbau: 66, ausdauer: 75, mental: 68 }, { salary: 2600, value: 95000, stats: { gp: 2, sv: 88.9, ga: 3.5 } }),
    P("p03", "Pascal", "Zürcher", "TH", 19, 45, { reflexe: 66, stellung: 61, fangen: 63, aufbau: 58, ausdauer: 70, mental: 59 }, { salary: 900, value: 40000, stats: { gp: 0 } }),
    P("p04", "Jan", "Brunner", "VE", 29, 4, { schuss: 66, pass: 77, technik: 70, tempo: 68, ausdauer: 80, defensive: 85 }, { salary: 4800, value: 210000, stats: { gp: 9, g: 2, a: 7, pm: 6 } }),
    P("p05", "Simon", "Widmer", "VE", 26, 6, { schuss: 72, pass: 74, technik: 69, tempo: 71, ausdauer: 77, defensive: 80 }, { salary: 4100, value: 175000, stats: { gp: 9, g: 3, a: 5, pm: 4 } }),
    P("p06", "Marco", "Wyss", "VE", 31, 8, { schuss: 61, pass: 70, technik: 64, tempo: 62, ausdauer: 72, defensive: 83 }, { salary: 3900, value: 120000, stats: { gp: 9, g: 0, a: 4, pm: 3 } }),
    P("p07", "Lars", "Lindqvist", "VE", 25, 13, { schuss: 75, pass: 72, technik: 73, tempo: 74, ausdauer: 76, defensive: 77 }, { nation: "SWE", salary: 4600, value: 230000, stats: { gp: 9, g: 4, a: 3, pm: 2 } }),
    P("p08", "Fabio", "Steiner", "VE", 21, 17, { schuss: 63, pass: 66, technik: 67, tempo: 73, ausdauer: 78, defensive: 71 }, { salary: 1800, value: 110000, stats: { gp: 8, g: 1, a: 2, pm: -1 } }),
    P("p09", "Yannick", "Schmid", "VE", 24, 22, { schuss: 60, pass: 65, technik: 61, tempo: 66, ausdauer: 74, defensive: 74 }, { salary: 2200, value: 85000, stats: { gp: 9, g: 0, a: 1, pm: -2 } }),
    P("p10", "Luca", "Meier", "CE", 26, 10, { schuss: 82, pass: 86, technik: 84, tempo: 79, ausdauer: 81, defensive: 68 }, { salary: 6500, value: 340000, stats: { gp: 9, g: 8, a: 11, pm: 9 } }),
    P("p11", "Mikko", "Laine", "CE", 28, 19, { schuss: 79, pass: 80, technik: 81, tempo: 75, ausdauer: 77, defensive: 70 }, { nation: "FIN", salary: 5800, value: 290000, stats: { gp: 9, g: 5, a: 8, pm: 5 } }),
    P("p12", "Sandro", "Bühler", "CE", 23, 23, { schuss: 70, pass: 74, technik: 72, tempo: 76, ausdauer: 79, defensive: 66 }, { salary: 2400, value: 140000, stats: { gp: 9, g: 2, a: 4, pm: 0 } }),
    P("p13", "Noah", "Keller", "FL", 24, 11, { schuss: 85, pass: 72, technik: 80, tempo: 84, ausdauer: 76, defensive: 55 }, { salary: 5600, value: 320000, stats: { gp: 9, g: 12, a: 5, pm: 8 } }),
    P("p14", "Elias", "Huber", "FL", 22, 14, { schuss: 79, pass: 70, technik: 77, tempo: 86, ausdauer: 80, defensive: 52 }, { salary: 3200, value: 260000, stats: { gp: 9, g: 7, a: 6, pm: 6 } }),
    P("p15", "Ondřej", "Novák", "FL", 27, 15, { schuss: 81, pass: 75, technik: 79, tempo: 78, ausdauer: 74, defensive: 60 }, { nation: "CZE", salary: 4700, value: 250000, stats: { gp: 9, g: 6, a: 7, pm: 4 } }),
    P("p16", "Timo", "Graf", "FL", 25, 18, { schuss: 74, pass: 71, technik: 73, tempo: 77, ausdauer: 75, defensive: 58 }, { salary: 2900, value: 150000, stats: { gp: 9, g: 4, a: 3, pm: 1 } }),
    P("p17", "Nico", "Frei", "FL", 20, 21, { schuss: 72, pass: 66, technik: 74, tempo: 82, ausdauer: 79, defensive: 50 }, { salary: 1500, value: 170000, stats: { gp: 9, g: 3, a: 2, pm: -1 } }),
    P("p18", "Levin", "Baumann", "FL", 23, 24, { schuss: 69, pass: 68, technik: 70, tempo: 74, ausdauer: 73, defensive: 57 }, { salary: 1900, value: 95000, stats: { gp: 9, g: 2, a: 3, pm: 0 } }),
    P("p19", "Jonas", "Moser", "CE", 30, 27, { schuss: 66, pass: 72, technik: 68, tempo: 64, ausdauer: 70, defensive: 72 }, { salary: 2300, value: 60000, stats: { gp: 6, g: 1, a: 2, pm: 1 } }),
    P("p20", "Dario", "Kälin", "FL", 18, 29, { schuss: 67, pass: 62, technik: 69, tempo: 79, ausdauer: 76, defensive: 48 }, { salary: 700, value: 120000, stats: { gp: 4, g: 1, a: 0, pm: 0 } }),
    P("p21", "Cédric", "Favre", "VE", 19, 33, { schuss: 58, pass: 63, technik: 60, tempo: 70, ausdauer: 74, defensive: 69 }, { salary: 700, value: 90000, stats: { gp: 3, g: 0, a: 0, pm: 0 } }),
    P("p22", "Mattia", "Rossi", "FL", 21, 37, { schuss: 70, pass: 64, technik: 71, tempo: 75, ausdauer: 72, defensive: 51 }, { salary: 1100, value: 85000, stats: { gp: 5, g: 1, a: 1, pm: -1 } })
  ];
  const form = { p01: 1, p04: 1, p10: 2, p13: 2, p14: 1, p08: -1, p17: 1, p20: 2 };
  players.forEach(p => { p.form = form[p.id] || 0; });

  // Aufstellung: 3 Linien, 2 Torhüter, Ersatz, je 2 Powerplay- (5 Feldspieler) und Boxplay-Formationen (4 Feldspieler)
  const lineup = {
    goalies: { start: "p01", backup: "p02" },
    lines: [
      { name: "Linie 1", share: 40, VE: ["p04", "p05"], CE: "p10", FL: ["p13", "p14"] },
      { name: "Linie 2", share: 35, VE: ["p07", "p06"], CE: "p11", FL: ["p15", "p16"] },
      { name: "Linie 3", share: 25, VE: ["p08", "p09"], CE: "p12", FL: ["p17", "p18"] }
    ],
    powerplay: [
      { name: "Powerplay 1", VE: ["p04", "p07"], CE: "p10", FL: ["p13", "p15"] },
      { name: "Powerplay 2", VE: ["p05", "p08"], CE: "p11", FL: ["p14", "p16"] }
    ],
    boxplay: [
      { name: "Boxplay 1", VE: ["p04", "p06"], FL: ["p11", "p12"] },
      { name: "Boxplay 2", VE: ["p05", "p09"], FL: ["p19", "p16"] }
    ],
    subs: ["p03", "p19", "p20", "p21", "p22"]
  };

  // Tabelle: S = Sieg (3), SnV = Sieg nach Verlängerung (2), NnV (1), N (0)
  const standings = [
    ["t02", 9, 7, 1, 0, 1, 58, 31], ["t01", 9, 6, 1, 1, 1, 54, 33], ["t05", 9, 6, 0, 1, 2, 49, 38],
    ["t08", 9, 5, 1, 0, 3, 47, 41], ["t03", 9, 4, 1, 1, 3, 44, 42], ["t04", 9, 4, 0, 1, 4, 40, 43],
    ["t07", 9, 3, 1, 0, 5, 37, 46], ["t06", 9, 2, 1, 2, 4, 35, 48], ["t10", 9, 2, 0, 1, 6, 33, 52], ["t09", 9, 1, 0, 0, 8, 28, 51]
  ].map(r => ({ team: r[0], gp: r[1], w: r[2], otw: r[3], otl: r[4], l: r[5], gf: r[6], ga: r[7], pts: r[2] * 3 + r[3] * 2 + r[4] }));

  const fixtures = [
    { id: "m10", round: 10, date: "2026-11-14T17:00", home: "t01", away: "t02", venue: "Tigerhalle Volketswil", comp: "Liga" },
    { id: "m11", round: 11, date: "2026-11-21T19:30", home: "t07", away: "t01", venue: "Thunder Arena", comp: "Liga" },
    { id: "c03", round: 0, date: "2026-11-25T20:00", home: "t01", away: "t09", venue: "Tigerhalle Volketswil", comp: "Cup, Achtelfinal" },
    { id: "m12", round: 12, date: "2026-11-28T17:00", home: "t01", away: "t04", venue: "Tigerhalle Volketswil", comp: "Liga" },
    { id: "m13", round: 13, date: "2026-12-05T18:00", home: "t08", away: "t01", venue: "Comet Dome", comp: "Liga" }
  ];
  const results = [
    { id: "m09", round: 9, date: "2026-11-07", home: "t01", away: "t06", hs: 7, as: 3, ot: false },
    { id: "m08", round: 8, date: "2026-10-31", home: "t05", away: "t01", hs: 5, as: 4, ot: true },
    { id: "m07", round: 7, date: "2026-10-24", home: "t01", away: "t10", hs: 8, as: 2, ot: false },
    { id: "m06", round: 6, date: "2026-10-17", home: "t03", away: "t01", hs: 4, as: 5, ot: true },
    { id: "m05", round: 5, date: "2026-10-10", home: "t01", away: "t08", hs: 6, as: 4, ot: false },
    { id: "m04", round: 4, date: "2026-10-03", home: "t02", away: "t01", hs: 6, as: 3, ot: false }
  ];

  const scorers = [
    ["Noah Keller", "t01", 12, 5], ["Aron Lehmann", "t02", 11, 7], ["Luca Meier", "t01", 8, 11], ["Silvan Roth", "t05", 10, 6],
    ["Joel Imhof", "t08", 9, 6], ["Mikko Laine", "t01", 5, 8], ["Ramon Gisler", "t03", 7, 6], ["Elias Huber", "t01", 7, 6],
    ["Nils Ammann", "t04", 6, 7], ["Ivo Bachmann", "t02", 4, 9]
  ].map(r => ({ name: r[0], team: r[1], g: r[2], a: r[3], pts: r[2] + r[3] }));

  const competitions = [
    { name: "Demo-Liga Ost", type: "Meisterschaft", status: "Runde 9 von 18", note: "Platz 2, 4 Punkte hinter der Spitze" },
    { name: "Schweizer Cup", type: "Pokal", status: "Achtelfinal", note: "Heimspiel gegen Rheintal Ravens am 25. November" },
    { name: "Supercup", type: "Einzelspiel", status: "Saisonende", note: "Qualifikation über Meistertitel oder Cupsieg" }
  ];

  const liveMatch = {
    home: "t01", away: "t02", venue: "Tigerhalle Volketswil", spectators: 842,
    events: [
      { min: 1, type: "start", text: "Anpfiff in der Tigerhalle. Die Falcons beginnen mit Ballbesitz." },
      { min: 4, type: "save", side: "home", text: "Robin Gerber pariert einen Distanzschuss von Aron Lehmann." },
      { min: 7, type: "goal", side: "home", text: "Noah Keller trifft nach Pass von Luca Meier. 1:0!" },
      { min: 11, type: "penalty", side: "away", text: "2 Minuten gegen Ivo Bachmann (Stockschlag). Powerplay für die Tigers." },
      { min: 12, type: "goal", side: "home", text: "Powerplay-Tor! Ondřej Novák schiesst unhaltbar ins hohe Eck. 2:0." },
      { min: 18, type: "goal", side: "away", text: "Aron Lehmann verkürzt nach einem schnellen Konter. 2:1." },
      { min: 20, type: "period", text: "Ende des ersten Drittels." },
      { min: 26, type: "save", side: "away", text: "Grosse Chance für Elias Huber, aber der Falcons-Torhüter ist zur Stelle." },
      { min: 31, type: "penalty", side: "home", text: "2 Minuten gegen Marco Wyss (Behinderung). Boxplay für die Tigers." },
      { min: 33, type: "save", side: "home", text: "Das Boxplay hält. Gerber mit zwei starken Paraden." },
      { min: 38, type: "goal", side: "home", text: "Mikko Laine vollendet eine schöne Kombination der zweiten Linie. 3:1." },
      { min: 40, type: "period", text: "Ende des zweiten Drittels." },
      { min: 45, type: "goal", side: "away", text: "Die Falcons kommen zurück. Silvan Roth trifft zum 3:2." },
      { min: 52, type: "save", side: "home", text: "Gerber rettet mit dem Schoner gegen einen Nachschuss." },
      { min: 57, type: "goal", side: "home", text: "Noah Keller macht mit seinem zweiten Treffer alles klar. 4:2!" },
      { min: 60, type: "end", text: "Schlusspfiff! Die Tigers gewinnen 4:2 gegen den Tabellenführer." }
    ],
    statsTemplate: { shots: [0, 0], possession: [50, 50], penalties: [0, 0], saves: [0, 0] }
  };

  const transferList = [
    { id: "x01", name: "Matthias Kunz", pos: "CE", age: 24, club: "Aarau Arrows", ovr: 77, price: 210000, ends: "2 Tage" },
    { id: "x02", name: "Henrik Sjöberg", pos: "VE", age: 28, club: "Vereinslos", ovr: 79, price: 160000, ends: "5 Std." },
    { id: "x03", name: "Raphael Egli", pos: "FL", age: 19, club: "Rheintal Ravens", ovr: 71, price: 140000, ends: "1 Tag" },
    { id: "x04", name: "Daniel Furrer", pos: "TH", age: 31, club: "Thurgau Thunder", ovr: 78, price: 120000, ends: "3 Tage" },
    { id: "x05", name: "Joel Imhof", pos: "FL", age: 26, club: "Zug Comets", ovr: 82, price: 390000, ends: "4 Tage" },
    { id: "x06", name: "Tuomas Virtanen", pos: "CE", age: 30, club: "Vereinslos", ovr: 80, price: 180000, ends: "12 Std." },
    { id: "x07", name: "Lukas Schär", pos: "VE", age: 22, club: "Limmattal Lynx", ovr: 74, price: 135000, ends: "2 Tage" },
    { id: "x08", name: "Adrian Wenger", pos: "FL", age: 33, club: "Uster Wolves", ovr: 75, price: 70000, ends: "6 Std." },
    { id: "x09", name: "Petr Dvořák", pos: "VE", age: 27, club: "Seebach Sharks", ovr: 78, price: 230000, ends: "3 Tage" },
    { id: "x10", name: "Gian Caduff", pos: "TH", age: 20, club: "Wil Wildcats", ovr: 70, price: 90000, ends: "1 Tag" },
    { id: "x11", name: "Florian Hug", pos: "CE", age: 21, club: "Glattal Falcons", ovr: 73, price: 175000, ends: "5 Tage" },
    { id: "x12", name: "Emil Nyström", pos: "FL", age: 23, club: "Vereinslos", ovr: 76, price: 150000, ends: "2 Tage" }
  ];
  const bids = [
    { player: "Henrik Sjöberg", pos: "VE", amount: 150000, status: "Überboten", note: "Höchstgebot jetzt CHF 160’000" },
    { player: "Raphael Egli", pos: "FL", amount: 140000, status: "Führend", note: "Endet in 1 Tag" },
    { player: "Gian Caduff", pos: "TH", amount: 80000, status: "Abgelehnt", note: "Verein will mindestens CHF 90’000" }
  ];

  const news = [
    { id: "n1", date: "2026-11-07", tag: "Liga", title: "Tigers feiern dritten Heimsieg in Folge", text: "Mit einem 7:3 gegen Limmattal festigt Volketswil Platz zwei. Noah Keller trifft doppelt und führt jetzt die Skorerliste an.", top: true },
    { id: "n2", date: "2026-11-06", tag: "Transfer", title: "Falcons holen schwedischen Verteidiger", text: "Der Tabellenführer verstärkt sich für die Rückrunde." },
    { id: "n3", date: "2026-11-05", tag: "Cup", title: "Achtelfinal-Lose sind gezogen", text: "Volketswil empfängt die Rheintal Ravens zu Hause." },
    { id: "n4", date: "2026-11-04", tag: "Verein", title: "Fanclub knackt die 600er-Marke", text: "So viele Mitglieder hatte der Verein noch nie." },
    { id: "n5", date: "2026-11-02", tag: "International", title: "Champions Cup: Gruppen stehen fest", text: "Zwölf Klubs aus acht Ländern spielen um den Titel." },
    { id: "n6", date: "2026-11-01", tag: "Training", title: "Elias Huber steigert sein Tempo", text: "Der Flügel hat im Training spürbar zugelegt." },
    { id: "n7", date: "2026-10-30", tag: "Liga", title: "Verlängerung in Wil", text: "Knappes 4:5 nach Verlängerung bringt immerhin einen Punkt." }
  ];

  const finances = {
    balance: 1284500, change: 48200,
    income: [ { label: "Ticketverkauf", amount: 214000 }, { label: "Sponsoren", amount: 380000 }, { label: "TV und Streaming", amount: 96000 }, { label: "Fanartikel", amount: 41500 }, { label: "Transfers", amount: 60000 } ],
    expenses: [ { label: "Spielerlöhne", amount: 486000 }, { label: "Stadion und Unterhalt", amount: 92000 }, { label: "Training und Staff", amount: 74000 }, { label: "Reisen", amount: 28500 }, { label: "Nachwuchs", amount: 39000 } ],
    months: [ { m: "Aug", in: 62, out: 71 }, { m: "Sep", in: 108, out: 96 }, { m: "Okt", in: 131, out: 102 }, { m: "Nov", in: 118, out: 99 }, { m: "Dez", in: 0, out: 0 }, { m: "Jan", in: 0, out: 0 }, { m: "Feb", in: 0, out: 0 }, { m: "Mär", in: 0, out: 0 } ]
  };

  const training = {
    week: [
      { day: "Mo", type: "Ruhetag", intensity: 0 },
      { day: "Di", type: "Technik", intensity: 2 },
      { day: "Mi", type: "Kondition", intensity: 3 },
      { day: "Do", type: "Taktik", intensity: 2 },
      { day: "Fr", type: "Abschluss", intensity: 1 },
      { day: "Sa", type: "Spiel", intensity: 3, match: "vs. Glattal Falcons" },
      { day: "So", type: "Regeneration", intensity: 1 }
    ],
    focus: [ { label: "Schuss", value: 30 }, { label: "Passspiel", value: 25 }, { label: "Kondition", value: 20 }, { label: "Defensive", value: 15 }, { label: "Torhüter", value: 10 } ],
    progress: [ { player: "p14", attr: "Tempo", from: 84, to: 86 }, { player: "p20", attr: "Technik", from: 66, to: 69 }, { player: "p13", attr: "Schuss", from: 84, to: 85 }, { player: "p21", attr: "Defensive", from: 67, to: 69 }, { player: "p08", attr: "Tempo", from: 72, to: 73 } ]
  };

  const club = {
    name: "UHC Volketswil Tigers", founded: 1994, city: "Volketswil", colors: "Dunkelblau und Türkis", manager: "Demo-Manager",
    stadium: { name: "Tigerhalle Volketswil", capacity: 1200, level: 2, avgAttendance: 905, levels: [
      { level: 1, capacity: 600, cost: 0, label: "Turnhalle" },
      { level: 2, capacity: 1200, cost: 0, label: "Vereinshalle" },
      { level: 3, capacity: 2500, cost: 450000, label: "Regionale Arena" },
      { level: 4, capacity: 5000, cost: 1400000, label: "Grosse Arena" },
      { level: 5, capacity: 9000, cost: 3800000, label: "Nationalarena" } ] },
    fans: { mood: 78, members: 642, fanclubs: 3, trend: 24 }
  };

  // Ligen weltweit (Spielwelt; Klubanzahl als Demo)
  const leagues = [
    { region: "Europa", country: "Schweiz", flag: "SUI", tiers: 3, clubs: 36 },
    { region: "Europa", country: "Schweden", flag: "SWE", tiers: 3, clubs: 42 },
    { region: "Europa", country: "Finnland", flag: "FIN", tiers: 3, clubs: 40 },
    { region: "Europa", country: "Tschechien", flag: "CZE", tiers: 3, clubs: 36 },
    { region: "Europa", country: "Norwegen", flag: "NOR", tiers: 2, clubs: 20 },
    { region: "Europa", country: "Dänemark", flag: "DEN", tiers: 2, clubs: 18 },
    { region: "Europa", country: "Deutschland", flag: "GER", tiers: 2, clubs: 24 },
    { region: "Europa", country: "Lettland", flag: "LAT", tiers: 2, clubs: 16 },
    { region: "Europa", country: "Slowakei", flag: "SVK", tiers: 2, clubs: 16 },
    { region: "Europa", country: "Polen", flag: "POL", tiers: 1, clubs: 12 },
    { region: "Europa", country: "Österreich", flag: "AUT", tiers: 1, clubs: 10 },
    { region: "Nordamerika", country: "Kanada", flag: "CAN", tiers: 1, clubs: 10 },
    { region: "Nordamerika", country: "USA", flag: "USA", tiers: 1, clubs: 12 },
    { region: "Asien und Ozeanien", country: "Japan", flag: "JPN", tiers: 1, clubs: 10 },
    { region: "Asien und Ozeanien", country: "Singapur", flag: "SGP", tiers: 1, clubs: 8 },
    { region: "Asien und Ozeanien", country: "Thailand", flag: "THA", tiers: 1, clubs: 8 },
    { region: "Asien und Ozeanien", country: "Australien", flag: "AUS", tiers: 1, clubs: 8 }
  ];
  const intlCompetitions = [
    { name: "Champions Cup", level: "Klubs", teams: 12, status: "Gruppenphase ab Januar", qualified: false, note: "Für die besten zwei jeder Top-Liga" },
    { name: "Continental Trophy", level: "Klubs", teams: 24, status: "Qualifikation läuft", qualified: true, note: "Volketswil ist als Liga-Zweiter auf Kurs" },
    { name: "Weltpokal der Vereine", level: "Klubs", teams: 8, status: "Sommerpause", qualified: false, note: "Meister aus Europa, Amerika und Asien" },
    { name: "Nationen-WM", level: "Nationalteams", teams: 16, status: "Dezember", qualified: true, note: "Alle zwei Spielzeiten" },
    { name: "U19-WM", level: "Nachwuchs", teams: 16, status: "Mai", qualified: true, note: "Talente aus allen Ligen" }
  ];
  const nationalRanking = [
    ["Schweden", "SWE", 2310], ["Finnland", "FIN", 2265], ["Schweiz", "SUI", 2140], ["Tschechien", "CZE", 2085],
    ["Norwegen", "NOR", 1810], ["Lettland", "LAT", 1755], ["Dänemark", "DEN", 1690], ["Deutschland", "GER", 1655],
    ["Slowakei", "SVK", 1610], ["Polen", "POL", 1470], ["Kanada", "CAN", 1390], ["Japan", "JPN", 1360]
  ].map((r, i) => ({ rank: i + 1, country: r[0], code: r[1], points: r[2] }));

  const friendlies = {
    open: [
      { opponent: "Seebach Sharks", date: "2026-12-20", home: true, status: "Wartet auf Antwort" },
      { opponent: "Team Helsinki Demo", date: "2026-12-28", home: false, status: "Angenommen" }
    ],
    past: [
      { opponent: "Aarau Arrows", date: "2026-08-16", hs: 6, as: 3, home: true },
      { opponent: "Uster Wolves", date: "2026-08-09", hs: 4, as: 4, home: false },
      { opponent: "Göteborg Demo", date: "2026-08-02", hs: 3, as: 7, home: false }
    ]
  };

  const teamStats = {
    kpis: [ { label: "Tore pro Spiel", value: "6,0" }, { label: "Gegentore pro Spiel", value: "3,7" }, { label: "Powerplay-Quote", value: "27 %" }, { label: "Boxplay-Quote", value: "84 %" }, { label: "Schüsse pro Spiel", value: "31,4" }, { label: "Fangquote Torhüter", value: "90,8 %" } ],
    compare: [ { label: "Tore", own: 6.0, avg: 4.7 }, { label: "Gegentore", own: 3.7, avg: 4.7 }, { label: "Schüsse", own: 31.4, avg: 27.9 }, { label: "Strafminuten", own: 5.2, avg: 6.8 } ]
  };

  const settings = {
    managerName: "Demo-Manager", clubName: "UHC Volketswil Tigers", country: "Schweiz", email: "",
    notifications: { matchStart: true, transfers: true, news: false, weekly: true },
    language: "de", timezone: "Europe/Zurich"
  };

  return { teams, players, lineup, standings, fixtures, results, scorers, competitions, liveMatch, transferList, bids, news, finances, training, club, leagues, intlCompetitions, nationalRanking, friendlies, teamStats, settings };
})();
