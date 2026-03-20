// ─── SUPABASE CONNECTION ──────────────────────────────────────
// ⚠️ Publishable key is safe in frontend code
// NEVER replace with secret or service_role key
const SUPABASE_URL = 'https://aleilngzhkbykthtiiyi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_K2fv01CHBRLOdlOGWf8RqA_li4v9hEQ';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── SHARED STATE ─────────────────────────────────────────────
// All JS files share these variables
let currentUser   = null;
let myProfile     = null;
let allProfiles   = [];
let myConnections = [];

// ─── SHARED HELPERS ───────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

function animateNum(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let n = 0;
  const step = Math.max(1, Math.floor(target / 30));
  const timer = setInterval(() => {
    n = Math.min(n + step, target);
    el.textContent = n;
    if (n >= target) clearInterval(timer);
  }, 40);
}

function calcMatch(a, b) {
  if (!a || !b) return 0;
  const aHave = (a.have || []).map(s => s.toLowerCase());
  const aWant = (a.want || []).map(s => s.toLowerCase());
  const bHave = (b.have || []).map(s => s.toLowerCase());
  const bWant = (b.want || []).map(s => s.toLowerCase());
  let score = 0;
  aWant.forEach(w => { if (bHave.some(h => h.includes(w) || w.includes(h))) score += 2; });
  aHave.forEach(h => { if (bWant.some(w => w.includes(h) || h.includes(w))) score += 2; });
  const max = Math.max((aWant.length + aHave.length) * 2, 1);
  return Math.min(Math.round((score / max) * 100), 99);
}

function matchBadge(score) {
  if (score >= 60) return `<span class="match-badge match-high">${score}% match</span>`;
  if (score >= 30) return `<span class="match-badge match-med">${score}% match</span>`;
  if (score > 0)   return `<span class="match-badge match-low">${score}% match</span>`;
  return '';
}
