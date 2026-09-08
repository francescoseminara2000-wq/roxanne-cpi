/**
 * Roxanne CPI Light - Monitoraggio Tirocini & Alert Scadenze L.68/99
 * Tracciamento scadenze bimestrali/trimestrali, calcolo giorni e registrazione verifiche
 */

(function(window) {

  function getTirocinantiData() {
    const persone = window.store.getPersone();
    const today = new Date();
    
    const tirocini = [];

    persone.forEach(p => {
      // Un iscritto è considerato in tirocinio se stato include "tirocinio" o ha avviamenti/progetti di tirocinio
      const isStatoTirocinio = (p.stato || "").toLowerCase().includes("tirocinio");
      const avviamenti = p.avviamenti || [];
      const noteDiario = p.noteDiario || [];
      const pil = p.progettiPIL && p.progettiPIL[0];

      // Cerca se ha avviamenti con tipContratto tirocinio o usa dati predefiniti
      let avviamentoTirocinio = avviamenti.find(a => (a.tipContratto || "").toLowerCase().includes("tirocinio"));

      if (isStatoTirocinio || avviamentoTirocinio) {
        // Data inizio di default o reale
        let dataInizio = avviamentoTirocinio ? new Date(avviamentoTirocinio.dataInizio) : null;
        if (!dataInizio || isNaN(dataInizio.getTime())) {
          dataInizio = new Date(today.getTime() - (45 * 24 * 60 * 60 * 1000)); // 45 gg fa per demo
        }

        // Data fine (di solito 6 mesi dopo)
        let dataFine = (avviamentoTirocinio && avviamentoTirocinio.dataFine) ? new Date(avviamentoTirocinio.dataFine) : null;
        if (!dataFine || isNaN(dataFine.getTime())) {
          dataFine = new Date(dataInizio.getTime() + (180 * 24 * 60 * 60 * 1000));
        }

        const totaleGiorni = Math.max(1, Math.round((dataFine - dataInizio) / (1000 * 60 * 60 * 24)));
        const giorniTrascorsi = Math.max(0, Math.round((today - dataInizio) / (1000 * 60 * 60 * 24)));
        const percentualeCompletata = Math.min(100, Math.round((giorniTrascorsi / totaleGiorni) * 100));

        // Note di monitoraggio pregresse
        const monitoraggi = noteDiario.filter(n => n.tipoNota === "Monitoraggio Tirocinio");
        const ultimoMonitoraggio = monitoraggi.length > 0 
          ? monitoraggi.sort((a, b) => new Date(b.data) - new Date(a.data))[0] 
          : null;

        // Calcolo scadenza prossimo monitoraggio (ogni 60 giorni)
        let dataUltimaVerifica = ultimoMonitoraggio ? new Date(ultimoMonitoraggio.data) : dataInizio;
        let dataProssimaVerifica = new Date(dataUltimaVerifica.getTime() + (60 * 24 * 60 * 60 * 1000));
        
        // Se la prossima verifica sfora la data fine, la scadenza è la data fine del tirocinio
        if (dataProssimaVerifica > dataFine) {
          dataProssimaVerifica = dataFine;
        }

        const giorniAlProssimo = Math.round((dataProssimaVerifica - today) / (1000 * 60 * 60 * 24));

        let statusAlert = "REGOLARE"; // REGOLARE | IN_SCADENZA | SCADUTO
        let alertBadge = { label: "Monitoraggio Regolare", class: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "fa-circle-check" };

        if (giorniAlProssimo < 0) {
          statusAlert = "SCADUTO";
          alertBadge = { label: `Scaduto da ${Math.abs(giorniAlProssimo)} gg`, class: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse", icon: "fa-triangle-exclamation" };
        } else if (giorniAlProssimo <= 15) {
          statusAlert = "IN_SCADENZA";
          alertBadge = { label: `In scadenza (${giorniAlProssimo} gg)`, class: "bg-amber-50 text-amber-700 border-amber-200 font-bold", icon: "fa-clock" };
        }

        tirocini.push({
          persona: p,
          azienda: avviamentoTirocinio ? avviamentoTirocinio.azienda : (p.aziendaTirocinio || "Azienda Convenzionata L.68"),
          tutor: (pil && pil.tutor) || p.operatore || "Tutor CPI L.68",
          dataInizio: dataInizio.toISOString().split("T")[0],
          dataFine: dataFine.toISOString().split("T")[0],
          giorniTrascorsi,
          totaleGiorni,
          percentualeCompletata,
          ultimoMonitoraggio,
          dataProssimoMonitoraggio: dataProssimaVerifica.toISOString().split("T")[0],
          giorniAlProssimo,
          statusAlert,
          alertBadge
        });
      }
    });

    return tirocini;
  }

  function renderMonitoraggioTirocini() {
    const tbody = document.getElementById("tbody-tirocini-monitoraggio");
    if (!tbody) return;

    const tirocini = getTirocinantiData();
    const filterAlert = document.getElementById("tirocini-filter-alert") ? document.getElementById("tirocini-filter-alert").value : "ALL";

    const filtered = tirocini.filter(t => {
      if (filterAlert === "ALL") return true;
      return t.statusAlert === filterAlert;
    });

    // Aggiorna contatori KPI
    const totalCount = tirocini.length;
    const scadutiCount = tirocini.filter(t => t.statusAlert === "SCADUTO").length;
    const inScadenzaCount = tirocini.filter(t => t.statusAlert === "IN_SCADENZA").length;
    const regolariCount = tirocini.filter(t => t.statusAlert === "REGOLARE").length;

    const elTotal = document.getElementById("kpi-tirocini-totale");
    if (elTotal) elTotal.textContent = totalCount;
    const elScaduti = document.getElementById("kpi-tirocini-scaduti");
    if (elScaduti) elScaduti.textContent = scadutiCount;
    const elInScadenza = document.getElementById("kpi-tirocini-in-scadenza");
    if (elInScadenza) elInScadenza.textContent = inScadenzaCount;
    const elRegolari = document.getElementById("kpi-tirocini-regolari");
    if (elRegolari) elRegolari.textContent = regolariCount;

    const countBadge = document.getElementById("badge-tirocini-count");
    if (countBadge) countBadge.textContent = `${filtered.length} Tirocini Attivi`;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-12 text-slate-400 italic">Nessun tirocinio corrispondente al filtro selezionato.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(t => {
      const p = t.persona;
      const fullName = window.formatFullName ? window.formatFullName(p) : `${p.nome} ${p.cognome}`;
      const initials = window.getPersonaInitials ? window.getPersonaInitials(p) : `${p.nome[0] || ''}${p.cognome[0] || ''}`;

      return `
        <tr class="hover:bg-blue-50/30 transition">
          <td class="px-5 py-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center font-heading shadow-xs">
                ${initials}
              </div>
              <div>
                <div class="font-bold text-slate-900 font-heading hover:text-blue-600 cursor-pointer btn-open-profile" data-id="${p.id}">
                  ${escapeHtml(fullName)}
                </div>
                <div class="text-[11px] text-slate-400 font-mono">
                  #${p.numeroIscrizione || p.id} &bull; ${p.categoria || 'C.O.'}
                </div>
              </div>
            </div>
          </td>

          <td class="px-5 py-4">
            <div class="font-bold text-slate-800 text-xs">${escapeHtml(t.azienda)}</div>
            <div class="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <i class="fa-solid fa-user-tie text-[10px]"></i> Tutor: ${escapeHtml(t.tutor)}
            </div>
          </td>

          <td class="px-5 py-4">
            <div class="text-xs font-semibold text-slate-700 font-mono">
              ${escapeHtml(t.dataInizio)} &rarr; ${escapeHtml(t.dataFine)}
            </div>
            <div class="mt-1.5 w-32 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div class="bg-indigo-600 h-2 rounded-full" style="width: ${t.percentualeCompletata}%"></div>
            </div>
            <div class="text-[10px] text-slate-400 mt-0.5">${t.giorniTrascorsi} / ${t.totaleGiorni} gg (${t.percentualeCompletata}%)</div>
          </td>

          <td class="px-5 py-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${t.alertBadge.class} font-heading">
              <i class="fa-solid ${t.alertBadge.icon}"></i>
              ${t.alertBadge.label}
            </span>
          </td>

          <td class="px-5 py-4">
            <div class="text-xs font-bold font-mono text-slate-800">${escapeHtml(t.dataProssimoMonitoraggio)}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">
              ${t.ultimoMonitoraggio ? `Ultimo: ${t.ultimoMonitoraggio.data.split('T')[0]}` : 'Nessuna verifica registrata'}
            </div>
          </td>

          <td class="px-5 py-4 text-right whitespace-nowrap">
            <div class="flex items-center justify-end gap-2">
              <button class="btn-quick-monitoraggio cursor-pointer bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-bold text-xs px-3 py-1.5 rounded-xl border border-purple-200 hover:border-transparent transition flex items-center gap-1.5 shadow-2xs"
                data-id="${p.id}" data-nome="${escapeHtml(fullName)}" data-num="${p.numeroIscrizione}">
                <i class="fa-solid fa-clipboard-check text-[11px]"></i>
                <span>Verifica</span>
              </button>
              <button class="btn-open-profile cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs p-2 rounded-xl transition" data-id="${p.id}" title="Apri Fascicolo Iscritto">
                <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // Listener bottoni apertura scheda
    tbody.querySelectorAll(".btn-open-profile").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        const persona = window.store.getPersonaById(id);
        if (persona) {
          window.store.setSelectedPersona(persona);
          if (window.navigateToSection) window.navigateToSection("section-citizen-hub");
        }
      });
    });

    // Listener bottone Nuova Verifica Monitoraggio
    tbody.querySelectorAll(".btn-quick-monitoraggio").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-id"));
        const nome = btn.getAttribute("data-nome");
        const num = btn.getAttribute("data-num");
        
        openModalNuovoMonitoraggio(id, num, nome);
      });
    });
  }

  // Modal rapida per registrare un monitoraggio periodico
  function openModalNuovoMonitoraggio(personaId, numeroIscrizione, nome) {
    const modal = document.getElementById("modal-nuovo-monitoraggio");
    if (!modal) return;

    document.getElementById("monit-persona-id").value = personaId;
    document.getElementById("monit-numero-iscriz").value = numeroIscrizione;
    document.getElementById("monit-persona-nome").textContent = `${nome} (#${numeroIscrizione})`;
    document.getElementById("monit-data").value = new Date().toISOString().split("T")[0];
    document.getElementById("monit-testo").value = "";

    modal.classList.remove("hidden");
  }

  function initMonitoraggiEvents() {
    const filterAlert = document.getElementById("tirocini-filter-alert");
    if (filterAlert) {
      filterAlert.addEventListener("change", renderMonitoraggioTirocini);
    }

    const modal = document.getElementById("modal-nuovo-monitoraggio");
    const btnClose = document.getElementById("btn-close-modal-monit");
    const btnCancel = document.getElementById("btn-cancel-modal-monit");
    const form = document.getElementById("form-nuovo-monitoraggio");

    if (btnClose && modal) btnClose.addEventListener("click", () => modal.classList.add("hidden"));
    if (btnCancel && modal) btnCancel.addEventListener("click", () => modal.classList.add("hidden"));

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const personaId = parseInt(document.getElementById("monit-persona-id").value);
        const numeroIscrizione = parseInt(document.getElementById("monit-numero-iscriz").value);
        const data = document.getElementById("monit-data").value;
        const noteDiDiario = document.getElementById("monit-testo").value.trim();
        const esito = document.getElementById("monit-esito").value;

        const currentUser = (window.store && window.store.getActiveUser) ? window.store.getActiveUser() : "Operatore CPI";

        const payload = {
          personaId,
          numeroIscrizione,
          tipoNota: "Monitoraggio Tirocinio",
          data,
          noteDiDiario: `[ESITO: ${esito}] ${noteDiDiario}`,
          firma: currentUser,
          operatore: currentUser
        };

        try {
          if (window.store && typeof window.store.addNotaDiario === "function") {
            await window.store.addNotaDiario(payload);
          } else {
            await fetch('/api/diario', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
          }

          if (modal) modal.classList.add("hidden");
          renderMonitoraggioTirocini();

          if (window.RoxToast) {
            window.RoxToast.success("Monitoraggio Registrato", "La verifica periodica è stata salvata con successo nel diario dell'iscritto.");
          }
        } catch (err) {
          console.error(err);
          if (window.RoxToast) {
            window.RoxToast.error("Errore Salvataggio", "Impossibile salvare il monitoraggio.");
          }
        }
      });
    }
  }

  window.renderMonitoraggioTirocini = renderMonitoraggioTirocini;
  window.initMonitoraggiEvents = initMonitoraggiEvents;

})(window);
