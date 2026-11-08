/*
  FloorTactix · Datenschicht (API)
  --------------------------------
  Jede Seite holt ihre Daten NUR über diese Funktionen. Heute liefern sie die
  Demo-Daten. In Etappe 2 wird pro Funktion die Supabase-Abfrage ergänzt
  (Tabellennamen stehen jeweils dabei, siehe docs/datenmodell.md).
  Alle Funktionen sind asynchron (geben ein Promise zurück), damit sich der
  Aufruf auf den Seiten beim Umstieg nicht ändert.
*/
(function () {
  const cfg = window.FT_CONFIG || { dataSource: "demo" };
  const D = window.FT_DEMO;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const demo = (fn) => Promise.resolve(clone(fn()));

  function notConnected(table) {
    return Promise.reject(new Error("Supabase ist noch nicht verbunden (Tabelle: " + table + ")."));
  }
  const useDemo = cfg.dataSource !== "supabase";

  const api = {
    isDemo: useDemo,

    // Tabelle: clubs (+ stadiums, fan_stats)
    getClub: () => useDemo ? demo(() => D.club) : notConnected("clubs"),
    // Tabelle: teams (Liga-Teilnehmer der Saison)
    getTeams: () => useDemo ? demo(() => D.teams) : notConnected("teams"),
    // Tabelle: players (where club_id = eigener Verein)
    getSquad: () => useDemo ? demo(() => D.players) : notConnected("players"),
    getPlayer: (id) => useDemo ? demo(() => D.players.find(p => p.id === id) || null) : notConnected("players"),
    // Tabellen: lineups, lineup_slots
    getLineup: () => useDemo ? demo(() => D.lineup) : notConnected("lineups"),
    // Tabelle: matches (status = scheduled / finished)
    getFixtures: () => useDemo ? demo(() => D.fixtures) : notConnected("matches"),
    getResults: () => useDemo ? demo(() => D.results) : notConnected("matches"),
    // View: league_standings
    getStandings: () => useDemo ? demo(() => D.standings) : notConnected("league_standings"),
    // View: top_scorers
    getScorers: () => useDemo ? demo(() => D.scorers) : notConnected("top_scorers"),
    // Tabelle: competitions
    getCompetitions: () => useDemo ? demo(() => D.competitions) : notConnected("competitions"),
    // Tabelle: match_events (später live über Supabase Realtime)
    getLiveMatch: () => useDemo ? demo(() => D.liveMatch) : notConnected("match_events"),
    // Tabelle: transfer_listings
    getTransferList: () => useDemo ? demo(() => D.transferList) : notConnected("transfer_listings"),
    // Tabelle: transfer_bids
    getBids: () => useDemo ? demo(() => D.bids) : notConnected("transfer_bids"),
    placeBid: (listingId, amount) => useDemo ? Promise.resolve({ demo: true, listingId, amount }) : notConnected("transfer_bids"),
    // Tabelle: news
    getNews: () => useDemo ? demo(() => D.news) : notConnected("news"),
    // Tabelle: finance_transactions (+ View finance_summary)
    getFinances: () => useDemo ? demo(() => D.finances) : notConnected("finance_transactions"),
    // Tabelle: training_plans
    getTraining: () => useDemo ? demo(() => D.training) : notConnected("training_plans"),
    // Tabelle: tactics
    getTactics: () => useDemo ? demo(() => ({ system: "2-1-2", pressing: 60, tempo: 70, hardness: 40, risk: 50, shift: 45 })) : notConnected("tactics"),
    saveTactics: (t) => useDemo ? Promise.resolve({ demo: true, saved: t }) : notConnected("tactics"),
    // Tabellen: leagues, countries
    getLeagues: () => useDemo ? demo(() => D.leagues) : notConnected("leagues"),
    getIntlCompetitions: () => useDemo ? demo(() => D.intlCompetitions) : notConnected("competitions"),
    // Tabelle: national_teams
    getNationalRanking: () => useDemo ? demo(() => D.nationalRanking) : notConnected("national_teams"),
    // Tabelle: friendly_requests
    getFriendlies: () => useDemo ? demo(() => D.friendlies) : notConnected("friendly_requests"),
    requestFriendly: (req) => useDemo ? Promise.resolve({ demo: true, req }) : notConnected("friendly_requests"),
    // View: team_stats
    getTeamStats: () => useDemo ? demo(() => D.teamStats) : notConnected("team_stats"),
    // Tabelle: profiles (Supabase Auth)
    getSettings: () => useDemo ? demo(() => D.settings) : notConnected("profiles"),
    saveSettings: (s) => useDemo ? Promise.resolve({ demo: true, saved: s }) : notConnected("profiles")
  };

  window.FT = window.FT || {};
  window.FT.api = api;
})();
