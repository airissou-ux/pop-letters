// Calcul du score : bonus de longueur + figures (Quarte / Quinte / Quinte Flush).

/**
 * Calcule les bonus pour une liste de mots.
 * - bonus de longueur : 6L +1, 7L +2, 8L +3, 9L +5, 10L+ +10
 * - figures (cumulables, comptées indépendamment) :
 *     Quarte (5+6+7+8L) +25, Quinte (5..9L) +50, Quinte Flush (6..10L) +75
 * @param {string[]} wordList
 * @returns {{len:number, fig:number, figLabel:string|null, qf:number, q:number, qa:number}}
 */
export function calcBonus(wordList) {
  const cnt = { 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }
  wordList.forEach((w) => {
    const l = Math.min(w.length, 10)
    cnt[l >= 10 ? 10 : l]++
  })

  let len = 0
  len += cnt[6] * 1
  len += cnt[7] * 2
  len += cnt[8] * 3
  len += cnt[9] * 5
  len += cnt[10] * 10

  const qf = Math.min(cnt[6], cnt[7], cnt[8], cnt[9], cnt[10]) // Quinte Flush
  const q = Math.min(cnt[5], cnt[6], cnt[7], cnt[8], cnt[9]) // Quinte
  const qa = Math.min(cnt[5], cnt[6], cnt[7], cnt[8]) // Quarte

  const fig = qf * 75 + q * 50 + qa * 25

  let figLabel = null
  if (qf > 0) figLabel = qf > 1 ? `${qf}× QUINTE FLUSH !` : 'QUINTE FLUSH !'
  else if (q > 0) figLabel = q > 1 ? `${q}× QUINTE !` : 'QUINTE !'
  else if (qa > 0) figLabel = qa > 1 ? `${qa}× QUARTE !` : 'QUARTE !'

  return { len, fig, figLabel, qf, q, qa }
}

/**
 * Score final détaillé d'une partie (lettres + bonus longueur + figures).
 * @param {string[]} wordList
 */
export function computeFinalScore(wordList) {
  const bonus = calcBonus(wordList)
  const base = wordList.reduce((s, w) => s + w.length, 0)
  const total = base + bonus.len + bonus.fig
  return { ...bonus, base, total }
}
