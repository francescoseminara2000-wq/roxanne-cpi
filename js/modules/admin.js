/**
 * Roxanne CPI Light - Admin & Audit Module
 * Gestione Operatori CPI e Log di Audit di Sistema
 */

  // --- AUDIT LOGS TABLE RENDERER ---
  function renderAuditLogsTable() {
    const logs = window.store.getAuditLogs();
    const filterUser = document.getElementById("audit-filter-user") ? document.getElementById("audit-filter-user").value : "ALL";

    const filtered = logs.filter(l => filterUser === "ALL" || (l.operatore && l.operatore.includes(filterUser)));

    const countBadge = document.getElementById("badge-audit-count");
    if (countBadge) countBadge.textContent = `${filtered.length} Eventi Registrati`;

    const tbody = document.getElementById("tbody-audit-logs");
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400 italic">Nessun evento registrato per l'operatore selezionato.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(l => {
      const isActionModifica = l.azione.includes("MODIFICA");
      const isActionWallet = l.azione.includes("WALLET");
      const isActionNota = l.azione.includes("NOTA");

      const badgeClass = isActionModifica ? "bg-blue-50 text-blue-700 border-blue-200" :
                         isActionWallet ? "bg-amber-50 text-amber-700 border-amber-200" :
                         isActionNota ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-100 text-slate-700 border-slate-200";

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="px-5 py-3.5 font-mono text-slate-600">${escapeHtml(l.timestamp)}</td>
          <td class="px-5 py-3.5 font-bold text-slate-900 font-heading"><i class="fa-solid fa-user-shield text-slate-400 mr-1.5"></i>${escapeHtml(l.operatore)}</td>
          <td class="px-5 py-3.5">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeClass}">
              ${escapeHtml(l.azione)}
            </span>
          </td>
          <td class="px-5 py-3.5 font-medium text-slate-800">${escapeHtml(l.modulo)}</td>
          <td class="px-5 py-3.5 font-bold text-blue-700 font-heading">${escapeHtml(l.target)}</td>
          <td class="px-5 py-3.5 text-slate-600 italic">${escapeHtml(l.dettagli)}</td>
        </tr>
      `;
    }).join("");
  }

  const filterAuditUser = document.getElementById("audit-filter-user");
  if (filterAuditUser) {
    filterAuditUser.addEventListener("change", renderAuditLogsTable);
  }

  const btnExportAuditCsv = document.getElementById("btn-export-audit-csv");
  if (btnExportAuditCsv) {
    btnExportAuditCsv.addEventListener("click", () => {
      const logs = window.store.getAuditLogs();
      if (logs.length === 0) {
        alert("Nessun dato presente nel registro audit.");
        return;
      }

      let csv = "ID,Timestamp,Operatore,Azione,Modulo,Target,Dettagli\n";
      logs.forEach(l => {
        csv += `"${l.id}","${l.timestamp}","${l.operatore}","${l.azione}","${l.modulo}","${l.target}","${l.dettagli}"\n`;
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Roxanne_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // --- PANNELLO ADMIN: GESTIONE UTENZE & OPERATORI CPI ---
  async function renderUsersTable() {
    const tbody = document.getElementById("tbody-users-list");
    if (!tbody) return;

    let users = [];
    try {
      const res = await fetch('/api/users');
      if (res.ok) users = await res.json();
    } catch (e) {
      console.log("Offline mode, default local users");
    }

    if (users.length === 0) {
      users = [
        { id: 1, nomeCompleto: "Marco Galli", username: "admin", email: "admin.cpi@provincia.lecco.it", ruolo: "ADMIN", sedeCpi: "Lecco Centro", attivo: true },
        { id: 2, nomeCompleto: "Elena Bianchi", username: "elena.bianchi", email: "elena.bianchi@provincia.lecco.it", ruolo: "OPERATORE_SILV", sedeCpi: "Merate", attivo: true },
        { id: 3, nomeCompleto: "Roberto Rossi", username: "roberto.rossi", email: "roberto.rossi@provincia.lecco.it", ruolo: "TUTOR_L68", sedeCpi: "Lecco Nord", attivo: true },
        { id: 4, nomeCompleto: "Dott.ssa Anna Verdi", username: "anna.verdi", email: "anna.verdi@asst-lecco.it", ruolo: "ASL_MEDICO", sedeCpi: "ASST Lecco", attivo: true }
      ];
    }

    document.getElementById("badge-users-count").textContent = `${users.length} Utenti Registrati`;

    tbody.innerHTML = users.map(u => {
      const roleBadge = u.ruolo === "ADMIN" 
        ? "bg-rose-50 text-rose-700 border-rose-200" 
        : u.ruolo === "OPERATORE_SILV" 
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : u.ruolo === "ASL_MEDICO"
        ? "bg-cyan-50 text-cyan-700 border-cyan-200"
        : "bg-purple-50 text-purple-700 border-purple-200";

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="px-5 py-4">
            <div class="font-bold text-slate-900 font-heading">${escapeHtml(u.nomeCompleto)}</div>
            <div class="text-[10px] text-slate-400 font-mono">ID #${u.id}</div>
          </td>
          <td class="px-5 py-4 font-mono font-bold text-slate-700">${escapeHtml(u.username)}</td>
          <td class="px-5 py-4 text-slate-600">${escapeHtml(u.email)}</td>
          <td class="px-5 py-4">
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${roleBadge} font-heading">
              ${escapeHtml(u.ruolo)}
            </span>
          </td>
          <td class="px-5 py-4 text-slate-600">${escapeHtml(u.sedeCpi || 'Lecco')}</td>
          <td class="px-5 py-4">
            <span class="inline-flex items-center gap-1.5 text-xs font-semibold ${u.attivo ? 'text-emerald-700' : 'text-slate-400'}">
              <span class="w-2 h-2 rounded-full ${u.attivo ? 'bg-emerald-500' : 'bg-slate-300'}"></span>
              ${u.attivo ? 'Attivo' : 'Disabilitato'}
            </span>
          </td>
          <td class="px-5 py-4 text-right">
            <button data-user-id="${u.id}" class="btn-delete-user text-slate-400 hover:text-rose-600 p-1 text-xs cursor-pointer" title="Elimina Utente">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // Delete user listener
    tbody.querySelectorAll(".btn-delete-user").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-user-id");
        if (confirm("Eliminare questo account operatore?")) {
          try {
            await fetch(`/api/users/${id}`, { method: 'DELETE' });
            renderUsersTable();
          } catch (e) {
            console.error(e);
          }
        }
      });
    });
  }

  // Modal Nuovo Utente Admin Listeners
  const modalUser = document.getElementById("modal-user-edit");
  const btnAddNewUser = document.getElementById("btn-add-new-user");
  const btnCloseModalUser = document.getElementById("btn-close-modal-user");
  const btnCancelModalUser = document.getElementById("btn-cancel-modal-user");
  const formUserEdit = document.getElementById("form-user-edit");

  if (btnAddNewUser && modalUser) {
    btnAddNewUser.addEventListener("click", () => {
      formUserEdit.reset();
      document.getElementById("user-edit-id").value = "";
      modalUser.classList.remove("hidden");
    });
  }

  if (btnCloseModalUser && modalUser) {
    btnCloseModalUser.addEventListener("click", () => modalUser.classList.add("hidden"));
  }

  if (btnCancelModalUser && modalUser) {
    btnCancelModalUser.addEventListener("click", () => modalUser.classList.add("hidden"));
  }

  if (formUserEdit) {
    formUserEdit.addEventListener("submit", async (e) => {
      e.preventDefault();
      const payload = {
        nomeCompleto: document.getElementById("user-nome-completo").value.trim(),
        username: document.getElementById("user-username").value.trim(),
        email: document.getElementById("user-email").value.trim(),
        password: document.getElementById("user-password").value.trim(),
        ruolo: document.getElementById("user-ruolo").value,
        sedeCpi: document.getElementById("user-sede").value.trim(),
        attivo: document.getElementById("user-attivo").checked
      };

      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        modalUser.classList.add("hidden");
        formUserEdit.reset();
        renderUsersTable();
        RoxToast.success("Operatore Creato", `L'account per ${payload.nomeCompleto} è attivo su MySQL.`);
      } catch (err) {
        RoxToast.error("Errore Creazione", "Impossibile registrare il nuovo utente.");
      }
    });
  }

window.renderAuditLogsTable = renderAuditLogsTable;
window.renderUsersTable = renderUsersTable;
