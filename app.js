// =====================================================================
// GlycoQuest — logique de l'application
// Les données restent sur l'appareil (localStorage). Aucun serveur.
// =====================================================================
"use strict";

// ---------- Constantes ----------------------------------------------------
const STORE_KEY = "glycoquest-v1";
const DAY = 86400000;
const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

const CONTEXTES = [
  { id: "jeun", nom: "À jeun", e: "🌅" },
  { id: "avant", nom: "Avant repas", e: "🍽️" },
  { id: "apres", nom: "2 h après repas", e: "⏱️" },
  { id: "coucher", nom: "Au coucher", e: "🌙" },
  { id: "autre", nom: "Autre moment", e: "✳️" },
];
const CTX = Object.fromEntries(CONTEXTES.map(c => [c.id, c]));

const TYPES_REPAS = [
  { id: "petitdej", nom: "Petit-déjeuner", e: "☕" },
  { id: "dejeuner", nom: "Déjeuner", e: "🍽️" },
  { id: "diner", nom: "Dîner", e: "🌙" },
  { id: "collation", nom: "Collation", e: "🍎" },
];
const TREPAS = Object.fromEntries(TYPES_REPAS.map(t => [t.id, t]));

const MEDS = [
  { nom: "Ozempic (sémaglutide)", forme: "stylo", freq: "hebdo" },
  { nom: "Trulicity (dulaglutide)", forme: "stylo", freq: "hebdo" },
  { nom: "Mounjaro (tirzépatide)", forme: "stylo", freq: "hebdo" },
  { nom: "Wegovy (sémaglutide)", forme: "stylo", freq: "hebdo" },
  { nom: "Victoza (liraglutide)", forme: "stylo", freq: "quotidien" },
  { nom: "Rybelsus (sémaglutide comprimé)", forme: "comprime", freq: "quotidien" },
  { nom: "Autre GLP-1 hebdomadaire", forme: "stylo", freq: "hebdo" },
  { nom: "Autre GLP-1 quotidien", forme: "stylo", freq: "quotidien" },
];

// Zones d'injection (vues de face, "gauche" = côté gauche de la personne)
const SITES = [
  { id: "abd_hd", nom: "Ventre haut droit", court: "VHD", x: 104, y: 148 },
  { id: "abd_hg", nom: "Ventre haut gauche", court: "VHG", x: 156, y: 148 },
  { id: "abd_bd", nom: "Ventre bas droit", court: "VBD", x: 104, y: 188 },
  { id: "abd_bg", nom: "Ventre bas gauche", court: "VBG", x: 156, y: 188 },
  { id: "cui_d", nom: "Cuisse droite", court: "CD", x: 108, y: 268 },
  { id: "cui_g", nom: "Cuisse gauche", court: "CG", x: 152, y: 268 },
  { id: "bra_d", nom: "Bras droit", court: "BD", x: 52, y: 140 },
  { id: "bra_g", nom: "Bras gauche", court: "BG", x: 208, y: 140 },
];
const SITE = Object.fromEntries(SITES.map(s => [s.id, s]));

const SYMPTOMES = [
  { id: "nausees", nom: "Nausées", e: "🤢" },
  { id: "digestion", nom: "Troubles digestifs", e: "🌀" },
  { id: "appetit", nom: "Manque d'appétit", e: "🍽️" },
  { id: "fatigue", nom: "Fatigue", e: "😴" },
];

const LEVELS = [
  [0, "Débutant"], [100, "Apprenti"], [250, "Régulier"], [500, "Assidu"], [900, "Expert"],
  [1400, "Maître du sucre"], [2000, "Champion"], [3000, "Légende"], [4500, "Héros GlycoQuest"],
];

const FOOD = Object.fromEntries(FOODS.map(f => [f.id, f]));

// ---------- État ------------------------------------------------------------
function defaultState() {
  return {
    version: 1,
    settings: {
      nom: "", unite: "gL", grand: false, onboarded: false,
      cibles: { jeunMin: 80, jeunMax: 130, apresMax: 180 }, // en mg/dL
      traitement: { nom: MEDS[0].nom, forme: "stylo", freq: "hebdo", jour: 1, heure: "09:00" },
    },
    readings: [],   // { id, t, v (mg/dL), ctx, note }
    meals: [],      // { id, t, type, items: [{id, q}], score, carbs }
    injections: [], // { id, t, site }
    weights: [],    // { id, t, kg }
    symptoms: {},   // dayKey -> { nausees: 0..3, ... }
    done: {},       // dayKey -> [challengeId]
    water: {},      // dayKey -> nombre de verres
    quiz: {},       // dayKey -> { choix, ok }
    meta: { level: 1, badges: [] },
  };
}

let S = load();
let currentTab = "accueil";
let range = 14;          // jours affichés sur le graphique
let tipOffset = 0;       // pour "un autre conseil"
let draft = null;        // brouillon de la feuille ouverte

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultState();
    const d = JSON.parse(raw);
    const base = defaultState();
    return {
      ...base, ...d,
      settings: { ...base.settings, ...d.settings,
        cibles: { ...base.settings.cibles, ...(d.settings || {}).cibles },
        traitement: { ...base.settings.traitement, ...(d.settings || {}).traitement } },
      meta: { ...base.meta, ...d.meta },
    };
  } catch (e) {
    return defaultState();
  }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { toast("⚠️ Impossible d'enregistrer : mémoire pleine ?"); }
}
// Demande au navigateur de ne pas effacer les données
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

