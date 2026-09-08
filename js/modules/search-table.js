/**
 * Roxanne CPI Light - Search & Results Module (Liquid Glass UI Potenziata)
 * Tabella avanzata, visualizzazione card a cristallo e lista compatta con indicatori chiari
 */

function renderMainSearchTable() {
  const persone = window.store.getPersone();
  
  const filterNome = (document.getElementById("af-nome").value || "").toLowerCase().trim();
  const filterCf = (document.getElementById("af-cf").value || "").toLowerCase().trim();
  const filterNumIscriz = (document.getElementById("af-num-iscriz").value || "").trim();
  const filterComune = (document.getElementById("af-comune").value || "").toLowerCase().trim();
  const filterCat = document.getElementById("af-categoria").value;
  const filterStato = document.getElementById("af-stato").value;
  const filterMinIc = parseInt(document.getElementById("af-min-ic").value) || 0;
  const filterNoEretta = document.getElementById("af-noeretta").checked;

  const filtered = persone.filter(p => {
    const pNome = (p.nome || "") + " " + (p.cognome || "");
    const matchNome = !filterNome || pNome.toLowerCase().includes(filterNome);
    const matchCf = !filterCf || (p.codiceFiscale || "").toLowerCase().includes(filterCf);
    const matchNum = !filterNumIscriz || String(p.numeroIscrizione || "").includes(filterNumIscriz);
    const matchComune = !filterComune || ((p.comuneResidenza || "") + " " + (p.domicilioComune || "")).toLowerCase().includes(filterComune);
    const matchCat = filterCat === "ALL" || p.categoria === filterCat;
    const matchStato = filterStato === "ALL" || (filterStato === "Occupato" ? (p.stato || "").includes("Occupato") : p.stato === filterStato);
    const matchIc = filterMinIc === 0 || (p.icPercentuale || 0) >= filterMinIc;
    const matchEretta = !filterNoEretta || p.stazioneEretta === false;

    return matchNome && matchCf && matchNum && matchComune && matchCat && matchStato && matchIc && matchEretta;
  });

  // Badge contatore nel titolo
  const badgeCount = document.getElementById("badge-search-count");
  if (badgeCount) {
    badgeCount.innerHTML = `<i class="fa-solid fa-users mr-1.5 text-blue-600"></i><strong>${filtered.length}</strong> Iscritti Filtrati`;
  }

  // --- 1. RENDER VISTA TABELLA (LIQUID GLASS DATA TABLE) ---
  const tbody = document.getElementById("tbody-main-search");
  if (tbody) {
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-16">
            <div class="max-w-xs mx-auto space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl mx-auto shadow-inner">
                <i class="fa-solid fa-user-slash"></i>
              </div>
              <div class="text-slate-700 font-bold text-sm font-heading">Nessun iscritto trovato</div>
              <p class="text-xs text-slate-400">Modifica o azzera i filtri di ricerca per visualizzare tutti i cittadini presenti.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      tbody.innerHTML = filtered.map(p => {
        const catBadge = p.categoria === "C.O." 
          ? "bg-blue-50 text-blue-700 border-blue-200" 
          : p.categoria === "Art. 18" 
          ? "bg-amber-50 text-amber-800 border-amber-200" 
          : "bg-emerald-50 text-emerald-700 border-emerald-200";

        const statoClass = (p.stato || '').toLowerCase().includes("disoccupato") 
          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
          : (p.stato || '').toLowerCase().includes("occupato") 
          ? "bg-sky-50 text-sky-700 border-sky-200" 
          : "bg-indigo-50 text-indigo-700 border-indigo-200";

        const icPerc = p.icPercentuale || 0;
        const icClass = icPerc >= 67 
          ? "bg-rose-50 text-rose-700 border-rose-200 font-extrabold" 
          : "bg-slate-100 text-slate-700 border-slate-200";

        // Iniziali avatar
        const initials = ((p.nome ? p.nome[0] : "") + (p.cognome ? p.cognome[0] : "")).toUpperCase() || "LC";

        return `
          <tr class="hover:bg-blue-50/40 transition-colors group cursor-pointer border-b border-slate-100">
            <!-- N. Iscrizione e Codice -->
            <td class="px-5 py-3.5 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60 flex items-center justify-center font-bold text-xs text-blue-700 font-heading shrink-0 shadow-2xs">
                  ${initials}
                </div>
                <div>
                  <span class="font-mono font-bold text-slate-900 text-xs">#${p.numeroIscrizione || p.id}</span>
                  <div class="text-[10px] text-slate-400 font-mono tracking-tight">${p.codice || `PERS-${p.id}`}</div>
                </div>
              </div>
            </td>

            <!-- Cittadino & CF -->
            <td class="px-5 py-3.5">
              <div class="font-bold text-slate-900 font-heading text-sm group-hover:text-blue-600 transition flex items-center gap-1.5">
                ${escapeHtml(p.nome)} ${escapeHtml(p.cognome || '')}
              </div>
              <div class="text-[11px] font-mono font-semibold text-slate-500 tracking-wider">${p.codiceFiscale || 'C.F. N.D.'}</div>
            </td>

            <!-- Categoria L.68 -->
            <td class="px-5 py-3.5 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border font-heading ${catBadge}">
                ${escapeHtml(p.categoria || 'C.O.')}
              </span>
            </td>

            <!-- % Invalidità -->
            <td class="px-5 py-3.5 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono border ${icClass}">
                ${icPerc > 0 ? `${icPerc}% IC` : 'Art. 18'}
              </span>
            </td>

            <!-- Comune -->
            <td class="px-5 py-3.5 whitespace-nowrap">
              <div class="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                <i class="fa-solid fa-location-dot text-slate-400 text-[11px]"></i>
                <span>${escapeHtml(p.comuneResidenza || 'Lecco')}</span>
                <span class="text-[10px] text-slate-400 font-semibold">(${p.residenzaProvincia || 'LC'})</span>
              </div>
            </td>

            <!-- Stato & Operatore -->
            <td class="px-5 py-3.5 whitespace-nowrap">
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statoClass}">
                ${escapeHtml(p.stato || 'Disoccupato')}
              </span>
              <div class="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <i class="fa-solid fa-user-shield text-[9px] text-slate-400"></i>
                <span>${escapeHtml(p.operatore || 'CPI Lecco')}</span>
              </div>
            </td>

            <!-- Azione -->
            <td class="px-5 py-3.5 text-right whitespace-nowrap">
              <button data-id="${p.id}" class="btn-open-citizen-hub cursor-pointer inline-flex items-center gap-2 bg-white hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-blue-200 hover:border-transparent shadow-2xs hover:shadow-md hover:shadow-blue-500/20 transition font-heading">
                <span>Apri Scheda 360°</span>
                <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  // --- 2. RENDER VISTA SCHEDE / CARDS (LIQUID GLASS CARDS) ---
  const cardsContainer = document.getElementById("view-results-cards");
  if (cardsContainer) {
    if (filtered.length === 0) {
      cardsContainer.innerHTML = `<p class="text-xs text-slate-400 py-12 col-span-3 text-center italic">Nessun iscritto corrisponde ai criteri.</p>`;
    } else {
      cardsContainer.innerHTML = filtered.map(p => {
        const catBadge = p.categoria === "C.O." 
          ? "bg-blue-50 text-blue-700 border-blue-200" 
          : p.categoria === "Art. 18" 
          ? "bg-amber-50 text-amber-800 border-amber-200" 
          : "bg-emerald-50 text-emerald-700 border-emerald-200";

        const icPerc = p.icPercentuale || 0;
        const initials = ((p.nome ? p.nome[0] : "") + (p.cognome ? p.cognome[0] : "")).toUpperCase() || "LC";

        return `
          <div class="card-white p-5 space-y-4 flex flex-col justify-between hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/8 transition-all group relative overflow-hidden">
            <div class="space-y-3">
              <!-- Top bar card -->
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center font-heading text-sm shadow-md shadow-blue-500/20">
                    ${initials}
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-900 text-sm font-heading group-hover:text-blue-600 transition">
                      ${escapeHtml(p.nome)} ${escapeHtml(p.cognome || '')}
                    </h3>
                    <p class="text-[11px] font-mono font-semibold text-slate-500 tracking-wider">${p.codiceFiscale || 'C.F. N.D.'}</p>
                  </div>
                </div>

                <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border font-heading ${catBadge}">
                  ${escapeHtml(p.categoria || 'C.O.')}
                </span>
              </div>

              <!-- Badges anagrafici & sanitari -->
              <div class="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-slate-100">
                <div class="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span class="text-slate-400 text-[9px] uppercase font-bold block">N. Iscrizione</span>
                  <span class="font-mono font-bold text-slate-800 text-xs">#${p.numeroIscrizione || p.id}</span>
                </div>

                <div class="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span class="text-slate-400 text-[9px] uppercase font-bold block">Invalidità Civile</span>
                  <span class="font-bold text-xs ${icPerc >= 67 ? 'text-rose-600' : 'text-slate-800'}">
                    ${icPerc > 0 ? `${icPerc}% IC` : 'Art. 18'}
                  </span>
                </div>

                <div class="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span class="text-slate-400 text-[9px] uppercase font-bold block">Comune</span>
                  <span class="font-semibold text-slate-800 text-xs truncate block">${escapeHtml(p.comuneResidenza || 'Lecco')}</span>
                </div>

                <div class="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span class="text-slate-400 text-[9px] uppercase font-bold block">Stato DID</span>
                  <span class="font-semibold text-emerald-700 text-xs truncate block">${escapeHtml(p.stato || 'Disoccupato')}</span>
                </div>
              </div>

              <!-- Info mansione / diagnosi anteprima -->
              ${p.diagnosi ? `
                <div class="text-[11px] text-slate-500 bg-blue-50/30 p-2.5 rounded-lg border border-blue-100/60 line-clamp-2 leading-relaxed">
                  <strong class="text-blue-900 font-semibold">Diagnosi:</strong> ${escapeHtml(p.diagnosi)}
                </div>
              ` : ''}
            </div>

            <!-- Footer card con bottone di apertura -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[11px] text-slate-400 flex items-center gap-1">
                <i class="fa-solid fa-user-shield text-[10px]"></i> ${escapeHtml(p.operatore || 'CPI Lecco')}
              </span>

              <button data-id="${p.id}" class="btn-open-citizen-hub cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition font-heading shadow-xs hover:shadow-md hover:shadow-blue-500/25 flex items-center gap-1.5">
                <span>Scheda 360°</span>
                <i class="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // --- 3. RENDER VISTA ELENCO COMPATTO ---
  const compactContainer = document.getElementById("view-results-compact");
  if (compactContainer) {
    if (filtered.length === 0) {
      compactContainer.innerHTML = `<p class="text-xs text-slate-400 py-10 text-center italic">Nessun iscritto corrisponde ai criteri.</p>`;
    } else {
      compactContainer.innerHTML = filtered.map(p => {
        const catBadge = p.categoria === "C.O." 
          ? "bg-blue-50 text-blue-700" 
          : p.categoria === "Art. 18" 
          ? "bg-amber-50 text-amber-800" 
          : "bg-emerald-50 text-emerald-700";

        const icPerc = p.icPercentuale || 0;

        return `
          <div class="p-3.5 hover:bg-blue-50/40 transition flex items-center justify-between border-b border-slate-100 group">
            <div class="flex items-center space-x-3">
              <span class="font-mono font-bold text-xs text-blue-700 w-16">#${p.numeroIscrizione || p.id}</span>
              <div>
                <span class="font-bold text-slate-900 text-xs font-heading mr-2 group-hover:text-blue-600 transition">
                  ${escapeHtml(p.nome)} ${escapeHtml(p.cognome || '')}
                </span>
                <span class="font-mono text-[11px] text-slate-400 mr-2">${p.codiceFiscale || 'C.F. N.D.'}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${catBadge}">${escapeHtml(p.categoria || 'C.O.')}</span>
              </div>
            </div>

            <div class="flex items-center space-x-6 text-xs">
              <span class="text-slate-600 font-medium">
                <i class="fa-solid fa-location-dot text-slate-400 mr-1"></i> ${escapeHtml(p.comuneResidenza || 'Lecco')}
              </span>
              <span class="font-bold ${icPerc >= 67 ? 'text-rose-600' : 'text-slate-700'} font-mono">
                ${icPerc > 0 ? `${icPerc}% IC` : 'Art. 18'}
              </span>
              <button data-id="${p.id}" class="btn-open-citizen-hub cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-bold hover:underline font-heading flex items-center gap-1">
                <span>Apri</span>
                <i class="fa-solid fa-chevron-right text-[9px]"></i>
              </button>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // Listener aperture Scheda 360°
  document.querySelectorAll(".btn-open-citizen-hub").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      window.store.setSelectedPersonaId(id);
      if (typeof window.renderCitizenHub === "function") window.renderCitizenHub();

      // Switch view to Hub
      const btnHub = document.getElementById("nav-mode-hub");
      if (btnHub) btnHub.click();
    });
  });
}

window.renderMainSearchTable = renderMainSearchTable;
