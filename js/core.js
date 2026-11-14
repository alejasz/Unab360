/* UNAB 360 · núcleo compartido: almacenamiento, sesión, layout, utilidades y datos del campus */
'use strict';

/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const pad = n => String(n).padStart(2, '0');
const toISO = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayISO = () => toISO(new Date());
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmtDate = (s, o = { day: 'numeric', month: 'short', year: 'numeric' }) => s ? parseISO(s).toLocaleDateString('es-CO', o) : '';
const fmtH = n => (Math.round(n * 100) / 100).toString().replace('.', ',');

const store = {
  get(k, d) { try { const v = localStorage.getItem('unab360:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('unab360:' + k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
  del(k) { try { localStorage.removeItem('unab360:' + k); } catch { } }
};

/* ---------- Enlaces institucionales ---------- */
const LINKS = [
  { n: 'Mi Portal U', u: 'https://miportalu.unab.edu.co/', e: '', d: 'Notas, horarios y trámites' },
  { n: 'Cosmos', u: 'https://cosmos.unab.edu.co/', e: '', d: 'Plataforma académica' },
  { n: 'Tema', u: 'https://tema.unab.edu.co/', e: '', d: 'Gestión y servicios' },
  { n: 'Canvas', u: 'https://unab.instructure.com/', e: '', d: 'Aulas virtuales' }
];

/* ---------- Lugares del campus ---------- */
const PLACES = [
  { id: 'banu', nombre: 'Banú', tipo: 'Zona social', campus: 'Campus Central', img: 'banu.jpg', horario: 'Lun–Vie · 7:00 a 20:00', min: 20, acts: ['Descansar', 'Conversar', 'Estudio en grupo'],
    desc: 'Plazoleta abierta rodeada de zonas verdes, ideal para desconectarse entre clases o reunirse con tu grupo.' },
  { id: 'gimnasio', nombre: 'Gimnasio', tipo: 'Deporte', campus: 'Campus Central', img: 'gimnasio.jpg', horario: 'Lun–Vie · 6:00 a 20:00', min: 45, acts: ['Ejercicio', 'Pesas', 'Cardio'],
    desc: 'Bicicletas, zona de pesas y espacios para entrenar durante tus horas libres. Lleva ropa deportiva.' },
  { id: 'casona', nombre: 'Cafetería Casona', tipo: 'Cafetería', campus: 'Campus La Casona', img: 'casona.jpg', horario: 'Lun–Sáb · 7:00 a 19:00', min: 20, acts: ['Comer', 'Descansar', 'Conversar'],
    desc: 'Cafetería en la histórica sede de La Casona, perfecta para un café tranquilo.' },
  { id: 'bosque', nombre: 'Cafetería Bosque', tipo: 'Cafetería', campus: 'Campus El Bosque', img: 'bosque.jpg', horario: 'Lun–Sáb · 7:00 a 19:00', min: 20, acts: ['Comer', 'Descansar', 'Conversar'],
    desc: 'Rodeada de naturaleza en el campus El Bosque. Buena opción para almorzar o tomar aire.' },
  { id: 'csu', nombre: 'Cafetería CSU', tipo: 'Cafetería', campus: 'Campus CSU', img: 'csu.jpg', horario: 'Lun–Vie · 7:00 a 20:00', min: 20, acts: ['Comer', 'Descansar', 'Estudio en grupo'],
    desc: 'Cafetería del Centro de Servicios Universitarios, con amplios espacios para compartir.' },
  { id: 'biblioteca', nombre: 'Biblioteca Luis Carlos Galán', tipo: 'Estudio', campus: 'Campus Central', img: 'biblioteca.jpg', horario: 'Lun–Vie · 7:00 a 21:00', min: 45, acts: ['Estudiar', 'Leer', 'Estudio en grupo'],
    desc: 'Salas de lectura, cubículos y recursos bibliográficos para estudiar con concentración.' },
  { id: 'computo', nombre: 'Salas de cómputo', tipo: 'Tecnología', campus: 'Campus Central', img: 'informatica.jpg', horario: 'Lun–Vie · 7:00 a 20:00', min: 45, acts: ['Hacer tareas', 'Imprimir / consultar', 'Estudiar'],
    desc: 'Salas con computadores para trabajos, consultas y software académico.' },
  { id: 'plazoleta', nombre: 'Plazoleta principal', tipo: 'Zona social', campus: 'Campus Central', img: 'plazoleta.jpg', horario: 'Todo el día', min: 15, acts: ['Descansar', 'Conversar', 'Caminar'],
    desc: 'El corazón del campus: punto de encuentro entre bloques.' },
  { id: 'aerobicos', nombre: 'Salón de aeróbicos', tipo: 'Deporte', campus: 'Campus Central', img: 'aerobicos.jpg', horario: 'Según programación', min: 45, acts: ['Ejercicio', 'Baile', 'Yoga'],
    desc: 'Espacio para clases dirigidas de acondicionamiento físico y baile.' },
  { id: 'musunab', nombre: 'MUSUNAB', tipo: 'Cultura', campus: 'Campus Central', img: 'musunab.jpg', horario: 'Lun–Vie · 8:00 a 17:00', min: 30, acts: ['Visitar exposición', 'Aprender', 'Caminar'],
    desc: 'Museo de la universidad con exposiciones y muestras culturales.' },
  { id: 'auditorio', nombre: 'Auditorio Mayor', tipo: 'Cultura', campus: 'Campus Central', img: 'auditorio.jpg', horario: 'Según eventos', min: 60, acts: ['Asistir a eventos', 'Conferencias'],
    desc: 'Escenario de conferencias, conciertos y eventos institucionales.' }
];
const placeById = id => PLACES.find(p => p.id === id);

/* ---------- Nube (Firebase) ----------
   Si js/firebase-config.js tiene las claves del proyecto, las cuentas y los datos se guardan
   en línea y funcionan en cualquier dispositivo. Si está vacío, todo se guarda solo en este navegador. */
const CLOUD = !!(window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey);
const clean = v => JSON.parse(JSON.stringify(v ?? null));
const Cloud = {
  auth: null, db: null, uid: null,
  loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); }); },
  async init() {
    if (!CLOUD) return;
    try {
      const base = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-';
      for (const m of ['app', 'auth', 'firestore']) await this.loadScript(`${base}${m}-compat.js`);
      firebase.initializeApp(window.FIREBASE_CONFIG);
      this.auth = firebase.auth(); this.db = firebase.firestore();
      const user = await new Promise(r => { const un = this.auth.onAuthStateChanged(u => { un(); r(u); }); });
      if (user) { this.uid = user.uid; await this.pull(); }
      else { store.del('session'); store.del('users'); }
    } catch (e) { console.warn('No se pudo conectar con la nube', e); }
  },
  /* Descarga el perfil y los datos del usuario y los deja en caché local */
  async pull() {
    const snap = await this.db.collection('users').doc(this.uid).get();
    if (!snap.exists) { await this.auth.signOut(); this.uid = null; store.del('session'); store.del('users'); return false; }
    const { data = {}, ...perfil } = snap.data();
    perfil.clave = '';
    store.set('users', { [perfil.usuario]: perfil }); store.set('session', perfil.usuario);
    Object.entries(data).forEach(([k, v]) => store.set(`u:${perfil.usuario}:${k}`, v));
    return true;
  },
  push(k, v) { if (this.uid) this.db.collection('users').doc(this.uid).set({ data: { [k]: clean(v) } }, { merge: true }).catch(console.warn); },
  pushProfile(u) { if (this.uid) { const { clave, ...p } = u; this.db.collection('users').doc(this.uid).set(clean(p), { merge: true }).catch(console.warn); } }
};

