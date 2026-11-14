/* UNAB 360 · lógica de cada página (se activa según <body data-page="...">) */
'use strict';
window.PAGES = {};

/* ---------- helpers de validación visual ---------- */
function setErr(input, msg) {
  const f = input.closest('.field'); if (!f) return;
  f.classList.toggle('invalid', !!msg);
  const e = $('.err', f); if (e) e.textContent = msg || '';
}
function togglePw(btn) {
  const i = btn.parentElement.querySelector('input');
  i.type = i.type === 'password' ? 'text' : 'password';
  btn.textContent = i.type === 'password' ? 'Ver' : 'Ocultar';
}

/* =====================  LOGIN  ===================== */
PAGES.login = () => {
  const form = $('#loginForm'), box = $('#loginAlert');
  $$('.pw button').forEach(b => b.onclick = () => togglePw(b));
  $('#themeBtn').onclick = toggleTheme;
  form.onsubmit = async e => {
    e.preventDefault();
    const u = form.usuario, c = form.clave; let ok = true;
    box.classList.add('hidden');
    if (u.value.trim().length < 3) { setErr(u, 'Ingresa tu usuario o correo institucional.'); ok = false; } else setErr(u);
    if (!c.value) { setErr(c, 'Ingresa tu clave.'); ok = false; } else setErr(c);
    if (!ok) return;
    const btn = $('button.yellow', form); btn.disabled = true; btn.textContent = 'Ingresando...';
    const r = await Auth.login(u.value, c.value);
    if (r.ok) { location.href = 'inicio.html'; return; }
    btn.disabled = false; btn.textContent = 'Ingresar';
    box.textContent = AUTH_MSG[r.code] || AUTH_MSG.error;
    box.classList.remove('hidden');
  };
};

/* =====================  BIENVENIDA  ===================== */
PAGES.landing = () => { $('#themeBtn').onclick = toggleTheme; };

/* =====================  REGISTRO  ===================== */
PAGES.registro = () => {
  const f = $('#regForm');
  $$('.pw button').forEach(b => b.onclick = () => togglePw(b));
  $('#themeBtn').onclick = toggleTheme;
  f.onsubmit = async e => {
    e.preventDefault();
    const v = n => f[n].value.trim();
    const checks = [
      ['nombre', v('nombre').split(/\s+/).length >= 2 && v('nombre').length >= 5, 'Escribe tu nombre completo.'],
      ['correo', /^[^\s@]+@unab\.edu\.co$/i.test(v('correo')), 'Usa tu correo institucional (@unab.edu.co).'],
      ['usuario', /^[a-z0-9._]{4,20}$/i.test(v('usuario')), '4 a 20 caracteres: letras, números, punto o guion bajo.'],
      ['programa', v('programa').length >= 3, 'Indica tu programa académico.'],
      ['clave', /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(f.clave.value), 'Mínimo 8 caracteres con letras y números.'],
      ['clave2', f.clave2.value === f.clave.value && f.clave2.value, 'Las claves no coinciden.']
    ];
    let ok = true;
    checks.forEach(([n, pass, msg]) => { setErr(f[n], pass ? '' : msg); if (!pass) ok = false; });
    if (!ok) return;
    const btn = $('button.yellow', f); btn.disabled = true; btn.textContent = 'Creando cuenta...';
    const r = await Auth.register({ usuario: v('usuario'), nombre: v('nombre'), correo: v('correo').toLowerCase(), programa: v('programa'), semestre: f.semestre.value, codigo: v('codigo') }, f.clave.value);
    if (r.ok) { location.href = 'inicio.html'; return; }
    btn.disabled = false; btn.textContent = 'Crear cuenta';
    if (r.field && f[r.field]) setErr(f[r.field], AUTH_MSG[r.code]); else toast(AUTH_MSG[r.code] || AUTH_MSG.error, true);
  };
};

/* =====================  INICIO  ===================== */
/* Top 10 de estudiantes con más horas libres (datos de muestra) */
const TOP10 = [
  ['Juan Esteban Becerra Sotelo', 61], ['Paulo Cesar Claro Martinez', 57], ['Maria Paula Gomez Bonilla', 54], ['David Santiago Hernandez Cristancho', 52],
  ['Dominic Santiago Maffiold Becerra', 49], ['Sebastian David Cataño Alcala', 47], ['Andres Felipe Gonzalez Pinto', 45],
  ['Pablo Andres Gonzalez Cortes', 42], ['Thomas Martinez Espinosa', 40], ['Juan David Martinez Cepeda', 37]
];
function pintarTop10() {
  const u = Auth.user(), mias = HL.total();
  let html = '';
  TOP10.forEach((e, i) => { html += `<tr><td>${i + 1}</td><td>${esc(e[0])}</td><td>${e[1]} h</td></tr>`; });
  const pos = TOP10.filter(e => e[1] > mias).length + 1;
  html += pos > 10
    ? `<tr class="yo"><td>${pos}</td><td>${esc(u.nombre)} (tú)</td><td>${fmtH(mias)} h</td></tr>`
    : '';
  $('#top10').innerHTML = html;
}

