// ─── DISCOVER ─────────────────────────────────────────────────
let currentFilter = 'all';

async function loadProfiles() {
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return; }

  // Don't show your own profile in discover
  allProfiles = (data || []).filter(p => p.id !== currentUser?.id);
  await loadMyConnections();
  renderCards();
  updateStats();
}

function getConnState(profileId) {
  const conn = myConnections.find(c =>
    (c.sender_id === currentUser?.id && c.receiver_id === profileId) ||
    (c.receiver_id === currentUser?.id && c.sender_id === profileId)
  );
  if (!conn) return 'none';
  if (conn.status === 'connected') return 'connected';
  if (conn.sender_id === currentUser?.id) return 'sent';
  return 'received';
}

function renderCards() {
  const grid   = document.getElementById('profiles-grid');
  const search = document.getElementById('search-input')?.value.toLowerCase() || '';

  let profiles = allProfiles
    .filter(p => {
      if (!search) return true;
      return p.name?.toLowerCase().includes(search) ||
        (p.have || []).some(s => s.toLowerCase().includes(search)) ||
        (p.want || []).some(s => s.toLowerCase().includes(search));
    })
    .filter(p => {
      if (currentFilter === 'cs')    return p.branch === 'CS / IT';
      if (currentFilter === 'ece')   return p.branch === 'ECE / EEE';
      if (currentFilter === 'other') return !['CS / IT', 'ECE / EEE'].includes(p.branch);
      return true;
    })
    .map(p => ({ ...p, score: calcMatch(myProfile, p) }));

  if (currentFilter === 'match') profiles.sort((a, b) => b.score - a.score);

  if (!profiles.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:80px;color:var(--muted)">
      ${allProfiles.length === 0 ? 'No profiles yet. Be the first to join! 🪴' : 'No results found.'}
    </div>`;
    return;
  }

  grid.innerHTML = profiles.map(p => {
    const state    = getConnState(p.id);
    const btnLabel = state === 'connected' ? 'Connected ✓' : state === 'sent' ? 'Request sent...' : state === 'received' ? 'Accept request?' : 'Connect →';
    const btnClass = state === 'connected' ? 'connected' : (state === 'sent' || state === 'received') ? 'requested' : '';

    return `
    <div class="profile-card" onclick="openModal('${p.id}')">
      <div class="pc-top">
        <div class="pc-avatar">${p.avatar || '👤'}</div>
        <div class="pc-info">
          <h3>${p.name}</h3>
          <p>${p.branch || ''} · ${p.year || ''}</p>
        </div>
        ${p.score > 0 ? matchBadge(p.score) : ''}
      </div>
      ${p.bio ? `<p style="font-size:13px;color:var(--muted);margin-bottom:14px;line-height:1.5">"${p.bio}"</p>` : ''}
      <div class="pc-skills">
        <div class="pc-skill-label">Knows</div>
        <div class="pc-skill-tags">
          ${(p.have || []).slice(0, 3).map(s => `<span class="pc-skill-tag">${s}</span>`).join('')}
          ${(p.have || []).length > 3 ? `<span class="pc-skill-tag">+${(p.have || []).length - 3}</span>` : ''}
        </div>
      </div>
      <div class="pc-skills">
        <div class="pc-skill-label">Wants to learn</div>
        <div class="pc-skill-tags">
          ${(p.want || []).slice(0, 3).map(s => `<span class="pc-skill-tag pc-skill-tag-want">${s}</span>`).join('')}
        </div>
      </div>
      <button class="pc-connect ${btnClass}" onclick="event.stopPropagation();openModal('${p.id}')">${btnLabel}</button>
    </div>`;
  }).join('');
}

function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderCards();
}

// ─── MODAL ────────────────────────────────────────────────────
function openModal(profileId) {
  const p     = allProfiles.find(x => x.id === profileId);
  if (!p) return;
  const score = calcMatch(myProfile, p);
  const state = getConnState(profileId);

  let banner = '';
  if (state === 'sent')      banner = `<div class="status-banner pending">Request sent. Waiting for ${p.name.split(' ')[0]} to accept.</div>`;
  if (state === 'received')  banner = `<div class="status-banner incoming">${p.name.split(' ')[0]} wants to connect with you!</div>`;
  if (state === 'connected') banner = `<div class="status-banner connected">You are connected!</div>`;

  const contactSection = state === 'connected'
    ? `<div class="contact-reveal">
         <div class="contact-reveal-label">Contact</div>
         <div style="font-size:15px;font-weight:500">${p.contact || 'Not added yet'}</div>
       </div>`
    : `<div class="contact-locked">
         <div style="font-size:24px">🔒</div>
         <p>Revealed only after both of you connect.</p>
       </div>`;

  let actions = '';
  if (!currentUser) {
    actions = `<button class="modal-btn primary" onclick="closeModal();showPage('auth')">Sign in to connect</button>`;
  } else if (state === 'none') {
    actions = `<button class="modal-btn primary" onclick="sendRequest('${profileId}','${p.name}')">Send connection request ✨</button>`;
  } else if (state === 'sent') {
    actions = `<button class="modal-btn pending" disabled>Request pending...</button>
               <button class="modal-btn" onclick="cancelRequest('${profileId}')">Cancel request</button>`;
  } else if (state === 'received') {
    actions = `<button class="modal-btn primary" onclick="acceptRequest('${profileId}','${p.name}')">Accept connection</button>
               <button class="modal-btn" onclick="declineRequest('${profileId}')">Decline</button>`;
  } else {
    actions = `<button class="modal-btn success" disabled>Connected ✓</button>`;
  }

  document.getElementById('modal-content').innerHTML = `
    <button class="modal-close" onclick="closeModal()">×</button>
    <div class="modal-avatar">${p.avatar || '👤'}</div>
    <h3>${p.name}</h3>
    <p class="modal-sub">${p.branch || ''} · ${p.year || ''}${p.bio ? ' · "' + p.bio + '"' : ''}</p>
    ${banner}
    ${score > 0 ? `
      <div style="margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
          <span style="color:var(--muted)">Skill match</span>
          <span style="color:var(--accent3);font-weight:500">${score}%</span>
        </div>
        <div class="modal-match-bar"><div class="modal-match-fill" id="match-fill"></div></div>
        <p class="modal-match-label">Based on skills you can teach each other.</p>
      </div>` : ''}
    <div>
      <div class="modal-skill-label">They know</div>
      <div class="modal-skill-tags">${(p.have || []).map(s => `<span class="pc-skill-tag">${s}</span>`).join('') || '<span style="color:var(--muted);font-size:13px">None listed</span>'}</div>
      <div class="modal-skill-label" style="margin-top:12px">They want to learn</div>
      <div class="modal-skill-tags">${(p.want || []).map(s => `<span class="pc-skill-tag pc-skill-tag-want">${s}</span>`).join('') || '<span style="color:var(--muted);font-size:13px">None listed</span>'}</div>
    </div>
    <div style="margin:20px 0">${contactSection}</div>
    <div class="modal-connect-btns">
      ${actions}
      <button class="modal-btn" onclick="closeModal()">Close</button>
    </div>`;

  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(() => {
    const fill = document.getElementById('match-fill');
    if (fill) fill.style.width = score + '%';
  }, 100);
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }
function closeModalOutside(e) { if (e.target === document.getElementById('modal-overlay')) closeModal(); }

// ─── STATS ────────────────────────────────────────────────────
async function updateStats() {
  const { count: userCount } = await sb.from('profiles').select('*', { count: 'exact', head: true });
  const { count: connCount } = await sb.from('connections').select('*', { count: 'exact', head: true }).eq('status', 'connected');
  const { data: skillData }  = await sb.from('profiles').select('have,want');
  const skillCount = (skillData || []).reduce((a, p) => a + (p.have || []).length + (p.want || []).length, 0);
  animateNum('stat-users', userCount || 0);
  animateNum('stat-skills', skillCount || 0);
  animateNum('stat-connects', connCount || 0);
}