/* ---------- Sesión y usuarios ---------- */
const AUTH_MSG = {
  nocuenta: 'No encontramos ese usuario. Revisa que esté bien escrito.',
  credenciales: 'Usuario o clave incorrectos. Inténtalo de nuevo.',
  clave: 'La clave es incorrecta. Inténtalo de nuevo.',
  dupUsuario: 'Ese usuario ya está registrado. Elige otro.',
  dupCorreo: 'Ese correo ya tiene una cuenta. Inicia sesión.',
  debil: 'La clave es muy débil. Usa mínimo 8 caracteres con letras y números.',
  intentos: 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.',
  red: 'No hay conexión con el servidor. Revisa tu internet.',
  error: 'Ocurrió un error. Inténtalo de nuevo.'
};
const authCode = e => ({
  'auth/wrong-password': 'credenciales', 'auth/invalid-credential': 'credenciales', 'auth/user-not-found': 'nocuenta', 'auth/invalid-login-credentials': 'credenciales',
  'auth/too-many-requests': 'intentos', 'auth/network-request-failed': 'red', 'auth/weak-password': 'debil', 'auth/email-already-in-use': 'dupCorreo'
}[e && e.code] || 'error');

/* Usuarios precargados: solo pueden iniciar sesión (no hay registro). */
const SEED_USERS = [
  { usuario: 'thore', nombre: 'Thore Nicholas Dohn Cerchiaro', correo: 'tdohn@unab.edu.co', clave: 'Unab2026', programa: 'Ingeniería de Sistemas', semestre: '2', codigo: 'U00187652', foto: 'img/thore.png' }
];

