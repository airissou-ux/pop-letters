// POP LETTERS — social.js
// ==================================================

// ── POP DU JOUR ──
function getDailyDate() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`;
}
function getDailySeed() {
  const date = getDailyDate();
  let h = 0;
  for (let i=0;i<date.length;i++){h=((h<<5)-h)+date.charCodeAt(i);h|=0;}
  return Math.abs(h);
}
function seededShuffle(arr, seed) {
  const a=[...arr]; let s=seed;
  for(let i=a.length-1;i>0;i--){
    s=(s*1664525+1013904223)&0xFFFFFFFF;
    const j=Math.abs(s)%(i+1);
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

async function openDailyModal() {
  openModal("modal-daily");
  const dateStr = getDailyDate();
  const d = new Date();
  document.getElementById("daily-date").textContent =
    d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}).toUpperCase();
  const content = document.getElementById("daily-content");
  content.innerHTML = `<div style="text-align:center;color:var(--dim);padding:20px;">Chargement…</div>`;

  let alreadyPlayed = false; let myScore = null;
  if (currentUser) {
    const {data} = await sb.from("games").select("score").eq("user_id",currentUser.id)
      .eq("is_daily",true).gte("created_at",dateStr).maybeSingle();
    if (data) { alreadyPlayed=true; myScore=data.score; }
  }

  // Requête 1 : scores du jour
  const {data:rawScores} = await sb.from("games")
    .select("score, user_id")
    .eq("is_daily", true)
    .gte("created_at", dateStr + "T00:00:00")
    .order("score", {ascending: false})
    .limit(100);

  // Requête 2 : profils des joueurs
  const userIds = [...new Set((rawScores||[]).map(s => s.user_id).filter(Boolean))];
  let profilesMap = {};
  if (userIds.length) {
    const {data:profs} = await sb.from("profiles")
      .select("id, pseudo, emoji").in("id", userIds);
    (profs||[]).forEach(p => { profilesMap[p.id] = p; });
  }

  // Fusionner
  const lb = (rawScores||[]).map(s => ({
    ...s,
    pseudo: profilesMap[s.user_id]?.pseudo || "Anonyme",
    emoji:  profilesMap[s.user_id]?.emoji  || "👤",
  }));
  const medals = ["🥇","🥈","🥉"];

  // Construire le podium (top 3)
  const podiumHTML = lb.length ? `
    <div class="lb-podium">
      ${[0,1,2].filter(i => lb[i]).map(i => {
        const s = lb[i];
        const isMe = currentUser && s.user_id === currentUser.id;
        const pseudo = s.pseudo || "Anonyme";
        const emoji  = s.emoji  || "👤";
        const medal  = ["gold","silver","bronze"][i];
        return `<div class="lb-podium-item ${medal}${isMe?" lb-podium-me":""}">
          <div class="lb-podium-medal">${medals[i]}</div>
          <div class="lb-podium-emoji">${emoji}</div>
          <div class="lb-podium-pseudo">${pseudo}${isMe?" ✓":""}</div>
          <div class="lb-podium-score">${s.score}</div>
        </div>`;
      }).join("")}
    </div>` : "";

  // Liste rang 4+
  const listHTML = lb.length > 3 ? `
    <div class="daily-lb-wrap">
      ${lb.slice(3).map((s,i) => {
        const isMe = currentUser && s.user_id === currentUser.id;
        const pseudo = s.pseudo || "Anonyme";
        const emoji  = s.emoji  || "👤";
        return `<div class="leaderboard-item ${isMe?"lb-me":""}">
          <div class="lb-rank">${i+4}</div>
          <div class="lb-emoji">${emoji}</div>
          <div class="lb-pseudo">${pseudo}${isMe?" ✓":""}</div>
          <div class="lb-score">${s.score}</div>
        </div>`;
      }).join("")}
    </div>` : "";

  content.innerHTML = (alreadyPlayed
    ? `<div class="daily-played">Ton score aujourd'hui : <strong>${myScore} pts</strong><br>
       <span style="font-size:12px;margin-top:4px;display:block;">Reviens demain pour un nouveau tirage !</span></div>`
    : `<button class="daily-start-btn" onclick="startDailyGame()">🚀 JOUER LE POP DU JOUR</button>`)
    + (lb.length ? `
    <div class="daily-scores">
      <div class="daily-scores-title">🏆 Classement du jour — ${lb.length} joueur${lb.length>1?"s":""}</div>
      ${podiumHTML}
      ${listHTML}
    </div>` : `<div style="text-align:center;padding:16px;color:var(--dim);font-size:13px;">Sois le premier à jouer aujourd'hui !</div>`);
}