// ---------- Utilitaires -----------------------------------------------------
const $ = sel => document.querySelector(sel);
const pad = n => String(n).padStart(2, "0");
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function dayKey(d) { d = new Date(d); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function keyToDate(k) { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); }
function startOfDay(d) { d = new Date(d); d.setHours(0, 0, 0, 0); return d; }
function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / DAY); }
function today() { return dayKey(new Date()); }
function hhmm(t) { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function toLocalInput(t) { const d = new Date(t); return `${dayKey(d)}T${hhmm(d)}`; }
function fmtDay(k) {
  const d = keyToDate(k), diff = daysBetween(d, new Date());
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return `${cap(JOURS[d.getDay()])} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}
function fmtDate(t) { const d = new Date(t); return `${d.getDate()} ${MOIS[d.getMonth()]}`; }
const kgFmt = kg => kg.toFixed(1).replace(".", ",") + " kg";
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function hash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); }
function dayNumber(d = new Date()) { return Math.floor(startOfDay(d).getTime() / DAY + 0.5); }
function byDay(arr) {
  const m = {};
  arr.forEach(x => { const k = dayKey(x.t); (m[k] = m[k] || []).push(x); });
  return m;
}
const prenom = () => S.settings.nom || "champion";

// ---------- Glycémie --------------------------------------------------------
function gFmt(v, withUnit = true) {
  if (v == null) return "—";
  if (S.settings.unite === "gL") return (v / 100).toFixed(2).replace(".", ",") + (withUnit ? " g/L" : "");
  return Math.round(v) + (withUnit ? " mg/dL" : "");
}
function gUnit() { return S.settings.unite === "gL" ? "g/L" : "mg/dL"; }
function gParse(str) {
  const n = parseFloat(String(str).replace(",", "."));
  if (isNaN(n)) return null;
  return S.settings.unite === "gL" ? Math.round(n * 100) : Math.round(n);
}
function classify(v, ctx) {
  const c = S.settings.cibles;
  if (v < 70) return { k: "bad", label: "Hypo" };
  const strict = ctx === "jeun" || ctx === "avant";
  const min = strict ? c.jeunMin : 70;
  const max = strict ? c.jeunMax : c.apresMax;
  if (v < min) return { k: "warn", label: "Un peu bas" };
  if (v <= max) return { k: "ok", label: "Dans la cible" };
  if (v < 250) return { k: "warn", label: "Élevé" };
  return { k: "bad", label: "Très élevé" };
}
function readingsSince(days) {
  const from = startOfDay(Date.now() - (days - 1) * DAY).getTime();
  return S.readings.filter(r => r.t >= from).sort((a, b) => a.t - b.t);
}
function statsOf(list) {
  if (!list.length) return null;
  const vals = list.map(r => r.v);
  const ok = list.filter(r => classify(r.v, r.ctx).k === "ok").length;
  return {
    n: list.length, moy: vals.reduce((a, b) => a + b, 0) / vals.length,
    min: Math.min(...vals), max: Math.max(...vals),
    pctOk: Math.round(ok * 100 / list.length),
    hypos: list.filter(r => r.v < 70).length,
  };
}

// ---------- Repas -----------------------------------------------------------
function mealRole(f) {
  if (f.tags.includes("sucre")) return "sucre";
  if (f.cat === "Légumes") return "leg";
  if (f.g >= 15) return "fec";
  if (f.tags.includes("pro")) return "pro";
  return null;
}
function scoreMeal(items) {
  let carbs = 0, high = 0, sucre = 0, leg = 0, pro = 0, fib = 0;
  const parts = { leg: 0, pro: 0, fec: 0, sucre: 0 };
  items.forEach(it => {
    const f = FOOD[it.id]; if (!f) return;
    carbs += f.g * it.q;
    if (f.ig === "h" && f.g >= 10) high += it.q;
    if (f.tags.includes("sucre")) sucre += it.q;
    if (f.tags.includes("leg")) leg += it.q;
    if (f.tags.includes("pro")) pro += it.q;
    if (f.tags.includes("fib")) fib += it.q;
    const r = mealRole(f); if (r) parts[r] += it.q;
  });
  let s = 100; const conseils = [];
  if (carbs > 60) { s -= Math.min(40, (carbs - 60) * 0.7); conseils.push("Beaucoup de glucides : réduis un peu la portion de féculents."); }
  if (high > 0) { s -= Math.min(24, high * 8); conseils.push("Remplace un aliment à index glycémique élevé (pain blanc, riz blanc, pommes de terre) par sa version complète ou par des légumineuses."); }
  if (sucre > 0) { s -= Math.min(24, sucre * 10); conseils.push("Le sucré passe mieux en fin de repas et en petite quantité."); }
  if (leg === 0 && carbs >= 15) { s -= 15; conseils.push("Ajoute des légumes : leurs fibres freinent la montée du sucre."); }
  if (pro === 0 && carbs >= 15) { s -= 10; conseils.push("Ajoute une protéine (œuf, yaourt, viande, poisson) pour être rassasié plus longtemps."); }
  if (fib > 0) s += 5;
  if (leg >= 1.5) s += 5;
  s = clamp(Math.round(s), 0, 100);
  if (!items.length) s = 0;
  if (items.length && !conseils.length) conseils.push("Assiette bien équilibrée, bravo ! 👏");
  return { score: s, carbs: Math.round(carbs), conseils, couleur: s >= 70 ? "ok" : s >= 45 ? "warn" : "bad", parts };
}
function scoreLabel(s) { return s >= 85 ? "Excellent" : s >= 70 ? "Très bien" : s >= 45 ? "Moyen" : "À améliorer"; }
function scoreClass(s) { return s >= 70 ? "ok" : s >= 45 ? "warn" : "bad"; }
function postMealReading(meal) {
  return S.readings.find(r => r.ctx === "apres" && r.t > meal.t + 45 * 60000 && r.t < meal.t + 4 * 3600000);
}
function guessMealType(d = new Date()) {
  const h = d.getHours();
  if (h < 10.5) return "petitdej";
  if (h < 15) return "dejeuner";
  if (h >= 18) return "diner";
  return "collation";
}

// ---------- Traitement ------------------------------------------------------
function med() { return S.settings.traitement; }
function isPill() { return med().forme === "comprime"; }
function actWord() { return isPill() ? "prise" : "injection"; }
function lastInjection() { return [...S.injections].sort((a, b) => b.t - a.t)[0]; }
function nextDue() {
  const m = med(), last = lastInjection(), now = new Date();
  const [hh, mm] = (m.heure || "09:00").split(":").map(Number);
  if (m.freq === "quotidien") {
    const doneToday = last && dayKey(last.t) === today();
    const d = startOfDay(now); if (doneToday) d.setDate(d.getDate() + 1);
    d.setHours(hh, mm);
    return { date: d, doneToday };
  }
  let d;
  if (last) { d = startOfDay(last.t); d.setDate(d.getDate() + 7); }
  else { d = startOfDay(now); while (d.getDay() !== Number(m.jour)) d.setDate(d.getDate() + 1); }
  d.setHours(hh, mm);
  return { date: d, doneToday: last && dayKey(last.t) === today() };
}
function dueText() {
  const { date, doneToday } = nextDue(), diff = daysBetween(new Date(), date);
  const jour = JOURS[date.getDay()];
  if (diff < 0) return { big: `En retard de ${-diff} j`, small: `Prévue ${jour} ${fmtDate(date)}`, k: "bad" };
  if (diff === 0) return { big: "C'est aujourd'hui !", small: `À ${hhmm(date)}`, k: "warn" };
  if (doneToday) return { big: "Fait aujourd'hui ✅", small: `Prochaine : ${jour} ${fmtDate(date)}`, k: "ok" };
  return { big: diff === 1 ? "Demain" : `Dans ${diff} jours`, small: `${cap(jour)} ${fmtDate(date)} à ${hhmm(date)}`, k: "ok" };
}
function suggestedSite() {
  const lastUse = {};
  S.injections.forEach(i => { if (i.site && (!lastUse[i.site] || i.t > lastUse[i.site])) lastUse[i.site] = i.t; });
  let best = SITES[0], bestT = Infinity;
  SITES.forEach(s => { const t = lastUse[s.id] || 0; if (t < bestT) { bestT = t; best = s; } });
  return best.id;
}

// ---------- Jeu : défis, XP, niveaux, badges ------------------------------
function dailyChallenges(k = today()) {
  const groups = ["mesure", "repas", "bouger"];
  return groups.map(g => {
    const pool = CHALLENGES.filter(c => c.groupe === g);
    return pool[hash(k + g) % pool.length];
  });
}
function autoDone(id, k) {
  const rs = S.readings.filter(r => dayKey(r.t) === k);
  const ms = S.meals.filter(m => dayKey(m.t) === k);
  switch (id) {
    case "mesure_jeun": return rs.some(r => r.ctx === "jeun");
    case "deux_mesures": return rs.length >= 2;
    case "mesure_apres": return rs.some(r => r.ctx === "apres");
    case "repas_vert": return ms.some(m => m.score >= 70);
    case "deux_repas": return ms.length >= 2;
    case "legumes": return ms.filter(m => m.items.some(i => FOOD[i.id] && FOOD[i.id].tags.includes("leg"))).length >= 2;
    case "eau": return (S.water[k] || 0) >= 6;
  }
  return false;
}
function isDone(id, k = today()) { return (S.done[k] || []).includes(id); }
function refreshAutoChallenges() {
  const k = today();
  dailyChallenges(k).forEach(c => {
    if (c.type !== "auto") return;
    const list = S.done[k] = S.done[k] || [];
    const ok = autoDone(c.id, k), has = list.includes(c.id);
    if (ok && !has) list.push(c.id);
    if (!ok && has) list.splice(list.indexOf(c.id), 1);
  });
}
function computeXP() {
  let xp = 0;
  xp += S.readings.length * 10;
  S.meals.forEach(m => { xp += 10 + (m.score >= 70 ? 5 : 0); });
  xp += S.injections.length * (med().freq === "hebdo" ? 30 : 8);
  xp += S.weights.length * 5;
  xp += Object.keys(S.symptoms).length * 3;
  Object.values(S.quiz).forEach(q => { xp += q.ok ? 15 : 5; });
  Object.values(S.done).forEach(l => { xp += l.length * 20; });
  return xp;
}
function levelInfo(xp) {
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  let n = i + 1, title = LEVELS[i][1], cur = LEVELS[i][0], next = LEVELS[i + 1] ? LEVELS[i + 1][0] : null;
  if (!next) {
    const extra = Math.floor((xp - cur) / 1500);
    n += extra; cur += extra * 1500; next = cur + 1500;
    if (extra) title = `${LEVELS[i][1]} ★${extra}`;
  }
  return { n, title, cur, next, xp, pct: Math.round((xp - cur) * 100 / (next - cur)) };
}
function readingDays() { return new Set(S.readings.map(r => dayKey(r.t))); }
function currentStreak() {
  const days = readingDays(); let d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function bestStreak() {
  const keys = [...readingDays()].sort(); let best = 0, run = 0, prev = null;
  keys.forEach(k => {
    const d = keyToDate(k);
    run = prev && daysBetween(prev, d) === 1 ? run + 1 : 1;
    best = Math.max(best, run); prev = d;
  });
  return best;
}
const BADGES = [
  { id: "premiere", e: "🩸", nm: "Première mesure", d: "Enregistrer une glycémie", test: () => S.readings.length >= 1 },
  { id: "serie3", e: "🔥", nm: "3 jours de suite", d: "Mesurer 3 jours d'affilée", test: () => bestStreak() >= 3 },
  { id: "serie7", e: "🔥", nm: "Semaine parfaite", d: "Mesurer 7 jours d'affilée", test: () => bestStreak() >= 7 },
  { id: "serie30", e: "🌋", nm: "Mois de feu", d: "Mesurer 30 jours d'affilée", test: () => bestStreak() >= 30 },
  { id: "mesures50", e: "📈", nm: "50 mesures", d: "50 glycémies enregistrées", test: () => S.readings.length >= 50 },
  { id: "mesures200", e: "🧪", nm: "Scientifique", d: "200 glycémies enregistrées", test: () => S.readings.length >= 200 },
  { id: "cible", e: "🎯", nm: "Dans le mille", d: "70 % des mesures des 7 derniers jours dans la cible (7 mesures min.)", test: () => { const s = statsOf(readingsSince(7)); return !!s && s.n >= 7 && s.pctOk >= 70; } },
  { id: "repas1", e: "🍽️", nm: "Premier repas", d: "Noter un repas", test: () => S.meals.length >= 1 },
  { id: "vert10", e: "🥦", nm: "Main verte", d: "10 repas notés verts", test: () => S.meals.filter(m => m.score >= 70).length >= 10 },
  { id: "vert50", e: "🌳", nm: "Chef équilibré", d: "50 repas notés verts", test: () => S.meals.filter(m => m.score >= 70).length >= 50 },
  { id: "inj1", e: "💉", nm: "C'est parti", d: "Noter un premier traitement", test: () => S.injections.length >= 1 },
  { id: "inj4", e: "📅", nm: "Un mois de traitement", d: "Un mois de prises notées", test: () => S.injections.length >= (med().freq === "hebdo" ? 4 : 28) },
  { id: "inj12", e: "🏅", nm: "Trois mois", d: "Trois mois de prises notées", test: () => S.injections.length >= (med().freq === "hebdo" ? 12 : 84) },
  { id: "eau", e: "💧", nm: "Bien hydraté", d: "6 verres d'eau en une journée", test: () => Object.values(S.water).some(n => n >= 6) },
  { id: "quiz10", e: "🧠", nm: "Cerveau en or", d: "10 bonnes réponses au quiz", test: () => Object.values(S.quiz).filter(q => q.ok).length >= 10 },
  { id: "defis20", e: "⚡", nm: "Relève les défis", d: "20 défis réussis", test: () => Object.values(S.done).reduce((a, l) => a + l.length, 0) >= 20 },
  { id: "poids", e: "⚖️", nm: "Sur la balance", d: "5 pesées notées", test: () => S.weights.length >= 5 },
  { id: "niv5", e: "👑", nm: "Expert", d: "Atteindre le niveau 5", test: () => levelInfo(computeXP()).n >= 5 },
];

// Appelé après chaque modification : sauvegarde, défis, célébrations.
function afterChange(msg) {
  refreshAutoChallenges();
  const lvl = levelInfo(computeXP());
  const newBadges = BADGES.filter(b => !S.meta.badges.includes(b.id) && b.test());
  const levelUp = lvl.n > S.meta.level;
  S.meta.level = Math.max(S.meta.level, lvl.n);
  newBadges.forEach(b => S.meta.badges.push(b.id));
  save();
  render();
  if (levelUp || newBadges.length) {
    setTimeout(() => celebrate(levelUp ? lvl : null, newBadges), 350);
  } else if (msg) toast(msg);
}

// ---------- Rendu général ---------------------------------------------------
function render() {
  document.documentElement.classList.toggle("grand", !!S.settings.grand);
  const lvl = levelInfo(computeXP());
  $("#xpChipText").textContent = `Niv. ${lvl.n} · ${lvl.xp} XP`;
  document.querySelectorAll("#tabbar button").forEach(b => b.classList.toggle("active", b.dataset.tab === currentTab));
  const views = { accueil: viewAccueil, glycemie: viewGlycemie, repas: viewRepas, traitement: viewTraitement, trophees: viewTrophees };
  const titles = { accueil: "GlycoQuest", glycemie: "Glycémie", repas: "Repas", traitement: "Traitement", trophees: "Trophées" };
  $("#topTitle").textContent = titles[currentTab];
  $("#main").innerHTML = views[currentTab]();
}
function go(tab) { currentTab = tab; render(); window.scrollTo(0, 0); }

// ---------- Vue : Accueil ---------------------------------------------------
function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Bonne nuit" : h < 18 ? "Bonjour" : "Bonsoir";
}
function mascotMessage() {
  const k = today();
  const rs = S.readings.filter(r => dayKey(r.t) === k);
  const due = dueText();
  const h = new Date().getHours();
  if (due.k === "bad") return `Ton ${actWord()} de ${med().nom.split(" ")[0]} est en retard. On le note dès que c'est fait ?`;
  if (due.big === "C'est aujourd'hui !") return `C'est le jour de ton ${actWord()} ! N'oublie pas de changer de zone.`;
  if (!rs.length && h < 11) return "On commence la journée par la glycémie à jeun ? 🩸";
  if (!rs.length) return "Pas encore de mesure aujourd'hui. Une petite piqûre au doigt ?";
  const last = rs[rs.length - 1], c = classify(last.v, last.ctx);
  if (c.k === "ok") return `Dernière mesure ${gFmt(last.v)} : dans la cible, bravo ! 🎉`;
  if (last.v < 70) return "Ta dernière mesure était basse. Tu te sens bien maintenant ?";
  return `Dernière mesure ${gFmt(last.v)}. Une petite marche peut aider à la faire baisser. 🚶`;
}
function viewAccueil() {
  const lvl = levelInfo(computeXP());
  const streak = currentStreak();
  const k = today();
  const lastR = [...S.readings].sort((a, b) => b.t - a.t)[0];
  const due = dueText();
  const tip = TIPS[(dayNumber() + tipOffset) % TIPS.length];
  const water = S.water[k] || 0;
  const qi = QUIZ[hash("quiz" + k) % QUIZ.length];
  const qa = S.quiz[k];

  return `
  <div class="card tint-primary">
    <div class="mascot">
      <div class="face">🦉</div>
      <div class="bubble"><b>${greeting()} ${esc(prenom())} !</b><br>${esc(mascotMessage())}</div>
    </div>
  </div>

  <div class="card">
    <div class="level-row">
      <div class="level-badge">${lvl.n}</div>
      <div class="grow">
        <div class="row" style="justify-content:space-between"><b>${esc(lvl.title)}</b><span class="streak">🔥 ${streak} j</span></div>
        <div class="bar" style="margin:6px 0 4px"><i style="width:${lvl.pct}%"></i></div>
        <div class="small muted">${lvl.xp} XP · encore ${lvl.next - lvl.xp} XP pour le niveau ${lvl.n + 1}</div>
      </div>
    </div>
  </div>

  <div class="grid2">
    <button class="btn" onclick="A.addReading()">🩸 Glycémie</button>
    <button class="btn secondary" onclick="A.addMeal()">🍽️ Repas</button>
  </div>

  <div class="grid2">
    <div class="card" onclick="go('glycemie')" style="margin-bottom:0">
      <div class="small muted">Dernière glycémie</div>
      ${lastR ? `<div class="big-value" style="font-size:1.9em;margin:4px 0">${gFmt(lastR.v, false)}<span class="unit">${gUnit()}</span></div>
        <span class="pill ${classify(lastR.v, lastR.ctx).k}">${classify(lastR.v, lastR.ctx).label}</span>
        <div class="small muted" style="margin-top:4px">${fmtDay(dayKey(lastR.t))} ${hhmm(lastR.t)}</div>`
        : `<div class="muted" style="margin-top:8px">Aucune mesure</div>`}
    </div>
    <div class="card" onclick="go('traitement')" style="margin-bottom:0">
      <div class="small muted">${cap(actWord())} GLP-1</div>
      <div style="font-weight:900;font-size:1.25em;margin:6px 0">${due.big}</div>
      <span class="pill ${due.k}">${esc(due.small)}</span>
    </div>
  </div>

  <div class="card">
    <div class="card-head"><h2>⚡ Défis du jour</h2><span class="small muted">+20 XP chacun</span></div>
    ${dailyChallenges(k).map(c => {
      const d = isDone(c.id);
      return `<div class="challenge ${d ? "done" : ""}">
        <span class="em">${c.e}</span>
        <div class="grow"><div style="font-weight:600">${esc(c.t)}</div>
          <div class="small muted">${c.type === "auto" ? "Validé automatiquement" : "Coche quand c'est fait"}</div></div>
        <button class="check ${d ? "done" : ""}" ${c.type === "auto" ? "disabled" : `onclick="A.toggleChallenge('${c.id}')"`}>${d ? "✓" : ""}</button>
      </div>`;
    }).join("")}
    <div style="margin-top:10px">
      <div class="row" style="justify-content:space-between"><b>💧 Eau</b><span class="small muted">${water} / 6 verres</span></div>
      <div class="water">${Array.from({ length: 8 }, (_, i) =>
        `<button class="${i < water ? "on" : ""}" onclick="A.setWater(${i + 1})" aria-label="${i + 1} verres">🥛</button>`).join("")}</div>
    </div>
  </div>

  <div class="card tint-gold">
    <div class="card-head"><h3>${tip.e} Conseil du jour</h3>
      <button class="btn small ghost" onclick="A.nextTip()">Un autre</button></div>
    <div>${esc(tip.t)}</div>
  </div>

  <div class="card">
    <div class="card-head"><h3>🧠 Quiz du jour</h3><span class="small muted">+15 XP</span></div>
    <div style="font-weight:700;margin-bottom:6px">${esc(qi.q)}</div>
    ${qi.r.map((r, i) => {
      let cls = "";
      if (qa) { if (i === qi.ok) cls = "right"; else if (i === qa.choix) cls = "wrong"; }
      return `<button class="quiz-opt ${cls}" ${qa ? "disabled" : `onclick="A.answerQuiz(${i})"`}>${esc(r)}</button>`;
    }).join("")}
    ${qa ? `<div class="alert ${qa.ok ? "ok" : "warn"}">${qa.ok ? "Bonne réponse ! 🎉" : "Pas tout à fait…"}<p>${esc(qi.x)}</p></div>` : ""}
  </div>

  <p class="disclaimer">GlycoQuest aide au suivi mais ne remplace pas l'avis de ton médecin.<br>Tes données restent sur ce téléphone.</p>`;
}

// ---------- Vue : Glycémie --------------------------------------------------
function viewGlycemie() {
  const list = readingsSince(range);
  const st = statsOf(list);
  const c = S.settings.cibles;
  const now = Date.now();
  const chart = lineChart(list.map(r => ({ t: r.t, v: r.v, k: classify(r.v, r.ctx).k })), {
    xStart: startOfDay(now - (range - 1) * DAY).getTime(), xEnd: startOfDay(now).getTime() + DAY,
    band: [c.jeunMin, c.jeunMax], line: c.apresMax, fmt: v => gFmt(v, false), minY: 50, maxY: 250,
  });
  const byCtx = CONTEXTES.map(cx => ({ cx, s: statsOf(list.filter(r => r.ctx === cx.id)) })).filter(x => x.s);
  const groups = byDay([...S.readings].sort((a, b) => b.t - a.t));
  const keys = Object.keys(groups).sort().reverse().slice(0, 30);

  return `
  <div class="card">
    <div class="seg" style="margin-bottom:10px">
      ${[7, 14, 30].map(n => `<button class="${range === n ? "on" : ""}" onclick="A.setRange(${n})">${n} jours</button>`).join("")}
    </div>
    ${list.length ? chart : `<div class="empty"><span class="em">📉</span>Ta courbe apparaîtra ici dès la première mesure.</div>`}
    <div class="small muted center" style="margin-top:4px">Bande verte : cible à jeun (${gFmt(c.jeunMin, false)}–${gFmt(c.jeunMax)}) · pointillés : max. après repas</div>
  </div>

  ${st ? `<div class="grid3">
    <div class="stat"><b>${gFmt(st.moy, false)}</b><span>Moyenne</span></div>
    <div class="stat"><b>${st.pctOk} %</b><span>Dans la cible</span></div>
    <div class="stat"><b>${st.n}</b><span>Mesures</span></div>
  </div>
  <div class="card">
    <h3>Par moment de la journée</h3>
    <ul class="list">${byCtx.map(x => `<li><span style="font-size:1.4em">${x.cx.e}</span>
      <div class="grow"><b>${x.cx.nom}</b><div class="small muted">${x.s.n} mesure${x.s.n > 1 ? "s" : ""} · min ${gFmt(x.s.min, false)} · max ${gFmt(x.s.max, false)}</div></div>
      <b>${gFmt(x.s.moy)}</b></li>`).join("")}</ul>
    ${st.hypos ? `<div class="alert bad">${st.hypos} hypoglycémie${st.hypos > 1 ? "s" : ""} sur la période<p>Parles-en à ton médecin, surtout si tu prends d'autres médicaments du diabète.</p></div>` : ""}
  </div>` : ""}

  <div class="card">
    <h3>Historique</h3>
    ${keys.length ? keys.map(k => `<div class="small muted" style="margin-top:10px;font-weight:700">${fmtDay(k)}</div>
      <ul class="list">${groups[k].map(r => { const cl = classify(r.v, r.ctx); return `
        <li onclick="A.addReading('${r.id}')"><span class="dot ${cl.k}"></span>
          <div class="grow"><b>${gFmt(r.v)}</b> <span class="small muted">· ${CTX[r.ctx].e} ${CTX[r.ctx].nom}</span>
          ${r.note ? `<div class="small muted">${esc(r.note)}</div>` : ""}</div>
          <span class="small muted">${hhmm(r.t)}</span></li>`; }).join("")}</ul>`).join("")
      : `<div class="empty"><span class="em">🩸</span>Aucune mesure pour l'instant.</div>`}
  </div>
  <button class="btn-fab" onclick="A.addReading()" aria-label="Ajouter une glycémie">+</button>`;
}

// Graphique en SVG (sans bibliothèque)
function lineChart(points, o) {
  const W = 340, H = 190, L = 38, R = 8, T = 10, B = 24;
  const vals = points.map(p => p.v);
  let minY = Math.min(o.minY ?? Infinity, ...vals), maxY = Math.max(o.maxY ?? -Infinity, ...vals);
  if (o.band) { minY = Math.min(minY, o.band[0]); maxY = Math.max(maxY, o.band[1]); }
  if (o.line) maxY = Math.max(maxY, o.line);
  if (maxY - minY < 1) { minY -= 1; maxY += 1; }
  const raw = (maxY - minY) / 4, mag = 10 ** Math.floor(Math.log10(raw)), f = raw / mag;
  const step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
  minY = Math.floor(minY / step) * step; maxY = Math.ceil(maxY / step) * step;
  const x = t => L + (t - o.xStart) / (o.xEnd - o.xStart) * (W - L - R);
  const y = v => T + (1 - (v - minY) / (maxY - minY)) * (H - T - B);
  let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Graphique">`;
  if (o.band) svg += `<rect x="${L}" width="${W - L - R}" y="${y(o.band[1])}" height="${y(o.band[0]) - y(o.band[1])}" fill="var(--ok)" opacity=".13" rx="4"/>`;
  if (o.line) svg += `<line x1="${L}" x2="${W - R}" y1="${y(o.line)}" y2="${y(o.line)}" stroke="var(--warn)" stroke-dasharray="4 4" stroke-width="1.5"/>`;
  // grille Y
  for (let v = minY; v <= maxY + step / 2; v += step) {
    svg += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/>`;
    svg += `<text x="${L - 5}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="var(--muted)">${o.fmt(v)}</text>`;
  }
  // étiquettes X
  const nDays = Math.round((o.xEnd - o.xStart) / DAY);
  const every = nDays <= 7 ? 1 : nDays <= 14 ? 2 : 5;
  for (let i = 0; i < nDays; i += every) {
    const t = o.xStart + i * DAY + DAY / 2; const d = new Date(t);
    svg += `<text x="${x(t)}" y="${H - 6}" text-anchor="middle" font-size="10" fill="var(--muted)">${d.getDate()}/${d.getMonth() + 1}</text>`;
  }
  if (points.length > 1) {
    svg += `<polyline fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" points="${points.map(p => `${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ")}"/>`;
  }
  const colors = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--bad)" };
  points.forEach(p => {
    svg += `<circle cx="${x(p.t).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="4.5" fill="${colors[p.k] || "var(--primary)"}" stroke="var(--card)" stroke-width="1.5"/>`;
  });
  return svg + `</svg>`;
}

// ---------- Vue : Repas -----------------------------------------------------
function viewRepas() {
  const meals = [...S.meals].sort((a, b) => b.t - a.t);
  const week = meals.filter(m => m.t >= Date.now() - 7 * DAY);
  const avg = week.length ? Math.round(week.reduce((a, m) => a + m.score, 0) / week.length) : null;
  const groups = byDay(meals);
  const keys = Object.keys(groups).sort().reverse().slice(0, 30);

  // Aliments à surveiller : présents dans des repas suivis d'une glycémie trop haute
  const suspects = {}, apresMax = S.settings.cibles.apresMax;
  S.meals.forEach(m => {
    const r = postMealReading(m);
    if (r && r.v > apresMax) m.items.forEach(i => { if (FOOD[i.id] && FOOD[i.id].g >= 10) suspects[i.id] = (suspects[i.id] || 0) + 1; });
  });
  const top = Object.entries(suspects).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return `
  <div class="card tint-primary">
    <div class="row">
      <div style="font-size:2.4em">🍽️</div>
      <div class="grow">
        <b>Note de la semaine</b>
        <div class="small">${avg != null ? `Moyenne de tes ${week.length} repas : <b>${avg}/100</b> · ${scoreLabel(avg)}` : "Note ton premier repas pour obtenir ta note."}</div>
      </div>
    </div>
    ${avg != null ? `<div class="bar green" style="margin-top:10px"><i style="width:${avg}%"></i></div>` : ""}
  </div>

  ${top.length ? `<div class="card">
    <h3>🔎 Aliments à surveiller</h3>
    <div class="small muted" style="margin-bottom:6px">Présents dans des repas suivis d'une glycémie au-dessus de ${gFmt(apresMax)} 2 h après.</div>
    <div class="chips">${top.map(([id, n]) => `<span class="chip">${FOOD[id].emoji} ${esc(FOOD[id].nom)} · ${n}×</span>`).join("")}</div>
  </div>` : `<div class="card"><div class="small"><b>💡 Astuce :</b> mesure ta glycémie 2 h après un repas. L'app reliera la mesure au repas et repérera les aliments qui te font le plus monter.</div></div>`}

  <div class="card">
    <h3>Journal</h3>
    ${keys.length ? keys.map(k => `<div class="small muted" style="margin-top:10px;font-weight:700">${fmtDay(k)}</div>
      <ul class="list">${groups[k].map(m => { const r = postMealReading(m); return `
        <li onclick="A.addMeal('${m.id}')">
          <span class="pill ${scoreClass(m.score)}" style="min-width:48px;text-align:center">${m.score}</span>
          <div class="grow"><b>${TREPAS[m.type].e} ${TREPAS[m.type].nom}</b> <span class="small muted">· ${hhmm(m.t)} · ${m.carbs} g glucides</span>
            <div style="font-size:1.2em">${m.items.map(i => FOOD[i.id] ? FOOD[i.id].emoji : "").join(" ")}</div>
            ${r ? `<div class="small">2 h après : <span class="pill ${classify(r.v, "apres").k}">${gFmt(r.v)}</span></div>` : ""}
          </div></li>`; }).join("")}</ul>`).join("")
      : `<div class="empty"><span class="em">🥗</span>Aucun repas noté pour l'instant.</div>`}
  </div>
  <button class="btn-fab" onclick="A.addMeal()" aria-label="Ajouter un repas">+</button>`;
}

function plateDonut(parts, size = 120) {
  const segs = [["leg", "#3fae5a"], ["pro", "#c0703a"], ["fec", "#e8b931"], ["sucre", "#d6457a"]];
  const total = segs.reduce((a, [k]) => a + parts[k], 0);
  const r = 15.9155, C = 100;
  let off = 25, out = `<svg viewBox="0 0 42 42" width="${size}" height="${size}">
    <circle cx="21" cy="21" r="${r}" fill="none" stroke="var(--line)" stroke-width="6"/>`;
  if (total > 0) segs.forEach(([k, col]) => {
    const p = parts[k] / total * C; if (!p) return;
    out += `<circle cx="21" cy="21" r="${r}" fill="none" stroke="${col}" stroke-width="6" stroke-dasharray="${p} ${C - p}" stroke-dashoffset="${off}"/>`;
    off -= p;
  });
  return out + `<text x="21" y="24" text-anchor="middle" font-size="8">🍽️</text></svg>`;
}

// ---------- Vue : Traitement ------------------------------------------------
function viewTraitement() {
  const m = med(), due = dueText();
  const inj = [...S.injections].sort((a, b) => b.t - a.t);
  const weights = [...S.weights].sort((a, b) => a.t - b.t);
  const lastW = weights[weights.length - 1], firstW = weights[0];
  const symK = Object.keys(S.symptoms).sort().reverse().slice(0, 7);
  const todaySym = S.symptoms[today()];

  let wChart = "";
  if (weights.length >= 2) {
    const w = weights.slice(-20);
    wChart = lineChart(w.map(p => ({ t: p.t, v: p.kg, k: "" })), {
      xStart: startOfDay(w[0].t).getTime(), xEnd: startOfDay(w[w.length - 1].t).getTime() + DAY,
      fmt: v => (Number.isInteger(Math.round(v * 100) / 100) ? v.toFixed(0) : v.toFixed(1)).replace(".", ","),
    });
  }

  return `
  <div class="card tint-primary">
    <div class="small muted">${esc(m.nom)} · ${m.freq === "hebdo" ? `chaque ${JOURS[m.jour]}` : "tous les jours"}</div>
    <div class="countdown">${due.big}</div>
    <div style="margin:4px 0 12px"><span class="pill ${due.k}">${esc(due.small)}</span></div>
    <button class="btn" onclick="A.addInjection()">${isPill() ? "💊 J'ai pris mon comprimé" : "💉 J'ai fait mon injection"}</button>
    ${!isPill() ? `<div class="small" style="margin-top:8px">Zone conseillée : <b>${SITE[suggestedSite()].nom}</b></div>` : ""}
  </div>

  <div class="card">
    <div class="card-head"><h3>🤢 Comment tu te sens ?</h3>
      <button class="btn small secondary" onclick="A.addSymptoms()">${todaySym ? "Modifier" : "Noter"}</button></div>
    <div class="small muted">Les effets digestifs sont fréquents au début du GLP-1 ou après une hausse de dose. Les noter aide ton médecin à ajuster.</div>
    ${symK.length ? `<ul class="list" style="margin-top:6px">${symK.map(k => {
      const s = S.symptoms[k], tot = SYMPTOMES.reduce((a, x) => a + (s[x.id] || 0), 0);
      return `<li><div class="grow"><b>${fmtDay(k)}</b><div class="small muted">${SYMPTOMES.filter(x => s[x.id]).map(x => `${x.e} ${x.nom} ${"●".repeat(s[x.id])}`).join(" · ") || "Rien à signaler 👍"}</div></div>
        <span class="pill ${tot === 0 ? "ok" : tot <= 3 ? "warn" : "bad"}">${tot === 0 ? "Bien" : tot <= 3 ? "Léger" : "Gênant"}</span></li>`;
    }).join("")}</ul>` : ""}
  </div>

  <div class="card">
    <div class="card-head"><h3>⚖️ Poids</h3><button class="btn small secondary" onclick="A.addWeight()">Peser</button></div>
    ${lastW ? `<div class="row"><div class="big-value" style="font-size:2em">${lastW.kg.toFixed(1).replace(".", ",")}<span class="unit">kg</span></div>
      ${firstW !== lastW ? `<span class="pill ${lastW.kg <= firstW.kg ? "ok" : "neutral"}">${lastW.kg - firstW.kg > 0 ? "+" : ""}${(lastW.kg - firstW.kg).toFixed(1).replace(".", ",")} kg depuis le ${fmtDate(firstW.t)}</span>` : ""}</div>
      ${wChart}` : `<div class="small muted">Une pesée par semaine suffit, le matin à jeun.</div>`}
  </div>

  <div class="card">
    <h3>🔔 Rappel dans le calendrier</h3>
    <div class="small muted" style="margin-bottom:8px">Ajoute un rappel ${m.freq === "hebdo" ? "chaque " + JOURS[m.jour] : "chaque jour"} à ${m.heure} dans le calendrier de l'iPhone.</div>
    <button class="btn secondary" onclick="A.calendar()">📅 Ajouter le rappel</button>
  </div>

  <div class="card">
    <h3>Historique des ${actWord()}s</h3>
    ${inj.length ? `<ul class="list">${inj.slice(0, 20).map(i => `<li onclick="A.addInjection('${i.id}')">
      <span style="font-size:1.4em">${isPill() ? "💊" : "💉"}</span>
      <div class="grow"><b>${fmtDay(dayKey(i.t))}</b> <span class="small muted">· ${hhmm(i.t)}</span>
      ${i.site && SITE[i.site] ? `<div class="small muted">${SITE[i.site].nom}</div>` : ""}</div></li>`).join("")}</ul>`
      : `<div class="empty"><span class="em">${isPill() ? "💊" : "💉"}</span>Rien de noté pour l'instant.</div>`}
  </div>`;
}

// ---------- Vue : Trophées --------------------------------------------------
function viewTrophees() {
  const lvl = levelInfo(computeXP());
  const unlocked = BADGES.filter(b => S.meta.badges.includes(b.id) || b.test());
  return `
  <div class="card tint-gold center">
    <div class="level-badge" style="margin:0 auto 8px;width:84px;height:84px;font-size:2.2em">${lvl.n}</div>
    <h2>${esc(lvl.title)}</h2>
    <div class="bar" style="margin:8px 0 4px"><i style="width:${lvl.pct}%"></i></div>
    <div class="small">${lvl.xp} XP · niveau ${lvl.n + 1} à ${lvl.next} XP</div>
    <div class="row" style="justify-content:center;gap:18px;margin-top:10px">
      <span class="streak">🔥 ${currentStreak()} j</span><span class="small muted">Record : ${bestStreak()} j</span>
    </div>
  </div>

  <div class="card">
    <div class="card-head"><h3>🏆 Badges</h3><span class="small muted">${unlocked.length}/${BADGES.length}</span></div>
    <div class="badges">${BADGES.map(b => {
      const ok = unlocked.includes(b);
      return `<button class="badge ${ok ? "" : "locked"}" style="border:0" onclick="A.badgeInfo('${b.id}')"><span class="em">${b.e}</span><span class="nm">${esc(b.nm)}</span></button>`;
    }).join("")}</div>
  </div>

  <div class="card">
    <h3>Comment gagner des XP ?</h3>
    <ul class="list small">
      <li>🩸 Une glycémie notée <b style="margin-left:auto">+10</b></li>
      <li>🍽️ Un repas noté (+5 s'il est vert) <b style="margin-left:auto">+10</b></li>
      <li>💉 Une ${actWord()} notée <b style="margin-left:auto">+${med().freq === "hebdo" ? 30 : 8}</b></li>
      <li>⚡ Un défi du jour réussi <b style="margin-left:auto">+20</b></li>
      <li>🧠 Le quiz du jour (bonne réponse) <b style="margin-left:auto">+15</b></li>
      <li>⚖️ Une pesée · 🤢 un bilan du jour <b style="margin-left:auto">+5 / +3</b></li>
    </ul>
  </div>

  <div class="grid2">
    <button class="btn secondary" onclick="A.report()">📄 Rapport médecin</button>
    <button class="btn secondary" onclick="A.settings()">⚙️ Réglages</button>
  </div>
  <p class="disclaimer">GlycoQuest · application personnelle, gratuite et sans publicité.</p>`;
}

// ---------- Feuilles modales ------------------------------------------------
function openSheet(html) {
  const sh = $("#sheet");
  sh.innerHTML = `<div class="grabber"></div>` + html;
  sh.hidden = false; $("#sheetBackdrop").hidden = false;
  sh.scrollTop = 0;
}
function closeSheet() { $("#sheet").hidden = true; $("#sheetBackdrop").hidden = true; draft = null; }
function sheetHead(title) { return `<div class="sheet-head"><h2>${title}</h2><button class="close-x" onclick="closeSheet()" aria-label="Fermer">✕</button></div>`; }

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 2600);
}
function confetti() {
  const box = $("#confetti"), cols = ["#e8a317", "#0f766e", "#d6457a", "#2f6fd6", "#3fae5a"];
  for (let i = 0; i < 70; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = cols[i % cols.length];
    p.style.animationDuration = 1.6 + Math.random() * 1.6 + "s";
    p.style.animationDelay = Math.random() * .4 + "s";
    box.appendChild(p);
    setTimeout(() => p.remove(), 3800);
  }
}
function celebrate(lvl, badges) {
  confetti();
  openSheet(`<div class="celebrate">
    ${lvl ? `<span class="em">🎉</span><h2>Niveau ${lvl.n} !</h2><p>Tu es maintenant <b>${esc(lvl.title)}</b>. Bravo ${esc(prenom())} !</p>` : `<span class="em">${badges[0].e}</span><h2>Nouveau badge !</h2>`}
    ${badges.map(b => `<div class="card" style="text-align:left"><div class="row"><span style="font-size:2em">${b.e}</span><div><b>${esc(b.nm)}</b><div class="small muted">${esc(b.d)}</div></div></div></div>`).join("")}
    <button class="btn gold" onclick="closeSheet()">Super !</button></div>`);
}

const A = {}; // actions appelées depuis le HTML

// --- Saisie de glycémie
A.addReading = (id) => {
  const r = id ? S.readings.find(x => x.id === id) : null;
  const h = new Date().getHours();
  draft = {
    id: r ? r.id : null,
    str: r ? (S.settings.unite === "gL" ? (r.v / 100).toFixed(2).replace(".", ",") : String(r.v)) : "",
    ctx: r ? r.ctx : (h < 10 ? "jeun" : "avant"),
    t: r ? r.t : Date.now(), note: r ? r.note || "" : "",
  };
  renderReadingSheet();
};
function renderReadingSheet() {
  const gl = S.settings.unite === "gL";
  openSheet(`${sheetHead(draft.id ? "Modifier la mesure" : "Nouvelle glycémie")}
    <div class="num-display" id="numDisplay">${esc(draft.str) || `<span class="muted">${gl ? "1,10" : "110"}</span>`} <span class="unit">${gUnit()}</span></div>
    <div class="keypad">
      ${["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(k => `<button onclick="A.key('${k}')">${k}</button>`).join("")}
      <button onclick="A.key(',')" ${gl ? "" : "disabled style='opacity:.2'"}>,</button>
      <button onclick="A.key('0')">0</button>
      <button onclick="A.key('del')">⌫</button>
    </div>
    <div class="chips" style="margin-bottom:8px">${CONTEXTES.map(c =>
      `<button class="chip ${draft.ctx === c.id ? "on" : ""}" onclick="A.setCtx('${c.id}')">${c.e} ${c.nom}</button>`).join("")}</div>
    <label class="field"><span>Date et heure</span><input class="input" type="datetime-local" id="rTime" value="${toLocalInput(draft.t)}"></label>
    <label class="field"><span>Note (facultatif)</span><input class="input" id="rNote" value="${esc(draft.note)}" placeholder="Ex. : après le gâteau d'anniversaire"></label>
    <button class="btn" onclick="A.saveReading()">Enregistrer</button>
    ${draft.id ? `<button class="btn danger" style="margin-top:8px" onclick="A.deleteReading()">Supprimer</button>` : ""}`);
}
A.key = (k) => {
  let s = draft.str;
  if (k === "del") s = s.slice(0, -1);
  else if (k === ",") { if (!s.includes(",")) s = (s || "0") + ","; }
  else {
    const dec = s.split(",")[1];
    if (dec !== undefined && dec.length >= 2) return;
    if (!s.includes(",") && s.replace(",", "").length >= 3) return;
    s += k;
  }
  draft.str = s;
  $("#numDisplay").innerHTML = `${esc(s) || `<span class="muted">${S.settings.unite === "gL" ? "1,10" : "110"}</span>`} <span class="unit">${gUnit()}</span>`;
};
A.setCtx = (c) => {
  draft.ctx = c; draft.note = $("#rNote").value;
  const tv = $("#rTime").value; if (tv) draft.t = new Date(tv).getTime();
  renderReadingSheet();
};
A.saveReading = () => {
  const v = gParse(draft.str);
  if (v == null || v < 20 || v > 600) { toast(`Valeur invalide. Exemple : ${S.settings.unite === "gL" ? "1,15" : "115"}`); return; }
  const tv = $("#rTime").value;
  const t = tv ? new Date(tv).getTime() : Date.now();
  const note = $("#rNote").value.trim();
  if (draft.id) Object.assign(S.readings.find(r => r.id === draft.id), { v, ctx: draft.ctx, t, note });
  else S.readings.push({ id: uid(), t, v, ctx: draft.ctx, note });
  const isNew = !draft.id, ctx = draft.ctx;
  closeSheet();
  if (v < 70) {
    save(); render();
    openSheet(`${sheetHead("⚠️ Glycémie basse")}
      <div class="alert bad">${gFmt(v)} : c'est une hypoglycémie.
        <p><b>Règle des 15 :</b> prends 15 g de sucre rapide (3 morceaux de sucre, ou un petit verre de jus ou de soda normal), puis recontrôle dans 15 minutes. Recommence si c'est toujours bas.</p>
        <p>Si tu te sens très mal, appelle le 15. Parle de cette hypo à ton médecin.</p></div>
      <button class="btn" onclick="closeSheet();afterChange()">Compris</button>`);
    return;
  }
  if (v >= 250) {
    save(); render();
    openSheet(`${sheetHead("Glycémie élevée")}
      <div class="alert warn">${gFmt(v)} : c'est haut.
        <p>Bois de l'eau et recontrôle plus tard. Si elle reste au-dessus de ${gFmt(250)} plusieurs fois, ou si tu as très soif, des nausées ou que tu te sens mal, contacte ton médecin.</p></div>
      <button class="btn" onclick="closeSheet();afterChange()">Compris</button>`);
    return;
  }
  const cl = classify(v, ctx);
  afterChange(isNew ? (cl.k === "ok" ? "🎯 Dans la cible ! +10 XP" : "Mesure enregistrée · +10 XP") : "Mesure modifiée");
};
A.deleteReading = () => {
  if (!confirm("Supprimer cette mesure ?")) return;
  S.readings = S.readings.filter(r => r.id !== draft.id);
  closeSheet(); afterChange("Mesure supprimée");
};
A.setRange = (n) => { range = n; render(); };

// --- Repas
A.addMeal = (id) => {
  const m = id ? S.meals.find(x => x.id === id) : null;
  draft = {
    id: m ? m.id : null, type: m ? m.type : guessMealType(), t: m ? m.t : Date.now(),
    items: m ? m.items.map(i => ({ ...i })) : [], cat: "Féculents", q: "",
  };
  openSheet(`${sheetHead(m ? "Modifier le repas" : "Nouveau repas")}
    <div class="chips" id="mealTypes"></div>
    <div id="mealSummary"></div>
    <h3 style="margin-top:14px">Ajoute ce que tu as mangé</h3>
    <input class="search" id="foodSearch" placeholder="🔍 Chercher un aliment…" oninput="A.searchFood(this.value)" autocomplete="off">
    <div class="cat-tabs" id="catTabs"></div>
    <div class="food-grid" id="foodGrid"></div>
    <label class="field"><span>Date et heure</span><input class="input" type="datetime-local" id="mTime" value="${toLocalInput(draft.t)}"></label>
    <button class="btn" onclick="A.saveMeal()">Enregistrer le repas</button>
    ${m ? `<button class="btn danger" style="margin-top:8px" onclick="A.deleteMeal()">Supprimer</button>` : ""}`);
  renderMealParts();
};
function renderMealParts() {
  $("#mealTypes").innerHTML = TYPES_REPAS.map(t => `<button class="chip ${draft.type === t.id ? "on" : ""}" onclick="A.mealType('${t.id}')">${t.e} ${t.nom}</button>`).join("");
  const sc = scoreMeal(draft.items);
  $("#mealSummary").innerHTML = draft.items.length ? `
    <div class="card" style="margin:12px 0 0;background:var(--bg);box-shadow:none">
      <div class="row">
        <div class="score-ring">${plateDonut(sc.parts)}</div>
        <div class="grow">
          <div><span class="pill ${sc.couleur}" style="font-size:1em">${sc.score}/100 · ${scoreLabel(sc.score)}</span></div>
          <div style="margin:6px 0"><b>${sc.carbs} g</b> de glucides</div>
          <div class="plate-legend"><i style="background:#3fae5a"></i>Légumes <i style="background:#c0703a"></i>Protéines<br><i style="background:#e8b931"></i>Féculents <i style="background:#d6457a"></i>Sucré</div>
        </div>
      </div>
      <div class="small muted" style="margin-top:6px">Assiette idéale : ½ légumes, ¼ protéines, ¼ féculents.</div>
      ${sc.conseils.map(c => `<div class="small" style="margin-top:6px">👉 ${esc(c)}</div>`).join("")}
      <div style="margin-top:8px">${draft.items.map((it, i) => { const f = FOOD[it.id]; return `
        <div class="cart-item"><span style="font-size:1.3em">${f.emoji}</span>
          <div class="grow small"><b>${esc(f.nom)}</b><br><span class="muted">${fmtQ(it.q)} × ${esc(f.portion)}</span></div>
          <div class="stepper"><button onclick="A.qty(${i},-0.5)">−</button><button onclick="A.qty(${i},0.5)">+</button></div></div>`; }).join("")}
      </div>
    </div>` : `<div class="empty" style="padding:12px"><span class="em" style="font-size:36px">🥄</span>Touche les aliments ci-dessous pour composer ton assiette.</div>`;
  $("#catTabs").innerHTML = draft.q ? "" : FOOD_CATS.map(c => `<button class="chip ${draft.cat === c ? "on" : ""}" onclick="A.foodCat('${c}')">${c}</button>`).join("");
  renderFoodGrid();
}
function fmtQ(q) { return q === 0.5 ? "½" : String(q).replace(".5", "½").replace(".", ","); }
function norm(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
function renderFoodGrid() {
  const q = norm(draft.q || "");
  const list = q ? FOODS.filter(f => norm(f.nom).includes(q)) : FOODS.filter(f => f.cat === draft.cat);
  $("#foodGrid").innerHTML = list.map(f => {
    const it = draft.items.find(i => i.id === f.id);
    return `<button class="food ${it ? "on" : ""}" onclick="A.toggleFood('${f.id}')">
      ${it ? `<span class="qty">${fmtQ(it.q)}</span>` : ""}
      <span class="em">${f.emoji}</span><span class="nm">${esc(f.nom)}</span><span class="pt">${esc(f.portion)} · ${f.g} g gluc.</span></button>`;
  }).join("") || `<div class="muted small">Aucun aliment trouvé. Essaie un autre mot.</div>`;
}
A.mealType = (t) => { draft.type = t; renderMealParts(); };
A.foodCat = (c) => { draft.cat = c; renderMealParts(); };
A.searchFood = (v) => { draft.q = v; $("#catTabs").innerHTML = v ? "" : FOOD_CATS.map(c => `<button class="chip ${draft.cat === c ? "on" : ""}" onclick="A.foodCat('${c}')">${c}</button>`).join(""); renderFoodGrid(); };
A.toggleFood = (id) => {
  const i = draft.items.findIndex(x => x.id === id);
  if (i >= 0) draft.items[i].q += 1; else draft.items.push({ id, q: 1 });
  renderMealParts();
};
A.qty = (i, d) => {
  draft.items[i].q = Math.round((draft.items[i].q + d) * 2) / 2;
  if (draft.items[i].q <= 0) draft.items.splice(i, 1);
  renderMealParts();
};
A.saveMeal = () => {
  if (!draft.items.length) { toast("Ajoute au moins un aliment"); return; }
  const tv = $("#mTime").value, t = tv ? new Date(tv).getTime() : Date.now();
  const sc = scoreMeal(draft.items);
  const data = { type: draft.type, t, items: draft.items, score: sc.score, carbs: sc.carbs };
  const isNew = !draft.id;
  if (draft.id) Object.assign(S.meals.find(m => m.id === draft.id), data);
  else S.meals.push({ id: uid(), ...data });
  closeSheet();
  afterChange(isNew ? (sc.score >= 70 ? `🟢 Repas vert ! ${sc.score}/100 · +15 XP` : `Repas noté ${sc.score}/100 · +10 XP`) : "Repas modifié");
};
A.deleteMeal = () => {
  if (!confirm("Supprimer ce repas ?")) return;
  S.meals = S.meals.filter(m => m.id !== draft.id);
  closeSheet(); afterChange("Repas supprimé");
};

// --- Injection
A.addInjection = (id) => {
  const i = id ? S.injections.find(x => x.id === id) : null;
  draft = { id: i ? i.id : null, site: i ? i.site : (isPill() ? null : suggestedSite()), t: i ? i.t : Date.now() };
  renderInjectionSheet();
};
function bodyMap() {
  const sug = suggestedSite();
  return `<svg class="body-map" viewBox="0 0 260 340">
    <g fill="var(--line)">
      <circle cx="130" cy="38" r="26"/>
      <rect x="84" y="70" width="92" height="150" rx="30"/>
      <rect x="38" y="78" width="30" height="120" rx="15" transform="rotate(8 53 78)"/>
      <rect x="192" y="78" width="30" height="120" rx="15" transform="rotate(-8 207 78)"/>
      <rect x="88" y="200" width="38" height="130" rx="18"/>
      <rect x="134" y="200" width="38" height="130" rx="18"/>
    </g>
    ${SITES.map(s => `<g class="zone ${draft.site === s.id ? "sel" : ""} ${!draft.id && s.id === sug && draft.site !== s.id ? "suggest" : ""}" onclick="A.site('${s.id}')">
      <circle cx="${s.x}" cy="${s.y}" r="17"/><text x="${s.x}" y="${s.y + 4}" text-anchor="middle">${s.court}</text></g>`).join("")}
  </svg>`;
}
function renderInjectionSheet() {
  openSheet(`${sheetHead(isPill() ? "Prise du comprimé" : "Injection")}
    ${!isPill() ? `<div class="small muted center">Touche la zone utilisée (vue de face). En jaune : la zone conseillée pour alterner.</div>
      ${bodyMap()}
      <div class="center" style="font-weight:800;margin-bottom:8px">${draft.site ? SITE[draft.site].nom : "Aucune zone choisie"}</div>` : ""}
    <label class="field"><span>Date et heure</span><input class="input" type="datetime-local" id="iTime" value="${toLocalInput(draft.t)}"></label>
    <button class="btn" onclick="A.saveInjection()">Enregistrer</button>
    ${draft.id ? `<button class="btn danger" style="margin-top:8px" onclick="A.deleteInjection()">Supprimer</button>` : ""}`);
}
A.site = (s) => { draft.site = s; const tv = $("#iTime").value; if (tv) draft.t = new Date(tv).getTime(); renderInjectionSheet(); };
A.saveInjection = () => {
  const tv = $("#iTime").value, t = tv ? new Date(tv).getTime() : Date.now();
  const isNew = !draft.id;
  if (draft.id) Object.assign(S.injections.find(i => i.id === draft.id), { t, site: draft.site });
  else S.injections.push({ id: uid(), t, site: draft.site });
  closeSheet();
  afterChange(isNew ? `${isPill() ? "💊" : "💉"} Bien noté ! +${med().freq === "hebdo" ? 30 : 8} XP` : "Modifié");
};
A.deleteInjection = () => {
  if (!confirm("Supprimer cette entrée ?")) return;
  S.injections = S.injections.filter(i => i.id !== draft.id);
  closeSheet(); afterChange("Supprimé");
};

// --- Effets secondaires
A.addSymptoms = () => {
  draft = { ...(S.symptoms[today()] || {}) };
  renderSymptomSheet();
};
function renderSymptomSheet() {
  const lab = ["Non", "Un peu", "Moyen", "Fort"];
  openSheet(`${sheetHead("Comment tu te sens aujourd'hui ?")}
    ${SYMPTOMES.map(s => `<div style="margin:12px 0"><b>${s.e} ${s.nom}</b>
      <div class="level-dots" style="margin-top:6px">${[0, 1, 2, 3].map(n =>
        `<button style="width:auto;padding:0 10px" class="${(draft[s.id] || 0) === n ? "on" : ""}" onclick="A.sym('${s.id}',${n})">${lab[n]}</button>`).join("")}</div></div>`).join("")}
    <div class="small muted">Si les symptômes sont forts ou durent (vomissements, douleur au ventre intense), contacte ton médecin.</div>
    <button class="btn" style="margin-top:12px" onclick="A.saveSymptoms()">Enregistrer</button>`);
}
A.sym = (id, n) => { draft[id] = n; renderSymptomSheet(); };
A.saveSymptoms = () => {
  const isNew = !S.symptoms[today()];
  S.symptoms[today()] = { ...draft };
  closeSheet(); afterChange(isNew ? "Merci ! +3 XP" : "Modifié");
};

// --- Poids
A.addWeight = () => {
  const last = [...S.weights].sort((a, b) => b.t - a.t)[0];
  openSheet(`${sheetHead("Nouvelle pesée")}
    <label class="field"><span>Poids (kg)</span><input class="input" id="wKg" inputmode="decimal" placeholder="${last ? last.kg.toFixed(1).replace(".", ",") : "85,0"}" style="font-size:1.6em;text-align:center"></label>
    <button class="btn" onclick="A.saveWeight()">Enregistrer</button>`);
  setTimeout(() => $("#wKg").focus(), 200);
};
A.saveWeight = () => {
  const kg = parseFloat($("#wKg").value.replace(",", "."));
  if (isNaN(kg) || kg < 30 || kg > 300) { toast("Poids invalide"); return; }
  S.weights.push({ id: uid(), t: Date.now(), kg });
  closeSheet(); afterChange("Pesée notée · +5 XP");
};

// --- Accueil : défis, eau, conseils, quiz
A.toggleChallenge = (id) => {
  const k = today(), l = S.done[k] = S.done[k] || [];
  if (l.includes(id)) l.splice(l.indexOf(id), 1); else l.push(id);
  afterChange(l.includes(id) ? "⚡ Défi réussi ! +20 XP" : null);
};
A.setWater = (n) => {
  const k = today();
  S.water[k] = (S.water[k] || 0) === n ? n - 1 : n;
  afterChange();
};
A.nextTip = () => { tipOffset++; render(); };
A.answerQuiz = (i) => {
  const k = today(), qi = QUIZ[hash("quiz" + k) % QUIZ.length];
  S.quiz[k] = { choix: i, ok: i === qi.ok };
  afterChange(i === qi.ok ? "🧠 Bravo ! +15 XP" : "Merci d'avoir joué · +5 XP");
};
A.badgeInfo = (id) => {
  const b = BADGES.find(x => x.id === id), ok = S.meta.badges.includes(id) || b.test();
  toast(`${b.e} ${b.nm} : ${b.d}${ok ? " ✅" : ""}`);
};

// --- Rappel calendrier (.ics)
A.calendar = () => {
  const m = med(), { date } = nextDue();
  const [hh, mm] = m.heure.split(":");
  const d = new Date(date); d.setHours(Number(hh), Number(mm), 0, 0);
  const dt = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const now = new Date(), stamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GlycoQuest//FR", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT", `UID:glycoquest-${uid()}@glycoquest`, `DTSTAMP:${stamp}`, `DTSTART:${dt}`, "DURATION:PT15M",
    `RRULE:FREQ=${m.freq === "hebdo" ? "WEEKLY" : "DAILY"}`,
    `SUMMARY:${isPill() ? "💊 Comprimé" : "💉 Injection"} ${m.nom.split(" (")[0]}`,
    "DESCRIPTION:Pense à le noter dans GlycoQuest (+XP) et à changer de zone.",
    "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", "DESCRIPTION:Traitement GLP-1", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  downloadFile("rappel-glp1.ics", ics, "text/calendar");
  openSheet(`${sheetHead("📅 Rappel")}
    <p>Le fichier de rappel a été créé. Sur iPhone, choisis <b>Ajouter au calendrier</b> quand il s'ouvre.</p>
    <div class="alert warn">Si rien ne s'ouvre :<p>ouvre l'app <b>Rappels</b> ➜ <b>Nouveau rappel</b> « ${esc(m.nom.split(" (")[0])} » ➜ <b>Date</b> et <b>Heure</b> ➜ <b>Répéter : ${m.freq === "hebdo" ? "Chaque semaine" : "Chaque jour"}</b>.</p></div>
    <button class="btn" onclick="closeSheet()">OK</button>`);
};
function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file], title: name }).catch(() => {});
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// --- Réglages
A.settings = () => {
  const s = S.settings, c = s.cibles, m = s.traitement;
  const gl = s.unite === "gL";
  const cv = v => gl ? (v / 100).toFixed(2).replace(".", ",") : v;
  openSheet(`${sheetHead("⚙️ Réglages")}
    <label class="field"><span>Prénom</span><input class="input" id="sNom" value="${esc(s.nom)}" placeholder="Ex. : Papa"></label>
    <div class="field"><span class="small muted" style="font-weight:700">Unité de glycémie</span>
      <div class="seg" style="margin-top:4px"><button id="uGL" class="${gl ? "on" : ""}" onclick="A.unit('gL')">g/L</button><button id="uMG" class="${!gl ? "on" : ""}" onclick="A.unit('mgdl')">mg/dL</button></div></div>
    <div class="switch-row"><b>Texte en grand</b><input type="checkbox" id="sGrand" ${s.grand ? "checked" : ""} style="width:26px;height:26px"></div>

    <h3 style="margin-top:14px">🎯 Cibles de glycémie (${gUnit()})</h3>
    <div class="small muted">À valider avec le médecin. Par défaut : 0,80–1,30 g/L à jeun, moins de 1,80 g/L 2 h après un repas.</div>
    <div class="grid2">
      <label class="field"><span>À jeun : min</span><input class="input" id="cMin" inputmode="decimal" value="${cv(c.jeunMin)}"></label>
      <label class="field"><span>À jeun : max</span><input class="input" id="cMax" inputmode="decimal" value="${cv(c.jeunMax)}"></label>
    </div>
    <label class="field"><span>2 h après repas : max</span><input class="input" id="cApres" inputmode="decimal" value="${cv(c.apresMax)}"></label>

    <h3 style="margin-top:14px">💉 Traitement GLP-1</h3>
    <label class="field"><span>Médicament</span><select class="input" id="sMed">${MEDS.map(x => `<option ${x.nom === m.nom ? "selected" : ""}>${esc(x.nom)}</option>`).join("")}</select></label>
    <div class="grid2">
      <label class="field"><span>Jour (si hebdo)</span><select class="input" id="sJour">${JOURS.map((j, i) => `<option value="${i}" ${Number(m.jour) === i ? "selected" : ""}>${cap(j)}</option>`).join("")}</select></label>
      <label class="field"><span>Heure</span><input class="input" type="time" id="sHeure" value="${esc(m.heure)}"></label>
    </div>
    <button class="btn" onclick="A.saveSettings()">Enregistrer</button>

    <h3 style="margin-top:20px">💾 Sauvegarde</h3>
    <div class="small muted" style="margin-bottom:8px">Les données sont uniquement sur ce téléphone. Fais une sauvegarde de temps en temps (dans Fichiers ou par e-mail).</div>
    <div class="grid2">
      <button class="btn secondary" onclick="A.exportData()">Exporter</button>
      <button class="btn secondary" onclick="$('#importFile').click()">Importer</button>
    </div>
    <input type="file" id="importFile" accept="application/json,.json" hidden onchange="A.importData(this)">
    <button class="btn danger" style="margin-top:16px" onclick="A.resetAll()">Tout effacer</button>`);
};
A.unit = (u) => {
  // Convertit l'affichage des cibles dans le formulaire sans enregistrer le reste
  const read = id => gParse($(id).value);
  const vals = [read("#cMin"), read("#cMax"), read("#cApres")];
  const keep = { nom: $("#sNom").value, grand: $("#sGrand").checked, med: $("#sMed").value, jour: $("#sJour").value, heure: $("#sHeure").value };
  S.settings.unite = u;
  if (vals.every(v => v)) Object.assign(S.settings.cibles, { jeunMin: vals[0], jeunMax: vals[1], apresMax: vals[2] });
  save(); A.settings();
  $("#sNom").value = keep.nom; $("#sGrand").checked = keep.grand; $("#sMed").value = keep.med; $("#sJour").value = keep.jour; $("#sHeure").value = keep.heure;
  render();
};
A.saveSettings = () => {
  const s = S.settings;
  s.nom = $("#sNom").value.trim();
  s.grand = $("#sGrand").checked;
  const cMin = gParse($("#cMin").value), cMax = gParse($("#cMax").value), cAp = gParse($("#cApres").value);
  if (!cMin || !cMax || !cAp || cMin >= cMax || cMin < 50 || cAp > 300) { toast("Vérifie les cibles"); return; }
  s.cibles = { jeunMin: cMin, jeunMax: cMax, apresMax: cAp };
  const md = MEDS.find(x => x.nom === $("#sMed").value) || MEDS[0];
  s.traitement = { nom: md.nom, forme: md.forme, freq: md.freq, jour: Number($("#sJour").value), heure: $("#sHeure").value || "09:00" };
  closeSheet(); afterChange("Réglages enregistrés");
};
A.exportData = () => downloadFile(`glycoquest-sauvegarde-${today()}.json`, JSON.stringify(S, null, 1), "application/json");
A.importData = (input) => {
  const f = input.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      if (!d.settings || !Array.isArray(d.readings)) throw new Error();
      if (!confirm("Remplacer les données actuelles par cette sauvegarde ?")) return;
      localStorage.setItem(STORE_KEY, JSON.stringify(d));
      S = load(); closeSheet(); afterChange("Sauvegarde restaurée ✅");
    } catch (e) { toast("Fichier de sauvegarde invalide"); }
  };
  rd.readAsText(f);
};
A.resetAll = () => {
  if (!confirm("Effacer TOUTES les données ? Cette action est définitive.")) return;
  if (!confirm("Vraiment sûr ? Pense à exporter une sauvegarde avant.")) return;
  localStorage.removeItem(STORE_KEY); S = defaultState(); closeSheet(); render(); onboarding();
};

// --- Rapport pour le médecin
A.report = () => {
  const days = 30, list = readingsSince(days), st = statsOf(list);
  const from = startOfDay(Date.now() - (days - 1) * DAY);
  const byCtx = CONTEXTES.map(cx => ({ cx, s: statsOf(list.filter(r => r.ctx === cx.id)) })).filter(x => x.s);
  const inj = S.injections.filter(i => i.t >= from.getTime()).sort((a, b) => a.t - b.t);
  const ws = S.weights.filter(w => w.t >= from.getTime()).sort((a, b) => a.t - b.t);
  const meals = S.meals.filter(m => m.t >= from.getTime());
  const symDays = Object.keys(S.symptoms).filter(k => keyToDate(k) >= from);
  const symAvg = SYMPTOMES.map(s => ({ s, n: symDays.filter(k => (S.symptoms[k][s.id] || 0) > 0).length }));
  const c = S.settings.cibles;

  const lines = [
    `Suivi glycémie — ${prenom()} — du ${fmtDate(from)} au ${fmtDate(Date.now())}`,
    `Traitement : ${med().nom}`,
    st ? `Glycémie : ${st.n} mesures, moyenne ${gFmt(st.moy)}, ${st.pctOk} % dans la cible, min ${gFmt(st.min)}, max ${gFmt(st.max)}, ${st.hypos} hypo(s)` : "Aucune mesure",
    ...byCtx.map(x => `  ${x.cx.nom} : moyenne ${gFmt(x.s.moy)} (${x.s.n} mesures)`),
    `Prises du traitement notées : ${inj.length}`,
    ws.length ? `Poids : ${kgFmt(ws[0].kg)} ➜ ${kgFmt(ws[ws.length - 1].kg)}` : "",
    meals.length ? `Repas notés : ${meals.length}, note moyenne ${Math.round(meals.reduce((a, m) => a + m.score, 0) / meals.length)}/100` : "",
    symDays.length ? `Effets secondaires (jours concernés sur ${symDays.length} notés) : ${symAvg.map(x => `${x.s.nom} ${x.n}`).join(", ")}` : "",
  ].filter(Boolean);
  draft = { text: lines.join("\n") };

  openSheet(`${sheetHead("📄 Rapport 30 jours")}
    <div class="small muted">${esc(prenom())} · ${esc(med().nom)} · du ${fmtDate(from)} au ${fmtDate(Date.now())}</div>
    <div class="small muted">Cibles : à jeun ${gFmt(c.jeunMin)}–${gFmt(c.jeunMax)}, après repas &lt; ${gFmt(c.apresMax)}</div>
    ${st ? `<div class="grid3" style="margin:10px 0">
      <div class="stat"><b>${gFmt(st.moy, false)}</b><span>Moyenne (${gUnit()})</span></div>
      <div class="stat"><b>${st.pctOk} %</b><span>Dans la cible</span></div>
      <div class="stat"><b>${st.hypos}</b><span>Hypos</span></div></div>
      ${lineChart(list.map(r => ({ t: r.t, v: r.v, k: classify(r.v, r.ctx).k })), { xStart: from.getTime(), xEnd: startOfDay(Date.now()).getTime() + DAY, band: [c.jeunMin, c.jeunMax], line: c.apresMax, fmt: v => gFmt(v, false), minY: 50, maxY: 250 })}
      <ul class="list small">${byCtx.map(x => `<li>${x.cx.e} <span class="grow">${x.cx.nom} (${x.s.n})</span><b>${gFmt(x.s.moy)}</b></li>`).join("")}</ul>` : `<p class="muted">Aucune mesure sur la période.</p>`}
    <ul class="list small">
      <li>💉 <span class="grow">Prises du traitement notées</span><b>${inj.length}</b></li>
      ${ws.length ? `<li>⚖️ <span class="grow">Poids</span><b>${kgFmt(ws[0].kg)} ➜ ${kgFmt(ws[ws.length - 1].kg)}</b></li>` : ""}
      ${meals.length ? `<li>🍽️ <span class="grow">Note moyenne des repas</span><b>${Math.round(meals.reduce((a, m) => a + m.score, 0) / meals.length)}/100</b></li>` : ""}
      ${symDays.length ? symAvg.map(x => `<li>${x.s.e} <span class="grow">${x.s.nom}</span><b>${x.n} j / ${symDays.length}</b></li>`).join("") : ""}
    </ul>
    <h3 style="margin-top:12px">Toutes les mesures</h3>
    <table class="small" style="width:100%;border-collapse:collapse">
      ${[...list].reverse().map(r => `<tr style="border-bottom:1px solid var(--line)"><td>${fmtDate(r.t)} ${hhmm(r.t)}</td><td>${CTX[r.ctx].nom}</td><td style="text-align:right"><b>${gFmt(r.v)}</b></td></tr>`).join("")}
    </table>
    <div class="grid2 no-print" style="margin-top:14px">
      <button class="btn" onclick="window.print()">🖨️ Imprimer / PDF</button>
      <button class="btn secondary" onclick="A.shareReport()">📤 Partager</button>
    </div>`);
};
A.shareReport = () => {
  if (navigator.share) navigator.share({ title: "Suivi glycémie", text: draft.text }).catch(() => {});
  else { navigator.clipboard.writeText(draft.text).then(() => toast("Résumé copié")); }
};

// --- Premier lancement
function onboarding() {
  if (S.settings.onboarded) return;
  openSheet(`<div class="celebrate"><span class="em">🦉</span><h2>Bienvenue dans GlycoQuest !</h2>
    <p>Je suis Glyco, ton compagnon. Ensemble, on suit ta glycémie, tes repas et ton traitement, et tu gagnes des points et des badges en chemin.</p></div>
    <label class="field"><span>Comment je t'appelle ?</span><input class="input" id="oNom" placeholder="Ex. : Papa, Jean…"></label>
    <div class="field"><span class="small muted" style="font-weight:700">Ton lecteur affiche la glycémie en…</span>
      <div class="seg" style="margin-top:4px"><button id="oGL" class="on" onclick="this.classList.add('on');$('#oMG').classList.remove('on')">g/L (1,10)</button><button id="oMG" onclick="this.classList.add('on');$('#oGL').classList.remove('on')">mg/dL (110)</button></div></div>
    <label class="field"><span>Ton traitement</span><select class="input" id="oMed">${MEDS.map(x => `<option>${esc(x.nom)}</option>`).join("")}</select></label>
    <div class="grid2">
      <label class="field"><span>Jour de l'injection</span><select class="input" id="oJour">${JOURS.map((j, i) => `<option value="${i}" ${i === new Date().getDay() ? "selected" : ""}>${cap(j)}</option>`).join("")}</select></label>
      <label class="field"><span>Heure</span><input class="input" type="time" id="oHeure" value="09:00"></label>
    </div>
    <label class="switch-row"><b>Texte en grand</b><input type="checkbox" id="oGrand" style="width:26px;height:26px"></label>
    <button class="btn" onclick="A.finishOnboarding()">C'est parti ! 🚀</button>
    <p class="disclaimer">Cette app aide au suivi mais ne remplace pas ton médecin. Les cibles sont réglables dans Trophées ➜ Réglages.</p>`);
}
A.finishOnboarding = () => {
  const s = S.settings;
  s.nom = $("#oNom").value.trim();
  s.unite = $("#oMG").classList.contains("on") ? "mgdl" : "gL";
  s.grand = $("#oGrand").checked;
  const md = MEDS.find(x => x.nom === $("#oMed").value) || MEDS[0];
  s.traitement = { nom: md.nom, forme: md.forme, freq: md.freq, jour: Number($("#oJour").value), heure: $("#oHeure").value || "09:00" };
  s.onboarded = true;
  closeSheet(); afterChange(`Bienvenue ${prenom()} ! 🦉`);
};

// ---------- Démarrage -------------------------------------------------------
document.querySelectorAll("#tabbar button").forEach(b => b.addEventListener("click", () => go(b.dataset.tab)));
$("#xpChip").addEventListener("click", () => go("trophees"));
$("#sheetBackdrop").addEventListener("click", () => { if (S.settings.onboarded) closeSheet(); });
document.addEventListener("visibilitychange", () => { if (!document.hidden) { refreshAutoChallenges(); render(); } });
refreshAutoChallenges();
render();
onboarding();
