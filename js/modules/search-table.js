/**
 * Roxanne CPI Light - Search & Results Module
 * Tabella filtri multi-campo, visualizzazione cards/compact/tabella
 */

  // --- MAIN ADVANCED SEARCH TABLE RENDERER (MULTI-FIELD) ---
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
      const matchNome = !filterNome || p.nome.toLowerCase().includes(filterNome);
      const matchCf = !filterCf || p.codiceFiscale.toLowerCase().includes(filterCf);
      const matchNum = !filterNumIscriz || String(p.numeroIscrizione).includes(filterNumIscriz);
      const matchComune = !filterComune || (p.comuneResidenza && p.comuneResidenza.toLowerCase().includes(filterComune));
      const matchCat = filterCat === "ALL" || p.categoria === filterCat;
      const matchStato = filterStato === "ALL" || (filterStato === "Occupato" ? p.stato.includes("Occupato") : p.stato === filterStato);
      const matchIc = filterMinIc === 0 || p.icPercentuale >= filterMinIc;
      const matchEretta = !filterNoEretta || p.stazioneEretta === false;

      return matchNome && matchCf && matchNum && matchComune && matchCat && matchStato && matchIc && matchEretta;
    });

    document.getElementById("badge-search-count").textContent = `${filtered.length} Iscritti nel Database`;

    // 1. RENDER VISTA TABELLA
    const tbody = document.getElementById("tbody-main-search");
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-slate-400 italic">Nessun iscritto corrisponde ai criteri.</td></tr>`;
    } else {
      tbody.innerHTML = filtered.map(p => {
        const badgeClass = p.categoria === "C.O." ? "badge-co" : p.categoria === "Art. 18" ? "badge-art18" : "badge-fd";
        return `
          <tr class="hover:bg-slate-50 transition">
            <td class="px-5 py-4 font-bold text-slate-800">
              #${p.numeroIscrizione}
              <div class="text-[10px] text-slate-400 font-normal">${p.codice}</div>
            </td>
            <td class="px-5 py-4">
              <div class="font-bold text-slate-900 font-heading text-sm">${escapeHtml(p.nome)}</div>
              <div class="text-[11px] font-bold text-blue-700">${p.codiceFiscale}</div>
            </td>
            <td class="px-5 py-4">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}">${p.categoria}</span>
            </td>
            <td class="px-5 py-4 font-bold ${p.icPercentuale >= 67 ? 'text-rose-600' : 'text-slate-800'}">
              ${p.icPercentuale > 0 ? `${p.icPercentuale}% IC` : 'Art.18'}
            </td>
            <td class="px-5 py-4 text-slate-700 font-medium">${escapeHtml(p.comuneResidenza)}</td>
            <td class="px-5 py-4 text-slate-600">
              <div class="font-semibold text-slate-800">${p.stato || 'Disoccupato'}</div>
              <div class="text-[11px] text-slate-400">${escapeHtml(p.operatore || 'CPI Lecco')}</div>
            </td>
            <td class="px-5 py-4 text-right">
              <button data-id="${p.id}" class="btn-open-citizen-hub cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs font-heading">
                Apri Scheda 360° <i class="fa-solid fa-arrow-right ml-1 text-[10px]"></i>
              </button>
            </td>
          </tr>
        `;
      }).join("");
    }

    // 2. RENDER VISTA SCHEDE / CARDS
    const cardsContainer = document.getElementById("view-results-cards");
    if (filtered.length === 0) {
      cardsContainer.innerHTML = `<p class="text-xs text-slate-400 py-10 col-span-3 text-center italic">Nessun iscritto corrisponde ai criteri.</p>`;
    } else {
      cardsContainer.innerHTML = filtered.map(p => {
        const badgeClass = p.categoria === "C.O." ? "badge-co" : p.categoria === "Art. 18" ? "badge-art18" : "badge-fd";
        return `
          <div class="card-white p-5 space-y-3 card-white-interactive flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-bold text-slate-900 text-base font-heading">${escapeHtml(p.nome)}</h3>
                  <p class="text-xs font-mono text-blue-700 font-semibold">${p.codiceFiscale}</p>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}">${p.categoria}</span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                <div><span class="text-slate-400 text-[10px] block uppercase font-semibold">N. Iscrizione</span><strong class="text-slate-800 font-mono">#${p.numeroIscrizione}</strong></div>
                <div><span class="text-slate-400 text-[10px] block uppercase font-semibold">Invalidità Civile</span><strong class="${p.icPercentuale >= 67 ? 'text-rose-600 font-bold' : 'text-slate-800'}">${p.icPercentuale > 0 ? `${p.icPercentuale}%` : 'Art.18'}</strong></div>
                <div><span class="text-slate-400 text-[10px] block uppercase font-semibold">Residenza</span><strong class="text-slate-800">${escapeHtml(p.comuneResidenza)}</strong></div>
                <div><span class="text-slate-400 text-[10px] block uppercase font-semibold">Stato Occupaz.</span><strong class="text-emerald-700">${escapeHtml(p.stato || 'Disoccupato')}</strong></div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span class="text-[11px] text-slate-400"><i class="fa-solid fa-user-gear mr-1"></i> ${escapeHtml(p.operatore || 'CPI Lecco')}</span>
              <button data-id="${p.id}" class="btn-open-citizen-hub cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition font-heading">
                Apri Scheda 360°
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    // 3. RENDER VISTA ELENCO COMPATTO
    const compactContainer = document.getElementById("view-results-compact");
    if (filtered.length === 0) {
      compactContainer.innerHTML = `<p class="text-xs text-slate-400 py-10 text-center italic">Nessun iscritto corrisponde ai criteri.</p>`;
    } else {
      compactContainer.innerHTML = filtered.map(p => {
        const badgeClass = p.categoria === "C.O." ? "badge-co" : p.categoria === "Art. 18" ? "badge-art18" : "badge-fd";
        return `
          <div class="p-3.5 hover:bg-slate-50 transition flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <span class="font-mono font-bold text-xs text-blue-600 w-16">#${p.numeroIscrizione}</span>
              <div>
                <span class="font-bold text-slate-900 text-xs font-heading mr-2">${escapeHtml(p.nome)}</span>
                <span class="font-mono text-[11px] text-slate-400 mr-3">${p.codiceFiscale}</span>
                <span class="px-2 py-0.2 rounded text-[10px] font-bold uppercase ${badgeClass}">${p.categoria}</span>
              </div>
            </div>

            <div class="flex items-center space-x-6 text-xs">
              <span class="text-slate-600"><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i> ${escapeHtml(p.comuneResidenza)}</span>
              <span class="font-bold ${p.icPercentuale >= 67 ? 'text-rose-600' : 'text-slate-700'}">${p.icPercentuale > 0 ? `${p.icPercentuale}% IC` : 'Art.18'}</span>
              <button data-id="${p.id}" class="btn-open-citizen-hub cursor-pointer text-xs text-blue-600 font-semibold hover:underline font-heading">
                Apri Scheda <i class="fa-solid fa-chevron-right text-[10px] ml-0.5"></i>
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    // Attach click listeners to "Apri Scheda 360°"
    document.querySelectorAll(".btn-open-citizen-hub").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        window.store.setSelectedPersonaId(id);
        renderCitizenHub();

        // Switch view to Hub
        document.getElementById("nav-mode-hub").click();
      });
    });
  }

window.renderMainSearchTable = renderMainSearchTable;
