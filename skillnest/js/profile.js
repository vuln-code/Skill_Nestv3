let selectedAvatar = '🦊';
let haveTags = [];
let wantTags = [];

async function loadMyProfile() {
  if (!currentUser) return;
  const { data } = await sb.from('profiles').select('*').eq('id', currentUser.id).single();
  myProfile = data || null;
  if (myProfile) updateNavForUser();
}

async function saveProfile() {
  if (!currentUser) { showPage('auth'); return; }
  const name    = document.getElementById('input-name').value.trim();
  const branch  = document.getElementById('input-branch').value;
  const year    = document.getElementById('input-year').value;
  const bio     = document.getElementById('input-bio').value.trim();
  const contact = document.getElementById('input-contact').value.trim();
  if (!name)            { showToast('Please enter your name 😅'); return; }
  if (!branch || !year) { showToast('Select your branch and year!'); return; }
  if (!haveTags.length && !wantTags.length) { showToast('Add at least one skill!'); return; }
  const btn = document.getElementById('profile-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Saving...';
  const profileData = { id: currentUser.id, name, branch, year, avatar: selectedAvatar, bio, contact, have: haveTags, want: wantTags };
  const { error } = await sb.from('profiles').upsert(profileData);
  if (error) { showToast('Error saving. Try again.'); console.error(error); btn.disabled = false; btn.textContent = 'Save profile 🪴'; return; }
  myProfile = profileData;
  updateNavForUser();
  showToast('Profile saved! 🪴');
  btn.disabled = false;
  btn.textContent = 'Save profile 🪴';
  setTimeout(() => showPage('discover'), 800);
}

function prefillProfileForm() {
  if (!myProfile) return;
  document.getElementById('input-name').value    = myProfile.name    || '';
  document.getElementById('input-branch').value  = myProfile.branch  || '';
  document.getElementById('input-year').value    = myProfile.year    || '';
  document.getElementById('input-bio').value     = myProfile.bio     || '';
  document.getElementById('input-contact').value = myProfile.contact || '';
  haveTags = [...(myProfile.have || [])];
  wantTags = [...(myProfile.want || [])];
  renderTags('have-tags-container', 'have-input', haveTags, '');
  renderTags('want-tags-container', 'want-input', wantTags, 'skill-tag-want');
  if (myProfile.avatar) {
    document.querySelectorAll('.avatar-option').forEach(a => { a.classList.toggle('selected', a.dataset.avatar === myProfile.avatar); });
    selectedAvatar = myProfile.avatar;
  }
}

function renderMyProfile() {
  const container = document.getElementById('my-profile-content');
  if (!currentUser) { container.innerHTML = `<div style="text-align:center;padding:80px 20px"><div style="font-size:48px;margin-bottom:16px">🪴</div><h3 style="font-family:'Syne',sans-serif;font-size:24px;font-weight:800;margin-bottom:10px">Not signed in</h3><button class="btn-primary" onclick="showPage('auth')">Sign in</button></div>`; return; }
  if (!myProfile) { container.innerHTML = `<div style="text-align:center;padding:80px 20px"><div style="font-size:48px;margin-bottom:16px">🪴</div><h3 style="font-family:'Syne',sans-serif;font-size:24px;font-weight:800;margin-bottom:10px">No profile yet</h3><p style="color:var(--muted);margin-bottom:24px">Create your profile to be discovered.</p><button class="btn-primary" onclick="showPage('create-profile')">Create profile</button></div>`; return; }
  const connected = myConnections.filter(c => c.status === 'connected').length;
  container.innerHTML = `
    <div class="my-profile-card">
      <div class="my-profile-top">
        <div class="my-avatar">${myProfile.avatar || '👤'}</div>
        <div class="my-profile-info">
          <h2>${myProfile.name}</h2>
          <p>${myProfile.branch || ''} · ${myProfile.year || ''}</p>
          ${myProfile.bio ? `<p style="color:var(--muted);font-size:13px;margin-top:4px">"${myProfile.bio}"</p>` : ''}
        </div>
      </div>
      <div class="section-label">Skills I have</div>
      <div class="tag-group">${(myProfile.have || []).map(s => `<span class="tag tag-have">${s}</span>`).join('') || '<span style="color:var(--muted);font-size:14px">None added</span>'}</div>
      <div class="section-label">Skills I want to learn</div>
      <div class="tag-group">${(myProfile.want || []).map(s => `<span class="tag tag-want">${s}</span>`).join('') || '<span style="color:var(--muted);font-size:14px">None added</span>'}</div>
      ${myProfile.contact ? `<div class="section-label">Your contact</div><p style="font-size:14px;color:var(--muted)">${myProfile.contact}</p>` : ''}
    </div>
    <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:20px;display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div><div style="font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:var(--accent)">${connected}</div><div style="color:var(--muted);font-size:13px;margin-top:4px">Connections</div></div>
      <div><div style="font-family:'Syne',sans-serif;font-weight:800;font-size:28px;color:var(--accent3)">${(myProfile.have || []).length + (myProfile.want || []).length}</div><div style="color:var(--muted);font-size:13px;margin-top:4px">Skills listed</div></div>
    </div>
    <div>
      <button class="action-btn" onclick="showPage('create-profile');prefillProfileForm()">Edit profile ✏️</button>
      <button class="action-btn" onclick="showPage('discover')">Discover people 🔍</button>
      <button class="action-btn" onclick="showPage('connections')">Connections 🤝</button>
      <button class="action-btn signout-btn" onclick="signOut()">Sign out</button>
    </div>`;
}

function selectAvatar(el) {
  document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
  el.classList.add('selected');
  selectedAvatar = el.dataset.avatar;
}

function addTagManual(containerId, inputId, arr, cls) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const val = input.value.trim().replace(',', '');
  if (!val) { input.focus(); return; }
  if (!arr.includes(val)) { arr.push(val); renderTags(containerId, inputId, arr, cls); }
  input.value = '';
  input.focus();
}

function addTag(containerId, inputId, arr, cls) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
      e.preventDefault();
      const val = input.value.trim().replace(',', '');
      if (!arr.includes(val)) { arr.push(val); renderTags(containerId, inputId, arr, cls); }
      input.value = '';
    }
    if (e.key === 'Backspace' && !input.value && arr.length) { arr.pop(); renderTags(containerId, inputId, arr, cls); }
  });
  input.addEventListener('input', e => {
    const val = input.value;
    if (val.endsWith(',') || val.endsWith(', ')) {
      const clean = val.replace(',', '').trim();
      if (clean && !arr.includes(clean)) { arr.push(clean); renderTags(containerId, inputId, arr, cls); }
      input.value = '';
    }
  });
}

function renderTags(containerId, inputId, arr, cls) {
  const container = document.getElementById(containerId);
  const input = document.getElementById(inputId);
  if (!container || !input) return;
  container.innerHTML = arr.map((t, i) => `<span class="skill-tag ${cls}">${t}<span class="skill-tag-remove" onclick="removeTag('${containerId}','${inputId}',${i},'${cls}')">×</span></span>`).join('');
  container.appendChild(input);
}

function removeTag(containerId, inputId, idx, cls) {
  if (containerId === 'have-tags-container') { haveTags.splice(idx, 1); renderTags(containerId, inputId, haveTags, cls); }
  else { wantTags.splice(idx, 1); renderTags(containerId, inputId, wantTags, cls); }
}