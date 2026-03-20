// ─── APP ROUTER ───────────────────────────────────────────────
// This is the main entry point — controls page navigation

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');

  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  const tabMap = {
    'landing':        'tab-home',
    'discover':       'tab-discover',
    'connections':    'tab-connections',
    'profile-view':   'tab-profile'
  };
  if (tabMap[page]) document.getElementById(tabMap[page])?.classList.add('active');

  // Run the right function for each page
  if (page === 'discover')      loadProfiles();
  if (page === 'profile-view')  renderMyProfile();
  if (page === 'connections')   renderConnections();
  if (page === 'landing')       updateStats();
  if (page === 'create-profile' && myProfile) prefillProfileForm();
}

// ─── INIT ─────────────────────────────────────────────────────
// Runs once when page loads
addTag('have-tags-container', 'have-input', haveTags, '');
addTag('want-tags-container', 'want-input', wantTags, 'skill-tag-want');
initAuth();
updateStats();
