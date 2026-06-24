// POP LETTERS — auth.js
// ==================================================

// ── AUTH ──
let authMode = "login";
let selectedEmoji = "🎯";
let editEmojiSelected = null;
let pseudoCheckTimer = null;
let editPseudoTimer  = null;

const EMOJI_CATEGORIES = {
  "Animaux":["🐶","🐱","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐧","🦆","🦅","🦉","🐺","🐴","🦄","🐝","🦋","🐌","🐢","🐍","🐙","🐠","🐟","🐬","🐳","🦈","🐆","🐅","🦒","🐘","🐕","🐈","🐇","🦔"],
  "Visages":["😀","😎","🥳","🤩","😍","🥰","🙂","🤗","🤔","😏","😎","🤓","🧐","😈","👿","💀","👻","👽","🤖","💩","🎃"],
  "Sports":["⚽","🏀","🎾","🎱","🥊","🥋","🎯","🎮","🕹","🎲","🎨","🎤","🎸","🎵","🎶","🏆","🥇"],
  "Nature":["🌸","🌺","🌻","🌹","🍀","🌿","🌵","🌲","🌴","🌊","🌈","❄","🔥","⚡","🌙","⭐","🌟","💫","✨","☄","🌞","🪐"],
  "Objets":["💎","👑","🏆","🎯","💡","🔑","💰","💻","📱","🎁","🎀","🧸","❤","🧡","💛","💚","💙","💜","🖤","🤍","💯"],
};
const EMOJI_LIST = Object.values(EMOJI_CATEGORIES).flat();

function switchAuthTab(mode) {
  authMode = mode;
  document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
  document.getElementById("tab-" + mode).classList.add("active");
  const sf = document.getElementById("signup-fields");
  if (sf) sf.style.display = mode === "signup" ? "block" : "none";
  if (mode === "signup") buildAuthEmojiPicker();
  document.getElementById("auth-submit-btn").textContent = mode === "login" ? "SE CONNECTER" : "CRÉER MON COMPTE";
  hideAuthError();
}
function showAuthError(msg) { const e=document.getElementById("auth-error"); e.textContent=msg; e.classList.add("show"); }
function hideAuthError() { document.getElementById("auth-error").classList.remove("show"); }

function selectEmoji(e) {
  selectedEmoji = e;
  document.querySelectorAll("#emoji-pick .emoji-opt").forEach(el => el.classList.toggle("sel", el.dataset.emoji===e));
  const h=document.getElementById("emoji-selected-hint"); if(h) h.textContent="Emoji choisi : "+e;
}
function buildAuthEmojiPicker() {
  const p=document.getElementById("emoji-pick"); if(!p||p.dataset.built) return; p.dataset.built="1";
  p.innerHTML=Object.entries(EMOJI_CATEGORIES).map(([cat,emojis])=>
    `<div class="emoji-cat-title">${cat}</div><div class="emoji-cat-grid">${emojis.map(e=>
      `<div class="emoji-opt${e===selectedEmoji?" sel":""}" data-emoji="${e}" onclick="selectEmoji('${e}')">${e}</div>`
    ).join("")}</div>`).join("");
}

async function handleAuth() {
  const email    = (document.getElementById("input-email")?.value||"").trim();
  const password = document.getElementById("input-password")?.value||"";
  const pseudo   = (document.getElementById("input-pseudo")?.value||"").trim();
  hideAuthError();
  if (!email||!password) { showAuthError("Email et mot de passe requis."); return; }
  const btn=document.getElementById("auth-submit-btn");
  btn.textContent="…"; btn.disabled=true;
  try {
    if (authMode==="signup") {
      if (pseudo.length<3) { showAuthError("Pseudo requis (3 caractères min.)"); return; }
      const {data:ex} = await sb.from("profiles").select("id").eq("pseudo",pseudo).maybeSingle();
      if (ex) { showAuthError("Ce pseudo est déjà pris."); return; }
      const {data:sd, error:se} = await sb.auth.signUp({email,password});
      if (se) throw se;
      currentUser = sd.user;
      if (!currentUser) throw new Error("Compte non créé. Réessaie.");
      // Créer le profil
      const {data:pd, error:pe} = await sb.from("profiles").upsert(
        {id:currentUser.id, pseudo, emoji:selectedEmoji||"🎯", best_score:0, total_games:0},
        {onConflict:"id"}
      ).select().maybeSingle();
      if (pe) throw new Error("Profil non créé: " + pe.message);
      userProfile = pd || {id:currentUser.id, pseudo, emoji:selectedEmoji||"🎯"};
    } else {
      const {data:ld, error:le} = await sb.auth.signInWithPassword({email,password});
      if (le) throw le;
      currentUser = ld.user;
      await loadUserProfile();
    }
    updateProfileUI();
    buildSplash();
    showScreen("splash");
  } catch(err) {
    const m=err.message||"";
    showAuthError(
      m.includes("Invalid")||m.includes("credentials") ? "Email ou mot de passe incorrect." :
      m.includes("already registered") ? "Email déjà utilisé." :
      m.includes("Password") ? "Mot de passe trop court (6 car. min.)." : m
    );
  } finally {
    btn.textContent=authMode==="login"?"SE CONNECTER":"CRÉER MON COMPTE";
    btn.disabled=false;
  }
}

