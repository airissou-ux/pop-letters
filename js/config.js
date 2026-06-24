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

async function initApp() {
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
const DICT_URL = "https://raw.githubusercontent.com/lorenbrichter/Words/master/Words/fr.txt";

const LETTER_POOL = [
  ...Array(9).fill("A"), ...Array(2).fill("B"), ...Array(2).fill("C"),
  ...Array(3).fill("D"), ...Array(15).fill("E"), ...Array(2).fill("F"),
  ...Array(2).fill("G"), ...Array(2).fill("H"), ...Array(8).fill("I"),
  ...Array(1).fill("J"), ...Array(1).fill("K"), ...Array(5).fill("L"),
  ...Array(3).fill("M"), ...Array(6).fill("N"), ...Array(6).fill("O"),
  ...Array(2).fill("P"), ...Array(1).fill("Q"), ...Array(6).fill("R"),
  ...Array(6).fill("S"), ...Array(6).fill("T"), ...Array(6).fill("U"),
  ...Array(2).fill("V"), ...Array(1).fill("W"), ...Array(1).fill("X"),
  ...Array(1).fill("Y"), ...Array(1).fill("Z"),
];

const DIFFICULTY = [
  { label:"Slow",   icon:"🐌",    ms:5000 },
  { label:"Cool",   icon:"🐢",    ms:4000 },
  { label:"Sharp",  icon:"🐟",    ms:3000 },
  { label:"Fast",   icon:"🐎",    ms:2000 },
  { label:"Insane", icon:"🐦‍🔥", ms:1000 },
];

let DICT = new Set();