PAGES.inicio = () => {
  pintarTop10();
  const u = Auth.user(), tot = HL.total(), meta = HL.meta(), pct = Math.min(100, Math.round(tot / meta * 100));
  $('#saludo').textContent = `¡Hola, ${u.nombre.split(' ')[0]}!`;
  $('#ring').style.setProperty('--v', pct);
  $('#ring').innerHTML = `<div><span>${pct}%<small>de tu meta</small></span></div>`;
  $('#sHL').textContent = fmtH(tot); $('#sFalta').textContent = fmtH(Math.max(0, meta - tot)); $('#sMeta').textContent = meta;
  const tareas = D.get('tareas', []).filter(t => !t.hecha);
  $('#sTareas').textContent = tareas.length;
  $('#quick').innerHTML = LINKS.map(l => `<a class="tile ext" href="${l.u}" target="_blank" rel="noopener"><b>${l.n}</b><span>${l.d}</span></a>`).join('');
  const prox = upcoming(30).slice(0, 5);
  $('#prox').innerHTML = prox.length ? prox.map(e => `<div class="item"><span class="ev ${e.tipo}" style="padding:4px 10px;font-size:.72rem">${tipoLabel(e.tipo)}</span><div class="grow"><b>${esc(e.titulo)}</b><div class="small muted">${fmtDate(e.fecha, { weekday: 'short', day: 'numeric', month: 'short' })}${e.hora ? ' · ' + e.hora : ''}</div></div></div>`).join('') : '<p class="empty">Sin actividades próximas. <a href="calendario.html">Agrega una</a>.</p>';
  $('#tareasRes').innerHTML = tareas.slice(0, 4).map(t => `<div class="item"><div class="grow">${esc(t.texto)}<div class="small muted">${t.fecha ? 'Para ' + fmtDate(t.fecha) : 'Sin fecha'}</div></div></div>`).join('') || '<p class="empty">¡Todo al día! </p>';
};

