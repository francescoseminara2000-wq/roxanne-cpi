/**
 * Roxanne CPI Light - Progetti Inserimento Lavorativo (PIL) Module
 */

  // --- RENDER PROGETTO INSERIMENTO LAVORATIVO (PIL L.68/99) ---
  function renderPilTab(p) {
    const list = window.store.getProgettiInserimentoLavByNumIscriz(p.numeroIscrizione);
    const container = document.getElementById("hub-pil-content-list");

    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto text-xl">
            <i class="fa-solid fa-file-signature"></i>
          </div>
          <h4 class="text-xs font-bold text-slate-700 font-heading">Nessun Progetto PIL Registrato</h4>
          <p class="text-[11px] text-slate-400 max-w-sm mx-auto">Non sono ancora stati formulati progetti individuali di inserimento lavorativo (PIL) per questo cittadino. Clicca su "+ Nuovo Progetto PIL" per redigerne uno.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-4">
        ${list.map((pil, idx) => `
          <div class="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-teal-300 hover:shadow-xs transition space-y-4">
            
            <div class="flex items-center justify-between border-b border-slate-200/70 pb-3">
              <div class="flex items-center space-x-3">
                <span class="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-xs font-heading">
                  #${idx + 1}
                </span>
                <div>
                  <h4 class="text-xs font-extrabold text-slate-900 font-heading">
                    Piano Individuale PIL &bull; Codice <span class="font-mono text-teal-700">${escapeHtml(pil.idDote || 'Standard L.68')}</span>
                  </h4>
                  <p class="text-[10px] text-slate-400 font-medium">Data Redazione: <strong class="text-slate-700">${formatDate(pil.data)}</strong> &bull; Iscritto: ${escapeHtml(pil.nome)} (${escapeHtml(pil.codiceFiscale)})</p>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  <i class="fa-solid fa-user-tie mr-1"></i> ${escapeHtml(pil.tutor || 'Operatore CPI')}
                </span>
                <button data-pil-id="${pil.id}" class="btn-delete-pil text-slate-400 hover:text-rose-600 p-1 text-xs cursor-pointer" title="Elimina questo progetto PIL">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>

            <!-- Progetto Inserimento Target -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span class="text-[9px] uppercase font-bold text-teal-600 block tracking-wider font-heading">Obiettivi & Progetto di Inserimento</span>
              <p class="text-xs text-slate-800 font-medium leading-relaxed italic">${escapeHtml(pil.progettoInserimento || 'Nessun progetto specificato')}</p>
            </div>

            <!-- Profili Dettagliati Griglia (4 colonne) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                <span class="text-[9px] uppercase font-bold text-slate-400 block font-heading">Profilo Dinamico Funzionale</span>
                <p class="text-slate-700 text-[11px] leading-snug line-clamp-3">${escapeHtml(pil.profiloDinamicoFunzionale || '-')}</p>
              </div>

              <div class="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                <span class="text-[9px] uppercase font-bold text-slate-400 block font-heading">Profilo Sanitario & Ausili</span>
                <p class="text-slate-700 text-[11px] leading-snug line-clamp-3">${escapeHtml(pil.profiloSanitario || '-')}</p>
              </div>

              <div class="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                <span class="text-[9px] uppercase font-bold text-slate-400 block font-heading">Profilo Lavorativo / Storico</span>
                <p class="text-slate-700 text-[11px] leading-snug line-clamp-3">${escapeHtml(pil.profiloLavorativo || '-')}</p>
              </div>

              <div class="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                <span class="text-[9px] uppercase font-bold text-slate-400 block font-heading">Personale & Sociale</span>
                <p class="text-slate-700 text-[11px] leading-snug line-clamp-3">${escapeHtml(pil.profiloPersonaleSociale || '-')}</p>
              </div>
            </div>

            <!-- Box Criticità & Positività -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div class="p-3 rounded-xl bg-rose-50/40 border border-rose-200/80 space-y-0.5">
                <span class="text-[9px] uppercase font-bold text-rose-600 block font-heading"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Aspetti di Criticità / Limiti</span>
                <p class="text-slate-700 text-[11px] font-medium leading-relaxed">${escapeHtml(pil.aspettiCriticita || 'Nessuna criticità segnalata')}</p>
              </div>

              <div class="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-0.5">
                <span class="text-[9px] uppercase font-bold text-emerald-700 block font-heading"><i class="fa-solid fa-circle-check mr-1"></i> Punti di Forza & Risorse</span>
                <p class="text-slate-700 text-[11px] font-medium leading-relaxed">${escapeHtml(pil.aspettiPositivita || 'Nessun punto di forza specificato')}</p>
              </div>
            </div>

          </div>
        `).join("")}
      </div>
    `;

    // Delete PIL Handler
    container.querySelectorAll(".btn-delete-pil").forEach(btn => {
      btn.addEventListener("click", () => {
        const pilId = btn.getAttribute("data-pil-id");
        if (confirm("Eliminare questa scheda del Progetto di Inserimento (PIL)?")) {
          window.store.deleteProgettoInserimentoLav(pilId);
          renderCitizenHub();
        }
      });
    });
  }

  // --- ADD PROGETTO INSERIMENTO (PIL) MODAL ---
  const modalPil = document.getElementById("modal-progetto-pil");
  const btnAddPilTab = document.getElementById("btn-add-pil-tab");
  const btnCloseModalPil = document.getElementById("btn-close-modal-pil");
  const btnCancelModalPil = document.getElementById("btn-cancel-modal-pil");
  const formProgettoPil = document.getElementById("form-progetto-pil");

  if (btnAddPilTab && modalPil) {
    btnAddPilTab.addEventListener("click", () => {
      const p = window.store.getSelectedPersona();
      if (!p) return;
      document.getElementById("pil-data").value = new Date().toISOString().split('T')[0];
      document.getElementById("pil-iddote").value = `DOTE-L68-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`;
      modalPil.classList.remove("hidden");
    });
  }

  if (btnCloseModalPil && modalPil) {
    btnCloseModalPil.addEventListener("click", () => modalPil.classList.add("hidden"));
  }

  if (btnCancelModalPil && modalPil) {
    btnCancelModalPil.addEventListener("click", () => modalPil.classList.add("hidden"));
  }

  if (formProgettoPil) {
    formProgettoPil.addEventListener("submit", (e) => {
      e.preventDefault();
      const p = window.store.getSelectedPersona();
      if (!p) return;

      const pilData = {
        numeroIscrizione: p.numeroIscrizione,
        nome: p.nome,
        codiceFiscale: p.codiceFiscale,
        data: document.getElementById("pil-data").value,
        idDote: document.getElementById("pil-iddote").value.trim(),
        tutor: document.getElementById("pil-operatore").value.trim(),
        progettoInserimento: document.getElementById("pil-progetto").value.trim(),
        profiloDinamicoFunzionale: document.getElementById("pil-funzionale").value.trim(),
        profiloSanitario: document.getElementById("pil-sanitario").value.trim(),
        profiloScolastico: document.getElementById("pil-scolastico").value.trim(),
        profiloLavorativo: document.getElementById("pil-lavorativo").value.trim(),
        profiloPersonaleSociale: document.getElementById("pil-sociale").value.trim(),
        valutazioneLavorativa: document.getElementById("pil-valutazione").value.trim(),
        aspettiCriticita: document.getElementById("pil-criticita").value.trim(),
        aspettiPositivita: document.getElementById("pil-positivita").value.trim()
      };

      window.store.addProgettoInserimentoLav(pilData);
      modalPil.classList.add("hidden");
      formProgettoPil.reset();
      renderCitizenHub();
      RoxToast.success("Progetto PIL Salvato", "Progetto individuale registrato su MySQL.");
    });
  }

window.renderProgettoInserimentoTab = renderProgettoInserimentoTab;
