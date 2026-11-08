import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/app.css';
export function shell(title, subtitle = '') {
  document.title = `${title} · IssueFlow`;
  document.querySelector('#app').innerHTML = `
    <a href="#content" class="skip-link">Skip to content</a>
    <aside class="sidebar"><a class="brand" href="/index.html"><span class="brand-icon"><i class="bi bi-intersect"></i></span>IssueFlow</a>
    <div class="workspace-label">WORKSPACE</div><nav aria-label="Main navigation">
    <a href="/index.html"><i class="bi bi-grid-1x2"></i> Overview</a>
    <a href="/issues.html"><i class="bi bi-stack"></i> Issues</a>
    <a href="/projects.html"><i class="bi bi-folder2"></i> Projects</a>
    <a href="/admin.html" id="admin-link" hidden><i class="bi bi-sliders"></i> Administration</a>
    </nav><div class="sidebar-bottom"><span class="team-icon">IF</span><div>IssueFlow team<small>Shared workspace</small></div></div></aside>
    <div class="main-wrap"><header class="topbar"><span class="text-secondary">Workspace <span class="mx-2">/</span> <strong class="text-dark">${title}</strong></span><div id="account" class="d-flex gap-3 align-items-center" aria-busy="true"><span class="text-secondary" role="status">Checking session…</span></div></header>
    <main id="content"><div class="page-heading"><div><div class="eyebrow">YOUR TEAM, IN SYNC</div><h1>${title}</h1><p>${subtitle}</p></div><a class="btn btn-primary" href="/issue-form.html"><i class="bi bi-plus-lg me-2"></i>New issue</a></div><div id="notice" role="status" aria-live="polite"></div><div id="page"><div class="empty-state">Loading your workspace…</div></div></main><footer>IssueFlow <span>Built for focused teams.</span></footer></div>`;
  const path = location.pathname === '/' ? '/index.html' : location.pathname;
  document.querySelectorAll('nav a').forEach(a => { if (a.pathname.replace('.html','') === path.replace('.html','')) { a.classList.add('active'); a.setAttribute('aria-current','page'); } });
}
export function notice(message, type = 'danger') {
  const box = document.querySelector('#notice');
  box.className = `alert alert-${type}`;
  box.textContent = message;
}
