// POP LETTERS — ui.js
// ==================================================

function renderGame() {
  const d = DIFFICULTY[state.diffIdx];
  document.getElementById("diff-icon").textContent = d.icon;
  document.getElementById("diff-name").textContent = d.label;
  renderMistakes();
  renderScore();
  renderWordPanel();
  renderGrid();
  renderWordDisplay();
  renderValidateBtn();
  renderProgDots();
}

function renderMistakes() {
  const el = document.getElementById("mistakes");
  el.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const d = document.createElement("div");
    d.className = "dot" + (i < state.mistakes ? " used" : "");
    el.appendChild(d);
  }
}

function renderScore() {
  document.getElementById("score-val").textContent = state.score;
}

function renderWordPanel() {
  const tabs = document.getElementById("word-tabs");
  tabs.innerHTML = "";
  const wordsByLen = [5,6,7,8,9,10].map(l => state.wordList.filter(w => l===10 ? w.length>=10 : w.length===l));
  TAB_LABELS.forEach((lbl, i) => {
    const t = document.createElement("div");
    t.className = "word-tab" + (i===state.activeTab ? " active" : "");
    t.textContent = lbl;
    if (wordsByLen[i].length > 0) {
      const badge = document.createElement("span");
      badge.className = "tab-count";
      badge.textContent = wordsByLen[i].length;
      t.appendChild(badge);
    }
    t.onclick = () => { state.activeTab = i; renderWordPanel(); };
    tabs.appendChild(t);
  });
  const list = document.getElementById("word-list");
  list.innerHTML = "";
  const words = wordsByLen[state.activeTab];
  if (words.length === 0) {
    const empty = document.createElement("span");
    empty.className = "word-empty";
    empty.textContent = "— aucun mot —";
    list.appendChild(empty);
  } else {
    words.forEach(w => {
      const chip = document.createElement("div");
      chip.className = "word-chip";
      chip.textContent = w;
      list.appendChild(chip);
    });
  }
}

function renderGrid() {
  const container = document.getElementById("grid");
  state.grid.forEach((cell, i) => {
    let el = container.children[i];
    if (!el) {
      el = document.createElement("div");
      el.className = "card";
      const inner = document.createElement("div");
      inner.className = "card-inner";
      const back = document.createElement("div");
      back.className = "card-back";
      const face = document.createElement("div");
      face.className = "card-face";
      inner.appendChild(back);
      inner.appendChild(face);
      el.appendChild(inner);
      el.addEventListener("click", () => handleCellClick(cell.id));
      container.appendChild(el);
    }

    // Préserver l'état revealed posé par flipCard — ne jamais l'écraser ici
    const domRevealed = el.classList.contains("revealed");
    let cls = "card";
    if (cell.revealed || domRevealed) cls += " revealed";
    if (cell.selected) cls += " selected";
    if (cell.valid)    cls += " valid";
    if (cell.gone)     cls += " gone";
    if (el.className !== cls) el.className = cls;

    const face = el.querySelector(".card-face");
    if (face.textContent !== (cell.letter || "")) face.textContent = cell.letter || "";
  });
}

function renderWordDisplay() {
  const sel = state.selection;
  const word = sel.map(id => state.grid[id]?.letter || "").join("");
  const wd = document.getElementById("word-display");
  if (word.length === 0) {
    wd.className = "word-display";
    wd.textContent = "";
    const placeholder = document.createElement("span");
    placeholder.className = "word-placeholder";
    placeholder.id = "word-placeholder";
    placeholder.textContent = "Sélectionnez des lettres…";
    wd.appendChild(placeholder);
  } else {
    wd.innerHTML = "";
    const isValid = sel.length >= 5 && state.grid[sel[0]]?.valid;
    wd.className = "word-display" + (isValid ? " valid" : " typing");
    wd.textContent = word;
  }
}

function renderValidateBtn() {
  const btn = document.getElementById("btn-validate");
  const sel = state.selection;
  const word = sel.map(id => state.grid[id]?.letter || "").join("");
  const isValid = sel.length >= 5 && checkWord(word);
  btn.disabled = !isValid;
  btn.className = "btn-validate" + (isValid ? " active" : "");
  btn.textContent = isValid ? "✓ VALIDER" : "VALIDER";
}

function renderProgDots() {
  const el = document.getElementById("prog-dots");
  el.innerHTML = "";
  const revealed = state.grid.filter(c => c.revealed).length;
  for (let i = 0; i < 10; i++) {
    const d = document.createElement("div");
    d.className = "prog-dot" + (i < Math.ceil(revealed/2) ? " on" : "");
    el.appendChild(d);
  }
}

