/**
 * Roxanne CPI Light - Matcher View Module (Potenziata Liquid Glass)
 * Presentazione interattiva della graduatoria di compatibilità domanda/offerta
 */

function runMatcher() {
  const mansioneInput = document.getElementById("m-mansione");
  const categoriaInput = document.getElementById("m-categoria");
  const minIcInput = document.getElementById("m-min-ic");
  const titoloStudioInput = document.getElementById("m-titolo-studio");
  const noErettaInput = document.getElementById("m-noeretta");
  const noCarichiInput = document.getElementById("m-nocarichi");
  const noContattoInput = document.getElementById("m-nocontatto");
  const richiedePcInput = document.getElementById("m-richiedepc");
  const richiedeIngleseInput = document.getElementById("m-richiede-inglese");
  const automunitoInput = document.getElementById("m-automunito");
  const smartWorkingInput = document.getElementById("m-smartworking");
  const comuneInput = document.getElementById("m-comune");
  const minScoreFilter = document.getElementById("m-min-score-filter");

  const reqs = {
    mansione: mansioneInput ? mansioneInput.value : "ALL",
    categoria: categoriaInput ? categoriaInput.value : "ALL",
    minIC: minIcInput ? parseInt(minIcInput.value) || 0 : 0,
    titoloStudio: titoloStudioInput ? titoloStudioInput.value : "ALL",
    noStazioneEretta: noErettaInput ? noErettaInput.checked : false,
    noMovimentazioneCarichi: noCarichiInput ? noCarichiInput.checked : false,
    noContattoPubblico: noContattoInput ? noContattoInput.checked : false,
    richiedePc: richiedePcInput ? richiedePcInput.checked : false,
    richiedeInglese: richiedeIngleseInput ? richiedeIngleseInput.checked : false,
    automunito: automunitoInput ? automunitoInput.checked : false,
    smartWorking: smartWorkingInput ? smartWorkingInput.checked : false,
    comune: comuneInput ? comuneInput.value : ""
  };

  const minScore = minScoreFilter ? parseInt(minScoreFilter.value) || 0 : 0;
  const persone = window.store.getPersone();
  const container = document.getElementById("matcher-results-container");
  const countBadge = document.getElementById("matcher-count-badge");
  if (!container) return;

  const evaluated = persone.map(p => {
    const res = window.MatcherEngine 
      ? window.MatcherEngine.calculateScore(p, reqs) 
      : { score: 50, matchLevel: 'MEDIUM', matchReasons: [], adaptations: [], incompatibilities: [] };
    return { 
      persona: p, 
      score: res.score, 
      matchLevel: res.matchLevel,
      matchReasons: res.matchReasons, 
      adaptations: res.adaptations, 
      incompatibilities: res.incompatibilities 
    };
  });

  // Filtra per soglia minima selezionata e ordina decrescente
  const filtered = evaluated
    .filter(item => item.score >= minScore)
    .sort((a, b) => b.score - a.score);

  if (countBadge) {
    countBadge.textContent = filtered.length;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="card-white p-12 text-center space-y-4 border border-dashed border-slate-300">
        <div class="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-2xl mx-auto shadow-inner">
          <i class="fa-solid fa-filter-circle-xmark"></i>
        </div>
        <div class="space-y-1">
          <h3 class="font-bold text-slate-800 text-base font-heading">Nessun candidato sopra la soglia del ${minScore}%</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto">
            Allenta alcuni requisiti aziendali (es. abbassa la % minima di invalidità o azzera il filtro territoriale) per visualizzare i profili idonei con adattamenti.
          </p>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(res => {
    const p = res.persona;
    const isHigh = res.score >= 80;
    const isMedium = res.score >= 60 && res.score < 80;

    // Palette liquid glass in base al livello di match
    const scoreColorClass = isHigh
      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25"
      : isMedium
      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25"
      : "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-rose-500/25";

    const badgeLabel = isHigh ? "ALTA COMPATIBILITÀ" : isMedium ? "CON ADATTAMENTI" : "COMPATIBILITÀ BASSA";
    const initials = ((p.nome ? p.nome[0] : "") + (p.cognome ? p.cognome[0] : "")).toUpperCase() || "LC";

    return `
      <div class="card-white p-5 space-y-4 transition-all hover:shadow-xl hover:shadow-blue-500/8 border border-slate-200/90 relative overflow-hidden group">
        <!-- Top bar candidato & Score Liquid Glass -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div class="flex items-center space-x-3.5">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center font-heading shadow-md shadow-blue-500/20 shrink-0">
              ${initials}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-slate-900 text-base font-heading group-hover:text-blue-600 transition">
                  ${escapeHtml(p.nome)} ${escapeHtml(p.cognome || '')}
                </h3>
                <span class="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                  #${p.numeroIscrizione || p.id}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span>Cat: <strong class="text-slate-800">${escapeHtml(p.categoria || 'C.O.')}</strong></span>
                <span>•</span>
                <span>% Invalidità: <strong class="${(p.icPercentuale || 0) >= 67 ? 'text-rose-600' : 'text-slate-800'} font-bold">${p.icPercentuale || 0}% IC</strong></span>
                <span>•</span>
                <span>Comune: <strong class="text-slate-800">${escapeHtml(p.comuneResidenza || 'Lecco')}</strong></span>
              </div>
            </div>
          </div>

          <!-- Score Badge -->
          <div class="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
            <div class="px-3.5 py-1.5 rounded-xl font-black text-xs tracking-wider font-heading shadow-md flex items-center gap-1.5 ${scoreColorClass}">
              <i class="fa-solid fa-circle-check text-xs"></i>
              <span>${res.score}% MATCH</span>
            </div>
            <span class="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-1">${badgeLabel}</span>
          </div>
        </div>

        <!-- Analisi di Compatibilità (Punti di Forza / Adattamenti / Incompatibilità) -->
        <div class="space-y-2.5 text-xs">
          <!-- Punti di Forza (Match Positivi) -->
          ${res.matchReasons.length > 0 ? `
            <div class="space-y-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <i class="fa-solid fa-thumbs-up"></i> Punti di Forza & Requisiti Soddisfatti
              </span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                ${res.matchReasons.map(r => `
                  <div class="flex items-start gap-1.5 text-emerald-800 bg-emerald-50/70 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 leading-tight">
                    <i class="fa-solid fa-check text-emerald-600 text-[10px] mt-0.5 shrink-0"></i>
                    <span>${r}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ''}

          <!-- Adattamenti e Supporti Raccomandati -->
          ${res.adaptations.length > 0 ? `
            <div class="space-y-1 pt-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                <i class="fa-solid fa-triangle-exclamation"></i> Adattamenti e Accorgimenti Consigliati
              </span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                ${res.adaptations.map(a => `
                  <div class="flex items-start gap-1.5 text-amber-900 bg-amber-50/70 px-2.5 py-1.5 rounded-lg border border-amber-200/60 leading-tight">
                    <i class="fa-solid fa-circle-info text-amber-600 text-[10px] mt-0.5 shrink-0"></i>
                    <span>${a}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ''}

          <!-- Incompatibilità Rilevate -->
          ${res.incompatibilities.length > 0 ? `
            <div class="space-y-1 pt-1">
              <span class="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                <i class="fa-solid fa-circle-xmark"></i> Incompatibilità Rilevate
              </span>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                ${res.incompatibilities.map(inc => `
                  <div class="flex items-start gap-1.5 text-rose-800 bg-rose-50/70 px-2.5 py-1.5 rounded-lg border border-rose-200/60 leading-tight">
                    <i class="fa-solid fa-xmark text-rose-500 text-[10px] mt-0.5 shrink-0"></i>
                    <span>${inc}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Footer Card con Pulsanti Azione Diretta -->
        <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div class="text-[11px] text-slate-500 flex items-center gap-2">
            <span><i class="fa-solid fa-briefcase text-slate-400 mr-1"></i>DID: <strong class="text-slate-700">${escapeHtml(p.stato || 'Disoccupato')}</strong></span>
            <span>•</span>
            <span><i class="fa-solid fa-graduation-cap text-slate-400 mr-1"></i>${escapeHtml(p.titoloStudioLast || 'Licenza Media')}</span>
          </div>

          <div class="flex items-center space-x-2">
            <button data-id="${p.id}" class="btn-select-from-matcher cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition font-heading shadow-xs hover:shadow-md hover:shadow-blue-500/20 flex items-center gap-1.5">
              <span>Apri Scheda 360°</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Handler apertura scheda 360° da Matcher
  document.querySelectorAll(".btn-select-from-matcher").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      window.store.setSelectedPersonaId(id);
      if (typeof window.renderCitizenHub === "function") window.renderCitizenHub();
      const btnHub = document.getElementById("nav-mode-hub");
      if (btnHub) btnHub.click();
    });
  });
}

function initMatcherModule() {
  const form = document.getElementById("form-full-matcher");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      runMatcher();
    });
  }

  // Filtro rapido soglia punteggio
  const minScoreFilter = document.getElementById("m-min-score-filter");
  if (minScoreFilter) {
    minScoreFilter.addEventListener("change", () => {
      runMatcher();
    });
  }

  // Pulsante Reset
  const btnReset = document.getElementById("btn-reset-matcher");
  if (btnReset && form) {
    btnReset.addEventListener("click", () => {
      form.reset();
      const mansioneInput = document.getElementById("m-mansione");
      if (mansioneInput) mansioneInput.value = "ALL";
      const catInput = document.getElementById("m-categoria");
      if (catInput) catInput.value = "ALL";
      const minIcInput = document.getElementById("m-min-ic");
      if (minIcInput) minIcInput.value = "46";
      runMatcher();
    });
  }
}

window.runMatcher = runMatcher;
window.initMatcherModule = initMatcherModule;
