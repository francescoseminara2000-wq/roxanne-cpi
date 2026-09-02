/**
 * Roxanne CPI Light - Stepper Wizard Module
 * Creazione guidata e modifica schede iscritto L.68/99 con salvataggio su MySQL
 */

  // --- CONTROLLER WIZARD GUIDATO INSERIMENTO / MODIFICA ISCRITTO L.68/99 ---
  let currentWizardStep = 1;
  const totalWizardSteps = 5;

  function setWizardStep(step) {
    currentWizardStep = Math.max(1, Math.min(step, totalWizardSteps));

    // Update Step Contents visibility
    for (let i = 1; i <= totalWizardSteps; i++) {
      const stepContent = document.getElementById(`wizard-step-${i}`);
      if (stepContent) {
        if (i === currentWizardStep) {
          stepContent.classList.remove("hidden");
        } else {
          stepContent.classList.add("hidden");
        }
      }
    }

    // Update Stepper Tabs active classes
    document.querySelectorAll(".wizard-step-tab").forEach(tab => {
      const s = parseInt(tab.getAttribute("data-step"));
      const circle = tab.querySelector("span:first-child");
      if (s === currentWizardStep) {
        tab.classList.remove("text-slate-400");
        tab.classList.add("text-blue-600");
        circle.className = "w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]";
      } else if (s < currentWizardStep) {
        tab.classList.remove("text-slate-400", "text-blue-600");
        tab.classList.add("text-emerald-600");
        circle.className = "w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]";
      } else {
        tab.classList.remove("text-blue-600", "text-emerald-600");
        tab.classList.add("text-slate-400");
        circle.className = "w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px]";
      }
    });

    // Update Footer controls
    const lblStep = document.getElementById("wizard-current-step-label");
    if (lblStep) lblStep.textContent = currentWizardStep;

    const btnPrev = document.getElementById("btn-wizard-prev");
    const btnNext = document.getElementById("btn-wizard-next");
    const btnSubmit = document.getElementById("btn-wizard-submit");

    if (btnPrev) btnPrev.disabled = (currentWizardStep === 1);

    if (currentWizardStep === totalWizardSteps) {
      if (btnNext) btnNext.classList.add("hidden");
      if (btnSubmit) btnSubmit.classList.remove("hidden");
    } else {
      if (btnNext) btnNext.classList.remove("hidden");
      if (btnSubmit) btnSubmit.classList.add("hidden");
    }
  }

  function openWizardPersona(persona = null) {
    const modal = document.getElementById("modal-persona");
    const form = document.getElementById("form-wizard-persona");
    if (!modal || !form) return;

    form.reset();
    currentWizardStep = 1;
    setWizardStep(1);

    const titleEl = document.getElementById("modal-persona-title");
    const badgeEl = document.getElementById("wizard-badge-mode");
    const idInput = document.getElementById("wizard-persona-id");

    if (persona) {
      if (titleEl) titleEl.textContent = `Modifica Scheda: ${persona.nome || ''} ${persona.cognome || ''}`;
      if (badgeEl) badgeEl.textContent = `Aggiornamento Iscritto #${persona.numeroIscrizione || persona.id}`;
      if (idInput) idInput.value = persona.id;

      // Fill Step 1
      document.getElementById("w-nome").value = persona.nome || "";
      document.getElementById("w-cognome").value = persona.cognome || "";
      document.getElementById("w-cf").value = persona.codiceFiscale || "";
      document.getElementById("w-data-nascita").value = persona.dataNascita ? persona.dataNascita.split("T")[0] : "";
      document.getElementById("w-nato-a").value = persona.natoA || "";
      document.getElementById("w-sesso").value = persona.sesso || "M";
      document.getElementById("w-stato-civile").value = persona.statoCivile || "Celibe/Nubile";
      document.getElementById("w-comune-res").value = persona.comuneResidenza || "";
      document.getElementById("w-prov-res").value = persona.residenzaProvincia || "LC";
      document.getElementById("w-indirizzo-res").value = persona.indirizzo || "";
      document.getElementById("w-cellulare").value = persona.cellulare || "";
      document.getElementById("w-telefono").value = persona.telefono || "";
      document.getElementById("w-email").value = persona.email || "";

      // Fill Step 2
      document.getElementById("w-categoria").value = persona.categoria || "C.O.";
      document.getElementById("w-cat-specifica").value = persona.categoriaLg6869 || "";
      document.getElementById("w-ic-perc").value = persona.icPercentuale || "";
      document.getElementById("w-attivo").value = persona.attivoNonAttivo || "Attivo";
      document.getElementById("w-stato-occup").value = persona.stato || "Disoccupato";
      document.getElementById("w-data-iscrizione").value = persona.dataIscrizioneCO ? persona.dataIscrizioneCO.split("T")[0] : "";
      document.getElementById("w-data-revisione").value = persona.dataRevisione ? persona.dataRevisione.split("T")[0] : "";
      document.getElementById("w-asl").value = persona.asl || "";
      document.getElementById("w-patologia").value = persona.patologia || "";
      document.getElementById("w-diagnosi").value = persona.diagnosi || "";
      document.getElementById("w-supporto-postazione").value = persona.diagnosiLastDescTipoSupporto || "";
      document.getElementById("w-l104").checked = !!persona.handicapL104;
      document.getElementById("w-allegati-l68").checked = persona.allegatiLg68 !== false;

      // Fill Step 3
      document.getElementById("w-titolo-studio").value = persona.titoloStudioLast || "";
      document.getElementById("w-istituto").value = persona.titoloStudioPresso || "";
      document.getElementById("w-anno-titolo").value = persona.anno || "";
      document.getElementById("w-votazione").value = persona.votazione || "";
      document.getElementById("w-qualifica").value = persona.qualifica || "";
      document.getElementById("w-ecdl").value = persona.ecdl || "Sì (Certificato PC)";
      document.getElementById("w-patente").value = persona.patente || "B";
      document.getElementById("w-lang-en").checked = !!persona.inglese;
      document.getElementById("w-lang-fr").checked = !!persona.francese;
      document.getElementById("w-lang-es").checked = !!persona.spagnolo;
      document.getElementById("w-lang-de").checked = !!persona.tedesco;
      document.getElementById("w-patente-muletto").checked = !!persona.patenteMuletto;

      // Fill Step 4
      document.getElementById("w-stazione-eretta").checked = persona.stazioneEretta !== false;
      document.getElementById("w-movimentazione").checked = persona.movimentazioneManuale !== false;
      document.getElementById("w-manualita").checked = persona.manualitaFine !== false;
      document.getElementById("w-arti-superiori").checked = persona.artiSuperiori !== false;
      document.getElementById("w-vista").checked = persona.vista !== false;
      document.getElementById("w-udito").checked = persona.udito !== false;
      document.getElementById("w-colonna").checked = persona.colonna !== false;
      document.getElementById("w-pubblico").checked = persona.contattoPubblico !== false;

      document.getElementById("w-m-impiegato").checked = !!persona.impiegato;
      document.getElementById("w-m-reception").checked = !!persona.receptionSegreteria;
      document.getElementById("w-m-magazzino").checked = !!persona.magazzino;
      document.getElementById("w-m-cassa").checked = !!persona.cassa;
      document.getElementById("w-m-pulizie").checked = !!persona.pulizie;
      document.getElementById("w-m-verde").checked = !!persona.verde;
      document.getElementById("w-m-artigiano").checked = !!persona.artigiano;
      document.getElementById("w-m-informatica").checked = !!persona.informatica;

      // Fill Step 5
      const disp = persona.disponibilita || {};
      document.getElementById("w-orario").value = disp.orarioPreferito || "Full-Time (40h)";
      document.getElementById("w-raggio-km").value = disp.raggioMaxKm || 25;
      document.getElementById("w-operatore-cpi").value = persona.operatore || "Marco Galli (Admin CPI)";
      document.getElementById("w-mezzo-munito").checked = disp.mezzoMunit !== false;
      document.getElementById("w-smartworking").checked = !!disp.smartWorking;
      document.getElementById("w-turni").checked = !!disp.disponibileTurni;
      document.getElementById("w-festivi").checked = !!disp.disponibileFestivi;
      document.getElementById("w-note-disponibilita").value = disp.noteDisponibilita || "";
    } else {
      if (titleEl) titleEl.textContent = "Procedura Guidata Inserimento Iscritto";
      if (badgeEl) badgeEl.textContent = "Nuova Presa in Carico L.68/99";
      if (idInput) idInput.value = "";
    }

    modal.classList.remove("hidden");
  }

  // Stepper Listeners
  document.querySelectorAll(".wizard-step-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const targetStep = parseInt(tab.getAttribute("data-step"));
      setWizardStep(targetStep);
    });
  });

  const btnWizardPrev = document.getElementById("btn-wizard-prev");
  if (btnWizardPrev) {
    btnWizardPrev.addEventListener("click", () => {
      if (currentWizardStep > 1) setWizardStep(currentWizardStep - 1);
    });
  }

  const btnWizardNext = document.getElementById("btn-wizard-next");
  if (btnWizardNext) {
    btnWizardNext.addEventListener("click", () => {
      // Step 1 Validation
      if (currentWizardStep === 1) {
        const nome = document.getElementById("w-nome").value.trim();
        const cf = document.getElementById("w-cf").value.trim();
        if (!nome || !cf) {
          alert("Compilare almeno il Nome e il Codice Fiscale del cittadino per procedere.");
          return;
        }
      }
      if (currentWizardStep < totalWizardSteps) setWizardStep(currentWizardStep + 1);
    });
  }

  const btnCloseWizard = document.getElementById("btn-close-modal-persona");
  if (btnCloseWizard) {
    btnCloseWizard.addEventListener("click", () => {
      document.getElementById("modal-persona").classList.add("hidden");
    });
  }

  // Stepper Form Submission
  const btnWizardSubmit = document.getElementById("btn-wizard-submit");
  if (btnWizardSubmit) {
    btnWizardSubmit.addEventListener("click", async () => {
      const idVal = document.getElementById("wizard-persona-id").value;
      const isEdit = !!idVal;

      const personaPayload = {
        nome: document.getElementById("w-nome").value.trim(),
        cognome: document.getElementById("w-cognome").value.trim(),
        codiceFiscale: document.getElementById("w-cf").value.trim().toUpperCase(),
        dataNascita: document.getElementById("w-data-nascita").value ? new Date(document.getElementById("w-data-nascita").value).toISOString() : null,
        natoA: document.getElementById("w-nato-a").value.trim(),
        sesso: document.getElementById("w-sesso").value,
        statoCivile: document.getElementById("w-stato-civile").value,
        comuneResidenza: document.getElementById("w-comune-res").value.trim(),
        residenzaProvincia: document.getElementById("w-prov-res").value.trim().toUpperCase(),
        indirizzo: document.getElementById("w-indirizzo-res").value.trim(),
        cellulare: document.getElementById("w-cellulare").value.trim(),
        telefono: document.getElementById("w-telefono").value.trim(),
        email: document.getElementById("w-email").value.trim(),

        categoria: document.getElementById("w-categoria").value,
        categoriaLg6869: document.getElementById("w-cat-specifica").value.trim(),
        icPercentuale: parseInt(document.getElementById("w-ic-perc").value) || 0,
        attivoNonAttivo: document.getElementById("w-attivo").value,
        stato: document.getElementById("w-stato-occup").value,
        dataIscrizioneCO: document.getElementById("w-data-iscrizione").value ? new Date(document.getElementById("w-data-iscrizione").value).toISOString() : null,
        dataRevisione: document.getElementById("w-data-revisione").value ? new Date(document.getElementById("w-data-revisione").value).toISOString() : null,
        asl: document.getElementById("w-asl").value.trim(),
        patologia: document.getElementById("w-patologia").value.trim(),
        diagnosi: document.getElementById("w-diagnosi").value.trim(),
        diagnosiLastDescTipoSupporto: document.getElementById("w-supporto-postazione").value.trim(),
        handicapL104: document.getElementById("w-l104").checked,
        allegatiLg68: document.getElementById("w-allegati-l68").checked,

        titoloStudioLast: document.getElementById("w-titolo-studio").value.trim(),
        titoloStudioPresso: document.getElementById("w-istituto").value.trim(),
        anno: parseInt(document.getElementById("w-anno-titolo").value) || null,
        votazione: document.getElementById("w-votazione").value.trim(),
        qualifica: document.getElementById("w-qualifica").value.trim(),
        ecdl: document.getElementById("w-ecdl").value,
        patente: document.getElementById("w-patente").value.trim(),
        inglese: document.getElementById("w-lang-en").checked,
        francese: document.getElementById("w-lang-fr").checked,
        spagnolo: document.getElementById("w-lang-es").checked,
        tedesco: document.getElementById("w-lang-de").checked,
        patenteMuletto: document.getElementById("w-patente-muletto").checked,

        stazioneEretta: document.getElementById("w-stazione-eretta").checked,
        movimentazioneManuale: document.getElementById("w-movimentazione").checked,
        manualitaFine: document.getElementById("w-manualita").checked,
        artiSuperiori: document.getElementById("w-arti-superiori").checked,
        vista: document.getElementById("w-vista").checked,
        udito: document.getElementById("w-udito").checked,
        colonna: document.getElementById("w-colonna").checked,
        contattoPubblico: document.getElementById("w-pubblico").checked,

        impiegato: document.getElementById("w-m-impiegato").checked,
        receptionSegreteria: document.getElementById("w-m-reception").checked,
        magazzino: document.getElementById("w-m-magazzino").checked,
        cassa: document.getElementById("w-m-cassa").checked,
        pulizie: document.getElementById("w-m-pulizie").checked,
        verde: document.getElementById("w-m-verde").checked,
        artigiano: document.getElementById("w-m-artigiano").checked,
        informatica: document.getElementById("w-m-informatica").checked,

        operatore: document.getElementById("w-operatore-cpi").value.trim(),
        disponibilita: {
          orarioPreferito: document.getElementById("w-orario").value,
          raggioMaxKm: parseInt(document.getElementById("w-raggio-km").value) || 25,
          mezzoMunit: document.getElementById("w-mezzo-munito").checked,
          smartWorking: document.getElementById("w-smartworking").checked,
          disponibileTurni: document.getElementById("w-turni").checked,
          disponibileFestivi: document.getElementById("w-festivi").checked,
          noteDisponibilita: document.getElementById("w-note-disponibilita").value.trim()
        }
      };

      try {
        if (isEdit) {
          await window.store.updatePersona(idVal, personaPayload);
        } else {
          await window.store.addPersona(personaPayload);
        }

        document.getElementById("modal-persona").classList.add("hidden");
        renderMainSearchTable();
        renderCitizenHub();

        RoxToast.success(
          isEdit ? "Scheda Aggiornata" : "Nuovo Iscritto Registrato",
          `La pratica per ${personaPayload.nome} ${personaPayload.cognome} è stata memorizzata permanentemente nel Database MySQL!`
        );
      } catch (err) {
        console.error("Errore salvataggio scheda:", err);
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: 'error',
            title: 'Errore Salvataggio su Database',
            html: `Non è stato possibile registrare l'iscritto su MySQL:<br><br><code class="text-rose-600 bg-rose-50 px-2 py-1 rounded">${err.message}</code>`,
            confirmButtonColor: '#ef4444'
          });
        } else {
          alert(`Errore Salvataggio su MySQL: ${err.message}`);
        }
      }
    });
  }

  // Hook Quick New Persona buttons to Stepper Wizard
  const btnQuickNew = document.getElementById("btn-quick-new-persona");
  if (btnQuickNew) {
    btnQuickNew.addEventListener("click", () => openWizardPersona(null));
  }

  const btnNuovoIscrittoSearch = document.getElementById("btn-nuovo-iscritto");
  if (btnNuovoIscrittoSearch) {
    btnNuovoIscrittoSearch.addEventListener("click", () => openWizardPersona(null));
  }

window.setWizardStep = setWizardStep;