async function handleLogout() {
  await sb.auth.signOut();
  currentUser=null; userProfile=null;
  updateProfileUI();
  closeModal("modal-profile");
  showScreen("auth");
}

async function skipAuth() { buildSplash(); showScreen("splash"); }

async function loadUserProfile() {
  if (!currentUser) return;
  const {data,error} = await sb.from("profiles").select("*").eq("id",currentUser.id).maybeSingle();
  if (error) { console.error("loadUserProfile:",error.message); return; }
  if (data) {
    userProfile = data;
  } else {
    const blank = {id:currentUser.id, emoji:"🎯", best_score:0, total_games:0};
    await sb.from("profiles").upsert(blank,{onConflict:"id"});
    userProfile = blank;
  }
}

function updateProfileUI() {
  const emoji  = userProfile?.emoji  || "👤";
  const pseudo = userProfile?.pseudo || null;
  const label  = pseudo ? (pseudo.length>8?pseudo.slice(0,8)+"…":pseudo) : "Profil";
  [["nav-profile-emoji-splash","nav-profile-pseudo-splash"],
   ["nav-profile-emoji-game",  "nav-profile-pseudo-game"],
   ["nav-profile-emoji-go",    "nav-profile-pseudo-go"]
  ].forEach(([eid,pid])=>{
    const e=document.getElementById(eid); if(e) e.textContent=emoji;
    const p=document.getElementById(pid); if(p) p.textContent=label;
  });
}

// ── MODALS ──
function openModal(id) {
  document.getElementById(id).classList.remove("hidden");
  if (id==="modal-profile") renderProfileModal();
}
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