const Auth = {
  users() {
    const all = store.get('users', {});
    let changed = false;
    SEED_USERS.forEach(s => {
      if (!all[s.usuario]) { all[s.usuario] = { ...s }; changed = true; }
      else if (!all[s.usuario].codigo && s.codigo) { all[s.usuario].codigo = s.codigo; changed = true; }
    });
    if (changed) store.set('users', all);
    return all;
  },
  current() { return store.get('session', null); },
  user() { const c = this.current(); return c ? this.users()[c] || null : null; },
  find(id) { const q = id.trim().toLowerCase(); return Object.values(this.users()).find(x => x.usuario.toLowerCase() === q || x.correo.toLowerCase() === q); },

  async login(id, clave) {
    if (!CLOUD) {
      const u = this.find(id);
      if (!u) return { ok: false, code: 'nocuenta' };
      if (u.clave !== clave) return { ok: false, code: 'clave' };
      store.set('session', u.usuario); return { ok: true };
    }
    if (!Cloud.auth) return { ok: false, code: 'red' };
    try {
      let email = id.trim();
      if (!email.includes('@')) {
        const s = await Cloud.db.collection('usernames').doc(email.toLowerCase()).get();
        if (!s.exists) return { ok: false, code: 'nocuenta' };
        email = s.data().email;
      }
      const cr = await Cloud.auth.signInWithEmailAndPassword(email, clave);
      Cloud.uid = cr.user.uid;
      return (await Cloud.pull()) ? { ok: true } : { ok: false, code: 'nocuenta' };
    } catch (e) { return { ok: false, code: authCode(e) }; }
  },

  async register(p, clave) {
    const key = p.usuario.toLowerCase();
    if (!CLOUD) {
      const dup = Object.values(this.users()).find(u => u.usuario.toLowerCase() === key || u.correo.toLowerCase() === p.correo.toLowerCase());
      if (dup) return { ok: false, field: dup.usuario.toLowerCase() === key ? 'usuario' : 'correo', code: dup.usuario.toLowerCase() === key ? 'dupUsuario' : 'dupCorreo' };
      this.save({ ...p, clave, foto: '' }); store.set('session', p.usuario); return { ok: true };
    }
    if (!Cloud.auth) return { ok: false, code: 'red' };
    try {
      const s = await Cloud.db.collection('usernames').doc(key).get();
      if (s.exists) return { ok: false, field: 'usuario', code: 'dupUsuario' };
      const cr = await Cloud.auth.createUserWithEmailAndPassword(p.correo, clave);
      Cloud.uid = cr.user.uid;
      const b = Cloud.db.batch();
      b.set(Cloud.db.collection('users').doc(Cloud.uid), clean({ ...p, foto: '' }));
      b.set(Cloud.db.collection('usernames').doc(key), { uid: Cloud.uid, email: p.correo });
      try { await b.commit(); } catch (e) { await cr.user.delete().catch(() => { }); Cloud.uid = null; return { ok: false, code: 'error' }; }
      await Cloud.pull(); return { ok: true };
    } catch (e) { const code = authCode(e); return { ok: false, code, field: code === 'dupCorreo' ? 'correo' : code === 'debil' ? 'clave' : undefined }; }
  },

  async logout() {
    if (CLOUD && Cloud.auth) { try { await Cloud.auth.signOut(); } catch { } store.del('users'); }
    store.del('session'); location.href = 'index.html';
  },
  save(u) { const all = this.users(); all[u.usuario] = u; store.set('users', all); Cloud.pushProfile(u); }
};

