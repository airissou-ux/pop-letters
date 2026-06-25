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

// ── DUEL / MODE DÉFI ──

function openDuelModal() { openModal("modal-duel"); renderDuelHome(); }

function renderDuelHome() {
  document.getElementById("duel-content").innerHTML = `
    <div class="duel-options">
      <div class="duel-option" onclick="startCreateDuel()">
        <div class="duel-option-title">⚔️ Lancer un défi</div>
        <div class="duel-option-desc">Génère un code et défie un ami — chacun joue à son rythme et son niveau</div>
      </div>
      <div class="duel-option" onclick="renderJoinDuel()">
        <div class="duel-option-title">🎯 Rejoindre un défi</div>
        <div class="duel-option-desc">Entre le code reçu pour relever le défi</div>
      </div>
    </div>`;
}

// ── CRÉER UN DÉFI (hôte) ──
function startCreateDuel() {
  // Choisir le niveau avant de créer
  const levelOptions = DIFFICULTY.map((d,i) =>
    `<div class="duel-level-opt" data-idx="${i}" onclick="selectDuelLevel(${i})">
      <span class="duel-level-icon">${d.icon}</span>
      <span class="duel-level-name">${d.label}</span>
      <span class="duel-level-speed">1 carte / ${d.ms/1000}s</span>
    </div>`
  ).join("");

  document.getElementById("duel-content").innerHTML = `
    <div style="font-size:13px;color:var(--dim);margin-bottom:12px;">
      Choisis ton niveau pour ce défi.<br>
      <strong style="color:var(--text);">Ton adversaire pourra choisir le sien librement.</strong>
    </div>
    <div class="duel-level-list" id="duel-level-list">${levelOptions}</div>
    <button class="duel-join-btn" id="btn-create-duel" onclick="createDuel()" disabled
      style="margin-top:14px;opacity:.4;">
      CRÉER LE DÉFI →
    </button>`;
}

let hostLevelIdx = 0;

function selectDuelLevel(idx) {
  hostLevelIdx = idx;
  document.querySelectorAll(".duel-level-opt").forEach(el => {
    el.classList.toggle("sel", parseInt(el.dataset.idx) === idx);
  });
  const btn = document.getElementById("btn-create-duel");
  if (btn) { btn.disabled = false; btn.style.opacity = "1"; }
}

async function createDuel() {
  if (!currentUser) { showToast("Connecte-toi pour créer un défi"); return; }
  const code    = genDuelCode();
  const seed    = Math.floor(Math.random() * 999999);
  const pseudo  = userProfile?.pseudo || "Anonyme";
  const level   = DIFFICULTY[hostLevelIdx].label;
  const expires = new Date(Date.now() + 24*60*60*1000).toISOString(); // +24h

  const { data, error } = await sb.from("duels").insert({
    code, seed,
    player1_id:     currentUser.id,
    player1_pseudo: pseudo,
    player1_level:  level,
    status:         "waiting",
    expires_at:     expires,
    created_at:     new Date().toISOString()
  }).select().single();

  if (error) { showToast("Erreur création défi"); return; }
  duelId = data.id;

  document.getElementById("duel-content").innerHTML = `
    <div class="duel-code-display">
      <div style="font-size:12px;color:var(--dim);margin-bottom:8px;letter-spacing:.1em;">CODE DÉFI</div>
      <div class="duel-code">${code}</div>
      <div class="duel-code-hint">Ton niveau : ${DIFFICULTY[hostLevelIdx].icon} ${level}<br>
      Valable 24h · Ton adversaire choisit son propre niveau</div>
    </div>
    <button class="duel-join-btn" onclick="shareDuelCode('${code}')">📤 Partager le code</button>
    <button class="duel-join-btn" style="margin-top:8px;background:linear-gradient(135deg,var(--coral),var(--amber));"
      onclick="closeModal('modal-duel');launchDuelGame(${data.id},'${code}',${seed},${hostLevelIdx})">
      🚀 JOUER MA PARTIE
    </button>`;
}

// ── REJOINDRE UN DÉFI (invité) ──
function renderJoinDuel() {
  document.getElementById("duel-content").innerHTML = `
    <div style="font-size:13px;color:var(--dim);margin-bottom:12px;">Entre le code reçu de ton adversaire</div>
    <input class="duel-code-input" id="join-code-input" placeholder="XXXXXX" maxlength="6"
      oninput="this.value=this.value.toUpperCase()"/>
    <button class="duel-join-btn" style="margin-top:10px;" onclick="lookupDuel()">RECHERCHER →</button>`;
}

