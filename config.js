/*
  FloorTactix · Zentrale Einstellungen
  ------------------------------------
  dataSource: "demo"      -> alle Seiten zeigen die erfundenen Daten aus demo-data.js
              "supabase"  -> (Etappe 2) Daten kommen live aus der Supabase-Datenbank

  Für Supabase später hier eintragen (der "anon key" ist öffentlich und darf im
  Browser stehen; geschützt wird über die Zugriffsregeln in der Datenbank):
*/
window.FT_CONFIG = {
  dataSource: "demo",
  supabaseUrl: "",
  supabaseAnonKey: "",
  siteUrl: "https://floortactix.com",
  currency: "CHF",
  locale: "de-CH"
};