/* Datos por usuario (caché local + copia en la nube cuando está activa) */
const D = {
  get(k, d) { return store.get(`u:${Auth.current()}:${k}`, d); },
  set(k, v) { store.set(`u:${Auth.current()}:${k}`, v); Cloud.push(k, v); }
};

/* Datos iniciales de Thore: materias, parciales, entregas, tareas y horas libres.
   Los días y horas de las clases son provisionales y se editan desde el Calendario. */
const MATERIAS = [
  ['Cálculo integral', 1, '07:00'], ['Programación de computadores', 2, '09:00'], ['Diseño de interfaz de usuario', 3, '10:00'],
  ['Cátedra', 4, '08:00'], ['Mecánica', 5, '07:00'], ['Laboratorio de mecánica', 5, '09:00']
];
function seedDatos() {
  if (Auth.current() !== 'thore' || D.get('seeded1', false)) return;
  const FIN = '2026-11-20'; // fin de clases: luego vacaciones
  const dia = n => toISO(new Date(2026, 10, 8 + n)); // semana del lunes 9 de noviembre
  const hoy = new Date(); const off = n => { const d = new Date(hoy); d.setDate(d.getDate() + n); return toISO(d); };
  const ev = MATERIAS.map(([m, d, h]) => ({ id: uid(), titulo: m, fecha: dia(d), hora: h, tipo: 'clase', repite: true, hasta: FIN, nota: '' }));
  ev.push(
    { id: uid(), titulo: 'Parcial final de Cálculo integral', fecha: '2026-11-16', hora: '07:00', tipo: 'parcial', repite: false, nota: '' },
    { id: uid(), titulo: 'Parcial final de Programación de computadores', fecha: '2026-11-17', hora: '09:00', tipo: 'parcial', repite: false, nota: '' },
    { id: uid(), titulo: 'Entrega final de Diseño de interfaz de usuario', fecha: '2026-11-18', hora: '23:59', tipo: 'entrega', repite: false, nota: '' },
    { id: uid(), titulo: 'Parcial final de Mecánica', fecha: '2026-11-20', hora: '07:00', tipo: 'parcial', repite: false, nota: '' },
    { id: uid(), titulo: 'Entrega de informe de Laboratorio de mecánica', fecha: '2026-11-20', hora: '09:00', tipo: 'entrega', repite: false, nota: '' }
  );
  D.set('events', ev);
  D.set('asist', MATERIAS.map(([m]) => ({ id: uid(), materia: m, sesiones: 32, permitidas: 6, faltas: 0 })));
  D.set('hlMeta', 40);
  D.set('hl', [
    { id: uid(), fecha: off(-12), lugar: 'gimnasio', horas: 2, nota: 'Rutina de piernas' },
    { id: uid(), fecha: off(-9), lugar: 'biblioteca', horas: 3, nota: 'Estudio para parcial' },
    { id: uid(), fecha: off(-5), lugar: 'casona', horas: 1, nota: 'Café con el grupo' },
    { id: uid(), fecha: off(-2), lugar: 'banu', horas: 2, nota: '' }
  ]);
  D.set('tareas', [
    { id: uid(), texto: 'Estudiar para el parcial de Cálculo integral', fecha: '2026-11-15', hecha: false },
    { id: uid(), texto: 'Terminar la entrega de Diseño de interfaz de usuario', fecha: '2026-11-18', hecha: false },
    { id: uid(), texto: 'Preparar el informe de Laboratorio de mecánica', fecha: '2026-11-19', hecha: false }
  ]);
  D.set('seeded1', true);
}

