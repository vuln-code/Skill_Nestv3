async function loadLeaderboard() {
  const list = document.getElementById('leaderboard-list');
  const { data, error } = await sb.from('leaderboard').select('*');
  if (error) { console.error(error); return; }
  if (!data?.length) { list.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted)">No students yet. Be the first!</div>'; return; }
  list.innerHTML = data.map((p, i) => `
    <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:14px;padding:18px 20px;display:flex;align-items:center;gap:14px;margin-bottom:10px">
      <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:22px;color:${i===0?'#FFD700':i===1?'#C0C0C0':i===2?'#CD7F32':'var(--muted)'};width:32px;text-align:center">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+(i+1)}</div>
      <div style="width:44px;height:44px;border-radius:12px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:22px">${p.avatar||'👤'}</div>
      <div style="flex:1">
        <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:15px">${p.name}</div>
        <div style="font-size:12px;color:var(--muted)">${p.branch||''} · ${p.year||''}</div>
      </div>
      <div style="text-align:right">
        <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:18px;color:var(--accent)">${p.score}</div>
        <div style="font-size:11px;color:var(--muted)">${p.skill_count} skills · ${p.connection_count} connects</div>
      </div>
    </div>`).join('');
}