// Tirages aléatoires et déterministes (mode « POP du jour » / duel).

/** Date du jour au format `YYYY-MM-DD` (heure locale). */
export function getDailyDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`
}

/** Graine déterministe dérivée de la date du jour (hash type djb2). */
export function getDailySeed(now = new Date()) {
  const date = getDailyDate(now)
  let h = 0
  for (let i = 0; i < date.length; i++) {
    h = (h << 5) - h + date.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

/** Mélange déterministe (Fisher-Yates + LCG) — même graine ⇒ même ordre. */
export function seededShuffle(arr, seed) {
  const a = [...arr]
  let s = seed
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(s) % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Mélange aléatoire (Fisher-Yates) — mode solo classique. */
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
