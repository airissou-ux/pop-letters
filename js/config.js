// POP LETTERS — config.js
// ==================================================

// ═══════════════════════════════════════════════
// SUPABASE CONFIG
// ═══════════════════════════════════════════════
const SUPABASE_URL = "https://jpplgrntcihsptjthita.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcGxncm50Y2loc3B0anRoaXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MTExODAsImV4cCI6MjA5NjQ4NzE4MH0.3MUzBoE2b7_PAXKgNjeWx3txfdFOicKqLnr8GStJ4vY";

let currentUser = null;
let userProfile = null;
let isDailyMode = false;
let isDuelMode  = false;
let duelId      = null;
let duelChannel = null;
let lastGameResult = null;
const gameDetailStore = {}; // stockage temporaire des parties pour le détail

// Init Supabase (SDK chargé en <head>)
window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
document.addEventListener("DOMContentLoaded", initApp);

async async function initApp() {
  loadDictionary();
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    currentUser = session.user;
    await loadUserProfile();
    updateProfileUI();
    buildSplash();
    showScreen("splash");
  } else {
    showScreen("auth");
  }
}
