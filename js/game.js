// POP LETTERS — game.js
// ==================================================

function calcBonus(wordList) {
  const cnt = {5:0,6:0,7:0,8:0,9:0,10:0};
  wordList.forEach(w => { const l=Math.min(w.length,10); cnt[l>=10?10:l]++; });
  let len = 0;
  len += cnt[6]*1; len += cnt[7]*2; len += cnt[8]*3; len += cnt[9]*5; len += cnt[10]*10;

  // Chaque figure est comptée indépendamment (pas de hiérarchie)
  // Un même mot peut contribuer à plusieurs figures à la fois
  const qf = Math.min(cnt[6],cnt[7],cnt[8],cnt[9],cnt[10]); // séries Quinte Flush (6+7+8+9+10+)
  const q  = Math.min(cnt[5],cnt[6],cnt[7],cnt[8],cnt[9]);  // séries Quinte (5+6+7+8+9)
  const qa = Math.min(cnt[5],cnt[6],cnt[7],cnt[8]);          // séries Quarte (5+6+7+8)

  const fig = qf*75 + q*50 + qa*25;

  let figLabel = null;
  if (qf > 0) figLabel = qf > 1 ? `${qf}× QUINTE FLUSH !` : "QUINTE FLUSH !";
  else if (q > 0) figLabel = q > 1 ? `${q}× QUINTE !` : "QUINTE !";
  else if (qa > 0) figLabel = qa > 1 ? `${qa}× QUARTE !` : "QUARTE !";

  return {len, fig, figLabel, qf, q, qa};
}

let state = {
  screen:"splash", diffIdx:0, grid:[], selection:[], wordList:[],
  score:0, mistakes:0, activeTab:0, intervalId:null,
  toastTimer:null, bonusTimer:null, deck:[],
};

function showScreen(name) {
  state.screen = name;
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
  document.getElementById(name).classList.add("active");
}

function buildSplash() {
  const list = document.getElementById("diff-list");
  list.innerHTML = "";
  DIFFICULTY.forEach((d, i) => {
    const btn = document.createElement("button");
    btn.className = "diff-btn" + (i===state.diffIdx?" sel":"");
    btn.innerHTML = `<span>${d.icon}</span><span>${d.label}</span><span class="spd">1 carte / ${d.ms/1000}s</span>`;
    btn.onclick = () => {
      state.diffIdx = i;
      document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("sel"));
      btn.classList.add("sel");
    };
    list.appendChild(btn);
  });
}

function emptyCell(id) {
  return {id, letter:null, revealed:false, selected:false, valid:false, gone:false};
}

function drawLetter() {
  if (state.deck.length === 0) state.deck = shuffle([...LETTER_POOL]);
  return state.deck.shift();
}