function startDailyGame() {
  // Fermer tout modal ouvert
  document.querySelectorAll(".modal-overlay").forEach(el => el.classList.add("hidden"));

  // Flags
  isDailyMode = true;
  isDuelMode  = false;

  // Préparer le deck daily
  const dailyDeck = seededShuffle([...LETTER_POOL], getDailySeed());

  // Réinitialiser l'état — copie directe de startGame sans toucher isDailyMode
  if (state.intervalId) { clearInterval(state.intervalId); clearTimeout(state.intervalId); }
  const gridEl = document.getElementById("grid");
  if (gridEl) gridEl.innerHTML = "";

  state.deck      = dailyDeck;
  state.grid      = Array.from({length:20}, (_, i) => emptyCell(i));
  state.selection    = [];
  state.wordList     = [];
  state.score        = 0;
  state.mistakes     = 0;
  state.activeTab    = 0;
  state.diffIdx      = 0;
  state.lastCardTimer = null;

  const allIdx = shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
  allIdx.slice(0,5).forEach(i => {
    state.grid[i].letter  = drawLetter();
    state.grid[i].revealed = true;
  });

  renderGame();
  showScreen("game");
  setTimeout(() => { allIdx.slice(0,5).forEach(i => flipCard(i)); }, 50);

  // Lancer le chrono daily progressif
  startDailyInterval();
}

function startDailyInterval() {
  function getDailyMs() {
    if (state.score >= 200) return 3000;
    if (state.score >= 100) return 4000;
    return 5000;
  }
  function updatePhaseUI() {
    const phases = [
      { min:200, icon:"🐟", label:"Sharp" },
      { min:100, icon:"🐢", label:"Cool"  },
      { min:0,   icon:"🐌", label:"Slow"  },
    ];
    const p = phases.find(ph => state.score >= ph.min);
    const iconEl = document.getElementById("diff-icon");
    const nameEl = document.getElementById("diff-name");
    if (iconEl) iconEl.textContent = p.icon;
    if (nameEl) nameEl.textContent = p.label;
  }
  function tick() {
    if (state.screen !== "game" || !isDailyMode) return;
    updatePhaseUI();
    const hidden = state.grid.map((c,i) => (!c.revealed ? i : -1)).filter(i => i !== -1);
    if (hidden.length === 0) { triggerGameOver("grid_full"); return; }
    const idx = hidden[Math.floor(Math.random() * hidden.length)];
    state.grid[idx].letter  = drawLetter();
    state.grid[idx].revealed = true;
    flipCard(idx);
    renderProgDots();
    if (state.grid.every(c => c.revealed)) {
      state.lastCardTimer = setTimeout(() => {
        if (state.grid.every(c => c.revealed || c.gone)) {
          triggerGameOver("grid_full");
        } else {
          state.lastCardTimer = null;
          state.intervalId = setTimeout(tick, getDailyMs());
        }
      }, getDailyMs());
      return;
    }
    state.intervalId = setTimeout(tick, getDailyMs());
  }
  updatePhaseUI();
  state.intervalId = setTimeout(tick, getDailyMs());
  // Exposer pour redémarrage depuis handleValidate
  state.restartInterval = () => { state.intervalId = setTimeout(tick, getDailyMs()); };
}

// ── DUEL ──
function openDuelModal() { openModal("modal-duel"); renderDuelHome(); }

function renderDuelHome() {
  document.getElementById("duel-content").innerHTML = `
    <div class="duel-options">
      <div class="duel-option" onclick="createDuel()">
        <div class="duel-option-title">⚔️ Créer un duel</div>
        <div class="duel-option-desc">Génère un code à partager avec ton adversaire</div>
      </div>
      <div class="duel-option" onclick="renderJoinDuel()">
        <div class="duel-option-title">🎯 Rejoindre un duel</div>
        <div class="duel-option-desc">Entre le code reçu de ton adversaire</div>
      </div>
    </div>`;
}

function genDuelCode() {
  const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s="";
  for(let i=0;i<6;i++) s+=c[Math.floor(Math.random()*c.length)];
  return s;
}

async function createDuel() {
  if (!currentUser) { showToast("Connecte-toi pour créer un duel"); return; }
  const code = genDuelCode();
  const seed = Math.floor(Math.random()*999999);
  const pseudo = userProfile?.pseudo||"Anonyme";
  const {data,error} = await sb.from("duels").insert({
    code, seed, player1_id:currentUser.id, player1_pseudo:pseudo, status:"waiting",
    created_at:new Date().toISOString()
  }).select().single();
  if (error) { showToast("Erreur création duel"); return; }
  duelId = data.id;

  document.getElementById("duel-content").innerHTML = `
    <div class="duel-code-display">
      <div style="font-size:12px;color:var(--dim);margin-bottom:8px;letter-spacing:.1em;">TON CODE DUEL</div>
      <div class="duel-code">${code}</div>
      <div class="duel-code-hint">Partage ce code avec ton adversaire</div>
    </div>
    <button class="duel-join-btn" onclick="shareDuelCode('${code}')">📤 Partager le code</button>
    <div class="duel-waiting"><div class="duel-waiting-icon">⏳</div>
    <div class="duel-waiting-text">En attente de l'adversaire…</div></div>`;

  duelChannel = sb.channel("duel:"+data.id)
    .on("postgres_changes",{event:"UPDATE",schema:"public",table:"duels",filter:"id=eq."+data.id},
      p => { if(p.new.status==="ready"){closeModal("modal-duel");startDuelGame(seed,data.id);} }
    ).subscribe();
}

