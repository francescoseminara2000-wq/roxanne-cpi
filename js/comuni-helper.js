
function normalizeComuneName(str) {
  if (!str) return '';
  return str.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
}

function formatComuneObj(c) {
  return {
    nome: c.n,
    provincia: c.p,
    regione: c.r,
    cap: c.c,
    lat: c.lt,
    lon: c.ln
  };
}

function findComune(query) {
  if (!query) return null;
  const qClean = normalizeComuneName(query);
  if (!qClean) return null;

  // 1. Ricerca esatta per nome
  let match = COMUNI_ITALIA_DB.find(c => normalizeComuneName(c.n) === qClean);
  if (match) return formatComuneObj(match);

  // 2. Ricerca per CAP
  if (/^\d{5}$/.test(query.trim())) {
    match = COMUNI_ITALIA_DB.find(c => c.c === query.trim());
    if (match) return formatComuneObj(match);
  }

  // 3. Ricerca per prefisso
  match = COMUNI_ITALIA_DB.find(c => normalizeComuneName(c.n).startsWith(qClean));
  if (match) return formatComuneObj(match);

  // 4. Ricerca contenimento
  match = COMUNI_ITALIA_DB.find(c => normalizeComuneName(c.n).includes(qClean));
  if (match) return formatComuneObj(match);

  return null;
}

function searchComuni(query, limit = 20) {
  if (!query || query.trim().length < 2) return [];
  const qClean = normalizeComuneName(query);
  const results = [];
  
  for (let i = 0; i < COMUNI_ITALIA_DB.length; i++) {
    const c = COMUNI_ITALIA_DB[i];
    const norm = normalizeComuneName(c.n);
    if (norm.startsWith(qClean) || norm.includes(qClean) || c.c.startsWith(query.trim())) {
      results.push(formatComuneObj(c));
      if (results.length >= limit) break;
    }
  }
  return results;
}

function calcolaDistanzaKm(comuneA, comuneB) {
  if (!comuneA || !comuneB) return null;

  const cA = typeof comuneA === 'string' ? findComune(comuneA) : comuneA;
  const cB = typeof comuneB === 'string' ? findComune(comuneB) : comuneB;

  if (!cA || !cB) return null;
  if (cA.nome && cB.nome && cA.nome.toLowerCase() === cB.nome.toLowerCase()) return 0;

  const R = 6371; // Raggio medio terra km
  const dLat = (cB.lat - cA.lat) * Math.PI / 180;
  const dLon = (cB.lon - cA.lon) * Math.PI / 180;
  const lat1 = cA.lat * Math.PI / 180;
  const lat2 = cB.lat * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Popola tutte le tendine (SELECT e DATALIST) del gestionale con TUTTI i 7904 comuni
function populateAllComuniElements() {
  console.log('Avvio popolamento comuni in tutta la UI Roxanne...');
  if (!Array.isArray(COMUNI_ITALIA_DB) || COMUNI_ITALIA_DB.length === 0) return;
  
  // 1. Popola il datalist globale #dl-comuni-italia
  const dl = document.getElementById('dl-comuni-italia');
  if (dl) {
    const frag = document.createDocumentFragment();
    dl.innerHTML = '';
    for (let i = 0; i < COMUNI_ITALIA_DB.length; i++) {
      const c = COMUNI_ITALIA_DB[i];
      const opt = document.createElement('option');
      opt.value = `${c.n} (${c.p})`;
      opt.setAttribute('data-cap', c.c);
      opt.setAttribute('data-prov', c.p);
      opt.setAttribute('data-nome', c.n);
      frag.appendChild(opt);
    }
    dl.appendChild(frag);
    console.log(`Datalist #dl-comuni-italia popolato con ${COMUNI_ITALIA_DB.length} comuni.`);
  }

  // 2. Popola le tendine <select> di selezione comune
  const selectIds = ['af-comune', 'ef-residenza', 'ef-domicilio-comune'];
  selectIds.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    
    const currentVal = sel.value;
    const isSearchFilter = (id === 'af-comune');
    
    const frag = document.createDocumentFragment();
    
    // Prima opzione di default
    const firstOpt = document.createElement('option');
    firstOpt.value = '';
    firstOpt.textContent = isSearchFilter ? 'Tutti i Comuni' : 'Seleziona Comune...';
    frag.appendChild(firstOpt);

    for (let i = 0; i < COMUNI_ITALIA_DB.length; i++) {
      const c = COMUNI_ITALIA_DB[i];
      const opt = document.createElement('option');
      opt.value = c.n;
      opt.textContent = `${c.n} (${c.p})`;
      opt.setAttribute('data-prov', c.p);
      opt.setAttribute('data-cap', c.c);
      if (currentVal && c.n.toLowerCase() === currentVal.toLowerCase()) {
        opt.selected = true;
      }
      frag.appendChild(opt);
    }

    sel.innerHTML = '';
    sel.appendChild(frag);
    if (currentVal) sel.value = currentVal;
    
    // Se c'è un wrapper custom-select già creato, aggiornalo
    if (typeof window.initCustomSearchableSelects === 'function') {
      const nextSibling = sel.nextElementSibling;
      if (nextSibling && nextSibling.classList && nextSibling.classList.contains('custom-select-wrapper')) {
        delete sel.dataset.customized;
        nextSibling.remove();
        window.initCustomSearchableSelects();
      }
    }
  });

  // 3. Collega autocompletamento datalist anche all'input del wizard anagrafica
  const wComuneRes = document.getElementById('w-comune-res');
  if (wComuneRes) {
    wComuneRes.setAttribute('list', 'dl-comuni-italia');
    wComuneRes.setAttribute('autocomplete', 'off');
    wComuneRes.addEventListener('change', () => {
      const parsed = findComune(wComuneRes.value);
      if (parsed) {
        const provInput = document.getElementById('w-prov-res');
        if (provInput) provInput.value = parsed.provincia;
      }
    });
  }

  // 4. Collega autocompletamento al filtro sede lavoro nel Matcher
  const mComune = document.getElementById('m-comune');
  if (mComune) {
    mComune.setAttribute('list', 'dl-comuni-italia');
    mComune.setAttribute('autocomplete', 'off');
  }

  console.log('Popolamento tendine comuni completato con successo in tutta l\'interfaccia.');
}

if (typeof window !== 'undefined') {
  window.COMUNI_ITALIA_DB = COMUNI_ITALIA_DB;
  window.findComune = findComune;
  window.searchComuni = searchComuni;
  window.calcolaDistanzaKm = calcolaDistanzaKm;
  window.populateAllComuniElements = populateAllComuniElements;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateAllComuniElements);
  } else {
    populateAllComuniElements();
  }
}