function startGame() {
  if (state.intervalId) { clearInterval(state.intervalId); clearTimeout(state.intervalId); }
  const gridEl = document.getElementById("grid");
  if (gridEl) gridEl.innerHTML = "";

  // Ne pas écraser le deck si déjà défini (mode daily ou duel)
  if (!state.deck || !state.deck.length) {
    state.deck = shuffle([...LETTER_POOL]);
  }
  state.grid = Array.from({length:20},(_,i) => emptyCell(i));
  state.selection     = [];
  state.wordList      = [];
  state.score         = 0;
  state.mistakes      = 0;
  state.activeTab     = 0;
  state.lastCardTimer = null;

  const allIdx = shuffle([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
  const first5 = allIdx.slice(0, 5);
  first5.forEach(i => {
    state.grid[i].letter = drawLetter();
    state.grid[i].revealed = true;
  });

  renderGame();
  showScreen("game");

  setTimeout(() => { first5.forEach(i => flipCard(i)); }, 50);

  // Mode POP du jour : vitesse progressive selon le score
  // Phase 1 : 0-99 pts → 🌙 Moon (5s), Phase 2 : 100-199 pts → ⭐ Star (4s), Phase 3 : 200+ pts → ☄️ Comet (3s)
  function getDailyMs() {
    if (!isDailyMode) return DIFFICULTY[state.diffIdx].ms;
    if (state.score >= 200) return 3000; // Sharp
    if (state.score >= 100) return 4000; // Cool
    return 5000; // Slow
  }
  function getDailyPhaseIcon() {
    if (!isDailyMode) return null;
    if (state.score >= 200) return { icon:"🐟", label:"Sharp" };
    if (state.score >= 100) return { icon:"🐢", label:"Cool" };
    return { icon:"🐌", label:"Slow" };
  }

  let ms = getDailyMs();
  function scheduleNext() {
    ms = getDailyMs();
    // Mettre à jour l'indicateur de phase si mode daily
    if (isDailyMode) {
      const phase = getDailyPhaseIcon();
      const iconEl = document.getElementById("diff-icon");
      const nameEl = document.getElementById("diff-name");
      if (iconEl) iconEl.textContent = phase.icon;
      if (nameEl) nameEl.textContent = phase.label;
    }
    state.intervalId = setTimeout(runInterval, ms);
  }
  // Exposer pour permettre le redémarrage depuis handleValidate
  state.restartInterval = scheduleNext;

  function runInterval() {
    if (state.screen !== "game") return;
    if (!state.grid || state.grid.length === 0) return; // guard contre état non initialisé
    const hidden = state.grid.map((c,i) => (!c.revealed ? i : -1)).filter(i => i !== -1);
    if (hidden.length === 0) {
      // Toutes les cartes révélées — déjà géré par lastCardTimer, ne pas déclencher ici
      return;
    }
    const idx = hidden[Math.floor(Math.random() * hidden.length)];
    state.grid[idx].letter = drawLetter();
    state.grid[idx].revealed = true;
    flipCard(idx);
    renderProgDots();
    if (state.grid.every(c => c.revealed)) {
      // Dernière lettre — laisser le temps du niveau avant de terminer
      // Ce timer est annulable si un mot est validé avant son expiration
      state.lastCardTimer = setTimeout(() => {
        // Vérifier si la grille est toujours pleine (aucun mot validé entretemps)
        if (state.grid.every(c => c.revealed || c.gone)) {
          triggerGameOver("grid_full");
        } else {
          // Un mot a été validé, des cases sont libérées — continuer !
          state.lastCardTimer = null;
          scheduleNext();
        }
      }, getDailyMs());
      return;
    }
    scheduleNext();
  }

    scheduleNext();
}

// Flip animé : dos → face
function flipCard(id) {
  const container = document.getElementById("grid");
  const el = container.children[id];
  if (!el) return;
  const inner = el.querySelector(".card-inner");
  el.querySelector(".card-face").textContent = state.grid[id].letter || "";
  // Partir de 0° sans transition, puis laisser la CSS animer vers 180°
  inner.style.transition = "none";
  inner.style.transform  = "rotateY(0deg)";
  el.className = "card";
  void inner.offsetWidth;
  inner.style.transition = "";
  inner.style.transform  = "";
  el.className = "card revealed";
}

// Reset instantané : face → dos, SANS animation
function resetCard(id) {
  const container = document.getElementById("grid");
  const el = container.children[id];
  if (!el) return;
  const inner = el.querySelector(".card-inner");
  // Couper la transition, remettre à 0° (dos), effacer la lettre
  inner.style.transition = "none";
  inner.style.transform  = "rotateY(0deg)";
  el.className = "card";
  el.querySelector(".card-face").textContent = "";
  // Forcer le reflow pour que l'état soit peint immédiatement
  void inner.offsetWidth;
  // Réactiver la transition pour le prochain flipCard
  inner.style.transition = "";
  inner.style.transform  = "";
}

function triggerGameOver(reason) {
  if (state.intervalId) { clearInterval(state.intervalId); clearTimeout(state.intervalId); }
  if (state.lastCardTimer) { clearTimeout(state.lastCardTimer); state.lastCardTimer = null; }
  if (state.screen === "gameover") return; // éviter double déclenchement
  state.screen = "gameover";
  renderGameOver(reason);
  showScreen("gameover");
  // Sauvegarder la partie
  const level = DIFFICULTY[state.diffIdx].label;
  lastGameResult = { score: state.score, level, wordCount: state.wordList.length };
  if (typeof saveGame === "function") saveGame(state.score, state.wordList, level);
  if (typeof saveDuelScore === "function" && isDuelMode) saveDuelScore(state.score);
}

function handleCellClick(id) {
  const cell = state.grid[id];
  if (!cell || !cell.revealed || cell.gone) return;
  const sel = state.selection;
  let newSel;
  if (sel.includes(id)) {
    if (sel[sel.length-1] !== id) return;
    newSel = sel.slice(0, -1);
  } else {
    newSel = [...sel, id];
  }
  state.selection = newSel;
  state.grid.forEach(c => { c.selected = newSel.includes(c.id); c.valid = false; });
  if (newSel.length >= 5) {
    const word = newSel.map(id => state.grid[id].letter).join("");
    if (checkWord(word)) newSel.forEach(id => { state.grid[id].valid = true; });
  }
  renderGrid();
  renderWordDisplay();
  renderValidateBtn();
}

function clearSelection() {
  state.selection = [];
  state.grid.forEach(c => { c.selected = false; c.valid = false; });
  renderGrid();
  renderWordDisplay();
  renderValidateBtn();
}

function handleValidate() {
  const sel = state.selection;
  if (sel.length < 5) return;
  const word = sel.map(id => state.grid[id].letter).join("");
  if (!checkWord(word)) {
    showToast(`"${word}" absent du dictionnaire`);
    const wd = document.getElementById("word-display");
    wd.classList.add("shake");
    setTimeout(() => wd.classList.remove("shake"), 400);
    return;
  }
  if (state.wordList.includes(word)) {
    showToast(`"${word}" déjà dans la liste !`);
    state.mistakes++;
    if (state.mistakes >= 3) setTimeout(() => triggerGameOver("mistakes"), 500);
    renderMistakes();
    const wd = document.getElementById("word-display");
    wd.classList.add("shake");
    setTimeout(() => { wd.classList.remove("shake"); clearSelection(); }, 700);
    return;
  }

  const ids = [...sel];
  const prevList = [...state.wordList];
  state.wordList.push(word);
  state.score += word.length;

  const pb = calcBonus(prevList);
  const nb = calcBonus(state.wordList);
  if (nb.fig > pb.fig && nb.figLabel) {
    state.score += (nb.fig - pb.fig);
    showBonusBadge(nb.figLabel);
  }

  const l = word.length;
  state.activeTab = l>=10?5 : l>=9?4 : l>=8?3 : l>=7?2 : l>=6?1 : 0;

  ids.forEach(id => { state.grid[id].gone = true; state.grid[id].selected = false; state.grid[id].valid = false; });
  state.selection = [];
  // Mot validé — annuler le timer de fin si on était sur la dernière carte
  if (state.lastCardTimer) {
    clearTimeout(state.lastCardTimer);
    state.lastCardTimer = null;
    // Relancer le chrono après l'animation de disparition des cartes (350ms)
    setTimeout(() => {
      if (state.screen === "game" && state.restartInterval) {
        state.restartInterval();
      }
    }, 360);
  }
  renderGrid();
  renderWordDisplay();
  renderValidateBtn();
  renderScore();
  renderWordPanel();

  // Après l'animation gone : reset instantané dos visible, sans flip
  setTimeout(() => {
    ids.forEach(id => {
      state.grid[id] = emptyCell(id);
      resetCard(id);
    });
  }, 350);
}

// ── RENDER ──
