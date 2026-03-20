// ─── AUTH ─────────────────────────────────────────────────────
let currentAuthTab = 'signin';

async function initAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    currentUser = session.user;
    await loadMyProfile();
    updateNavForUser();
  }

  sb.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN') {
      currentUser = session.user;
      await loadMyProfile();
      updateNavForUser();
      if (!myProfile) showPage('create-profile');
      else showPage('discover');
    }
    if (event === 'SIGNED_OUT') {
      currentUser = null;
      myProfile = null;
      updateNavForGuest();
      showPage('landing');
    }
  });
}

function switchAuthTab(tab) {
  currentAuthTab = tab;
  document.getElementById('auth-tab-signin').classList.toggle('active', tab === 'signin');
  document.getElementById('auth-tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('auth-submit-btn').textContent = tab === 'signin' ? 'Sign in' : 'Create account';
  clearAuthMessages();
}

async function handleAuth() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const btn      = document.getElementById('auth-submit-btn');

  if (!email || !password) { showAuthError('Please fill in both fields.'); return; }
  if (password.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }

  btn.disabled = true;
  btn.textContent = 'Please wait...';
  clearAuthMessages();

  if (currentAuthTab === 'signup') {
    const { error } = await sb.auth.signUp({ email, password });
    if (error) {
      showAuthError(error.message);
    } else {
      showAuthSuccess('Account created! Check your email to verify, then sign in.');
      switchAuthTab('signin');
    }
    btn.disabled = false;
    btn.textContent = 'Create account';
  } else {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      showAuthError(error.message);
      btn.disabled = false;
      btn.textContent = 'Sign in';
    }
    // success is handled by onAuthStateChange above
  }
}

async function signOut() {
  await sb.auth.signOut();
  showToast('Signed out. See you soon! 👋');
}

function updateNavForUser() {
  const avatar = myProfile ? myProfile.avatar : '👤';
  document.getElementById('nav-right').innerHTML =
    `<div class="nav-avatar" onclick="showPage('profile-view')" title="My Profile">${avatar}</div>`;
}

function updateNavForGuest() {
  document.getElementById('nav-right').innerHTML =
    `<button class="nav-cta" onclick="showPage('auth')">Sign in</button>`;
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.style.display = 'block';
}

function showAuthSuccess(msg) {
  const el = document.getElementById('auth-success');
  el.textContent = msg;
  el.style.display = 'block';
}

function clearAuthMessages() {
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-success').style.display = 'none';
}