// ── PROFIL ──
async function renderProfileModal() {
  const logoutBtn = document.querySelector(".logout-btn");
  if (!currentUser) {
    document.getElementById("profile-hero-emoji").textContent="👤";
    document.getElementById("profile-hero-pseudo").textContent="Non connecté";
    document.getElementById("stats-grid").innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--dim);font-size:13px;">
      <button class="auth-btn" style="font-size:14px;padding:11px;" onclick="closeModal('modal-profile');showScreen('auth')">Se connecter</button></div>`;
    document.getElementById("history-list").innerHTML="";
    if(logoutBtn) logoutBtn.style.display="none";
    document.querySelectorAll(".profile-section-title,.profile-action-btn,.delete-confirm").forEach(el=>el.style.display="none");
    return;
  }
  if(logoutBtn) logoutBtn.style.display="block";
  document.querySelectorAll(".profile-section-title,.profile-action-btn").forEach(el=>el.style.display="");

  // Recharger profil frais
  await loadUserProfile();
  updateProfileUI();

  document.getElementById("profile-hero-emoji").textContent  = userProfile?.emoji  || "🎯";
  document.getElementById("profile-hero-pseudo").textContent = userProfile?.pseudo || "✏️ Choisir un pseudo";
  
  // Préparer edit emoji
  const ep=document.getElementById("edit-emoji-pick");
  if(ep) {
    ep.innerHTML='<div class="emoji-picker">'+Object.entries(EMOJI_CATEGORIES).map(([cat,emojis])=>
      `<div class="emoji-cat-title">${cat}</div><div class="emoji-cat-grid">${emojis.map(e=>
        `<div class="emoji-opt${e===userProfile?.emoji?" sel":""}" data-emoji="${e}" onclick="selectEditEmoji('${e}')">${e}</div>`
      ).join("")}</div>`).join("")+'</div>';
    editEmojiSelected=userProfile?.emoji||"🎯";
  }

  // Stats
  const {data:games} = await sb.from("games").select("*").eq("user_id",currentUser.id).order("score",{ascending:false}).limit(50);
  const total=games?.length||0, best=games?Math.max(0,...games.map(g=>g.score)):0;
  const avg=total?Math.round(games.reduce((s,g)=>s+g.score,0)/total):0;
  const words=games?games.reduce((s,g)=>s+(g.word_count||0),0):0;
  document.getElementById("stats-grid").innerHTML=`
    <div class="stat-card"><div class="stat-val">${total}</div><div class="stat-lbl">Parties</div></div>
    <div class="stat-card"><div class="stat-val">${best}</div><div class="stat-lbl">Meilleur score</div></div>
    <div class="stat-card"><div class="stat-val">${avg}</div><div class="stat-lbl">Score moyen</div></div>
    <div class="stat-card"><div class="stat-val">${words}</div><div class="stat-lbl">Mots trouvés</div></div>`;

  // Historique
  const hl=document.getElementById("history-list");
  if (!games||!games.length) { hl.innerHTML='<div style="text-align:center;color:var(--dim);font-size:13px;padding:16px;">Aucune partie</div>'; return; }
  hl.innerHTML=games.slice(0,20).map((g,i)=>{
    const legacyIcons={"Moon":"🌙","Star":"⭐","Comet":"☄️","Nova":"🌟","Supernova":"💫"};
    const icon=DIFFICULTY.find(d=>d.label===g.level)?.icon||legacyIcons[g.level]||"🎮";
    const date=new Date(g.created_at).toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
    gameDetailStore["game_"+i]=g;
    return `<div class="history-item" style="cursor:pointer;" onclick="openGameDetail('game_${i}')">
      <div class="history-left"><div class="history-score">${g.score} pts</div>
      <div class="history-meta">${g.word_count||0} mot${(g.word_count||0)>1?"s":""} · ${g.level||""}</div></div>
      <div class="history-right"><div class="history-level">${icon}</div>
      <div class="history-date">${date}</div><div style="font-size:9px;color:var(--dim);margin-top:2px;">voir →</div></div>
    </div>`;
  }).join("");
}

function toggleEditBox(id) {
  document.querySelectorAll(".profile-edit-box").forEach(el=>{if(el.id!==id)el.classList.remove("show");});
  document.getElementById(id).classList.toggle("show");
}

// ── EDIT PSEUDO ──
async function checkEditPseudo() {
  const input=document.getElementById("edit-pseudo-input");
  const status=document.getElementById("edit-pseudo-status");
  const save=document.getElementById("edit-pseudo-save");
  const val=input.value.trim();
  save.disabled=true;
  if (val.length<3) { input.className="edit-input"; status.textContent=val.length>0?"3 car. minimum":""; status.className="edit-status taken"; return; }
  if (val===userProfile?.pseudo) { input.className="edit-input ok"; status.textContent="Pseudo actuel"; status.className="edit-status ok"; return; }
  status.textContent="Vérification…"; status.className="edit-status checking"; input.className="edit-input";
  clearTimeout(editPseudoTimer);
  editPseudoTimer=setTimeout(async()=>{
    const {data}=await sb.from("profiles").select("id").eq("pseudo",val).maybeSingle();
    if(data){input.className="edit-input taken";status.textContent="❌ Pseudo déjà pris";status.className="edit-status taken";save.disabled=true;}
    else{input.className="edit-input ok";status.textContent="✓ Disponible";status.className="edit-status ok";save.disabled=false;}
  },500);
}

async function saveEditPseudo() {
  const val=document.getElementById("edit-pseudo-input").value.trim();
  if(!val||val.length<3||!currentUser) return;
  const btn=document.getElementById("edit-pseudo-save"); btn.disabled=true; btn.textContent="…";
  const {error}=await sb.from("profiles").update({pseudo:val}).eq("id",currentUser.id);
  if(error){showToast("Erreur: "+error.message);btn.textContent="OK";btn.disabled=false;return;}
  userProfile.pseudo=val;
  document.getElementById("profile-hero-pseudo").textContent=val;
  updateProfileUI();
  document.getElementById("edit-pseudo-box").classList.remove("show");
  showToast("Pseudo mis à jour !");
  btn.textContent="OK";
}

// ── EDIT EMOJI ──
async function selectEditEmoji(e) {
  editEmojiSelected=e;
  document.querySelectorAll("#edit-emoji-pick .emoji-opt").forEach(el=>el.classList.toggle("sel",el.dataset.emoji===e));
  document.getElementById("edit-emoji-save").disabled=(e===userProfile?.emoji);
}
async function saveEditEmoji() {
  if(!editEmojiSelected||!currentUser) return;
  const btn=document.getElementById("edit-emoji-save"); btn.disabled=true; btn.textContent="…";
  const {error}=await sb.from("profiles").update({emoji:editEmojiSelected}).eq("id",currentUser.id);
  if(error){showToast("Erreur: "+error.message);btn.textContent="Enregistrer";btn.disabled=false;return;}
  userProfile.emoji=editEmojiSelected;
  document.getElementById("profile-hero-emoji").textContent=editEmojiSelected;
  updateProfileUI();
  document.getElementById("edit-emoji-box").classList.remove("show");
  showToast("Emoji mis à jour !");
  btn.textContent="Enregistrer";
}

// ── GAME DETAIL ──
function openGameDetail(key) {
  const g = gameDetailStore[key];
  if (!g) { showToast("Détail non disponible"); return; }
  const d = new Date(g.created_at);
  const date = d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const legacyIcons = {"Moon":"🌙","Star":"⭐","Comet":"☄️","Nova":"🌟","Supernova":"💫"};
  const icon = DIFFICULTY.find(d=>d.label===g.level)?.icon || legacyIcons[g.level] || "🎮";
  const words = g.words || [];
  const modeTag = g.is_daily ? "⭐ POP du jour" : g.level || "";
  document.getElementById("game-detail-content").innerHTML = `
    <div class="detail-header">
      <div style="font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);margin-bottom:6px;">${modeTag} · ${date}</div>
      <div class="detail-score">${g.score}</div>
      <div class="detail-meta">${icon} ${g.level||""} · ${g.word_count||0} mot${(g.word_count||0)>1?"s":""} trouvé${(g.word_count||0)>1?"s":""}</div>
    </div>
    ${words.length > 0
      ? `<div style="font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);margin-bottom:8px;font-weight:700;">Mots trouvés</div>
         <div class="detail-words">${words.map(w=>`<span class="detail-chip">${w}</span>`).join("")}</div>`
      : `<div style="text-align:center;color:var(--dim);font-size:13px;padding:16px;">Aucun mot enregistré pour cette partie</div>`
    }`;
  closeModal("modal-profile");
  document.getElementById("modal-game-detail").classList.remove("hidden");
}

// ── SAVE GAME ──
async function saveGame(score, wordList, level) {
  if (!currentUser) return;
  await sb.from("games").insert({
    user_id: currentUser.id, score, word_count: wordList.length,
    words: wordList, level, is_daily: isDailyMode,
    created_at: new Date().toISOString()
  });
  if (userProfile && score > (userProfile.best_score||0)) {
    await sb.from("profiles").update({best_score:score}).eq("id",currentUser.id);
    userProfile.best_score = score;
  }
}

// ── SUPPRESSION COMPTE ──
async function toggleDeleteConfirm() { document.getElementById("delete-confirm").classList.toggle("show"); }
async function deleteAccount() {
  if(!currentUser) return;
  const btn=document.querySelector(".btn-delete-confirm"); if(btn){btn.disabled=true;btn.textContent="…";}
  try {
    await sb.from("games").delete().eq("user_id",currentUser.id);
    await sb.from("profiles").delete().eq("id",currentUser.id);
    await sb.auth.signOut();
    currentUser=null; userProfile=null;
    updateProfileUI(); closeModal("modal-profile");
    showToast("Compte supprimé."); showScreen("auth");
  } catch(e) { showToast("Erreur: "+e.message); if(btn){btn.disabled=false;btn.textContent="Supprimer";} }
}
