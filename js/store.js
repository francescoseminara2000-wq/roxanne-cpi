/**
 * Chrono Stellar - LocalStore Manager
 * Gestione dello stato e permanenza LocalStorage con Wallet & Disponibilità
 */

class StoreManager {
  constructor() {
    // Pulisci eventuale cache obsoleta da LocalStorage
    try {
      localStorage.removeItem("ROXANNE_CPI_LIGHT_DB");
      localStorage.removeItem("ROXANNE_CPI_DATA");
    } catch (e) {}

    this.data = this.loadData();
    this.selectedPersonaId = null;
    
    // Audit Logs (tracciamento di sessione)
    const savedAudit = localStorage.getItem("ROXANNE_AUDIT_LOGS");
    this.auditLogs = savedAudit ? JSON.parse(savedAudit) : [
      { id: 101, timestamp: "2026-09-01 10:15:22", operatore: "Marco Galli (Admin CPI)", azione: "ACCESSO_SCHEDA", modulo: "Scheda Cittadino", target: "Mario Rossi (#10452)", dettagli: "Consultazione completa 360°" },
      { id: 102, timestamp: "2026-09-01 11:04:10", operatore: "Elena Bianchi (Operatore SILV)", azione: "CARICAMENTO_WALLET", modulo: "Wallet Documentale", target: "Mario Rossi (#10452)", dettagli: "Caricato Verbale_INPS_2026.pdf" },
      { id: 103, timestamp: "2026-09-01 14:30:00", operatore: "Roberto Rossi (Tutor L.68)", azione: "AGGIUNTA_NOTA", modulo: "Diario Operatore", target: "Mario Rossi (#10452)", dettagli: "Inserita nota diario colloquio DID" }
    ];

    this.activeUser = "Marco Galli (Admin CPI)";
  }

  getActiveUser() {
    return this.activeUser || "Marco Galli (Admin CPI)";
  }

  setActiveUser(userName) {
    this.activeUser = userName;
    this.addAuditLog("CAMBIO_OPERATORE", "Sistema", "Sessione", `Operatore loggato cambiato in ${userName}`);
  }

  getAuditLogs() {
    return this.auditLogs || [];
  }

  addAuditLog(azione, modulo, target, dettagli) {
    const log = {
      id: Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatore: this.getActiveUser(),
      azione: azione,
      modulo: modulo,
      target: target || "-",
      dettagli: dettagli || ""
    };

    if (!this.auditLogs) this.auditLogs = [];
    this.auditLogs.unshift(log);
    try {
      localStorage.setItem("ROXANNE_AUDIT_LOGS", JSON.stringify(this.auditLogs));
    } catch(e) {}
  }

  loadData() {
    // Nessun caricamento da LocalStorage: lo stato vive in memoria ed è popolato esclusivamente dal database MySQL
    return {
      persone: [],
      avviamenti: [],
      comitatoTecnico: [],
      noteDiario: [],
      progettiInserimentoLav: []
    };
  }

  saveData() {
    // Nessun salvataggio in locale: tutte le operazioni persistono unicamente su MySQL
  }

  resetToDefault() {
    // Inizializza memoria vuota e forza sincronizzazione con MySQL
    this.data = this.loadData();
    this.selectedPersonaId = null;
    return this.initRemoteSync();
  }

  async initRemoteSync() {
    try {
      const res = await fetch('/api/persone');
      if (res.ok) {
        const personeDb = await res.json();
        if (Array.isArray(personeDb)) {
          this.data.persone = personeDb;

          // Popola lo store relazionale con tutti i record collegati caricati da MySQL
          this.data.comitatoTecnico = [];
          this.data.noteDiario = [];
          this.data.progettiInserimentoLav = [];

          personeDb.forEach(p => {
            if (Array.isArray(p.comitatoTecnico)) {
              this.data.comitatoTecnico.push(...p.comitatoTecnico);
            }
            if (Array.isArray(p.noteDiario)) {
              this.data.noteDiario.push(...p.noteDiario);
            }
            if (Array.isArray(p.progettiPIL)) {
              this.data.progettiInserimentoLav.push(...p.progettiPIL);
            }
          });

          // Controlla se c'era una persona già memorizzata esplicitamente
          const urlParams = new URLSearchParams(window.location.search);
          const paramId = urlParams.get("personaId") || urlParams.get("id");
          const storedId = paramId || sessionStorage.getItem("ROXANNE_SELECTED_PERSONA_ID") || localStorage.getItem("ROXANNE_SELECTED_PERSONA_ID");
          if (storedId && this.data.persone.some(p => p.id === parseInt(storedId))) {
            this.selectedPersonaId = parseInt(storedId);
          } else {
            this.selectedPersonaId = null;
          }

          console.log(`[MySQL Sync] Sincronizzati ${personeDb.length} iscritti dal Database con relative note, verbali e progetti PIL.`);
          if (typeof window.renderMainSearchTable === "function") window.renderMainSearchTable();
          if (typeof window.renderCitizenHub === "function") window.renderCitizenHub();
          if (typeof window.renderDashboardAnalytics === "function") window.renderDashboardAnalytics();

          // Se l'utente era nella Scheda Cittadino o in altra vista, ripristina la vista esatta
          if (typeof window.restorePersistedNavigation === "function") {
            window.restorePersistedNavigation();
          }
        }
      }
    } catch (e) {
      console.warn("Connessione API MySQL non disponibile:", e.message);
    }
  }