/* ---------- Tema claro / oscuro ---------- */
function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); }
applyTheme(store.get('theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
/* Iconos SVG (sin emojis): luna en modo claro, sol en modo oscuro */
function themeIcon(dark) {
  const a = 'width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  return dark
    ? `<svg ${a}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`
    : `<svg ${a}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
}
function toggleTheme() {
  const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  store.set('theme', t); applyTheme(t); const b = $('#themeBtn'); if (b) b.innerHTML = themeIcon(t === 'dark');
}

/* ---------- Toast, confirmación y formularios modales ---------- */
function toast(msg, bad = false) {
  let box = $('#toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('role', 'status'); document.body.append(box); }
  const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg; box.append(t);
  setTimeout(() => t.remove(), 3200);
}

function fieldHTML(f, v) {
  const val = v ?? f.value ?? '';
  const id = 'f_' + f.name;
  let ctl;
  if (f.type === 'select') ctl = `<select id="${id}" name="${f.name}" ${f.required ? 'required' : ''}>${f.options.map(o => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}" ${String(ov) === String(val) ? 'selected' : ''}>${esc(ol)}</option>`; }).join('')}</select>`;
  else if (f.type === 'textarea') ctl = `<textarea id="${id}" name="${f.name}" rows="3" maxlength="${f.max || 300}">${esc(val)}</textarea>`;
  else if (f.type === 'checkbox') return `<div class="field"><label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" name="${f.name}" ${val ? 'checked' : ''}> ${esc(f.label)}</label></div>`;
  else ctl = `<input id="${id}" name="${f.name}" type="${f.type || 'text'}" value="${esc(val)}" ${f.required ? 'required' : ''} ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined ? `max="${f.max}"` : ''} ${f.step ? `step="${f.step}"` : ''} ${f.maxlength ? `maxlength="${f.maxlength}"` : ''} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''}>`;
  return `<div class="field"><label for="${id}">${esc(f.label)}${f.required ? ' *' : ''}</label>${ctl}<div class="err" aria-live="polite"></div></div>`;
}

function openForm({ title, fields, values = {}, submitText = 'Guardar', onSubmit, extra = '' }) {
  const dlg = document.createElement('dialog');
  dlg.innerHTML = `<div class="dh"><h3>${esc(title)}</h3><button class="icon-btn" type="button" data-x aria-label="Cerrar">✕</button></div>
    <form class="db" novalidate>${extra}${fields.map(f => fieldHTML(f, values[f.name])).join('')}
    <div class="df"><button type="button" class="btn ghost" data-x>Cancelar</button><button class="btn yellow">${esc(submitText)}</button></div></form>`;
  document.body.append(dlg);
  const close = () => { dlg.close(); dlg.remove(); };
  $$('[data-x]', dlg).forEach(b => b.onclick = close);
  dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
  $('form', dlg).onsubmit = e => {
    e.preventDefault();
    let ok = true; const out = {};
    $$('input,select,textarea', dlg).forEach(el => {
      const wrap = el.closest('.field'); const err = $('.err', wrap || dlg);
      if (el.type === 'checkbox') { out[el.name] = el.checked; return; }
      const valid = el.checkValidity() && !(el.required && !el.value.trim());
      if (wrap) wrap.classList.toggle('invalid', !valid);
      if (err) err.textContent = valid ? '' : (el.validationMessage || 'Campo obligatorio');
      if (!valid) ok = false;
      out[el.name] = el.value.trim();
    });
    if (!ok) return;
    if (onSubmit(out) !== false) close();
  };
  dlg.showModal();
  const first = $('input:not([type=checkbox]),select,textarea', dlg); if (first) first.focus();
  return dlg;
}

/* ---------- Layout: header + footer ---------- */
const NAV = [
  ['inicio.html', 'Inicio'], ['horas-libres.html', 'Horas libres'], ['lugares.html', 'Lugares'], ['calendario.html', 'Calendario'],
  ['notas.html', 'Notas'], ['asistencia.html', 'Asistencia'], ['tareas.html', 'Tareas'], ['perfil.html', 'Perfil'], ['ayuda.html', 'Ayuda'], ['creadores.html', 'Creadores']
];
function initials(n) { return String(n).trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase(); }
function avatarSrc(u) { return u && u.foto ? u.foto : null; }

function buildLayout() {
  const page = location.pathname.split('/').pop() || 'index.html';
  const u = Auth.user();
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `<div class="container bar">
    <a class="brand" href="${u ? 'inicio.html' : 'index.html'}" aria-label="UNAB 360 inicio"><img src="img/logo.png" alt="Universidad UNAB"><span>360</span></a>
    ${u ? `<nav class="nav" id="nav" aria-label="Principal">${NAV.map(([h, t]) => `<a href="${h}" ${h === page ? 'class="active" aria-current="page"' : ''}>${t}</a>`).join('')}</nav>` : ''}
    <button class="icon-btn" id="themeBtn" type="button" aria-label="Cambiar tema claro u oscuro" title="Modo claro / oscuro">${themeIcon(dark)}</button>
    ${u ? `<a class="user-chip" href="perfil.html" style="color:#fff;text-decoration:none">${avatarSrc(u) ? `<img src="${esc(avatarSrc(u))}" alt="">` : `<span class="mini-ini" aria-hidden="true">${esc(initials(u.nombre))}</span>`}<span class="nm small">${esc(u.nombre.split(' ')[0])}</span></a>
    <button class="btn yellow sm" id="logoutBtn" type="button">Salir</button>
    <button class="icon-btn menu-btn" id="menuBtn" type="button" aria-label="Abrir menú" aria-expanded="false"></button>` : ''}
  </div>`;
  document.body.prepend(header);

  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `<div class="container"><div class="cols">
    <div><img src="img/logo.png" alt="Universidad UNAB"><p class="small">UNAB 360 es un proyecto estudiantil que reúne tus horas libres, lugares del campus, calendario y herramientas académicas en un solo sitio.</p></div>
    <div><h4>Secciones</h4><a href="horas-libres.html">Horas libres</a><a href="lugares.html">Lugares</a><a href="calendario.html">Calendario</a><a href="ayuda.html">Ayuda</a></div>
    <div><h4>Plataformas UNAB</h4>${LINKS.map(l => `<a href="${l.u}" target="_blank" rel="noopener">${l.n}</a>`).join('')}</div>
  </div><div class="copy">© ${new Date().getFullYear()} UNAB 360 · Bucaramanga, Colombia · <a href="creadores.html" style="display:inline">Creadores del sitio</a></div></div>`;
  document.body.append(footer);

  $('#themeBtn').onclick = toggleTheme;
  const lo = $('#logoutBtn'); if (lo) lo.onclick = () => Auth.logout();
  const mb = $('#menuBtn'); if (mb) mb.onclick = () => { const o = $('#nav').classList.toggle('open'); mb.setAttribute('aria-expanded', o); };
}

/* ---------- Horas libres (helpers compartidos) ---------- */
const HL = {
  list() { return D.get('hl', []); },
  meta() { return Number(D.get('hlMeta', 40)) || 40; },
  total() { return this.list().reduce((s, r) => s + Number(r.horas || 0), 0); },
  add(r) { const l = this.list(); l.push({ id: uid(), ...r }); D.set('hl', l); }
};

/* ---------- Arranque ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  await Cloud.init();
  const protectedPage = document.body.hasAttribute('data-protected');
  if (protectedPage && !Auth.user()) { location.replace('index.html'); return; }
  if (!protectedPage && document.body.hasAttribute('data-guest') && Auth.user()) { location.replace('inicio.html'); return; }
  if (Auth.user()) seedDatos();
  if (!document.body.hasAttribute('data-bare')) buildLayout();
  else { const tb = $('#themeBtn'); if (tb) tb.innerHTML = themeIcon(document.documentElement.getAttribute('data-theme') === 'dark'); }
  const init = window.PAGES && window.PAGES[document.body.dataset.page];
  if (init) init();
});