/* =====================  HORAS LIBRES (CRUD)  ===================== */
PAGES.horas = () => {
  const fields = (v = {}) => [
    { name: 'fecha', label: 'Fecha', type: 'date', required: true, max: todayISO() },
    { name: 'lugar', label: 'Lugar donde hiciste la HL', type: 'select', required: true, options: PLACES.map(p => [p.id, p.nombre]) },
    { name: 'horas', label: 'Horas realizadas', type: 'number', required: true, min: 0.5, max: 12, step: 0.5 },
    { name: 'nota', label: 'Actividad / nota (opcional)', type: 'textarea' }
  ];
  const save = (id) => out => {
    const l = HL.list(); out.horas = Number(out.horas);
    if (id) { const i = l.findIndex(x => x.id === id); l[i] = { ...l[i], ...out }; toast('Registro actualizado'); }
    else { l.push({ id: uid(), ...out }); toast('Horas libres registradas'); }
    D.set('hl', l); render();
  };
  const filtro = $('#fLugar');
  filtro.innerHTML = '<option value="">Todos los lugares</option>' + PLACES.map(p => `<option value="${p.id}">${esc(p.nombre)}</option>`).join('');
  filtro.onchange = render;
  $('#addHL').onclick = () => openForm({ title: 'Registrar horas libres', fields: fields(), values: { fecha: todayISO(), horas: 1 }, onSubmit: save(null) });
  $('#editMeta').onclick = () => openForm({
    title: 'Meta de horas libres', fields: [{ name: 'meta', label: 'Horas libres que debes cumplir', type: 'number', required: true, min: 1, max: 500 }],
    values: { meta: HL.meta() }, onSubmit: o => { D.set('hlMeta', Number(o.meta)); toast('Meta actualizada'); render(); }
  });

  function render() {
    const tot = HL.total(), meta = HL.meta(), pct = Math.min(100, Math.round(tot / meta * 100));
    $('#hTot').textContent = fmtH(tot); $('#hFalta').textContent = fmtH(Math.max(0, meta - tot)); $('#hMeta').textContent = meta;
    $('#hBar').style.width = pct + '%'; $('#hPct').textContent = pct + '%';
    $('#hMsg').textContent = tot >= meta ? '¡Meta cumplida!' : `Te faltan ${fmtH(meta - tot)} horas para completar tu meta.`;
    const fl = filtro.value;
    const rows = HL.list().filter(r => !fl || r.lugar === fl).sort((a, b) => b.fecha.localeCompare(a.fecha));
    $('#hlBody').innerHTML = rows.length ? rows.map(r => `<tr><td>${fmtDate(r.fecha)}</td><td>${esc(placeById(r.lugar)?.nombre || r.lugar)}</td><td><b>${fmtH(r.horas)} h</b></td><td class="muted">${esc(r.nota || '—')}</td>
      <td style="white-space:nowrap"><button class="btn ghost sm" data-e="${r.id}">Editar</button> <button class="btn danger sm" data-d="${r.id}">Eliminar</button></td></tr>`).join('')
      : '<tr><td colspan="5" class="empty">Aún no tienes horas registradas. Pulsa “Registrar horas”.</td></tr>';
    $$('[data-e]').forEach(b => b.onclick = () => { const r = HL.list().find(x => x.id === b.dataset.e); openForm({ title: 'Editar registro', fields: fields(), values: r, onSubmit: save(r.id) }); });
    $$('[data-d]').forEach(b => b.onclick = () => { if (confirm('¿Eliminar este registro de horas libres?')) { D.set('hl', HL.list().filter(x => x.id !== b.dataset.d)); toast('Registro eliminado'); render(); } });
    // por lugar
    const by = {}; HL.list().forEach(r => by[r.lugar] = (by[r.lugar] || 0) + Number(r.horas));
    $('#hPlaces').innerHTML = Object.keys(by).length ? Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<div class="item"><div class="grow">${esc(placeById(k)?.nombre || k)}</div><span class="badge">${fmtH(v)} h</span></div>`).join('') : '<p class="empty">Sin datos todavía.</p>';
  }

  /* Sugerencias según tiempo libre */
  const sug = () => {
    const m = Number($('#sMin').value), t = $('#sTipo').value;
    const list = PLACES.filter(p => p.min <= m && (!t || p.tipo === t)).sort((a, b) => b.min - a.min).slice(0, 4);
    $('#sugList').innerHTML = list.length ? list.map(p => `<div class="card flat" style="display:flex;gap:14px;align-items:center;padding:12px"><img src="img/${p.img}" alt="" style="width:84px;height:68px;object-fit:cover;border-radius:10px"><div class="grow" style="flex:1"><b>${esc(p.nombre)}</b><div class="small muted">${esc(p.acts.join(' · '))}</div><div class="small">${esc(p.campus)}</div></div><a class="btn sm" href="lugares.html?reg=${p.id}">Registrarme</a></div>`).join('')
      : '<p class="empty">No hay lugares que encajen con ese tiempo.</p>';
  };
  $('#sTipo').innerHTML = '<option value="">Cualquier tipo</option>' + [...new Set(PLACES.map(p => p.tipo))].map(t => `<option>${t}</option>`).join('');
  $('#sMin').onchange = sug; $('#sTipo').onchange = sug;
  render(); sug();
};

/* =====================  LUGARES  ===================== */
PAGES.lugares = () => {
  let tab = 'disp';
  const reg = () => D.get('reg', []);
  const campusList = [...new Set(PLACES.map(p => p.campus))];
  const tipos = [...new Set(PLACES.map(p => p.tipo))];
  $('#fCampus').innerHTML = '<option value="">Todos los campus</option>' + campusList.map(c => `<option>${c}</option>`).join('');
  $('#fTipo').innerHTML = '<option value="">Todos los tipos</option>' + tipos.map(c => `<option>${c}</option>`).join('');
  ['fQ', 'fCampus', 'fTipo'].forEach(i => $('#' + i).oninput = render);
  $$('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; $$('[data-tab]').forEach(x => x.classList.toggle('on', x === b)); render(); });

  function openReg(p) {
    openForm({
      title: `Registrarme en ${p.nombre}`, submitText: 'Registrarme',
      extra: `<p class="small muted" style="margin-bottom:12px">${esc(p.horario)} · ${esc(p.campus)}</p>`,
      fields: [
        { name: 'fecha', label: 'Fecha', type: 'date', required: true, min: todayISO() },
        { name: 'hora', label: 'Hora de llegada', type: 'time', required: true },
        { name: 'horas', label: 'Duración (horas)', type: 'number', required: true, min: 0.5, max: 6, step: 0.5 }
      ],
      values: { fecha: todayISO(), hora: '12:00', horas: 1 },
      onSubmit: o => { const l = reg(); l.push({ id: uid(), lugar: p.id, ...o, horas: Number(o.horas) }); D.set('reg', l); toast(`Registrado en ${p.nombre}`); render(); }
    });
  }

  function card(p) {
    const mine = reg().filter(r => r.lugar === p.id);
    return `<article class="card place" id="${p.id}"><img src="img/${p.img}" alt="${esc(p.nombre)}" loading="lazy"><div class="body">
      <div class="meta"><span class="badge">${esc(p.tipo)}</span><span class="badge y">${esc(p.campus)}</span>${mine.length ? `<span class="badge ok">Registrado ×${mine.length}</span>` : ''}</div>
      <h3>${esc(p.nombre)}</h3><p class="small muted">${esc(p.desc)}</p>
      <div class="small">Horario: ${esc(p.horario)}</div><div class="small">Actividades: ${esc(p.acts.join(' · '))}</div>
      <div class="actions"><button class="btn sm" data-r="${p.id}">Registrarme</button></div></div></article>`;
  }

  function render() {
    const q = $('#fQ').value.trim().toLowerCase(), c = $('#fCampus').value, t = $('#fTipo').value;
    const match = p => (!q || (p.nombre + ' ' + p.tipo + ' ' + p.campus + ' ' + p.acts.join(' ')).toLowerCase().includes(q)) && (!c || p.campus === c) && (!t || p.tipo === t);
    const regBox = $('#regBox'), grid = $('#placeGrid');
    if (tab === 'disp') {
      regBox.classList.add('hidden'); grid.classList.remove('hidden');
      const l = PLACES.filter(match);
      grid.innerHTML = l.length ? l.map(card).join('') : '<p class="empty" style="grid-column:1/-1">No se encontraron lugares con esos filtros.</p>';
      $$('[data-r]', grid).forEach(b => b.onclick = () => openReg(placeById(b.dataset.r)));
    } else {
      grid.classList.add('hidden'); regBox.classList.remove('hidden');
      const l = reg().filter(r => match(placeById(r.lugar))).sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
      $('#regBody').innerHTML = l.length ? l.map(r => { const p = placeById(r.lugar); return `<tr><td><b>${esc(p.nombre)}</b><div class="small muted">${esc(p.campus)}</div></td><td>${fmtDate(r.fecha)} · ${r.hora}</td><td>${fmtH(r.horas)} h</td>
        <td>${r.asistida ? '<span class="badge ok">HL sumada</span>' : r.fecha < todayISO() ? '<span class="badge bad">Pendiente</span>' : '<span class="badge y">Programada</span>'}</td>
        <td style="white-space:nowrap">${r.asistida ? '' : `<button class="btn sm" data-ok="${r.id}">Asistí</button> `}<button class="btn danger sm" data-x="${r.id}">Cancelar</button></td></tr>`; }).join('')
        : '<tr><td colspan="5" class="empty">No tienes lugares registrados. Ve a “Disponibles” y regístrate.</td></tr>';
      $$('[data-ok]').forEach(b => b.onclick = () => { const l = reg(), r = l.find(x => x.id === b.dataset.ok); r.asistida = true; D.set('reg', l); HL.add({ fecha: r.fecha > todayISO() ? todayISO() : r.fecha, lugar: r.lugar, horas: r.horas, nota: 'Registrada desde Lugares' }); toast(`+${fmtH(r.horas)} h sumadas a tus horas libres`); render(); });
      $$('[data-x]', regBox).forEach(b => b.onclick = () => { if (confirm('¿Cancelar este registro?')) { D.set('reg', reg().filter(x => x.id !== b.dataset.x)); toast('Registro cancelado'); render(); } });
    }
  }
  render();
  const want = new URLSearchParams(location.search).get('reg');
  if (want && placeById(want)) openReg(placeById(want));
};

/* =====================  CALENDARIO  ===================== */
const FESTIVOS = {
  '2026-01-01': 'Año Nuevo', '2026-01-12': 'Reyes Magos', '2026-03-23': 'San José', '2026-04-02': 'Jueves Santo', '2026-04-03': 'Viernes Santo',
  '2026-05-01': 'Día del Trabajo', '2026-05-18': 'Ascensión del Señor', '2026-06-08': 'Corpus Christi', '2026-06-15': 'Sagrado Corazón',
  '2026-06-29': 'San Pedro y San Pablo', '2026-07-20': 'Día de la Independencia', '2026-08-07': 'Batalla de Boyacá', '2026-08-17': 'Asunción de la Virgen',
  '2026-10-12': 'Día de la Raza', '2026-11-02': 'Todos los Santos', '2026-11-16': 'Independencia de Cartagena', '2026-12-08': 'Inmaculada Concepción',
  '2026-12-25': 'Navidad', '2027-01-01': 'Año Nuevo', '2027-01-11': 'Reyes Magos'
};
const TIPOS = [['clase', 'Clase / horario'], ['parcial', 'Parcial / examen'], ['entrega', 'Entrega'], ['personal', 'Personal']];
const tipoLabel = t => ({ clase: 'Clase', parcial: 'Parcial', entrega: 'Entrega', personal: 'Personal', festivo: 'Festivo', hl: 'HL' }[t] || t);

function eventsOn(iso) {
  const out = [], wd = parseISO(iso).getDay();
  if (FESTIVOS[iso]) out.push({ titulo: FESTIVOS[iso], tipo: 'festivo', ro: true });
  D.get('events', []).forEach(e => { if (e.fecha === iso || (e.repite && e.fecha < iso && (!e.hasta || iso <= e.hasta) && parseISO(e.fecha).getDay() === wd)) out.push(e); });
  D.get('reg', []).forEach(r => { if (r.fecha === iso) out.push({ titulo: 'HL · ' + (placeById(r.lugar)?.nombre || ''), hora: r.hora, tipo: 'hl', ro: true }); });
  return out.sort((a, b) => (a.hora || '99').localeCompare(b.hora || '99'));
}
function upcoming(days) {
  const out = [], d = new Date();
  for (let i = 0; i < days; i++) { const iso = toISO(d); eventsOn(iso).filter(e => e.tipo !== 'festivo').forEach(e => out.push({ ...e, fecha: iso })); d.setDate(d.getDate() + 1); }
  return out;
}

PAGES.calendario = () => {
  let cur = new Date(); cur.setDate(1);
  const evFields = [
    { name: 'titulo', label: 'Título', required: true, maxlength: 60 },
    { name: 'fecha', label: 'Fecha', type: 'date', required: true },
    { name: 'hora', label: 'Hora', type: 'time' },
    { name: 'tipo', label: 'Tipo', type: 'select', options: TIPOS },
    { name: 'repite', label: 'Repetir cada semana (para horario de clases)', type: 'checkbox' },
    { name: 'hasta', label: 'Repetir hasta (opcional, p. ej. fin de clases)', type: 'date' },
    { name: 'nota', label: 'Nota (opcional)', type: 'textarea' }
  ];
  const saveEv = id => o => {
    const l = D.get('events', []);
    if (id) { const i = l.findIndex(x => x.id === id); l[i] = { ...l[i], ...o }; toast('Actividad actualizada'); }
    else { l.push({ id: uid(), ...o }); toast('Actividad agregada'); }
    D.set('events', l); render();
  };
  const addEv = fecha => openForm({ title: 'Nueva actividad', fields: evFields, values: { fecha: fecha || todayISO(), tipo: 'personal' }, onSubmit: saveEv(null) });
  const editEv = e => openForm({ title: 'Editar actividad', fields: evFields, values: e, onSubmit: saveEv(e.id) });
  const delEv = e => { if (confirm(e.repite ? 'Esta actividad se repite cada semana. ¿Eliminar toda la serie?' : '¿Eliminar esta actividad?')) { D.set('events', D.get('events', []).filter(x => x.id !== e.id)); toast('Actividad eliminada'); render(); } };

  function openDay(iso) {
    const dlg = document.createElement('dialog');
    const evs = eventsOn(iso);
    dlg.innerHTML = `<div class="dh"><h3>${fmtDate(iso, { weekday: 'long', day: 'numeric', month: 'long' })}</h3><button class="icon-btn" data-x aria-label="Cerrar">✕</button></div>
      <div class="db">${evs.length ? evs.map((e, i) => `<div class="item"><span class="ev ${e.tipo}" style="font-size:.72rem;padding:3px 9px">${tipoLabel(e.tipo)}</span><div class="grow"><b>${esc(e.titulo)}</b><div class="small muted">${e.hora || 'Todo el día'}${e.repite ? ' · semanal' : ''}${e.nota ? ' · ' + esc(e.nota) : ''}</div></div>
      ${e.ro ? '' : `<button class="btn ghost sm" data-ed="${i}">Editar</button><button class="btn danger sm" data-dl="${i}">Eliminar</button>`}</div>`).join('') : '<p class="empty">Sin actividades este día.</p>'}
      <div class="df"><button class="btn yellow" data-add>＋ Agregar actividad</button></div></div>`;
    document.body.append(dlg);
    const close = () => { dlg.close(); dlg.remove(); };
    $$('[data-x]', dlg).forEach(b => b.onclick = close); dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
    $('[data-add]', dlg).onclick = () => { close(); addEv(iso); };
    $$('[data-ed]', dlg).forEach(b => b.onclick = () => { const e = evs[b.dataset.ed]; close(); editEv(e); });
    $$('[data-dl]', dlg).forEach(b => b.onclick = () => { const e = evs[b.dataset.dl]; close(); delEv(e); });
    dlg.showModal();
  }

  function render() {
    const y = cur.getFullYear(), m = cur.getMonth();
    const ttl = cur.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    $('#calTitle').textContent = ttl[0].toUpperCase() + ttl.slice(1);
    const first = new Date(y, m, 1), lead = (first.getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
    let html = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => `<div class="dow">${d}</div>`).join('');
    for (let i = 0; i < 42; i++) {
      const d = new Date(y, m, 1 - lead + i), iso = toISO(d), out = d.getMonth() !== m;
      if (i >= 35 && out) break;
      const evs = eventsOn(iso);
      html += `<button class="day ${out ? 'out' : ''} ${iso === todayISO() ? 'today' : ''}" data-d="${iso}" aria-label="${fmtDate(iso)}"><span class="n">${d.getDate()}</span><span class="evs">${evs.slice(0, 3).map(e => `<span class="ev ${e.tipo}" title="${esc(e.titulo)}">${esc((e.hora ? e.hora + ' ' : '') + e.titulo)}</span>`).join('')}${evs.length > 3 ? `<span class="small muted">+${evs.length - 3}</span>` : ''}</span></button>`;
    }
    $('#calGrid').innerHTML = html;
    $$('.day').forEach(b => b.onclick = () => openDay(b.dataset.d));
    const up = upcoming(45).slice(0, 8);
    $('#upList').innerHTML = up.length ? up.map(e => `<div class="item"><span class="ev ${e.tipo}" style="font-size:.72rem;padding:3px 9px">${tipoLabel(e.tipo)}</span><div class="grow"><b>${esc(e.titulo)}</b><div class="small muted">${fmtDate(e.fecha, { weekday: 'short', day: 'numeric', month: 'short' })}${e.hora ? ' · ' + e.hora : ''}</div></div></div>`).join('') : '<p class="empty">Nada pendiente en los próximos 45 días.</p>';
  }
  $('#prevM').onclick = () => { cur.setMonth(cur.getMonth() - 1); render(); };
  $('#nextM').onclick = () => { cur.setMonth(cur.getMonth() + 1); render(); };
  $('#todayM').onclick = () => { cur = new Date(); cur.setDate(1); render(); };
  $('#addEv').onclick = () => addEv();
  $('#legend').innerHTML = [...TIPOS.map(t => t[0]), 'festivo', 'hl'].map(t => `<span><span class="ev ${t}" style="display:inline-block;width:12px;height:12px;padding:0;vertical-align:middle;margin-right:4px"></span>${tipoLabel(t)}</span>`).join('');
  render();
};

/* =====================  TAREAS  ===================== */
PAGES.tareas = () => {
  const f = [{ name: 'texto', label: 'Tarea o recordatorio', required: true, maxlength: 120 }, { name: 'fecha', label: 'Fecha límite (opcional)', type: 'date' }];
  const save = id => o => { const l = D.get('tareas', []); if (id) { const i = l.findIndex(x => x.id === id); l[i] = { ...l[i], ...o }; } else l.push({ id: uid(), hecha: false, ...o }); D.set('tareas', l); toast('Guardado'); render(); };
  $('#addT').onclick = () => openForm({ title: 'Nueva tarea', fields: f, onSubmit: save(null) });
  let flt = 'todas';
  $$('[data-f]').forEach(b => b.onclick = () => { flt = b.dataset.f; $$('[data-f]').forEach(x => x.classList.toggle('on', x === b)); render(); });
  function render() {
    const all = D.get('tareas', []);
    const l = all.filter(t => flt === 'todas' || (flt === 'hechas' ? t.hecha : !t.hecha)).sort((a, b) => (a.hecha - b.hecha) || (a.fecha || '9').localeCompare(b.fecha || '9'));
    $('#tCount').textContent = `${all.filter(t => !t.hecha).length} pendientes · ${all.filter(t => t.hecha).length} completadas`;
    $('#tList').innerHTML = l.length ? l.map(t => `<div class="item ${t.hecha ? 'done' : ''}"><input type="checkbox" data-c="${t.id}" ${t.hecha ? 'checked' : ''} aria-label="Completada"><div class="grow"><div class="t">${esc(t.texto)}</div><div class="small ${t.fecha && !t.hecha && t.fecha < todayISO() ? '' : 'muted'}" ${t.fecha && !t.hecha && t.fecha < todayISO() ? 'style="color:var(--bad)"' : ''}>${t.fecha ? (t.fecha < todayISO() && !t.hecha ? 'Vencida · ' : '') + fmtDate(t.fecha) : 'Sin fecha'}</div></div>
      <button class="btn ghost sm" data-e="${t.id}">Editar</button><button class="btn danger sm" data-d="${t.id}">Eliminar</button></div>`).join('') : '<p class="empty">No hay tareas aquí.</p>';
    $$('[data-c]').forEach(c => c.onchange = () => { const a = D.get('tareas', []); a.find(x => x.id === c.dataset.c).hecha = c.checked; D.set('tareas', a); render(); });
    $$('[data-e]').forEach(b => b.onclick = () => { const t = D.get('tareas', []).find(x => x.id === b.dataset.e); openForm({ title: 'Editar tarea', fields: f, values: t, onSubmit: save(t.id) }); });
    $$('[data-d]').forEach(b => b.onclick = () => { if (confirm('¿Eliminar tarea?')) { D.set('tareas', D.get('tareas', []).filter(x => x.id !== b.dataset.d)); render(); } });
  }
  render();
};

/* =====================  NOTAS (simulador + promedio)  ===================== */
PAGES.notas = () => {
  const cortes = $('#cortes');
  const rowC = (n, p, v = '') => `<div class="row r4"><div class="field" style="margin:0"><label>Corte</label><input class="cn" value="${esc(n)}"></div><div class="field" style="margin:0"><label>Porcentaje %</label><input class="cp" type="number" min="1" max="100" value="${p}"></div><div class="field" style="margin:0"><label>Nota (vacío = pendiente)</label><input class="cv" type="number" min="0" max="5" step="0.1" value="${v}"></div><button type="button" class="btn danger sm" data-rm aria-label="Quitar">✕</button></div>`;
  cortes.innerHTML = rowC('Corte 1', 30) + rowC('Corte 2', 30) + rowC('Corte 3', 40);
  cortes.onclick = e => { if (e.target.dataset.rm !== undefined) { e.target.parentElement.remove(); calc(); } };
  cortes.oninput = calc; $('#minNota').oninput = calc;
  $('#addCorte').onclick = () => { cortes.insertAdjacentHTML('beforeend', rowC('Corte ' + ($$('.cp').length + 1), 10)); };
  function calc() {
    const min = Number($('#minNota').value) || 3, rows = $$('.row', cortes).map(r => ({ p: Number($('.cp', r).value) || 0, v: $('.cv', r).value }));
    const tp = rows.reduce((s, r) => s + r.p, 0), box = $('#simRes');
    if (tp !== 100) { box.innerHTML = `Los porcentajes suman <b style="font-size:1rem">${tp}%</b>. Deben sumar 100%.`; return; }
    const hecho = rows.filter(r => r.v !== ''), ac = hecho.reduce((s, r) => s + Number(r.v) * r.p / 100, 0), pend = rows.filter(r => r.v === '').reduce((s, r) => s + r.p, 0);
    if (!pend) { box.innerHTML = `Nota final: <b>${ac.toFixed(2)}</b> — ${ac >= min ? 'Aprobaste' : 'No alcanzaste la nota mínima'}`; return; }
    const need = (min - ac) / (pend / 100);
    box.innerHTML = `Acumulado: <b style="font-size:1.1rem">${ac.toFixed(2)}</b> sobre ${100 - pend}% evaluado.<br>` + (need <= 0 ? 'Ya aseguraste la nota mínima.' : need > 5 ? 'Ni con 5.0 en lo que falta alcanzas la nota mínima.' : `Necesitas promediar <b>${need.toFixed(2)}</b> en el ${pend}% restante para aprobar con ${min.toFixed(1)}.`);
  }
  calc();
  // promedio ponderado
  const mats = $('#mats');
  const rowM = () => `<div class="row r4"><div class="field" style="margin:0"><label>Materia</label><input class="mn"></div><div class="field" style="margin:0"><label>Créditos</label><input class="mc" type="number" min="1" max="12" value="3"></div><div class="field" style="margin:0"><label>Nota final</label><input class="mv" type="number" min="0" max="5" step="0.1"></div><button type="button" class="btn danger sm" data-rm>✕</button></div>`;
  mats.innerHTML = rowM() + rowM() + rowM();
  mats.onclick = e => { if (e.target.dataset.rm !== undefined) { e.target.parentElement.remove(); prom(); } };
  mats.oninput = prom; $('#addMat').onclick = () => mats.insertAdjacentHTML('beforeend', rowM());
  function prom() {
    const r = $$('.row', mats).map(x => ({ c: Number($('.mc', x).value) || 0, v: $('.mv', x).value })).filter(x => x.v !== '' && x.c);
    const cr = r.reduce((s, x) => s + x.c, 0);
    $('#promRes').innerHTML = cr ? `Promedio ponderado: <b>${(r.reduce((s, x) => s + x.c * Number(x.v), 0) / cr).toFixed(2)}</b> (${cr} créditos)` : 'Ingresa las notas para ver tu promedio.';
  }
  prom();
};

/* =====================  ASISTENCIA  ===================== */
PAGES.asistencia = () => {
  const f = [{ name: 'materia', label: 'Materia', required: true, maxlength: 60 },
    { name: 'sesiones', label: 'Sesiones totales del semestre', type: 'number', required: true, min: 1, max: 200 },
    { name: 'permitidas', label: 'Faltas permitidas', type: 'number', required: true, min: 1, max: 100 },
    { name: 'faltas', label: 'Faltas actuales', type: 'number', required: true, min: 0, max: 200 }];
  const save = id => o => { const l = D.get('asist', []); const n = { ...o, sesiones: +o.sesiones, permitidas: +o.permitidas, faltas: +o.faltas }; if (id) { const i = l.findIndex(x => x.id === id); l[i] = { ...l[i], ...n }; } else l.push({ id: uid(), ...n }); D.set('asist', l); render(); toast('Guardado'); };
  $('#addA').onclick = () => openForm({ title: 'Agregar materia', fields: f, values: { faltas: 0 }, onSubmit: save(null) });
  const bump = (id, d) => { const l = D.get('asist', []), a = l.find(x => x.id === id); a.faltas = Math.max(0, a.faltas + d); D.set('asist', l); render(); };
  function render() {
    const l = D.get('asist', []);
    $('#aList').innerHTML = l.length ? l.map(a => {
      const r = a.faltas / a.permitidas, st = r >= 1 ? 'bad' : r >= .75 ? 'warn' : '', rest = a.permitidas - a.faltas;
      return `<div class="card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:start"><h3>${esc(a.materia)}</h3><span class="badge ${r >= 1 ? 'bad' : r >= .75 ? 'y' : 'ok'}">${r >= 1 ? 'Límite alcanzado' : r >= .75 ? '¡Cuidado!' : 'Todo bien'}</span></div>
      <div class="bar-track" style="margin:14px 0 8px"><div class="bar-fill ${st}" style="width:${Math.min(100, r * 100)}%"></div></div>
      <p><b>${a.faltas}</b> faltas · permitidas <b>${a.permitidas}</b> · ${rest >= 0 ? `te quedan <b>${rest}</b>` : `excedes por <b>${-rest}</b>`}</p>
      ${r >= .75 ? `<div class="alert ${r >= 1 ? '' : 'info'}" style="margin:10px 0 0">${r >= 1 ? 'Superaste o llegaste al límite de faltas.' : 'Estás cerca del límite de faltas permitidas.'}</div>` : ''}
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn sm" data-p="${a.id}">＋ Falta</button><button class="btn ghost sm" data-m="${a.id}">− Falta</button><button class="btn ghost sm" data-e="${a.id}">Editar</button><button class="btn danger sm" data-d="${a.id}">Eliminar</button></div></div>`;
    }).join('') : '<p class="empty">Agrega tus materias para llevar el control de faltas.</p>';
    $$('[data-p]').forEach(b => b.onclick = () => bump(b.dataset.p, 1)); $$('[data-m]').forEach(b => b.onclick = () => bump(b.dataset.m, -1));
    $$('[data-e]').forEach(b => b.onclick = () => { const a = D.get('asist', []).find(x => x.id === b.dataset.e); openForm({ title: 'Editar materia', fields: f, values: a, onSubmit: save(a.id) }); });
    $$('[data-d]').forEach(b => b.onclick = () => { if (confirm('¿Eliminar materia?')) { D.set('asist', D.get('asist', []).filter(x => x.id !== b.dataset.d)); render(); } });
  }
  render();
};