  // --- PERSONE & CITIZEN HUB ---
  getPersone() {
    return this.data.persone || [];
  }

  getSelectedPersona() {
    // Se non impostato in memoria, controlla URL param o localStorage
    if (!this.selectedPersonaId) {
      const urlParams = new URLSearchParams(window.location.search);
      const paramId = urlParams.get("personaId") || urlParams.get("id");
      const storedId = paramId || sessionStorage.getItem("ROXANNE_SELECTED_PERSONA_ID") || localStorage.getItem("ROXANNE_SELECTED_PERSONA_ID");
      if (storedId) {
        this.selectedPersonaId = parseInt(storedId);
      }
    }

    if (!this.selectedPersonaId) {
      return null;
    }

    let found = this.data.persone.find(p => p.id === parseInt(this.selectedPersonaId));
    return found || null;
  }

  setSelectedPersonaId(id) {
    this.selectedPersonaId = parseInt(id);
    try {
      if (this.selectedPersonaId) {
        sessionStorage.setItem("ROXANNE_SELECTED_PERSONA_ID", String(this.selectedPersonaId));
        localStorage.setItem("ROXANNE_SELECTED_PERSONA_ID", String(this.selectedPersonaId));
        
        // Aggiorna URL senza ricaricare la pagina per conservare lo stato
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("personaId", String(this.selectedPersonaId));
        window.history.replaceState(null, "", currentUrl.toString());
      }
    } catch (e) {}
  }

  async addPersona(personaData) {
    const newNumIscrizione = this.data.persone.length > 0 ? Math.max(...this.data.persone.map(p => p.numeroIscrizione || 10000)) + 1 : 10001;
    
    const payload = {
      ...personaData,
      numeroIscrizione: personaData.numeroIscrizione || newNumIscrizione,
      codice: personaData.codice || `PERS-${personaData.numeroIscrizione || newNumIscrizione}`
    };

    const res = await fetch('/api/persone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const errorMsg = errJson.error || `Errore HTTP ${res.status}: Impossibile scrivere su MySQL.`;
      console.error("Errore salvataggio MySQL:", errorMsg);
      throw new Error(errorMsg);
    }

    const createdPersona = await res.json();
    this.data.persone.unshift(createdPersona);
    this.selectedPersonaId = createdPersona.id;
    return createdPersona;
  }