async function lookupDuel() {
  const code = (document.getElementById("join-code-input").value||"").trim().toUpperCase();
  if (code.length < 6) { showToast("Code invalide"); return; }

  const { data, error } = await sb.from("duels").select("*").eq("code", code).single();
  if (error || !data) { showToast("Code introuvable"); return; }

  // Vérifier expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    showToast("Ce défi a expiré (24h dépassées)"); return;
  }

  // Vérifier que ce n'est pas l'hôte lui-même
  if (data.player1_id === currentUser?.id) {
    showToast("Tu es l'hôte de ce défi — partage le code avec ton adversaire");
    return;
  }

  // Choisir son niveau
  const levelOptions = DIFFICULTY.map((d,i) =>
    `<div class="duel-level-opt" data-idx="${i}" onclick="selectGuestLevel(${i},${data.id},'${data.code}',${data.seed})">
      <span class="duel-level-icon">${d.icon}</span>
      <span class="duel-level-name">${d.label}</span>
      <span class="duel-level-speed">1 carte / ${d.ms/1000}s</span>
    </div>`
  ).join("");

  const hostInfo = data.player1_pseudo ? 
    `Défi lancé par <strong>${data.player1_pseudo}</strong> en niveau ${data.player1_level}` :
    "Défi trouvé";

  document.getElementById("duel-content").innerHTML = `
    <div style="font-size:13px;color:var(--amber);margin-bottom:14px;">${hostInfo}</div>
    <div style="font-size:13px;color:var(--dim);margin-bottom:12px;">
      Choisis <strong style="color:var(--text);">ton</strong> niveau pour relever ce défi :
    </div>
    <div class="duel-level-list" id="duel-level-list">${levelOptions}</div>`;
}

let guestLevelIdx = 0;
let pendingDuelData = null;

function selectGuestLevel(idx, duelDbId, code, seed) {
  guestLevelIdx = idx;
  pendingDuelData = { duelDbId, code, seed };
  document.querySelectorAll(".duel-level-opt").forEach(el => {
    el.classList.toggle("sel", parseInt(el.dataset.idx) === idx);
  });

  // Afficher le bouton de lancement s'il n'existe pas encore
  if (!document.getElementById("btn-guest-play")) {
    const btn = document.createElement("button");
    btn.id = "btn-guest-play";
    btn.className = "duel-join-btn";
    btn.style.marginTop = "14px";
    btn.textContent = "🚀 RELEVER LE DÉFI";
    btn.onclick = joinAndPlay;
    document.getElementById("duel-content").appendChild(btn);
  }
}

async function joinAndPlay() {
  if (!pendingDuelData) return;
  const { duelDbId, seed } = pendingDuelData;
  const pseudo = userProfile?.pseudo || "Anonyme";
  const level  = DIFFICULTY[guestLevelIdx].label;

  // Enregistrer le joueur 2
  await sb.from("duels").update({
    player2_id:     currentUser?.id || null,
    player2_pseudo: pseudo,
    player2_level:  level,
    status:         "ready"
  }).eq("id", duelDbId);

  closeModal("modal-duel");
  launchDuelGame(duelDbId, null, seed, guestLevelIdx);
}

// ── LANCER LA PARTIE DÉFI ──
async function launchDuelGame(duelDbId, code, seed, levelIdx) {
  isDuelMode  = true;
  isDailyMode = false;
  duelId      = duelDbId;

  // Forcer le niveau choisi
  state.diffIdx = levelIdx;
  state.deck    = seededShuffle([...LETTER_POOL], seed);
  startGame();
}

// ── SAUVEGARDER LE RÉSULTAT DÉFI ──
async function saveDuelScore(score, wordList) {
  if (!duelId || !currentUser) return;

  const { data } = await sb.from("duels").select("player1_id, player1_done, player2_done").eq("id", duelId).single();
  const isHost  = data?.player1_id === currentUser.id;
  const level   = DIFFICULTY[state.diffIdx].label;

  // Calcul du détail du score
  const { len, fig, figLabel } = calcBonus(state.wordList);
  const base  = state.wordList.reduce((s, w) => s + w.length, 0);
  const detail = { base, bonusLength: len, bonusFigure: fig, figureLabel: figLabel || null };

  const update = isHost ? {
    player1_score:        score,
    player1_words:        wordList,
    player1_level:        level,
    player1_score_detail: detail,
    player1_done:         true,
    status: data.player2_done ? "done" : "waiting_guest"
  } : {
    player2_score:        score,
    player2_words:        wordList,
    player2_level:        level,
    player2_score_detail: detail,
    player2_done:         true,
    status: data.player1_done ? "done" : "waiting_host"
  };

  await sb.from("duels").update(update).eq("id", duelId);
}

