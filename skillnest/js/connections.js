// ─── CONNECTIONS ──────────────────────────────────────────────

async function loadMyConnections() {
  if (!currentUser) { myConnections = []; return; }
  const { data } = await sb
    .from('connections')
    .select('*')
    .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`);
  myConnections = data || [];
  updateNotifDot();
}

async function sendRequest(receiverId, name) {
  const { error } = await sb.from('connections').insert({
    sender_id:   currentUser.id,
    receiver_id: receiverId,
    status:      'pending'
  });
  if (error) { showToast('Could not send request. Try again.'); console.error(error); return; }
  await loadMyConnections();
  closeModal();
  renderCards();
  showToast(`Request sent to ${name.split(' ')[0]}! ✨`);
}

async function cancelRequest(receiverId) {
  await sb.from('connections').delete()
    .eq('sender_id', currentUser.id)
    .eq('receiver_id', receiverId);
  await loadMyConnections();
  closeModal();
  renderCards();
  showToast('Request cancelled');
}

async function acceptRequest(senderId, name) {
  await sb.from('connections').update({ status: 'connected' })
    .eq('sender_id', senderId)
    .eq('receiver_id', currentUser.id);
  await loadMyConnections();
  closeModal();
  renderCards();
  renderConnections();
  updateStats();
  showToast(`You're now connected with ${name.split(' ')[0]}! 🎉`);
}

async function declineRequest(senderId) {
  await sb.from('connections').delete()
    .eq('sender_id', senderId)
    .eq('receiver_id', currentUser.id);
  await loadMyConnections();
  closeModal();
  renderConnections();
  showToast('Request declined');
}

async function renderConnections() {
  const container = document.getElementById('connections-content');

  if (!currentUser) {
    container.innerHTML = `<div style="text-align:center;padding:60px;color:var(--muted)">
      <p>Sign in to see your connections.</p>
      <button class="btn-primary" style="margin-top:20px" onclick="showPage('auth')">Sign in</button>
    </div>`;
    return;
  }

  await loadMyConnections();

  const connected = myConnections.filter(c => c.status === 'connected');
  const incoming  = myConnections.filter(c => c.status === 'pending' && c.receiver_id === currentUser.id);
  const sent      = myConnections.filter(c => c.status === 'pending' && c.sender_id === currentUser.id);

  function getP(id) { return allProfiles.find(p => p.id === id); }

  let html = '';

  if (incoming.length) {
    html += `<div class="conn-section-title">Incoming requests (${incoming.length})</div>`;
    html += incoming.map(c => {
      const p = getP(c.sender_id);
      if (!p) return '';
      return `<div class="conn-card">
        <div class="conn-avatar">${p.avatar || '👤'}</div>
        <div class="conn-info"><h4>${p.name}</h4><p>${p.branch || ''} · ${p.year || ''}</p></div>
        <div class="conn-actions">
          <button class="conn-btn accept" onclick="acceptRequest('${p.id}','${p.name}')">Accept</button>
          <button class="conn-btn decline" onclick="declineRequest('${p.id}')">Decline</button>
        </div>
      </div>`;
    }).join('');
  }

  if (connected.length) {
    html += `<div class="conn-section-title">Connected (${connected.length})</div>`;
    html += connected.map(c => {
      const otherId = c.sender_id === currentUser.id ? c.receiver_id : c.sender_id;
      const p = getP(otherId);
      if (!p) return '';
      return `<div class="conn-card">
        <div class="conn-avatar">${p.avatar || '👤'}</div>
        <div class="conn-info">
          <h4>${p.name}</h4>
          <p>${p.contact || p.branch + ' · ' + p.year}</p>
        </div>
        <div class="conn-actions">
          <button class="conn-btn" onclick="openModal('${p.id}')">View</button>
        </div>
      </div>`;
    }).join('');
  }

  if (sent.length) {
    html += `<div class="conn-section-title">Sent requests</div>`;
    html += sent.map(c => {
      const p = getP(c.receiver_id);
      if (!p) return '';
      return `<div class="conn-card">
        <div class="conn-avatar">${p.avatar || '👤'}</div>
        <div class="conn-info"><h4>${p.name}</h4><p>Waiting for response...</p></div>
        <div class="conn-actions">
          <button class="conn-btn decline" onclick="cancelRequest('${p.id}')">Cancel</button>
        </div>
      </div>`;
    }).join('');
  }

  if (!html) {
    html = `<div style="text-align:center;padding:60px;color:var(--muted)">
      <div style="font-size:40px;margin-bottom:12px">🤝</div>
      <p>No connections yet. Discover people and send a request!</p>
      <button class="btn-primary" style="margin-top:20px" onclick="showPage('discover')">Discover people</button>
    </div>`;
  }

  container.innerHTML = html;
}

function updateNotifDot() {
  if (!currentUser) return;
  const incoming = myConnections.filter(c => c.status === 'pending' && c.receiver_id === currentUser.id);
  const dot = document.getElementById('notif-dot');
  if (dot) dot.style.display = incoming.length ? 'inline-block' : 'none';
}
