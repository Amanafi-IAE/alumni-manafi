// auth.js — shared authentication helpers
const CONFIG_CHECK = () => {
  const email = localStorage.getItem('appwrite_user_email');
  const session = localStorage.getItem('appwrite_session');
  if (!email || !session) {
    window.location.href = 'login.html';
    return null;
  }
  return { email };
};

async function checkAuth() {
  return CONFIG_CHECK();
}

function logout() {
  localStorage.removeItem('appwrite_session');
  localStorage.removeItem('appwrite_user_email');
  window.location.href = 'login.html';
}

function getInitials(prenom, nom) {
  return ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase();
}

function getAvatarColor(str) {
  const colors = [
    { bg: '#EEEDFE', color: '#3C3489' },
    { bg: '#E1F5EE', color: '#085041' },
    { bg: '#FAECE7', color: '#712B13' },
    { bg: '#E6F1FB', color: '#0C447C' },
    { bg: '#FAEEDA', color: '#633806' },
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
  return colors[hash % colors.length];
}

function renderNav(currentPage, userEmail) {
  const pages = [
    { href: 'annuaire.html', label: 'Annuaire' },
    { href: 'offres.html', label: 'Offres' },
    { href: 'evenements.html', label: 'Événements' },
    { href: 'promotions.html', label: 'Promotions' },
    { href: 'forum.html', label: 'Forum' },
  ];
  const initials = (userEmail || '??').substring(0, 2).toUpperCase();
  return `
    <nav>
      <a href="annuaire.html" class="nav-logo">
        <div class="nav-dot"></div>
        Alumni MANAFI
      </a>
      <div class="nav-links">
        ${pages.map(p => `<a href="${p.href}" class="${currentPage === p.href ? 'active' : ''}">${p.label}</a>`).join('')}
      </div>
      <div class="nav-user">
        <div class="avatar">${initials}</div>
        <button class="btn-logout" onclick="logout()">Déconnexion</button>
      </div>
    </nav>
  `;
}

async function baserowGet(tableId, filters = '') {
  let allResults = [];
  let url = `${CONFIG.BASEROW_URL}/${tableId}/?user_field_names=true&size=200${filters}`;
  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Token ${CONFIG.BASEROW_TOKEN}` },
    });
    const data = await res.json();
    allResults = allResults.concat(data.results || []);
    url = data.next;
  }
  return { results: allResults };
}

async function baserowUpdate(tableId, rowId, data) {
  const res = await fetch(`${CONFIG.BASEROW_URL}/${tableId}/${rowId}/?user_field_names=true`, {
    method: 'PATCH',
    headers: {
      Authorization: `Token ${CONFIG.BASEROW_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return res.json();
}
