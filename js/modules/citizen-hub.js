/**
 * Roxanne CPI Light - Citizen Hub 360° Module
 * Scheda integrata a 360° dell'iscritto, editing in-place e visualizzazione completa
 */

  // --- CITIZEN HUB SUB-TABS INITIALIZATION ---
  function initHubSubTabs() {
    const tabLinks = document.querySelectorAll(".hub-tab-link");
    tabLinks.forEach(link => {
      link.addEventListener("click", () => {
        const tabId = link.getAttribute("data-tab");
        
        tabLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");

        document.querySelectorAll(".hub-tab-content").forEach(content => {
          content.classList.add("hidden");
        });

        const activeContent = document.getElementById(tabId);
        if (activeContent) {
          activeContent.classList.remove("hidden");
        }
      });
    });
  }

  // --- CITIZEN HUB 360° MASTER RENDERER (IN-PLACE INLINE EDITING) ---
  function renderCitizenHub() {
    const p = window.store.getSelectedPersona();
    if (!p) return;

    const personeList = window.store.getPersone();
    const currentIndex = personeList.findIndex(item => item.id === p.id);

    // 1. Update Indexer Badge & Navigation
    const elIndexer = document.getElementById("hub-indexer-badge");
    if (elIndexer) {
      elIndexer.textContent = `${currentIndex !== -1 ? currentIndex + 1 : 1} / ${personeList.length}`;
    }

    const btnPrev = document.getElementById("btn-hub-prev-persona");
    const btnNext = document.getElementById("btn-hub-next-persona");
    if (btnPrev) btnPrev.disabled = (currentIndex <= 0);
    if (btnNext) btnNext.disabled = (currentIndex === -1 || currentIndex >= personeList.length - 1);

    // 2. Dynamic Avatar with colorful gradient based on gender/category
    const initials = (p.nome || "NN").split(" ").map(n => n.charAt(0)).join("").substring(0, 2).toUpperCase();
    const elAvatar = document.getElementById("hub-avatar");
    if (elAvatar) {
      elAvatar.textContent = initials;
      if (p.sesso === "F") {
        elAvatar.className = "w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-pink-500/25 font-heading";
      } else {
        elAvatar.className = "w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-700 to-slate-900 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-blue-500/25 font-heading";
      }
    }

    // Active status indicator dot
    const elActiveDot = document.getElementById("hub-active-dot");
    if (elActiveDot) {
      const isAttivo = (p.attivoNonAttivo || "Attivo") === "Attivo";
      elActiveDot.className = `absolute -bottom-1.5 -right-1.5 ${isAttivo ? 'bg-emerald-500' : 'bg-slate-400'} w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white shadow-2xs`;
      elActiveDot.innerHTML = isAttivo ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-pause"></i>';
      elActiveDot.title = isAttivo ? 'Iscritto Attivo al CPI' : 'Iscritto Sospeso / Non Attivo';
    }

    // 3. Header Texts & Micro-Badges
    const elNome = document.getElementById("hub-nome");
    const elCf = document.getElementById("hub-cf");
    const elNumIscriz = document.getElementById("hub-num-iscriz");
    const elResidenza = document.getElementById("hub-residenza");
    const elTel = document.getElementById("hub-tel");
    const elEmail = document.getElementById("hub-email");

    if (elNome) elNome.textContent = p.nome || "-";
    if (elCf) elCf.textContent = p.codiceFiscale || "-";
    if (elNumIscriz) elNumIscriz.textContent = `#${p.numeroIscrizione || '0'}`;
    if (elResidenza) elResidenza.textContent = p.comuneResidenza || "Lecco";
    if (elTel) elTel.textContent = p.cellulare || p.telefono1 || p.telefono || "-";
    if (elEmail) elEmail.textContent = p.email || "-";

    // Dynamic Category Badge
    const catBadge = document.getElementById("hub-cat-badge");
    if (catBadge) {
      const cat = p.categoria || "C.O.";
      catBadge.textContent = cat === "C.O." ? "C.O. Disabili" : (cat === "Art. 18" ? "Art. 18 Categorie Protette" : cat);
      if (cat === "C.O.") {
        catBadge.className = "px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs";
      } else if (cat === "Art. 18") {
        catBadge.className = "px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs";
      } else {
        catBadge.className = "px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs";
      }
    }

    // Dynamic Employment Status Badge
    const elStatoBadge = document.getElementById("hub-stato-badge");
    if (elStatoBadge) {
      const st = p.stato || "Disoccupato";
      elStatoBadge.textContent = st;
      if (st.toLowerCase().includes("occupato")) {
        elStatoBadge.className = "px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs";
      } else if (st.toLowerCase().includes("tirocinio")) {
        elStatoBadge.className = "px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs";
      } else if (st.toLowerCase().includes("disoccupato")) {
        elStatoBadge.className = "px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs";
      } else {
        elStatoBadge.className = "px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs";
      }
    }

    // 4. Radial Gauge Invalidità SVG
    const percIC = parseInt(p.icPercentuale) || 0;
    const elIcPerc = document.getElementById("hub-ic-perc");
    const elIcLabel = document.getElementById("hub-ic-label");
    const elRadialCircle = document.getElementById("hub-radial-circle");

    if (elIcPerc) elIcPerc.textContent = percIC > 0 ? `${percIC}%` : 'Art.18';
    if (elRadialCircle) {
      elRadialCircle.setAttribute("stroke-dasharray", `${Math.min(100, Math.max(0, percIC))}, 100`);
      if (percIC >= 67) {
        elRadialCircle.setAttribute("class", "text-rose-500");
        if (elIcLabel) { elIcLabel.textContent = "Disabilità Grave (≥67%)"; elIcLabel.className = "text-xs font-extrabold text-rose-600 font-heading"; }
      } else if (percIC >= 46) {
        elRadialCircle.setAttribute("class", "text-blue-500");
        if (elIcLabel) { elIcLabel.textContent = "Invalido L.68 (46-66%)"; elIcLabel.className = "text-xs font-extrabold text-blue-600 font-heading"; }
      } else {
        elRadialCircle.setAttribute("class", "text-emerald-500");
        if (elIcLabel) { elIcLabel.textContent = percIC > 0 ? "Invalidità Lieve (<46%)" : "Quota Art. 18"; elIcLabel.className = "text-xs font-extrabold text-emerald-600 font-heading"; }
      }
    }

    // 5. Alert Revisione Sanitaria ASL / INPS
    const elRevAlert = document.getElementById("hub-revisione-alert");
    const elRevText = document.getElementById("hub-revisione-text");
    if (elRevAlert && elRevText) {
      const revDateStr = p.diagnosiLastDataRevisione || p.dataRevisione;
      if (revDateStr) {
        const revDate = new Date(revDateStr);
        const today = new Date();
        const diffDays = Math.ceil((revDate - today) / (1000 * 60 * 60 * 24));
        const formattedRev = !isNaN(revDate) ? `${String(revDate.getDate()).padStart(2, '0')}/${String(revDate.getMonth()+1).padStart(2, '0')}/${revDate.getFullYear()}` : revDateStr;

        if (diffDays < 0) {
          elRevAlert.className = "flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold font-heading bg-rose-50 text-rose-700 border border-rose-200 animate-pulse";
          elRevText.textContent = `Revisione Sanitaria SCADUTA (${formattedRev})`;
          elRevAlert.classList.remove("hidden");
        } else if (diffDays <= 90) {
          elRevAlert.className = "flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold font-heading bg-amber-50 text-amber-800 border border-amber-200";
          elRevText.textContent = `Revisione Sanitaria in Scadenza: ${formattedRev} (tra ${diffDays} gg)`;
          elRevAlert.classList.remove("hidden");
        } else {
          elRevAlert.className = "hidden";
        }
      } else {
        elRevAlert.className = "hidden";
      }
    }

    // 6. Update Last Note Widget in Header
    const lastNoteBox = document.getElementById("hub-last-note-box");
    const lastNoteAuthor = document.getElementById("hub-last-note-author");
    const lastNoteDate = document.getElementById("hub-last-note-date");
    const lastNoteText = document.getElementById("hub-last-note-text");

    if (lastNoteAuthor && lastNoteDate && lastNoteText) {
      if (p.diario && p.diario.length > 0) {
        const latestNote = p.diario[0];
        const d = new Date(latestNote.data);
        const formattedDate = !isNaN(d) ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}` : latestNote.data;
        
        lastNoteAuthor.textContent = latestNote.autore || "Operatore";
        lastNoteDate.textContent = formattedDate;
        lastNoteText.textContent = latestNote.testo || latestNote.tipo || "Nessun dettaglio testo";
        if (lastNoteBox) lastNoteBox.title = `Autore: ${latestNote.autore} - Clicca per andare al diario`;
      } else {
        lastNoteAuthor.textContent = "Nessuna nota";
        lastNoteDate.textContent = "--/--/----";
        lastNoteText.textContent = "Nessuna annotazione presente nel diario";
      }
    }

    // Click on last note box jumps to Diario tab
    if (lastNoteBox) {
      lastNoteBox.onclick = () => {
        const diarioTabBtn = document.querySelector(".hub-tab-link[data-tab='hub-tab-diario']");
        if (diarioTabBtn) diarioTabBtn.click();
      };
    }

    // Render Integrated Timeline
    renderIntegratedTimeline(p);

    // --- TAB 1: ANAGRAFICA & CPI (IN-PLACE INPUT VALUES) ---
    const parts = (p.nome || "").split(" ");
    document.getElementById("ef-nome").value = p.first_name || p.nomeOnly || parts[0] || "";
    document.getElementById("ef-cognome").value = p.last_name || p.cognome || parts.slice(1).join(" ") || "";
    document.getElementById("ef-cf").value = p.codiceFiscale || "";
    document.getElementById("ef-num-iscriz").value = p.numeroIscrizione || "";
    document.getElementById("ef-codice").value = p.codice || "";
    document.getElementById("ef-data-nascita").value = p.dataNascita || "";
    document.getElementById("ef-nato-a").value = p.natoA || "";
    document.getElementById("ef-sesso").value = p.sesso || "M";
    document.getElementById("ef-patente").value = p.patente || "B";

    document.getElementById("ef-residenza").value = p.comuneResidenza || "";
    document.getElementById("ef-indirizzo").value = p.indirizzo || "";
    document.getElementById("ef-domicilio-comune").value = p.domicilioComune || "";
    document.getElementById("ef-domicilio-indirizzo").value = p.domicilioIndirizzo || "";

    document.getElementById("ef-tel").value = p.telefono || "";
    document.getElementById("ef-tel2").value = p.cellulare || p.telefono1 || "";
    document.getElementById("ef-email").value = p.email || "";
    document.getElementById("ef-stato-occup").value = p.stato || "Disoccupato";

    document.getElementById("ef-categoria").value = p.categoria || "C.O.";
    document.getElementById("ef-categoria-lg6869").value = p.categoriaLg6869 || "Art. 1 L.68/99";
    document.getElementById("ef-data-co").value = p.dataIscrizioneCO || p.dataIscrizioneFD || "";
    document.getElementById("ef-tipologia-lista").value = p.tipologiaIscrizioneLista || "Lista Unica Provinciale L.68/99";

    document.getElementById("ef-operatore").value = p.operatore || "CPI Lecco";
    document.getElementById("ef-segnalato").value = p.segnalatoDa || "";
    document.getElementById("ef-referente").value = p.referente || "";
    document.getElementById("ef-niscriz-manuale").value = p.nIscrizManuale || p.numeroIscrizione || "";

    // --- TAB 2: SANITARIO, DIAGNOSI & INPS (IN-PLACE INPUT VALUES) ---
    document.getElementById("ef-ic-perc").value = p.icPercentuale || 0;
    document.getElementById("ef-data-verbale").value = p.diagnosiLastDataDiagnosi || p.dataVerbale || "";
    document.getElementById("ef-verbale-num").value = p.diagnosiLastVerbale || "VERB-INPS-9942";
    document.getElementById("ef-data-revisione").value = p.diagnosiLastDataRevisione || "2028-11-20";

    document.getElementById("ef-tipo-minorazione").value = p.diagnosiLastTipoMinorazioni || "Motoria";
    document.getElementById("ef-invalido-psichico").value = p.diagnosiLastInvalidoPsichico || "NO";
    document.getElementById("ef-codice-asl").value = p.diagnosiLastCodiceAsl || "ASL-LC-01";
    document.getElementById("ef-desc-asl").value = p.diagnosiLastDescCodiceAsl || "ASST Lecco Ospedale Manzoni";

    document.getElementById("ef-patologia").value = p.diagnosiLastPatologia || "";
    document.getElementById("ef-handicap").value = p.diagnosiLastSituazioneHandicap || "Comma 1 Art. 3 L. 104/92";
    document.getElementById("ef-provenienza").value = p.diagnosiLastProvenienzaInformazioni || "Commissione Medica Integrata ATS Brianza";
    document.getElementById("ef-allegati-status").value = String(!!p.allegatiLg68);

    document.getElementById("ef-diagnosi").value = p.diagnosi || "";
    document.getElementById("ef-desc-supporto").value = p.diagnosiLastDescTipoSupporto || "";

    // Aggiornamento Stato Allegati Verbali Specifici
    const wallet = p.wallet || [];
    const docL68 = wallet.find(d => (d.nome && d.nome.toLowerCase().includes("l68")) || (d.tipo && d.tipo.toLowerCase().includes("legge 68")) || (d.tipo && d.tipo.toLowerCase().includes("verbale l.68")));
    const docIC = wallet.find(d => (d.nome && (d.nome.toLowerCase().includes("inps") || d.nome.toLowerCase().includes("invalidita") || d.nome.toLowerCase().includes("ic"))) || (d.tipo && d.tipo.toLowerCase().includes("inps")) || (d.tipo && d.tipo.toLowerCase().includes("invalidit")));

    const badgeL68 = document.getElementById("badge-verbale-l68");
    const btnPreviewL68 = document.getElementById("btn-preview-verbale-l68");
    if (badgeL68) {
      if (docL68) {
        badgeL68.textContent = "Allegato Presente";
        badgeL68.className = "text-[9px] font-bold px-2 py-0.2 rounded bg-emerald-100 text-emerald-800";
        if (btnPreviewL68) {
          btnPreviewL68.classList.remove("hidden");
          btnPreviewL68.onclick = () => {
            if (docL68.fileContent) {
              const win = window.open();
              if (win) win.document.write(`<iframe src="${docL68.fileContent}" style="width:100vw;height:100vh;border:none;"></iframe>`);
            } else {
              alert(`Documento presente nel fascicolo: ${docL68.nome}`);
            }
          };
        }
      } else {
        badgeL68.textContent = "Non allegato";
        badgeL68.className = "text-[9px] font-bold px-2 py-0.2 rounded bg-slate-200 text-slate-600";
        if (btnPreviewL68) btnPreviewL68.classList.add("hidden");
      }
    }

    const badgeIC = document.getElementById("badge-verbale-ic");
    const btnPreviewIC = document.getElementById("btn-preview-verbale-ic");
    if (badgeIC) {
      if (docIC) {
        badgeIC.textContent = "Allegato Presente";
        badgeIC.className = "text-[9px] font-bold px-2 py-0.2 rounded bg-emerald-100 text-emerald-800";
        if (btnPreviewIC) {
          btnPreviewIC.classList.remove("hidden");
          btnPreviewIC.onclick = () => {
            if (docIC.fileContent) {
              const win = window.open();
              if (win) win.document.write(`<iframe src="${docIC.fileContent}" style="width:100vw;height:100vh;border:none;"></iframe>`);
            } else {
              alert(`Documento presente nel fascicolo: ${docIC.nome}`);
            }
          };
        }
      } else {
        badgeIC.textContent = "Non allegato";
        badgeIC.className = "text-[9px] font-bold px-2 py-0.2 rounded bg-slate-200 text-slate-600";
        if (btnPreviewIC) btnPreviewIC.classList.add("hidden");
      }
    }

    // Trigger sync for all custom UI selects
    document.querySelectorAll("select").forEach(sel => {
      sel.dispatchEvent(new Event("updateCustomUI"));
    });

    // --- TAB 3: ISTRUZIONE (STUDIAMO EDITABILE IN-PLACE) ---
    const elTitoloLast = document.getElementById("ef-titolo-last");
    const elTitoloAnno = document.getElementById("ef-titolo-anno");
    const elTitoloVoto = document.getElementById("ef-titolo-voto");
    const elTitoloPresso = document.getElementById("ef-titolo-presso");
    const elQualifica = document.getElementById("ef-qualifica");
    const elPatente2 = document.getElementById("ef-patente-2");
    const elMuletto = document.getElementById("ef-muletto");
    const elEcdl = document.getElementById("ef-ecdl");
    const elInglese = document.getElementById("ef-inglese");
    const elSpagnolo = document.getElementById("ef-spagnolo");
    const elAltreLingue = document.getElementById("ef-altre-lingue");

    if (elTitoloLast) elTitoloLast.value = p.titoloStudioLast || "Diploma di Scuola Secondaria Superiore";
    if (elTitoloAnno) elTitoloAnno.value = p.anno || p.titoloStudioAnnoInizio || "1997";
    if (elTitoloVoto) elTitoloVoto.value = p.votazione || "85/100";
    if (elTitoloPresso) elTitoloPresso.value = p.titoloStudioPresso || p.istituto || "I.T.C. Viganò";
    if (elQualifica) elQualifica.value = p.qualifica || "Ragioniere Programmatore";
    if (elPatente2) elPatente2.value = p.patente || "B";
    if (elMuletto) elMuletto.value = String(!!p.patenteMuletto);
    if (elEcdl) elEcdl.value = p.ecdl || (p.usoPc ? "Sì (Certificato PC)" : "Base");
    if (elInglese) elInglese.value = p.inglese ? "Sì (Buono)" : "No";
    if (elSpagnolo) elSpagnolo.value = p.spagnolo ? "Sì" : "No";
    if (elAltreLingue) elAltreLingue.value = p.altreLingue || "Nessuna";

    // --- TAB 4: FUNZIONALE & MANSIONI ---
    renderFunzionaleTab(p);

    // --- TAB 5: DISPONIBILITA TAB ---
    renderDisponibilitaTab(p);

    // --- TAB 6: WALLET DOCUMENTALE ---
    renderWalletTab(p);

    // --- TAB 7: COMITATO TECNICO ASL ---
    renderComitatoTab(p);

    // --- TAB 8: PROGETTO INSERIMENTO (PIL L.68/99) ---
    renderPilTab(p);

    // --- TAB 9: DIARIO OPERATORE ---
    renderDiarioTab(p);
  }

  // --- RENDER DISPONIBILITA TAB ---
  function renderDisponibilitaTab(persona) {
    const disp = persona.disponibilita || {};

    const elOrario = document.getElementById("disp-orario");
    const elTurni = document.getElementById("disp-turni");
    const elRaggio = document.getElementById("disp-raggio");
    const elSede = document.getElementById("disp-sede");
    const elAutomunito = document.getElementById("disp-automunito");
    const elSmart = document.getElementById("disp-smart");
    const elNote = document.getElementById("disp-note");

    if (elOrario) elOrario.value = disp.orarioPreferito || "Part-Time 30h";
    if (elTurni) elTurni.value = disp.turni || (disp.disponibileTurni ? "Turni Diurni (Mattina/Pomeriggio)" : "Solo Diurno");
    if (elRaggio) elRaggio.value = disp.raggioMaxKm ? String(disp.raggioMaxKm) : "20";
    if (elSede) elSede.value = disp.sedeTerritoriale || "";
    if (elAutomunito) elAutomunito.value = disp.mezzoMunit !== undefined ? String(disp.mezzoMunit) : "true";
    if (elSmart) elSmart.value = disp.smartWorking !== undefined ? (disp.smartWorking ? "Ibrido" : "Solo Presenza") : "Ibrido";
    if (elNote) elNote.value = disp.noteDisponibilita || "";

    // Sync custom selects for Tab 5
    [elOrario, elTurni, elRaggio, elAutomunito, elSmart].forEach(el => {
      if (el) el.dispatchEvent(new Event("updateCustomUI"));
    });
  }

  // --- RENDER FUNZIONALE TAB ---
  function renderFunzionaleTab(p) {
    const funzContainer = document.getElementById("hub-funzionale-list");
    const flags = [
      { key: "stazioneEretta", label: "Stazione Eretta Prolungata", ok: p.stazioneEretta },
      { key: "movimentazioneManuale", label: "Movimentazione Carichi", ok: p.movimentazioneManuale },
      { key: "manualitaFine", label: "Manualità Fine Bilanciata", ok: p.manualitaFine },
      { key: "colonna", label: "Idoneità Colonna Vertebrale", ok: p.colonna },
      { key: "lavoriInAltezza", label: "Lavori in Altezza / Scale", ok: p.lavoriInAltezza },
      { key: "contattoPubblico", label: "Contatto Diretto col Pubblico", ok: p.contattoPubblico }
    ];

    if (funzContainer) {
      funzContainer.innerHTML = flags.map(f => `
        <label class="flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${f.ok ? 'bg-purple-50/70 text-purple-900 border-purple-200 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200'}">
          <span class="font-semibold text-xs">${f.label}</span>
          <input type="checkbox" data-flag="${f.key}" ${f.ok ? 'checked' : ''} class="cb-flag-func rounded border-slate-300 text-purple-600 focus:ring-0">
        </label>
      `).join("");
    }

    const mansContainer = document.getElementById("hub-mansioni-list");
    const mansioni = [
      { key: "impiegato", name: "Impiegato / Amministrativo", active: p.impiegato },
      { key: "cassa", name: "Addetto Cassa", active: p.cassa },
      { key: "commesso", name: "Commesso / Vendita", active: p.commesso },
      { key: "magazzino", name: "Magazziniere", active: p.magazzino },
      { key: "verde", name: "Manutenzione Verde", active: p.verde },
      { key: "socialeScuola", name: "Servizi Scolastici", active: p.socialeScuola },
      { key: "pulizie", name: "Addetto Pulizie", active: p.pulizie },
      { key: "impTecnico", name: "Impiegato Tecnico", active: p.impTecnico },
      { key: "receptionSegreteria", name: "Reception / Front Office", active: p.receptionSegreteria }
    ];

    if (mansContainer) {
      mansContainer.innerHTML = mansioni.map(m => `
        <label class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${m.active ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'} flex items-center space-x-2">
          <input type="checkbox" data-mansione="${m.key}" ${m.active ? 'checked' : ''} class="cb-mansione-chip rounded border-slate-300 text-blue-600 focus:ring-0">
          <span>${m.name}</span>
        </label>
      `).join("");
    }
  }

  // --- DIZIONARIO TERRITORIALE UFFICIALE COMUNI, PROVINCE E CAP ---
  const COMUNI_MAP = {
    "Lecco": { prov: "LC", cap: "23900" },
    "Abbadia Lariana": { prov: "LC", cap: "23821" },
    "Airuno": { prov: "LC", cap: "23881" },
    "Annone di Brianza": { prov: "LC", cap: "23841" },
    "Ballabio": { prov: "LC", cap: "23811" },
    "Barzanò": { prov: "LC", cap: "23891" },
    "Bellano": { prov: "LC", cap: "23822" },
    "Bosisio Parini": { prov: "LC", cap: "23842" },
    "Bulciago": { prov: "LC", cap: "23892" },
    "Calco": { prov: "LC", cap: "23885" },
    "Calolziocorte": { prov: "LC", cap: "23801" },
    "Carenno": { prov: "LC", cap: "23802" },
    "Casatenovo": { prov: "LC", cap: "23880" },
    "Cassago Brianza": { prov: "LC", cap: "23893" },
    "Cassina Valsassina": { prov: "LC", cap: "23817" },
    "Castello di Brianza": { prov: "LC", cap: "23884" },
    "Cernusco Lombardone": { prov: "LC", cap: "23870" },
    "Cesana Brianza": { prov: "LC", cap: "23861" },
    "Civate": { prov: "LC", cap: "23862" },
    "Colico": { prov: "LC", cap: "23823" },
    "Colle Brianza": { prov: "LC", cap: "23886" },
    "Costa Masnaga": { prov: "LC", cap: "23845" },
    "Cremella": { prov: "LC", cap: "23894" },
    "Cremeno": { prov: "LC", cap: "23814" },
    "Dervio": { prov: "LC", cap: "23824" },
    "Dolzago": { prov: "LC", cap: "23843" },
    "Galbiate": { prov: "LC", cap: "23851" },
    "Garlate": { prov: "LC", cap: "23852" },
    "Imbersago": { prov: "LC", cap: "23898" },
    "Introbio": { prov: "LC", cap: "23815" },
    "Lomagna": { prov: "LC", cap: "23871" },
    "Malgrate": { prov: "LC", cap: "23864" },
    "Mandello del Lario": { prov: "LC", cap: "23826" },
    "Merate": { prov: "LC", cap: "23807" },
    "Missaglia": { prov: "LC", cap: "23873" },
    "Molteno": { prov: "LC", cap: "23847" },
    "Monte Marenzo": { prov: "LC", cap: "23804" },
    "Montevecchia": { prov: "LC", cap: "23874" },
    "Monticello Brianza": { prov: "LC", cap: "23876" },
    "Nibionno": { prov: "LC", cap: "23895" },
    "Oggiono": { prov: "LC", cap: "23848" },
    "Olgiate Molgora": { prov: "LC", cap: "23887" },
    "Olginate": { prov: "LC", cap: "23854" },
    "Osnago": { prov: "LC", cap: "23875" },
    "Paderno d'Adda": { prov: "LC", cap: "23877" },
    "Robbiate": { prov: "LC", cap: "23899" },
    "Rogeno": { prov: "LC", cap: "23849" },
    "Sirone": { prov: "LC", cap: "23844" },
    "Sirtori": { prov: "LC", cap: "23888" },
    "Valgreghentino": { prov: "LC", cap: "23857" },
    "Valmadrera": { prov: "LC", cap: "23868" },
    "Varenna": { prov: "LC", cap: "23829" },
    "Vercurago": { prov: "LC", cap: "23808" },
    "Verderio": { prov: "LC", cap: "23879" },
    "Viganò": { prov: "LC", cap: "23896" },
    "Milano": { prov: "MI", cap: "20100" },
    "Monza": { prov: "MB", cap: "20900" },
    "Como": { prov: "CO", cap: "22100" },
    "Bergamo": { prov: "BG", cap: "24100" }
  };

  function updateComuneGeoData() {
    const comRes = document.getElementById("ef-residenza").value;
    const geoRes = COMUNI_MAP[comRes] || { prov: "LC", cap: "23900" };
    document.getElementById("ef-residenza-prov").value = geoRes.prov;
    document.getElementById("ef-residenza-cap").value = geoRes.cap;

    const comDom = document.getElementById("ef-domicilio-comune").value;
    const geoDom = COMUNI_MAP[comDom] || { prov: "LC", cap: "23900" };
    document.getElementById("ef-domicilio-prov").value = geoDom.prov;
    document.getElementById("ef-domicilio-cap").value = geoDom.cap;
  }

  document.getElementById("ef-residenza").addEventListener("change", updateComuneGeoData);
  document.getElementById("ef-domicilio-comune").addEventListener("change", updateComuneGeoData);

  // --- APEXCHARTS RADIAL BAR RENDERER ---
  let apexChartIC = null;
  function renderApexRadialIC(percent) {
    const container = document.getElementById("hub-ic-radial-chart");
    if (!container || typeof ApexCharts === "undefined") return;

    const val = Math.min(Math.max(percent, 0), 100);
    const color = val >= 67 ? "#e11d48" : val >= 46 ? "#2563eb" : "#059669";

    const options = {
      series: [val],
      chart: {
        height: 110,
        width: 110,
        type: 'radialBar',
        sparkline: { enabled: true }
      },
      plotOptions: {
        radialBar: {
          hollow: { size: '55%' },
          track: { background: '#f1f5f9', strokeWidth: '100%' },
          dataLabels: {
            name: { show: false },
            value: {
              offsetY: 5,
              fontSize: '15px',
              fontWeight: 800,
              fontFamily: 'Outfit, sans-serif',
              color: color,
              formatter: (v) => `${v}%`
            }
          }
        }
      },
      colors: [color],
      stroke: { lineCap: 'round' }
    };

    if (apexChartIC) {
      apexChartIC.destroy();
    }
    container.innerHTML = "";
    apexChartIC = new ApexCharts(container, options);
    apexChartIC.render();
  }

  // --- GESTIONE ISCRIZIONE L.68/99 CON STEPPER WIZARD SU MYSQL ---
  // (I pulsanti #btn-quick-new-persona e #btn-nuovo-iscritto aprono il Wizard ufficiale collegato direttamente a MySQL)

  // --- SAVE INLINE IN-PLACE EDITING FROM CITIZEN HUB ---
  const btnSaveInline = document.getElementById("btn-save-inline-hub");
  if (btnSaveInline) {
    btnSaveInline.addEventListener("click", async () => {
      const p = window.store.getSelectedPersona();
      if (!p) return;

      const first = document.getElementById("ef-nome").value.trim();
      const last = document.getElementById("ef-cognome").value.trim();
      const cf = document.getElementById("ef-cf").value.trim().toUpperCase();

      if (!first || !cf) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: 'warning',
            title: 'Campi Obbligatori Mancanti',
            text: 'Nome e Codice Fiscale sono campi obbligatori per il salvataggio.',
            confirmButtonColor: '#2563eb'
          });
        } else {
          alert("Attenzione: Nome e Codice Fiscale sono campi obbligatori.");
        }
        return;
      }

      // Collect functional flags
      const funzPayload = {};
      document.querySelectorAll(".cb-flag-func").forEach(cb => {
        funzPayload[cb.getAttribute("data-flag")] = cb.checked;
      });

      // Collect mansioni flags
      const mansPayload = {};
      document.querySelectorAll(".cb-mansione-chip").forEach(cb => {
        mansPayload[cb.getAttribute("data-mansione")] = cb.checked;
      });

      const updatedPayload = {
        nome: `${first} ${last}`.trim(),
        first_name: first,
        cognome: last,
        codiceFiscale: cf,
        numeroIscrizione: parseInt(document.getElementById("ef-num-iscriz").value) || p.numeroIscrizione,
        dataNascita: document.getElementById("ef-data-nascita").value,
        natoA: document.getElementById("ef-nato-a").value,
        sesso: document.getElementById("ef-sesso").value,
        patente: document.getElementById("ef-patente").value,
        comuneResidenza: document.getElementById("ef-residenza").value,
        residenzaProvincia: document.getElementById("ef-residenza-prov").value,
        residenzaCap: document.getElementById("ef-residenza-cap").value,
        indirizzo: document.getElementById("ef-indirizzo").value,
        domicilioComune: document.getElementById("ef-domicilio-comune").value,
        domicilioProvincia: document.getElementById("ef-domicilio-prov").value,
        domicilioCap: document.getElementById("ef-domicilio-cap").value,
        domicilioIndirizzo: document.getElementById("ef-domicilio-indirizzo").value,
        telefono: document.getElementById("ef-tel").value,
        cellulare: document.getElementById("ef-tel2").value,
        email: document.getElementById("ef-email").value,
        stato: document.getElementById("ef-stato-occup").value,
        categoria: document.getElementById("ef-categoria").value,
        categoriaLg6869: document.getElementById("ef-categoria-lg6869").value,
        dataIscrizioneCO: document.getElementById("ef-data-co").value,
        tipologiaIscrizioneLista: document.getElementById("ef-tipologia-lista").value,
        operatore: document.getElementById("ef-operatore").value,
        segnalatoDa: document.getElementById("ef-segnalato").value,
        referente: document.getElementById("ef-referente").value,
        nIscrizManuale: parseInt(document.getElementById("ef-niscriz-manuale").value) || p.numeroIscrizione,

        icPercentuale: parseInt(document.getElementById("ef-ic-perc").value) || 0,
        diagnosiLastDataDiagnosi: document.getElementById("ef-data-verbale").value,
        dataVerbale: document.getElementById("ef-data-verbale").value,
        diagnosiLastVerbale: document.getElementById("ef-verbale-num").value,
        diagnosiLastDataRevisione: document.getElementById("ef-data-revisione").value,
        diagnosiLastTipoMinorazioni: document.getElementById("ef-tipo-minorazione").value,
        diagnosiLastInvalidoPsichico: document.getElementById("ef-invalido-psichico").value,
        diagnosiLastCodiceAsl: document.getElementById("ef-codice-asl").value,
        diagnosiLastDescCodiceAsl: document.getElementById("ef-desc-asl").value,
        diagnosiLastPatologia: document.getElementById("ef-patologia").value,
        diagnosiLastSituazioneHandicap: document.getElementById("ef-handicap").value,
        diagnosiLastProvenienzaInformazioni: document.getElementById("ef-provenienza").value,
        allegatiLg68: document.getElementById("ef-allegati-status").value === "true",
        diagnosi: document.getElementById("ef-diagnosi").value,
        diagnosiLastDescTipoSupporto: document.getElementById("ef-desc-supporto").value,

        // Studiamo (Istruzione)
        titoloStudioLast: document.getElementById("ef-titolo-last").value,
        anno: document.getElementById("ef-titolo-anno").value,
        votazione: document.getElementById("ef-titolo-voto").value,
        titoloStudioPresso: document.getElementById("ef-titolo-presso").value,
        qualifica: document.getElementById("ef-qualifica").value,
        patenteMuletto: document.getElementById("ef-muletto").value === "true",
        ecdl: document.getElementById("ef-ecdl").value,
        inglese: document.getElementById("ef-inglese").value.includes("Sì"),
        spagnolo: document.getElementById("ef-spagnolo").value === "Sì",
        altreLingue: document.getElementById("ef-altre-lingue").value,

        ...funzPayload,
        ...mansPayload
      };

      try {
        await window.store.updatePersona(p.id, updatedPayload);

        // Hide Sticky Save Bar
        const stickyBar = document.getElementById("hub-sticky-save-bar");
        if (stickyBar) stickyBar.classList.add("hidden");

        RoxToast.success("Scheda Salvata", "Tutte le modifiche sono state memorizzate sul database MySQL.");
        renderCitizenHub();
      } catch (err) {
        console.error("Errore salvataggio scheda:", err);
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: 'error',
            title: 'Errore Aggiornamento MySQL',
            text: err.message || 'Impossibile aggiornare la scheda su MySQL.',
            confirmButtonColor: '#ef4444'
          });
        } else {
          alert(`Errore salvataggio MySQL: ${err.message}`);
        }
      }
    });
  }

  // --- FLOATING STICKY SAVE BAR & DIRTY TRACKING ---
  const stickySaveBtn = document.getElementById("btn-sticky-save");
  if (stickySaveBtn && btnSaveInline) {
    stickySaveBtn.addEventListener("click", () => {
      btnSaveInline.click();
    });
  }

  // Dirty field change listener in Hub to reveal sticky save bar
  document.querySelectorAll("#section-citizen-hub input, #section-citizen-hub select, #section-citizen-hub textarea").forEach(input => {
    input.addEventListener("input", () => {
      const stickyBar = document.getElementById("hub-sticky-save-bar");
      if (stickyBar) stickyBar.classList.remove("hidden");
    });
    input.addEventListener("change", () => {
      const stickyBar = document.getElementById("hub-sticky-save-bar");
      if (stickyBar) stickyBar.classList.remove("hidden");
    });
  });

  // --- PREV / NEXT CITIZEN FAST NAVIGATION CONTROLLER ---
  const btnFastPrev = document.getElementById("btn-hub-prev-persona");
  const btnFastNext = document.getElementById("btn-hub-next-persona");

  if (btnFastPrev) {
    btnFastPrev.addEventListener("click", () => {
      const persone = window.store.getPersone();
      const current = window.store.getSelectedPersona();
      if (!current) return;
      const idx = persone.findIndex(item => item.id === current.id);
      if (idx > 0) {
        window.store.setSelectedPersonaId(persone[idx - 1].id);
        const stickyBar = document.getElementById("hub-sticky-save-bar");
        if (stickyBar) stickyBar.classList.add("hidden");
        renderCitizenHub();
      }
    });
  }

  if (btnFastNext) {
    btnFastNext.addEventListener("click", () => {
      const persone = window.store.getPersone();
      const current = window.store.getSelectedPersona();
      if (!current) return;
      const idx = persone.findIndex(item => item.id === current.id);
      if (idx !== -1 && idx < persone.length - 1) {
        window.store.setSelectedPersonaId(persone[idx + 1].id);
        const stickyBar = document.getElementById("hub-sticky-save-bar");
        if (stickyBar) stickyBar.classList.add("hidden");
        renderCitizenHub();
      }
    });
  }

  // --- RENDER INTEGRATED TIMELINE (PERCORSO DI VITA & PRESA IN CARICO) ---
  function renderIntegratedTimeline(p) {
    const container = document.getElementById("hub-integrated-timeline");
    if (!container) return;

    const events = [];

    // 1. Data Iscrizione CO
    if (p.dataIscrizioneCO) {
      events.push({
        date: p.dataIscrizioneCO,
        tipo: "ISCRIZIONE_L68",
        title: "Iscrizione Collocamento Mirato L.68/99",
        subtitle: `Iscrizione formale nella graduatoria ${escapeHtml(p.categoria || 'C.O.')} (N. Pratica #${p.numeroIscrizione})`,
        icon: "fa-solid fa-id-card",
        color: "bg-blue-600",
        badge: "Iscrizione Lista"
      });
    }

    // 2. Verbali ASL
    const comitatoList = window.store.getComitatoTecnicoByNumIscriz(p.numeroIscrizione);
    comitatoList.forEach(c => {
      events.push({
        date: c.dataSeduta || "2026-01-01",
        tipo: "COMITATO_ASL",
        title: `Verbale Comitato Tecnico ASL N. ${c.numPratica || 'N/D'}`,
        subtitle: `Prognosi lavorativa: "${escapeHtml(c.prognosi || 'Idoneo con limitazioni')}" - Presieduto da: ${escapeHtml(c.responsabile || 'ASST Lecco')}`,
        icon: "fa-solid fa-building-columns",
        color: "bg-cyan-600",
        badge: "Collegio ASL"
      });
    });

    // 3. Progetti PIL
    const pilList = window.store.getProgettiPILByNumIscriz ? window.store.getProgettiPILByNumIscriz(p.numeroIscrizione) : [];
    pilList.forEach(pil => {
      events.push({
        date: pil.data || "2026-02-01",
        tipo: "PROGETTO_PIL",
        title: `Progetto Inserimento Lavorativo (PIL) - ${escapeHtml(pil.ente || 'Dote Unica Lavoro')}`,
        subtitle: `Obiettivo: ${escapeHtml(pil.obiettivo || 'Tirocinio Inclusivo')} &bull; Tutor: ${escapeHtml(pil.tutor || 'Operatore CPI')}`,
        icon: "fa-solid fa-file-signature",
        color: "bg-teal-600",
        badge: "Progetto PIL"
      });
    });

    // 4. Note Diario Operatore
    if (p.diario && Array.isArray(p.diario)) {
      p.diario.forEach(d => {
        events.push({
          date: d.data,
          tipo: "DIARIO",
          title: `Colloquio & Diario: ${escapeHtml(d.tipo || 'Colloquio DID')}`,
          subtitle: `${escapeHtml(d.testo || '')} (Autore: ${escapeHtml(d.autore || 'Operatore')})`,
          icon: "fa-solid fa-book-bookmark",
          color: "bg-amber-600",
          badge: "Colloquio CPI"
        });
      });
    }

    // 5. Revisione Sanitaria Future/Passata
    if (p.diagnosiLastDataRevisione || p.dataRevisione) {
      const dRev = p.diagnosiLastDataRevisione || p.dataRevisione;
      events.push({
        date: dRev,
        tipo: "REVISIONE",
        title: "Scadenza / Revisione Verbale Sanitario",
        subtitle: `Data limite indicata nel verbale INPS/ASL per la visita di revisione collegiale`,
        icon: "fa-solid fa-triangle-exclamation",
        color: "bg-rose-600",
        badge: "Revisione INPS"
      });
    }

    // Sort descending by date
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (events.length === 0) {
      container.innerHTML = `<div class="py-8 text-center text-slate-400 italic text-xs">Nessun evento registrato nella cronistoria dell'iscritto.</div>`;
      return;
    }

    container.innerHTML = events.map(ev => {
      const d = new Date(ev.date);
      const dateFormatted = !isNaN(d) ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}` : ev.date;

      return `
        <div class="relative flex items-start space-x-3 group">
          <div class="absolute -left-6 sm:-left-8 mt-1.5 w-6 h-6 rounded-full ${ev.color} text-white flex items-center justify-center text-[10px] shadow-sm ring-4 ring-white">
            <i class="${ev.icon}"></i>
          </div>
          <div class="flex-1 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 space-y-1.5 hover:bg-white hover:border-slate-300 hover:shadow-2xs transition">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span class="text-xs font-bold text-slate-900 font-heading flex items-center gap-2">
                ${ev.title}
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">${ev.badge}</span>
              </span>
              <span class="text-[10px] font-mono font-bold text-slate-500">${dateFormatted}</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed font-medium">${ev.subtitle}</p>
          </div>
        </div>
      `;
    }).join("");
  }

  // --- DOSSIER CITTADINO L.68/99 FULL COMPREHENSIVE PDF GENERATOR ---
  const btnExportDossier = document.getElementById("btn-export-dossier-pdf");
  if (btnExportDossier) {
    btnExportDossier.addEventListener("click", () => {
      const p = window.store.getSelectedPersona();
      if (!p) {
        RoxToast.warning("Attenzione", "Nessun iscritto selezionato.");
        return;
      }
      generateDossierReportPDF(p);
    });
  }

  function generateDossierReportPDF(p) {
    const logo1 = localStorage.getItem("ROXANNE_PDF_LOGO_1") || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Provincia_di_Lecco-Stemma.svg/120px-Provincia_di_Lecco-Stemma.svg.png";
    const logo2 = localStorage.getItem("ROXANNE_PDF_LOGO_2") || "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Lombardia-Bandiera.svg/180px-Lombardia-Bandiera.svg.png";
    const logo3 = localStorage.getItem("ROXANNE_PDF_LOGO_3") || "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Lombardia-Bandiera.svg/180px-Lombardia-Bandiera.svg.png";

    const printWin = window.open('', '_blank');
    if (!printWin) {
      alert("Permetti l'apertura dei popup per visualizzare e stampare il Dossier PDF.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <title>Dossier_Iscritto_${escapeHtml(p.codiceFiscale || 'L68')}.pdf</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700;900&display=swap" rel="stylesheet">
        <style>
          @page { size: A4 portrait; margin: 12mm 15mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Titillium Web', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #0f172a;
            background: #ffffff;
            font-size: 9.5pt;
            line-height: 1.35;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            position: fixed; top: 0; left: 0; right: 0;
            background: #0f172a; color: white; padding: 10px 20px;
            display: flex; justify-content: space-between; align-items: center;
            z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .btn-print {
            background: #0284c7; color: white; border: none; padding: 8px 18px;
            border-radius: 6px; font-weight: 700; font-size: 11pt; cursor: pointer;
            font-family: 'Titillium Web', sans-serif;
          }
          .content-wrapper { padding-top: 50px; }
          @media print {
            .no-print { display: none !important; }
            .content-wrapper { padding-top: 0 !important; }
            .page-break { page-break-before: always; }
          }
          .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          .header-table td { vertical-align: middle; border: none; }
          .logo-img { max-height: 50px; max-width: 140px; object-fit: contain; }
          .title-box {
            text-align: center; border-top: 2px solid #0284c7; border-bottom: 2px solid #0284c7;
            padding: 6px 0; margin-bottom: 12px; background: #f8fafc;
          }
          .title-box h1 { font-size: 13pt; font-weight: 900; text-transform: uppercase; color: #0f172a; letter-spacing: 0.5px; }
          .title-box p { font-size: 9pt; font-weight: 600; color: #0284c7; text-transform: uppercase; }
          
          .section-title {
            background: #0f172a; color: #ffffff; padding: 4px 10px; font-weight: 800; font-size: 9.5pt;
            text-transform: uppercase; letter-spacing: 0.5px; border-radius: 4px 4px 0 0; margin-top: 10px;
          }
          .table-data { width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 10px; }
          .table-data td, .table-data th {
            border: 1px solid #cbd5e1; padding: 5px 8px; font-size: 9pt; vertical-align: top;
          }
          .lbl { font-weight: 700; color: #475569; background: #f8fafc; width: 22%; text-transform: uppercase; font-size: 8.5pt; }
          .val { font-weight: 600; color: #0f172a; }
          .highlight { font-weight: 800; color: #0284c7; font-size: 10pt; }
          .chip { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 8pt; font-weight: 700; background: #e0f2fe; color: #0369a1; }
        </style>
      </head>
      <body>
        <div class="no-print">
          <span style="font-weight: 700; font-size: 11pt;">Dossier Fascicolo Elettronico Iscritto L.68/99</span>
          <button class="btn-print" onclick="window.print()">Stampa / Salva in PDF</button>
        </div>

        <div class="content-wrapper">
          <!-- Institutional Header Logos -->
          <table class="header-table">
            <tr>
              <td style="width: 25%; text-align: left;"><img src="${logo1}" class="logo-img" alt="Ente Territoriale"></td>
              <td style="width: 50%; text-align: center;"><img src="${logo2}" class="logo-img" alt="Lavoro Lombardia"></td>
              <td style="width: 25%; text-align: right;"><img src="${logo3}" class="logo-img" alt="ASST Sanità"></td>
            </tr>
          </table>

          <div class="title-box">
            <h1>FASCICOLO INTEGRATO COLLOCAMENTO MIRATO L. 68/99</h1>
            <p>Centro per l'Impiego &bull; Scheda Anagrafica, Clinica & Funzionale 360°</p>
          </div>

          <!-- Section 1: Anagrafica -->
          <div class="section-title">1. Dati Anagrafici & Identificativi Cittadino</div>
          <table class="table-data">
            <tr>
              <td class="lbl">Nominativo</td>
              <td class="val highlight">${escapeHtml(p.nome || '-')}</td>
              <td class="lbl">Codice Fiscale</td>
              <td class="val font-mono highlight">${escapeHtml(p.codiceFiscale || '-')}</td>
            </tr>
            <tr>
              <td class="lbl">N. Iscrizione L.68</td>
              <td class="val"><strong>#${p.numeroIscrizione || '-'}</strong> (${escapeHtml(p.codice || '')})</td>
              <td class="lbl">Data & Luogo Nascita</td>
              <td class="val">${p.dataNascita ? p.dataNascita.split('T')[0] : '-'} (${escapeHtml(p.natoA || 'N/D')}) &bull; Sesso: ${p.sesso || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Residenza</td>
              <td class="val">${escapeHtml(p.indirizzo || '')}, ${escapeHtml(p.comuneResidenza || 'Lecco')} (${escapeHtml(p.residenzaProvincia || 'LC')})</td>
              <td class="lbl">Recapiti</td>
              <td class="val">Tel: ${escapeHtml(p.cellulare || p.telefono || '-')} &bull; Email: ${escapeHtml(p.email || '-')}</td>
            </tr>
            <tr>
              <td class="lbl">Categoria L.68/99</td>
              <td class="val"><span class="chip">${escapeHtml(p.categoria || 'C.O.')} - ${escapeHtml(p.categoriaLg6869 || 'Art.1')}</span></td>
              <td class="lbl">Stato Occupazionale</td>
              <td class="val"><strong>${escapeHtml(p.stato || 'Disoccupato')}</strong> (Attivo: ${escapeHtml(p.attivoNonAttivo || 'Attivo')})</td>
            </tr>
          </table>

          <!-- Section 2: Quadro Clinico & Disabilità -->
          <div class="section-title">2. Quadro Sanitario, Diagnosi & Percentuale Invalidità</div>
          <table class="table-data">
            <tr>
              <td class="lbl">% Invalidità Civile</td>
              <td class="val highlight" style="color: #e11d48; font-size: 11pt;">${p.icPercentuale || 0}% IC</td>
              <td class="lbl">Verbale ASL / INPS</td>
              <td class="val">N. ${escapeHtml(p.diagnosiLastVerbale || 'INPS-9942')} del ${p.dataVerbale || '-'}</td>
            </tr>
            <tr>
              <td class="lbl">Tipologia Minorazione</td>
              <td class="val">${escapeHtml(p.diagnosiLastTipoMinorazioni || 'Motoria')} (Psichico: ${escapeHtml(p.diagnosiLastInvalidoPsichico || 'NO')})</td>
              <td class="lbl">Revisione Sanitaria</td>
              <td class="val" style="font-weight: 700; color: #c2410c;">${p.diagnosiLastDataRevisione || p.dataRevisione || 'Non prevista'}</td>
            </tr>
            <tr>
              <td class="lbl">Diagnosi Funzionale</td>
              <td class="val" colspan="3">${escapeHtml(p.diagnosi || p.diagnosiLastPatologia || 'Nessuna diagnosi esplicita registrata')}</td>
            </tr>
            <tr>
              <td class="lbl">Supporti Necessari</td>
              <td class="val" colspan="3">${escapeHtml(p.diagnosiLastDescTipoSupporto || 'Nessun ausilio di postazione segnalato')}</td>
            </tr>
          </table>

          <!-- Section 3: Istruzione & Competenze -->
          <div class="section-title">3. Istruzione, Formazione & Competenze</div>
          <table class="table-data">
            <tr>
              <td class="lbl">Titolo di Studio</td>
              <td class="val">${escapeHtml(p.titoloStudioLast || 'Diploma di Scuola Superiore')} (${escapeHtml(p.anno || '-')})</td>
              <td class="lbl">Istituto / Votazione</td>
              <td class="val">${escapeHtml(p.titoloStudioPresso || '-')} (Voto: ${escapeHtml(p.votazione || '-')})</td>
            </tr>
            <tr>
              <td class="lbl">Competenze PC / ECDL</td>
              <td class="val">${escapeHtml(p.ecdl || 'Sì')}</td>
              <td class="lbl">Patenti di Guida</td>
              <td class="val">Patente: ${escapeHtml(p.patente || 'B')} &bull; Muletto: ${p.patenteMuletto ? 'Sì' : 'No'}</td>
            </tr>
          </table>

          <!-- Section 4: Capacità & Disponibilità -->
          <div class="section-title">4. Capacità Funzionali Lavorative & Disponibilità Oraria</div>
          <table class="table-data">
            <tr>
              <td class="lbl">Orario & Raggio Km</td>
              <td class="val"><strong>${escapeHtml(p.disponibilita ? p.disponibilita.orarioPreferito : 'Full-Time')}</strong> (Raggio max: ${p.disponibilita ? p.disponibilita.raggioMaxKm : '25'} Km)</td>
              <td class="lbl">Condizioni Logistiche</td>
              <td class="val">Automunito: ${p.disponibilita && p.disponibilita.mezzoMunit ? 'Sì' : 'No'} &bull; Smartworking: ${p.disponibilita && p.disponibilita.smartWorking ? 'Sì' : 'No'}</td>
            </tr>
          </table>

          <!-- Footer Signatures -->
          <table style="width: 100%; margin-top: 30px; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; text-align: center; border: none;">
                <p style="font-size: 9pt; color: #64748b; font-weight: 700;">L'OPERATORE DEL COLLOCAMENTO MIRATO</p>
                <div style="margin-top: 35px; border-bottom: 1px dashed #94a3b8; width: 70%; margin-left: auto; margin-right: auto;"></div>
                <p style="font-size: 8.5pt; font-weight: 700; color: #0f172a; margin-top: 4px;">${escapeHtml(p.operatore || 'Centro per l\'Impiego')}</p>
              </td>
              <td style="width: 50%; text-align: center; border: none;">
                <p style="font-size: 9pt; color: #64748b; font-weight: 700;">IL CITTADINO ISCRITTO (L.68/99)</p>
                <div style="margin-top: 35px; border-bottom: 1px dashed #94a3b8; width: 70%; margin-left: auto; margin-right: auto;"></div>
                <p style="font-size: 8.5pt; font-weight: 700; color: #0f172a; margin-top: 4px;">${escapeHtml(p.nome || '')}</p>
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  }

  // --- SAVE DISPONIBILITA FORM ---
  const formDisp = document.getElementById("form-disponibilita-hub");
  if (formDisp) {
    formDisp.addEventListener("submit", (e) => {
      e.preventDefault();
      const p = window.store.getSelectedPersona();
      if (!p) return;

      const disponibilitaData = {
        orarioPreferito: document.getElementById("disp-orario").value,
        turni: document.getElementById("disp-turni").value,
        raggioMaxKm: parseInt(document.getElementById("disp-raggio").value) || 20,
        sedeTerritoriale: document.getElementById("disp-sede").value,
        mezzoMunit: document.getElementById("disp-automunito").value === "true",
        smartWorking: document.getElementById("disp-smart").value,
        noteDisponibilita: document.getElementById("disp-note").value
      };

      window.store.updatePersona(p.id, { disponibilita: disponibilitaData });
      
      if (typeof Swal !== "undefined") {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Disponibilità lavorativa salvata!',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        alert("Disponibilità aggiornata con successo!");
      }
      renderCitizenHub();
    });
  }

window.initHubSubTabs = initHubSubTabs;
window.renderCitizenHub = renderCitizenHub;
window.exportStampaScheda = exportStampaScheda;
