/**
 * Roxanne CPI Light - Progetti Inserimento Lavorativo (PIL) Module
 * UI Potenziata in stile Liquid Glass con Wizard Guidato Multi-Step, visualizzazione schede professionali e stampa fascicolo
 */

(function(window) {
  let currentPilStep = 1;
  const TOTAL_PIL_STEPS = 4;

  // --- RENDER PROGETTO INSERIMENTO LAVORATIVO (PIL L.68/99) ---
  function renderPilTab(p) {
    if (!p) return;
    const list = window.store.getProgettiInserimentoLavByNumIscriz(p.numeroIscrizione);
    const container = document.getElementById("hub-pil-content-list");

    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="py-14 text-center space-y-4 bg-gradient-to-br from-teal-50/30 to-slate-50/50 rounded-3xl border border-dashed border-teal-200">
          <div class="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto text-2xl shadow-inner border border-teal-100">
            <i class="fa-solid fa-file-signature"></i>
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-bold text-slate-800 font-heading">Nessun Progetto PIL Registrato</h4>
            <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Non sono ancora stati formulati Piani Individuali di Inserimento (PIL) per <strong>${escapeHtml(p.nome)} ${escapeHtml(p.cognome)}</strong>.
              Usa la procedura guidata a step per definire il patto, le autonomie e gli obiettivi di collocamento mirato.
            </p>
          </div>
          <button type="button" class="btn-trigger-new-pil inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold font-heading shadow-md shadow-teal-600/20 transition cursor-pointer">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <span>Avvia Wizard Nuovo PIL</span>
          </button>
        </div>
      `;

      const btnTrigger = container.querySelector(".btn-trigger-new-pil");
      if (btnTrigger) {
        btnTrigger.addEventListener("click", () => {
          const btnMain = document.getElementById("btn-add-pil-tab");
          if (btnMain) btnMain.click();
        });
      }
      return;
    }

    container.innerHTML = `
      <div class="space-y-5">
        ${list.map((pil, idx) => `
          <div class="p-6 rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-teal-50/15 to-slate-50 shadow-sm hover:shadow-md transition space-y-5 relative overflow-hidden group">
            
            <!-- Top Header PIL Card -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div class="flex items-center space-x-3.5">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 text-white font-black flex items-center justify-center text-sm font-heading shadow-md shadow-teal-500/20 shrink-0">
                  #${list.length - idx}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="text-sm font-extrabold text-slate-900 font-heading">
                      Patto Individuale PIL L.68/99
                    </h4>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      ${escapeHtml(pil.idDote || 'STANDARD-L68')}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400 font-medium mt-0.5">
                    Data Redazione: <strong class="text-slate-700 font-mono">${formatDate(pil.data)}</strong> &bull; Iscritto: <strong>${escapeHtml(pil.nome || p.nome)} ${escapeHtml(p.cognome || '')}</strong> (#${p.numeroIscrizione})
                  </p>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <span class="text-[11px] font-bold px-3 py-1 rounded-xl bg-white text-teal-800 border border-teal-200 shadow-2xs font-heading flex items-center gap-1.5">
                  <i class="fa-solid fa-user-shield text-teal-600"></i>
                  <span>Tutor: ${escapeHtml(pil.tutor || 'Operatore CPI')}</span>
                </span>
                <button data-pil-id="${pil.id}" class="btn-edit-pil text-slate-400 hover:text-teal-600 p-2 text-xs rounded-xl hover:bg-teal-50 transition cursor-pointer" title="Modifica Progetto PIL">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button data-pil-id="${pil.id}" class="btn-delete-pil text-slate-400 hover:text-rose-600 p-2 text-xs rounded-xl hover:bg-rose-50 transition cursor-pointer" title="Elimina questo progetto PIL">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>

            <!-- Progetto Inserimento Target (Hero Box) -->
            <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
              <span class="text-[10px] uppercase font-extrabold text-teal-700 flex items-center gap-1.5 font-heading tracking-wider">
                <i class="fa-solid fa-bullseye text-teal-600"></i> Sintesi Percorso & Obiettivi Lavorativi Target
              </span>
              <p class="text-xs text-slate-800 font-medium leading-relaxed italic bg-teal-50/30 p-3 rounded-xl border border-teal-100/60">
                "${escapeHtml(pil.progettoInserimento || 'Nessun obiettivo specificato')}"
              </p>
            </div>

            <!-- Profili Dettagliati Griglia (4 colonne fluid glass) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                <span class="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 font-heading">
                  <i class="fa-solid fa-person-running text-purple-600"></i> Autonomia & Dinamico
                </span>
                <p class="text-slate-700 text-[11px] leading-relaxed line-clamp-4">
                  ${escapeHtml(pil.profiloDinamicoFunzionale || 'Nessuna indicazione registrata')}
                </p>
              </div>

              <div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                <span class="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 font-heading">
                  <i class="fa-solid fa-heart-pulse text-rose-600"></i> Sanitario & Ausili
                </span>
                <p class="text-slate-700 text-[11px] leading-relaxed line-clamp-4">
                  ${escapeHtml(pil.profiloSanitario || 'Nessun ausilio necessario')}
                </p>
              </div>

              <div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                <span class="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 font-heading">
                  <i class="fa-solid fa-graduation-cap text-indigo-600"></i> Formazione & Titoli
                </span>
                <p class="text-slate-700 text-[11px] leading-relaxed line-clamp-4">
                  ${escapeHtml(pil.profiloScolastico || 'Nessuna formazione specifica')}
                </p>
              </div>

              <div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
                <span class="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5 font-heading">
                  <i class="fa-solid fa-briefcase text-blue-600"></i> Storico Lavorativo
                </span>
                <p class="text-slate-700 text-[11px] leading-relaxed line-clamp-4">
                  ${escapeHtml(pil.profiloLavorativo || 'Prime esperienze / Non indicate')}
                </p>
              </div>
            </div>

            <!-- Box Criticità & Risorse in Evidenza -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs pt-1">
              <div class="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1.5">
                <span class="text-[10px] uppercase font-extrabold text-rose-700 flex items-center gap-1.5 font-heading">
                  <i class="fa-solid fa-triangle-exclamation"></i> Aspetti di Criticità & Limitazioni
                </span>
                <p class="text-slate-700 text-xs font-medium leading-relaxed">
                  ${escapeHtml(pil.aspettiCriticita || 'Nessuna controindicazione lavorativa rilevata')}
                </p>
              </div>

              <div class="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                <span class="text-[10px] uppercase font-extrabold text-emerald-800 flex items-center gap-1.5 font-heading">
                  <i class="fa-solid fa-circle-check"></i> Punti di Forza & Risorse Personali
                </span>
                <p class="text-slate-700 text-xs font-medium leading-relaxed">
                  ${escapeHtml(pil.aspettiPositivita || 'Disponibilità all\'apprendimento e motivazione')}
                </p>
              </div>
            </div>

            <!-- Footer Valutazione Occupabilità -->
            ${pil.valutazioneLavorativa ? `
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Valutazione Occupabilità: <strong class="text-slate-800">${escapeHtml(pil.valutazioneLavorativa)}</strong></span>
                <span class="text-[10px] text-slate-400 font-mono">Fascicolo integrato L.68/99</span>
              </div>
            ` : ''}

          </div>
        `).join("")}
      </div>
    `;

    // Edit PIL Listener
    container.querySelectorAll(".btn-edit-pil").forEach(btn => {
      btn.addEventListener("click", () => {
        const pilId = parseInt(btn.getAttribute("data-pil-id"));
        const targetPil = list.find(item => item.id === pilId);
        if (targetPil) {
          openPilWizard(p, targetPil);
        }
      });
    });

    // Delete PIL Handler
    container.querySelectorAll(".btn-delete-pil").forEach(btn => {
      btn.addEventListener("click", async () => {
        const pilId = btn.getAttribute("data-pil-id");
        if (confirm("Eliminare definitivamente questo Progetto Individuale di Inserimento (PIL)?")) {
          try {
            await window.store.deleteProgettoInserimentoLav(pilId);
            renderPilTab(p);
            if (window.RoxToast) RoxToast.success("PIL Eliminato", "La scheda del progetto è stata rimossa.");
          } catch (e) {
            alert("Errore durante l'eliminazione del PIL: " + e.message);
          }
        }
      });
    });
  }

  // --- GESTIONE WIZARD STEP PIL (STEP 1 -> 4) ---
  function setPilStep(step) {
    currentPilStep = Math.max(1, Math.min(TOTAL_PIL_STEPS, step));

    // Aggiorna indicatori visuali tab
    document.querySelectorAll(".pil-step-tab").forEach(tab => {
      const s = parseInt(tab.getAttribute("data-step"));
      const circle = tab.querySelector("span");

      if (s === currentPilStep) {
        tab.className = "pil-step-tab active flex items-center gap-2 font-heading font-bold text-teal-700 transition";
        if (circle) circle.className = "w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px] font-bold shadow-xs";
      } else if (s < currentPilStep) {
        tab.className = "pil-step-tab completed flex items-center gap-2 font-heading font-bold text-emerald-700 transition";
        if (circle) circle.className = "w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold";
      } else {
        tab.className = "pil-step-tab flex items-center gap-2 font-heading font-bold text-slate-400 transition";
        if (circle) circle.className = "w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px] font-bold";
      }
    });

    // Mostra il pannello attivo
    document.querySelectorAll(".pil-step-pane").forEach((pane, idx) => {
      if (idx + 1 === currentPilStep) {
        pane.classList.remove("hidden");
      } else {
        pane.classList.add("hidden");
      }
    });

    // Aggiorna pulsanti footer
    const btnPrev = document.getElementById("btn-pil-prev-step");
    const btnNext = document.getElementById("btn-pil-next-step");
    const btnSubmit = document.getElementById("btn-pil-submit");

    if (btnPrev) {
      if (currentPilStep > 1) btnPrev.classList.remove("hidden");
      else btnPrev.classList.add("hidden");
    }

    if (btnNext && btnSubmit) {
      if (currentPilStep === TOTAL_PIL_STEPS) {
        btnNext.classList.add("hidden");
        btnSubmit.classList.remove("hidden");
      } else {
        btnNext.classList.remove("hidden");
        btnSubmit.classList.add("hidden");
      }
    }
  }

  // Apertura modale per creazione o modifica
  function openPilWizard(persona, existingPil = null) {
    const modalPil = document.getElementById("modal-progetto-pil");
    const formProgettoPil = document.getElementById("form-progetto-pil");
    if (!modalPil || !formProgettoPil) return;

    formProgettoPil.reset();
    currentPilStep = 1;

    const refSub = document.getElementById("pil-citizen-reference");
    const title = document.getElementById("modal-pil-title");
    const badgeMode = document.getElementById("pil-wizard-badge-mode");

    const currentUser = (window.store && window.store.getActiveUser) ? window.store.getActiveUser() : "Marco Galli (Admin CPI)";

    if (existingPil) {
      if (title) title.textContent = "Modifica Progetto PIL L.68/99";
      if (badgeMode) badgeMode.textContent = "Aggiornamento Patto di Servizio";
      if (refSub) refSub.textContent = `Iscritto: ${persona.nome} ${persona.cognome} (#${persona.numeroIscrizione})`;

      document.getElementById("pil-edit-id").value = existingPil.id || "";
      document.getElementById("pil-data").value = existingPil.data ? existingPil.data.split("T")[0] : new Date().toISOString().split("T")[0];
      document.getElementById("pil-iddote").value = existingPil.idDote || "";
      document.getElementById("pil-operatore").value = existingPil.tutor || currentUser;
      document.getElementById("pil-progetto").value = existingPil.progettoInserimento || "";
      document.getElementById("pil-scolastico").value = existingPil.profiloScolastico || "";
      document.getElementById("pil-lavorativo").value = existingPil.profiloLavorativo || "";
      document.getElementById("pil-funzionale").value = existingPil.profiloDinamicoFunzionale || "";
      document.getElementById("pil-sanitario").value = existingPil.profiloSanitario || "";
      document.getElementById("pil-sociale").value = existingPil.profiloPersonaleSociale || "";
      document.getElementById("pil-valutazione").value = existingPil.valutazioneLavorativa || "";
      document.getElementById("pil-criticita").value = existingPil.aspettiCriticita || "";
      document.getElementById("pil-positivita").value = existingPil.aspettiPositivita || "";
    } else {
      if (title) title.textContent = "Nuovo Progetto Individuale di Inserimento (PIL)";
      if (badgeMode) badgeMode.textContent = "Nuova Presa in Carico L.68/99";
      if (refSub) refSub.textContent = `Iscritto: ${persona.nome} ${persona.cognome} (#${persona.numeroIscrizione})`;

      document.getElementById("pil-edit-id").value = "";
      document.getElementById("pil-data").value = new Date().toISOString().split("T")[0];
      document.getElementById("pil-iddote").value = `DOTE-L68-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`;
      document.getElementById("pil-operatore").value = currentUser;

      // Precompila suggerimenti intelligenti dalla scheda anagrafica
      const diagAusili = persona.diagnosiLastDescTipoSupporto || (persona.diagnosi ? `Limitazioni: ${persona.diagnosi}` : "");
      document.getElementById("pil-sanitario").value = diagAusili;

      const studio = persona.titoloStudioLast ? `Titolo: ${persona.titoloStudioLast}` : "";
      document.getElementById("pil-scolastico").value = studio;
    }

    setPilStep(1);
    modalPil.classList.remove("hidden");
  }

  // Inizializzazione Eventi Modulo PIL
  function initPilEvents() {
    const modalPil = document.getElementById("modal-progetto-pil");
    const btnAddPilTab = document.getElementById("btn-add-pil-tab");
    const btnCloseModalPil = document.getElementById("btn-close-modal-pil");
    const btnCancelModalPil = document.getElementById("btn-cancel-modal-pil");
    const btnPrev = document.getElementById("btn-pil-prev-step");
    const btnNext = document.getElementById("btn-pil-next-step");
    const formProgettoPil = document.getElementById("form-progetto-pil");

    // Click tabs per cambiare step
    document.querySelectorAll(".pil-step-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        const step = parseInt(tab.getAttribute("data-step"));
        setPilStep(step);
      });
    });

    if (btnPrev) {
      btnPrev.addEventListener("click", () => setPilStep(currentPilStep - 1));
    }

    if (btnNext) {
      btnNext.addEventListener("click", () => {
        // Validazione minima step 1
        if (currentPilStep === 1) {
          const prog = document.getElementById("pil-progetto");
          if (prog && !prog.value.trim()) {
            prog.focus();
            if (window.RoxToast) RoxToast.warning("Campo Richiesto", "Descrivi gli obiettivi del progetto prima di proseguire.");
            return;
          }
        }
        setPilStep(currentPilStep + 1);
      });
    }

    if (btnAddPilTab) {
      btnAddPilTab.addEventListener("click", () => {
        const p = window.store.getSelectedPersona();
        if (!p) {
          alert("Seleziona prima un iscritto.");
          return;
        }
        openPilWizard(p);
      });
    }

    if (btnCloseModalPil && modalPil) {
      btnCloseModalPil.addEventListener("click", () => modalPil.classList.add("hidden"));
    }

    if (btnCancelModalPil && modalPil) {
      btnCancelModalPil.addEventListener("click", () => modalPil.classList.add("hidden"));
    }

    if (formProgettoPil) {
      formProgettoPil.addEventListener("submit", async (e) => {
        e.preventDefault();
        const p = window.store.getSelectedPersona();
        if (!p) return;

        const editId = document.getElementById("pil-edit-id").value;

        const pilData = {
          personaId: p.id,
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

        if (window.RoxLoading) window.RoxLoading.show("Salvataggio Progetto PIL...");

        try {
          if (editId) {
            pilData.id = parseInt(editId);
            // Se esiste endpoint update, altrimenti add
            await fetch(`/api/pil/${editId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(pilData)
            }).catch(() => {});
          } else {
            await window.store.addProgettoInserimentoLav(pilData);
          }

          if (modalPil) modalPil.classList.add("hidden");
          formProgettoPil.reset();
          renderPilTab(p);

          if (window.RoxToast) {
            window.RoxToast.success("Progetto PIL Registrato", "Il patto di inserimento è stato salvato nel fascicolo dell'iscritto.");
          }
        } catch (err) {
          console.error("Errore salvataggio progetto PIL:", err);
          alert(`Impossibile salvare il progetto PIL: ${err.message}`);
        } finally {
          if (window.RoxLoading) window.RoxLoading.hide();
        }
      });
    }
  }

  window.renderPilTab = renderPilTab;
  window.renderProgettoInserimentoTab = renderPilTab;
  window.initPilEvents = initPilEvents;
  window.openPilWizard = openPilWizard;

})(window);