function renderGameOver(reason) {
  const wordList = state.wordList;
  const {len, fig, figLabel, qf, q, qa} = calcBonus(wordList);
  const base = wordList.reduce((s,w) => s+w.length, 0);
  const total = base + len + fig;
  state.score = total; // synchroniser state.score avec le total affiché
  document.getElementById("go-title").textContent = reason==="mistakes" ? "3 FAUTES !" : "GRILLE PLEINE";
  document.getElementById("go-score").textContent = total;
  const d = DIFFICULTY[state.diffIdx];
  document.getElementById("go-level").textContent = d.icon + " " + d.label;

  // Mini-grille : snapshot de l'état final
  const goGrid = document.getElementById("go-grid");
  goGrid.innerHTML = "";
  state.grid.forEach(cell => {
    const el = document.createElement("div");
    if (cell.revealed && cell.letter) {
      el.className = "go-card filled";
      el.textContent = cell.letter;
    } else {
      el.className = "go-card empty";
    }
    goGrid.appendChild(el);
  });
  const wt = document.getElementById("go-words-title");
  wt.textContent = `${wordList.length} mot${wordList.length!==1?"s":""} trouvé${wordList.length!==1?"s":""}`;
  const wl = document.getElementById("go-words-list");
  wl.innerHTML = "";
  if (wordList.length === 0) {
    const empty = document.createElement("span");
    empty.style.cssText = "color:var(--dim);font-size:12px";
    empty.textContent = "Aucun mot validé";
    wl.appendChild(empty);
  } else {
    wordList.forEach(w => {
      const chip = document.createElement("div");
      chip.className = "go-chip";
      chip.textContent = w;
      wl.appendChild(chip);
    });
  }
  const gb = document.getElementById("go-bonus");
  gb.innerHTML = `
    <div class="go-row"><span>Lettres collectées</span><span class="go-val">${base} pts</span></div>
    <div class="go-row"><span>Bonus longueur</span><span class="go-val">+${len} pts</span></div>
    ${qf>0 ? `<div class="go-row"><span>Quinte Flush ×${qf}</span><span class="go-val">+${qf*75} pts</span></div>` : ""}
    ${q>0  ? `<div class="go-row"><span>Quinte ×${q}</span><span class="go-val">+${q*50} pts</span></div>` : ""}
    ${qa>0 ? `<div class="go-row"><span>Quarte ×${qa}</span><span class="go-val">+${qa*25} pts</span></div>` : ""}
    <div class="go-row" style="border-bottom:none;border-top:1px solid var(--border);padding-top:8px;margin-top:4px">
      <span style="font-weight:700;color:var(--text)">TOTAL</span>
      <span class="go-val" style="font-size:18px">${total} pts</span>
    </div>`;
}

let toastEl = null;
function showToast(msg) {
  if (toastEl) toastEl.remove();
  toastEl = document.createElement("div");
  toastEl.className = "toast";
  toastEl.textContent = msg;
  document.body.appendChild(toastEl);
  if (state.toastTimer) clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => { if (toastEl) { toastEl.remove(); toastEl = null; } }, 1800);
}

let badgeEl = null;
function showBonusBadge(text) {
  if (badgeEl) badgeEl.remove();
  badgeEl = document.createElement("div");
  badgeEl.className = "bonus-badge";
  badgeEl.textContent = text;
  document.body.appendChild(badgeEl);
  if (state.bonusTimer) clearTimeout(state.bonusTimer);
  state.bonusTimer = setTimeout(() => { if (badgeEl) { badgeEl.remove(); badgeEl = null; } }, 2500);
}

// Event listeners via délégation — robuste même si Supabase charge en asynchrone
function bindListeners() {
  const safe = (id, fn) => { const el = document.getElementById(id); if(el) el.addEventListener("click", fn); };
  safe("start-btn",   () => { isDailyMode=false; isDuelMode=false; state.deck=[]; startGame(); });
  safe("btn-clear",   clearSelection);
  safe("btn-validate", handleValidate);
  safe("btn-menu",    () => { if(state.intervalId) clearInterval(state.intervalId); buildSplash(); showScreen("splash"); });
  safe("btn-help",    () => showTutorial(0));
  safe("btn-help-splash", () => showTutorial(0));
  safe("go-replay",   () => { isDailyMode=false; isDuelMode=false; duelId=null; state.deck=[]; startGame(); });
  safe("btn-back",    () => { buildSplash(); showScreen("splash"); });
  safe("tuto-next",   () => { if(tutoStep<TUTO_STEPS-1){tutoStep++;renderTutoStep();}else{closeTutorial();} });
  safe("tuto-skip",   closeTutorial);
}
// Appel immédiat + après DOMContentLoaded pour être sûr
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindListeners);
} else {
  bindListeners();
}


// ── TUTORIEL ──
const TUTO_STEPS = 8;
let tutoStep = 0;

function showTutorial(fromStep) {
  tutoStep = fromStep || 0;
  renderTutoStep();
  document.getElementById("tutorial").classList.remove("hidden");
}

function closeTutorial() {
  document.getElementById("tutorial").classList.add("hidden");
  localStorage.setItem("fw_tuto_seen", "1");
}

function renderTutoStep() {
  document.querySelectorAll(".tuto-step").forEach((el, i) => {
    el.classList.toggle("active", i === tutoStep);
  });
  // Dots
  const dotsEl = document.getElementById("tuto-dots");
  dotsEl.innerHTML = "";
  for (let i = 0; i < TUTO_STEPS; i++) {
    const d = document.createElement("div");
    d.className = "tuto-dot" + (i === tutoStep ? " on" : "");
    dotsEl.appendChild(d);
  }
  // Bouton suivant / terminer
  const nextBtn = document.getElementById("tuto-next");
  const skipBtn = document.getElementById("tuto-skip");
  if (tutoStep === TUTO_STEPS - 1) {
    nextBtn.textContent = "JOUER !";
    skipBtn.style.display = "none";
  } else {
    nextBtn.textContent = "SUIVANT →";
    skipBtn.style.display = "";
  }
}

document.getElementById("btn-help-splash").addEventListener("click", () => showTutorial(0));

// init via initApp() after Supabase loads