  async updatePersona(id, updatedFields) {
    const numericId = parseInt(id);
    const index = this.data.persone.findIndex(p => p.id === numericId);
    if (index !== -1) {
      this.data.persone[index] = { ...this.data.persone[index], ...updatedFields };

      // Invia esclusivamente i campi modificati per massima velocità di rete e query snella
      const res = await fetch(`/api/persone/${numericId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Errore HTTP ${res.status}: Impossibile aggiornare su MySQL.`);
      }

      const updatedFromDb = await res.json();
      // Aggiorna lo store locale unendo la risposta del database
      this.data.persone[index] = { ...this.data.persone[index], ...updatedFromDb };
      return this.data.persone[index];
    }
    return null;
  }

  // --- WALLET DOCUMENTALE COMPLETO ---
  async addDocumentToWallet(personaId, doc) {
    const persona = this.data.persone.find(p => p.id === parseInt(personaId));
    if (persona) {
      if (!persona.wallet) persona.wallet = [];
      const newDoc = {
        id: Date.now(),
        nome: doc.nome,
        tipo: doc.tipo || "Documento Allegato",
        descrizione: doc.descrizione || "",
        data: new Date().toISOString(),
        dimensione: doc.dimensione || "520 KB",
        fileContent: doc.fileContent || null,
        fileType: doc.fileType || "application/pdf"
      };

      this.addAuditLog("CARICAMENTO_WALLET", "Wallet Documentale", `${persona.nome} (#${persona.numeroIscrizione})`, `Caricato file ${doc.nome}`);

      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: parseInt(personaId),
          nome: newDoc.nome,
          tipo: newDoc.tipo,
          descrizione: newDoc.descrizione,
          dimensione: newDoc.dimensione,
          fileContent: newDoc.fileContent,
          fileType: newDoc.fileType,
          data: newDoc.data
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Errore HTTP ${res.status}: Impossibile salvare allegato nel database.`);
      }

      const savedDoc = await res.json();
      if (savedDoc && savedDoc.id) {
        newDoc.id = savedDoc.id;
      }
      persona.wallet.unshift(newDoc);
      return newDoc;
    }
    return null;
  }

  async updateDocumentInWallet(personaId, docId, fields) {
    const persona = this.data.persone.find(p => p.id === parseInt(personaId));
    if (persona && persona.wallet) {
      const doc = persona.wallet.find(d => d.id === parseInt(docId));
      if (doc) {
        Object.assign(doc, fields);
      }

      const res = await fetch(`/api/wallet/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Errore HTTP ${res.status}: Impossibile aggiornare dettagli allegato.`);
      }

      const updated = await res.json();
      if (doc) Object.assign(doc, updated);
      this.addAuditLog("MODIFICA_WALLET", "Wallet Documentale", `${persona.nome}`, `Modificato allegato #${docId} (${fields.nome || doc.nome})`);
      return updated;
    }
  }

  async deleteDocumentFromWallet(personaId, docId) {
    const persona = this.data.persone.find(p => p.id === parseInt(personaId));
    if (persona && persona.wallet) {
      const res = await fetch(`/api/wallet/${docId}`, { method: 'DELETE' });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Errore HTTP ${res.status}: Impossibile eliminare allegato dal database.`);
      }
      persona.wallet = persona.wallet.filter(d => d.id !== parseInt(docId));
      this.addAuditLog("ELIMINAZIONE_WALLET", "Wallet Documentale", `${persona.nome}`, `Rimossa allegato #${docId}`);
    }
  }

  // --- COMITATO TECNICO ASL (MULTI-VERBALI E STORICO RELAZIONI) ---
  getComitatoTecnicoByNumIscriz(numIscriz) {
    const list = (this.data.comitatoTecnico || []).filter(c => parseInt(c.numeroIscrizione) === parseInt(numIscriz));
    return list.sort((a, b) => new Date(b.dataSeduta) - new Date(a.dataSeduta));
  }

  async addVerbaleComitato(comitatoData) {
    if (!this.data.comitatoTecnico) this.data.comitatoTecnico = [];
    const newVerbale = {
      ...comitatoData,
      createdAt: new Date().toISOString()
    };

    const res = await fetch('/api/comitato', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVerbale)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Errore HTTP ${res.status}: Impossibile salvare verbale comitato su MySQL.`);
    }

    const saved = await res.json();
    this.data.comitatoTecnico.unshift(saved);
    const persona = this.data.persone.find(p => parseInt(p.numeroIscrizione) === parseInt(comitatoData.numeroIscrizione));
    if (persona) {
      if (!Array.isArray(persona.comitatoTecnico)) persona.comitatoTecnico = [];
      persona.comitatoTecnico.unshift(saved);
    }
    this.addAuditLog("AGGIUNTA_VERBALE_COMITATO", "Comitato Tecnico ASL", `Iscritto #${comitatoData.numeroIscrizione}`, `Verbale ASL n. ${comitatoData.numPratica || saved.id}`);
    return saved;
  }

  async deleteVerbaleComitato(verbaleId) {
    const res = await fetch(`/api/comitato/${verbaleId}`, { method: 'DELETE' });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Errore HTTP ${res.status}: Impossibile eliminare verbale comitato.`);
    }
    if (this.data.comitatoTecnico) {
      this.data.comitatoTecnico = this.data.comitatoTecnico.filter(c => c.id !== parseInt(verbaleId));
    }
    this.data.persone.forEach(p => {
      if (Array.isArray(p.comitatoTecnico)) {
        p.comitatoTecnico = p.comitatoTecnico.filter(c => c.id !== parseInt(verbaleId));
      }
    });
    this.addAuditLog("ELIMINAZIONE_VERBALE_COMITATO", "Comitato Tecnico ASL", `Verbale #${verbaleId}`, "Eliminazione record verbale ASL");
  }

  // --- PROGETTO INSERIMENTO LAVORATIVO (PIL L.68/99) ---
  getProgettiInserimentoLavByNumIscriz(numIscriz) {
    if (!this.data.progettiInserimentoLav) this.data.progettiInserimentoLav = [];
    const list = this.data.progettiInserimentoLav.filter(p => parseInt(p.numeroIscrizione) === parseInt(numIscriz));
    return list.sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  async addProgettoInserimentoLav(pilData) {
    if (!this.data.progettiInserimentoLav) this.data.progettiInserimentoLav = [];
    const newPil = {
      ...pilData,
      createdAt: new Date().toISOString()
    };

    const res = await fetch('/api/pil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPil)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Errore HTTP ${res.status}: Impossibile salvare PIL su MySQL.`);
    }

    const saved = await res.json();
    this.data.progettiInserimentoLav.unshift(saved);
    const persona = this.data.persone.find(p => parseInt(p.numeroIscrizione) === parseInt(pilData.numeroIscrizione));
    if (persona) {
      if (!Array.isArray(persona.progettiPIL)) persona.progettiPIL = [];
      persona.progettiPIL.unshift(saved);
    }
    this.addAuditLog("AGGIUNTA_PIL", "Progetto Inserimento (PIL)", `${pilData.nome || 'Iscritto'} (#${pilData.numeroIscrizione})`, `Nuovo PIL registrato`);
    return saved;
  }

  async deleteProgettoInserimentoLav(pilId) {
    const res = await fetch(`/api/pil/${pilId}`, { method: 'DELETE' });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Errore HTTP ${res.status}: Impossibile eliminare PIL.`);
    }
    if (this.data.progettiInserimentoLav) {
      this.data.progettiInserimentoLav = this.data.progettiInserimentoLav.filter(p => p.id !== parseInt(pilId));
    }
    this.data.persone.forEach(p => {
      if (Array.isArray(p.progettiPIL)) {
        p.progettiPIL = p.progettiPIL.filter(pil => pil.id !== parseInt(pilId));
      }
    });
    this.addAuditLog("ELIMINAZIONE_PIL", "Progetto Inserimento (PIL)", `PIL #${pilId}`, "Eliminazione scheda PIL");
  }

  // --- DIARIO OPERATORI (COLLOQUI & MONITORAGGIO TIROCINI) ---
  getNoteDiarioByNumIscriz(numIscriz) {
    if (!this.data.noteDiario) this.data.noteDiario = [];
    return this.data.noteDiario.filter(n => parseInt(n.numeroIscrizione) === parseInt(numIscriz));
  }

  async addNotaDiario(notaData) {
    if (!this.data.noteDiario) this.data.noteDiario = [];
    const newNota = { ...notaData, operatore: this.getActiveUser(), firma: this.getActiveUser() };

    const res = await fetch('/api/diario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNota)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Errore HTTP ${res.status}: Impossibile salvare nota diario su MySQL.`);
    }

    const saved = await res.json();
    this.data.noteDiario.unshift(saved);
    const persona = this.data.persone.find(p => parseInt(p.numeroIscrizione) === parseInt(notaData.numeroIscrizione));
    if (persona) {
      if (!Array.isArray(persona.noteDiario)) persona.noteDiario = [];
      persona.noteDiario.unshift(saved);
    }
    this.addAuditLog("AGGIUNTA_NOTA", "Diario Operatore", `${notaData.nome || 'Iscritto'} (#${notaData.numeroIscrizione})`, `Nota ${notaData.tipoNota || 'Diario'}`);
    return saved;
  }

  async deleteNotaDiario(notaId) {
    const res = await fetch(`/api/diario/${notaId}`, { method: 'DELETE' });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Errore HTTP ${res.status}: Impossibile eliminare nota diario.`);
    }
    if (this.data.noteDiario) {
      this.data.noteDiario = this.data.noteDiario.filter(n => n.id !== parseInt(notaId));
    }
    this.data.persone.forEach(p => {
      if (Array.isArray(p.noteDiario)) {
        p.noteDiario = p.noteDiario.filter(n => n.id !== parseInt(notaId));
      }
    });
    this.addAuditLog("ELIMINAZIONE_NOTA", "Diario Operatore", `Nota #${notaId}`, "Eliminazione annotazione diario");
  }

  // --- METRICHE CPI ---
  getStats() {
    const persone = this.getPersone();
    const avviamenti = this.data.avviamenti || [];

    return {
      totalIscritti: persone.length,
      attivi: persone.filter(p => p.attivoNonAttivo === "Attivo").length,
      disabiliCO: persone.filter(p => p.categoria === "C.O." || p.categoria === "F.D.").length,
      art18: persone.filter(p => p.categoria === "Art. 18").length,
      avviamentiAnno: avviamenti.length
    };
  }
}

window.store = new StoreManager();
