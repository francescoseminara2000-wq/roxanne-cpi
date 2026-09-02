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
          if (!this.selectedPersonaId && this.data.persone.length > 0) {
            this.selectedPersonaId = this.data.persone[0].id;
          }
          console.log(`[MySQL Sync] Sincronizzati ${personeDb.length} iscritti dal Database.`);
          if (typeof window.renderMainSearchTable === "function") window.renderMainSearchTable();
          if (typeof window.renderCitizenHub === "function") window.renderCitizenHub();
          if (typeof window.renderDashboardAnalytics === "function") window.renderDashboardAnalytics();
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
    if (!this.selectedPersonaId && this.data.persone.length > 0) {
      this.selectedPersonaId = this.data.persone[0].id;
    }
    return this.data.persone.find(p => p.id === parseInt(this.selectedPersonaId));
  }

  setSelectedPersonaId(id) {
    this.selectedPersonaId = parseInt(id);
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
      const p = this.data.persone[index];

      const res = await fetch(`/api/persone/${numericId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Errore HTTP ${res.status}: Impossibile aggiornare su MySQL.`);
      }

      const updatedFromDb = await res.json();
      this.data.persone[index] = updatedFromDb;
      return updatedFromDb;
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
      this.addAuditLog("ELIMINAZIONE_VERBALE_COMITATO", "Comitato Tecnico ASL", `Verbale #${verbaleId}`, "Eliminazione record verbale ASL");
    }
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
      this.addAuditLog("ELIMINAZIONE_PIL", "Progetto Inserimento (PIL)", `PIL #${pilId}`, "Eliminazione scheda PIL");
    }
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
      this.addAuditLog("ELIMINAZIONE_NOTA", "Diario Operatore", `Nota #${notaId}`, "Eliminazione annotazione diario");
    }
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