function renderJoinDuel() {
  document.getElementById("duel-content").innerHTML = `
    <input class="duel-code-input" id="join-code-input" placeholder="XXXXXX" maxlength="6"/>
    <button class="duel-join-btn" onclick="joinDuel()">REJOINDRE →</button>`;
}

async function joinDuel() {
  const code = (document.getElementById("join-code-input").value||"").trim().toUpperCase();
  if (code.length<6) { showToast("Code invalide"); return; }
  const {data,error} = await sb.from("duels").select("*").eq("code",code).eq("status","waiting").single();
  if (error||!data) { showToast("Code introuvable"); return; }
  const pseudo = userProfile?.pseudo||"Anonyme";
  await sb.from("duels").update({
    player2_id:currentUser?.id||null, player2_pseudo:pseudo, status:"ready"
  }).eq("id",data.id);
  closeModal("modal-duel");
  startDuelGame(data.seed, data.id);
}

function startDuelGame(seed, id) {
  isDuelMode=true; isDailyMode=false; duelId=id;
  state.deck = seededShuffle([...LETTER_POOL], seed);
  startGame();
}

async function saveDuelScore(score) {
  if (!duelId||!currentUser) return;
  const {data} = await sb.from("duels").select("player1_id").eq("id",duelId).single();
  const isP1 = data?.player1_id===currentUser.id;
  await sb.from("duels").update({
    [isP1?"player1_score":"player2_score"]:score,
    [isP1?"player1_done":"player2_done"]:true,
  }).eq("id",duelId);
}

function shareDuelCode(code) {
  const text = `Je te défie sur POP LETTERS ! Code : ${code} 🎮`;
  if(navigator.share){navigator.share({title:"POP LETTERS Duel",text});}
  else{navigator.clipboard.writeText(text);showToast("Code copié !");}
}

// ── PARTAGE ──
function openShareModal() { openModal("modal-share"); renderShareModal(); }

function renderShareModal() {
  const score = lastGameResult?.score || state.score || 0;
  const level = lastGameResult?.level || DIFFICULTY[state.diffIdx]?.label || "";
  const words = lastGameResult?.wordCount || state.wordList?.length || 0;
  const icon  = DIFFICULTY.find(d=>d.label===level)?.icon||"🌙";
  const dateStr = new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long"});
  const modeTag = isDailyMode?"⭐ POP du jour":isDuelMode?"⚔️ Duel":level;
  const url = "https://airissou-ux.github.io/pop-letters/";

  document.getElementById("share-preview").innerHTML = `
    <div style="display:flex;gap:5px;justify-content:center;align-items:flex-end;margin-bottom:10px;">
      <span style="width:20px;height:20px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#fff;background:linear-gradient(135deg,#FF4757,#FF6B9D);transform:translateY(4px) rotate(-22deg);">P</span>
      <span style="width:20px;height:20px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#fff;background:linear-gradient(135deg,#FFB703,#FF8C00);">O</span>
      <span style="width:20px;height:20px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#fff;background:linear-gradient(135deg,#06D6A0,#00B4D8);transform:translateY(4px) rotate(22deg);">P</span>
    </div>
    <div style="font-size:10px;letter-spacing:.25em;color:rgba(255,255,255,.4);margin-bottom:8px;">${modeTag} · ${dateStr}</div>
    <div class="share-preview-score">${score}</div>
    <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px;">pts · ${words} mot${words>1?"s":""} · ${icon} ${level}</div>`;

  const txt = encodeURIComponent(`🎮 POP LETTERS ${isDailyMode?"(POP du jour)":""}\n${score} pts · ${words} mots · ${icon} ${level}\n${dateStr}\n\n👉 ${url}`);

  document.getElementById("share-btns").innerHTML = `
    <button class="share-btn" onclick="shareNative('${txt}')"><span class="share-btn-icon">📤</span>Partager via…</button>
    <button class="share-btn" onclick="window.open('https://wa.me/?text=${txt}','_blank')"><span class="share-btn-icon">💬</span>WhatsApp</button>
    <button class="share-btn" onclick="window.open('https://twitter.com/intent/tweet?text=${txt}','_blank')"><span class="share-btn-icon">𝕏</span>X / Twitter</button>
    <button class="share-btn" onclick="navigator.clipboard.writeText(decodeURIComponent('${txt}'));showToast('Copié !')"><span class="share-btn-icon">📋</span>Copier</button>`;
}

function shareNative(encodedText) {
  if(navigator.share){navigator.share({title:"POP LETTERS",text:decodeURIComponent(encodedText),url:"https://airissou-ux.github.io/pop-letters/"});}
  else{navigator.clipboard.writeText(decodeURIComponent(encodedText));showToast("Copié !");}
}

function navTo(tab) {
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById("nav-"+tab)?.classList.add("active");
}


// Fermer modals sur overlay click
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".modal-overlay").forEach(el => {
    el.addEventListener("click", e => { if(e.target===el) el.classList.add("hidden"); });
  });
});





const TAB_LABELS = ["5 L","6 L","7 L","8 L","9 L","10+ L"];



function deaccent(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
}

async
