/**
 * Chrono Stellar - LocalStore Manager
 * Gestione dello stato e permanenza LocalStorage con Wallet & Disponibilità
 */

const STORAGE_KEY = "ROXANNE_CPI_LIGHT_DB";

class StoreManager {
  constructor() {
    this.data = this.loadData();
    this.selectedPersonaId = this.data.persone.length > 0 ? this.data.persone[0].id : null;
    
    // Audit Logs
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
    localStorage.setItem("ROXANNE_AUDIT_LOGS", JSON.stringify(this.auditLogs));
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Errore durante il caricamento da LocalStorage:", e);
    }
    return JSON.parse(JSON.stringify(window.INITIAL_DATA || { persone: [], avviamenti: [], comitatoTecnico: [], noteDiario: [] }));
  }

  saveData() {
    try {
      // Create a light copy for LocalStorage cache without massive Base64 payloads
      const lightData = {
        ...this.data,
        persone: (this.data.persone || []).map(p => {
          if (!p.wallet || !Array.isArray(p.wallet)) return p;
          return {
            ...p,
            wallet: p.wallet.map(doc => {
              const { fileContent, ...lightDoc } = doc;
              return lightDoc;
            })
          };
        })
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightData));
    } catch (e) {
      console.warn("Avviso LocalStorage Quota: salvataggio cache locale saltato, i dati persistono su MySQL:", e.message);
    }
  }

  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(window.INITIAL_DATA));
    this.selectedPersonaId = this.data.persone.length > 0 ? this.data.persone[0].id : null;
    this.saveData();
    return this.data;
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
          this.saveData();
          console.log(`[MySQL Sync] Sincronizzati ${personeDb.length} iscritti dal Database.`);
          if (typeof window.renderMainSearchTable === "function") window.renderMainSearchTable();
          if (typeof window.renderCitizenHub === "function") window.renderCitizenHub();
          if (typeof window.renderDashboardAnalytics === "function") window.renderDashboardAnalytics();
        }
      }
    } catch (e) {
      console.warn("Modalità standalone locale o API offline:", e.message);
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
    this.saveData();
    return createdPersona;
  }

  async updatePersona(id, updatedFields) {
    const numericId = parseInt(id);
    const index = this.data.persone.findIndex(p => p.id === numericId);
    if (index !== -1) {
      this.data.persone[index] = { ...this.data.persone[index], ...updatedFields };
      const p = this.data.persone[index];

      try {
        const res = await fetch(`/api/persone/${numericId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p)
        });

        if (res.ok) {
          const updatedFromDb = await res.json();
          this.data.persone[index] = updatedFromDb;
          this.saveData();
          return updatedFromDb;
        }
      } catch (err) {
        console.error("Errore aggiornamento MySQL:", err);
      }

      this.saveData();
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
      persona.wallet.unshift(newDoc);
      this.saveData();

      this.addAuditLog("CARICAMENTO_WALLET", "Wallet Documentale", `${persona.nome} (#${persona.numeroIscrizione})`, `Caricato file ${doc.nome}`);

      try {
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

        if (res.ok) {
          const savedDoc = await res.json();
          if (savedDoc && savedDoc.id) {
            newDoc.id = savedDoc.id;
            this.saveData();
          }
        }
      } catch (e) {
        console.warn("Wallet sync pending:", e);
      }

      return newDoc;
    }
    return null;
  }

  async deleteDocumentFromWallet(personaId, docId) {
    const persona = this.data.persone.find(p => p.id === parseInt(personaId));
    if (persona && persona.wallet) {
      persona.wallet = persona.wallet.filter(d => d.id !== parseInt(docId));
      this.saveData();
      this.addAuditLog("ELIMINAZIONE_WALLET", "Wallet Documentale", `${persona.nome}`, `Rimossa allegato #${docId}`);

      try {
        await fetch(`/api/wallet/${docId}`, { method: 'DELETE' });
      } catch (e) {
        console.warn("Wallet delete sync pending:", e);
      }
    }
  }

  // --- COMITATO TECNICO ASL (MULTI-VERBALI E STORICO RELAZIONI) ---
  getComitatoTecnicoByNumIscriz(numIscriz) {
    const list = (this.data.comitatoTecnico || []).filter(c => parseInt(c.numeroIscrizione) === parseInt(numIscriz));
    return list.sort((a, b) => new Date(b.dataSeduta) - new Date(a.dataSeduta));
  }

  async addVerbaleComitato(comitatoData) {
    if (!this.data.comitatoTecnico) this.data.comitatoTecnico = [];
    const newId = this.data.comitatoTecnico.length > 0 ? Math.max(...this.data.comitatoTecnico.map(c => c.id || 0)) + 1 : 1;
    const newVerbale = {
      id: newId,
      ...comitatoData,
      createdAt: new Date().toISOString()
    };
    this.data.comitatoTecnico.unshift(newVerbale);
    this.saveData();

    this.addAuditLog("AGGIUNTA_VERBALE_COMITATO", "Comitato Tecnico ASL", `Iscritto #${comitatoData.numeroIscrizione}`, `Verbale ASL n. ${comitatoData.numPratica || newId}`);

    try {
      await fetch('/api/comitato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVerbale)
      });
    } catch (e) {
      console.warn("Comitato sync pending:", e);
    }

    return newVerbale;
  }

  async deleteVerbaleComitato(verbaleId) {
    if (this.data.comitatoTecnico) {
      this.data.comitatoTecnico = this.data.comitatoTecnico.filter(c => c.id !== parseInt(verbaleId));
      this.saveData();
      this.addAuditLog("ELIMINAZIONE_VERBALE_COMITATO", "Comitato Tecnico ASL", `Verbale #${verbaleId}`, "Eliminazione record verbale ASL");

      try {
        await fetch(`/api/comitato/${verbaleId}`, { method: 'DELETE' });
      } catch (e) {
        console.warn("Comitato delete sync pending:", e);
      }
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
    const newId = this.data.progettiInserimentoLav.length > 0 ? Math.max(...this.data.progettiInserimentoLav.map(p => p.id || 0)) + 1 : 1;
    const newPil = {
      id: newId,
      ...pilData,
      createdAt: new Date().toISOString()
    };
    this.data.progettiInserimentoLav.unshift(newPil);
    this.saveData();

    this.addAuditLog("AGGIUNTA_PIL", "Progetto Inserimento (PIL)", `${pilData.nome || 'Iscritto'} (#${pilData.numeroIscrizione})`, `Nuovo PIL registrato`);

    try {
      await fetch('/api/pil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPil)
      });
    } catch (e) {
      console.warn("PIL sync pending:", e);
    }

    return newPil;
  }

  async deleteProgettoInserimentoLav(pilId) {
    if (this.data.progettiInserimentoLav) {
      this.data.progettiInserimentoLav = this.data.progettiInserimentoLav.filter(p => p.id !== parseInt(pilId));
      this.saveData();
      this.addAuditLog("ELIMINAZIONE_PIL", "Progetto Inserimento (PIL)", `PIL #${pilId}`, "Eliminazione scheda PIL");

      try {
        await fetch(`/api/pil/${pilId}`, { method: 'DELETE' });
      } catch (e) {
        console.warn("PIL delete sync pending:", e);
      }
    }
  }

  // --- DIARIO OPERATORI (COLLOQUI & MONITORAGGIO TIROCINI) ---
  getNoteDiarioByNumIscriz(numIscriz) {
    if (!this.data.noteDiario) this.data.noteDiario = [];
    return this.data.noteDiario.filter(n => parseInt(n.numeroIscrizione) === parseInt(numIscriz));
  }

  async addNotaDiario(notaData) {
    if (!this.data.noteDiario) this.data.noteDiario = [];
    const newId = this.data.noteDiario.length > 0 ? Math.max(...this.data.noteDiario.map(n => n.id || 0)) + 1 : 401;
    const newNota = { ...notaData, id: newId, operatore: this.getActiveUser(), firma: this.getActiveUser() };
    this.data.noteDiario.unshift(newNota);
    this.saveData();

    this.addAuditLog("AGGIUNTA_NOTA", "Diario Operatore", `${notaData.nome || 'Iscritto'} (#${notaData.numeroIscrizione})`, `Nota ${notaData.tipoNota || 'Diario'}`);

    try {
      await fetch('/api/diario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNota)
      });
    } catch (e) {
      console.warn("Diario sync pending:", e);
    }

    return newNota;
  }

  async deleteNotaDiario(notaId) {
    if (this.data.noteDiario) {
      this.data.noteDiario = this.data.noteDiario.filter(n => n.id !== parseInt(notaId));
      this.saveData();
      this.addAuditLog("ELIMINAZIONE_NOTA", "Diario Operatore", `Nota #${notaId}`, "Eliminazione annotazione diario");

      try {
        await fetch(`/api/diario/${notaId}`, { method: 'DELETE' });
      } catch (e) {
        console.warn("Diario delete sync pending:", e);
      }
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