/* =====================  PERFIL  ===================== */
PAGES.perfil = () => {
  const draw = () => {
    const u = Auth.user(), tot = HL.total(), meta = HL.meta();
    $('#pFoto').innerHTML = u.foto ? `<img class="avatar" src="${esc(u.foto)}" alt="Foto de perfil de ${esc(u.nombre)}">` : `<div class="creator"><div class="ini" style="width:150px;height:150px;font-size:3rem">${esc(u.nombre.split(' ').slice(0, 2).map(x => x[0]).join(''))}</div></div>`;
    $('#pNombre').textContent = u.nombre; $('#pCorreo').textContent = u.correo;
    $('#pDatos').innerHTML = `<dt>Usuario</dt><dd>${esc(u.usuario)}</dd><dt>Correo</dt><dd>${esc(u.correo)}</dd><dt>Programa</dt><dd>${esc(u.programa || '—')}</dd><dt>Semestre</dt><dd>${u.semestre ? esc(u.semestre) + '.º semestre' : '—'}</dd><dt>Código</dt><dd>${esc(u.codigo || '—')}</dd>`;
    $('#pHL').textContent = fmtH(tot); $('#pFalta').textContent = fmtH(Math.max(0, meta - tot)); $('#pBar').style.width = Math.min(100, tot / meta * 100) + '%';
    $('#pReg').textContent = D.get('reg', []).length;
  };
  // reduce la imagen a 400 px para que quepa en el almacenamiento del navegador
  const resize = file => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = rej;
    fr.onload = () => {
      const img = new Image();
      img.onerror = rej;
      img.onload = () => {
        const s = Math.min(1, 400 / Math.min(img.width, img.height)), w = Math.round(img.width * s), h = Math.round(img.height * s);
        const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h);
        res(c.toDataURL('image/jpeg', 0.85));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
  $('#editP').onclick = () => {
    const u = Auth.user(); let foto = u.foto || '';
    const prev = () => foto ? `<img class="avatar" src="${esc(foto)}" alt="Vista previa">` : `<div class="ini96">${esc(initials(u.nombre))}</div>`;
    const dlg = openForm({
      title: 'Editar perfil', values: u,
      extra: `<div class="photo-edit"><div id="fotoPrev">${prev()}</div><div><label for="fotoIn">Foto de perfil</label><input id="fotoIn" type="file" accept="image/*"><button type="button" class="btn ghost sm hidden" id="fotoDel" style="margin-top:8px">Quitar foto</button></div></div>`,
      fields: [
        { name: 'nombre', label: 'Nombre completo', required: true, maxlength: 80 },
        { name: 'programa', label: 'Programa académico', required: true },
        { name: 'semestre', label: 'Semestre', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] },
        { name: 'codigo', label: 'Código estudiantil', maxlength: 15 }],
      onSubmit: o => { Auth.save({ ...u, ...o, foto }); toast('Perfil actualizado'); location.reload(); }
    });
    const sync = () => { $('#fotoPrev', dlg).innerHTML = prev(); $('#fotoDel', dlg).classList.toggle('hidden', !foto); };
    sync();
    $('#fotoIn', dlg).onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      if (!f.type.startsWith('image/')) { toast('Elige un archivo de imagen', true); return; }
      try { foto = await resize(f); sync(); } catch { toast('No se pudo leer la imagen', true); }
    };
    $('#fotoDel', dlg).onclick = () => { foto = ''; $('#fotoIn', dlg).value = ''; sync(); };
  };
  draw();
};

/* =====================  AYUDA  ===================== */
PAGES.ayuda = () => {
  const f = $('#contactForm');
  f.onsubmit = e => {
    e.preventDefault();
    const n = f.asunto, m = f.mensaje; let ok = true;
    if (n.value.trim().length < 4) { setErr(n, 'Escribe un asunto (mín. 4 caracteres).'); ok = false; } else setErr(n);
    if (m.value.trim().length < 10) { setErr(m, 'Cuéntanos un poco más (mín. 10 caracteres).'); ok = false; } else setErr(m);
    if (!ok) return;
    const l = store.get('contacto', []); l.push({ usuario: Auth.current(), tipo: f.tipo.value, asunto: n.value.trim(), mensaje: m.value.trim(), fecha: new Date().toISOString() });
    store.set('contacto', l); f.reset(); toast('¡Gracias! Tu mensaje fue enviado.');
  };
};