// ── AFFICHER LE RÉSULTAT DÉFI ──
async function showDuelResult() {
  if (!duelId) return;
  const { data } = await sb.from("duels").select("*").eq("id", duelId).single();
  if (!data) return;

  const isHost   = data.player1_id === currentUser?.id;
  const myDone   = isHost ? data.player1_done   : data.player2_done;
  const oppDone  = isHost ? data.player2_done   : data.player1_done;
  const myPseudo = isHost ? data.player1_pseudo : data.player2_pseudo;
  const oppPseudo= isHost ? data.player2_pseudo : data.player1_pseudo;

  // Construire le tableau comparatif
  function playerCol(pseudo, level, score, detail, words, done, isOpponent) {
    if (!done) {
      return `<div class="duel-col">
        <div class="duel-col-header">${pseudo || "Adversaire"}</div>
        <div class="duel-col-waiting">⏳ En attente<br>de sa partie</div>
      </div>`;
    }
    // Si c'est l'adversaire et que je n'ai pas encore joué → masquer
    if (isOpponent && !myDone) {
      return `<div class="duel-col">
        <div class="duel-col-header">${pseudo}</div>
        <div class="duel-col-waiting">🔒 Score masqué<br>Joue d'abord !</div>
      </div>`;
    }
    const winner = myDone && oppDone && score > (isHost ? data.player2_score : data.player1_score);
    const d = detail || {};
    return `<div class="duel-col${winner && !isOpponent ? " duel-col-win" : ""}">
      <div class="duel-col-header">${pseudo}${!isOpponent ? " (toi)" : ""}</div>
      <div class="duel-col-level">${DIFFICULTY.find(x=>x.label===level)?.icon||"🎮"} ${level||""}</div>
      <div class="duel-col-score">${score} pts</div>
      <div class="duel-col-detail">
        <div class="duel-detail-row"><span>Lettres</span><span>${d.base||0} pts</span></div>
        <div class="duel-detail-row"><span>Bonus longueur</span><span>+${d.bonusLength||0} pts</span></div>
        ${d.bonusFigure ? `<div class="duel-detail-row"><span>${d.figureLabel||"Figure"}</span><span>+${d.bonusFigure} pts</span></div>` : ""}
      </div>
      <div class="duel-col-words">
        <div class="duel-words-title">${(words||[]).length} mot${(words||[]).length>1?"s":""}</div>
        <div class="duel-words-list">${(words||[]).map(w=>`<span class="detail-chip">${w}</span>`).join("")}</div>
      </div>
    </div>`;
  }

  const myScore    = isHost ? data.player1_score    : data.player2_score;
  const oppScore   = isHost ? data.player2_score    : data.player1_score;
  const myDetail   = isHost ? data.player1_score_detail : data.player2_score_detail;
  const oppDetail  = isHost ? data.player2_score_detail : data.player1_score_detail;
  const myWords    = isHost ? data.player1_words    : data.player2_words;
  const oppWords   = isHost ? data.player2_words    : data.player1_words;
  const myLevel    = isHost ? data.player1_level    : data.player2_level;
  const oppLevel   = isHost ? data.player2_level    : data.player1_level;

  // Résultat si les deux ont joué
  let resultBanner = "";
  if (myDone && oppDone) {
    const iWin = myScore > oppScore;
    const tie  = myScore === oppScore;
    resultBanner = `<div class="duel-result-banner ${iWin?"win":tie?"tie":"lose"}">
      ${iWin ? "🏆 Tu gagnes !" : tie ? "🤝 Égalité !" : "💪 "+oppPseudo+" gagne !"}
    </div>`;
  }

  document.getElementById("game-detail-content").innerHTML = `
    <div style="font-family:var(--font-title);font-size:18px;font-weight:900;
      background:linear-gradient(90deg,var(--coral),var(--amber));
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:12px;">
      ⚔️ Défi
    </div>
    ${resultBanner}
    <div class="duel-result-table">
      ${playerCol(myPseudo,  myLevel,  myScore,  myDetail,  myWords,  myDone,  false)}
      ${playerCol(oppPseudo, oppLevel, oppScore, oppDetail, oppWords, oppDone, true)}
    </div>
    <button class="duel-join-btn" style="margin-top:16px;" onclick="closeModal('modal-game-detail');openDuelModal()">
      Nouveau défi
    </button>`;

  closeModal("modal-profile");
  document.getElementById("modal-game-detail").classList.remove("hidden");
}

function genDuelCode() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

function shareDuelCode(code) {
  const text = `Je te défie sur POP LETTERS ! Code : ${code} 🎮\nTu choisis ton niveau, moi j'ai choisi le mien. Valable 24h !`;
  if (navigator.share) { navigator.share({ title:"POP LETTERS Défi", text }); }
  else { navigator.clipboard.writeText(text); showToast("Code copié !"); }
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

const TAB_LABELS = ["5 L","6 L","7 L","8 L","9 L","10+ L"];

let DICT = new Set();

function deaccent(s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase();
}

