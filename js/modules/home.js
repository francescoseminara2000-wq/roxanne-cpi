/**
 * Roxanne CPI Light - Home Module & Operator Feed
 * Feed cronologico attività in tempo reale, gestione del profilo operatore e scorciatoie
 */

(function(window) {

  // Formatta orario relativo (es. "5 min fa", "Oggi alle 14:30")
  function formatRelativeTime(dateStr) {
    if (!dateStr) return "Recente";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    const diffSec = Math.round((now - d) / 1000);

    if (diffSec < 60) return "Pochi istanti fa";
    if (diffSec < 3600) return `${Math.round(diffSec / 60)} min fa`;
    if (diffSec < 86400) return `Oggi alle ${d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`;
    return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  // Rende il feed interattivo delle ultime attività
  function renderHomeFeed() {
    const timelineContainer = document.getElementById("home-activities-timeline");
    if (!timelineContainer) return;

    // Recupera utente corrente
    let currentUser = { nomeCompleto: "Marco Galli", ruolo: "ADMIN", username: "admin", email: "admin.cpi@provincia.lecco.it", sedeCpi: "Lecco Centro" };
    const savedUserJson = localStorage.getItem("ROXANNE_CURRENT_USER");
    if (savedUserJson) {
      try {
        currentUser = { ...currentUser, ...JSON.parse(savedUserJson) };
      } catch (e) {}
    }

    // Aggiorna box operatore in Home
    const elName = document.getElementById("home-welcome-name");
    if (elName) elName.textContent = currentUser.nomeCompleto || "Operatore CPI";

    const elBoxName = document.getElementById("home-box-user-name");
    if (elBoxName) elBoxName.textContent = currentUser.nomeCompleto || "Operatore CPI";

    const elBoxRole = document.getElementById("home-box-user-role");
    if (elBoxRole) elBoxRole.textContent = currentUser.ruolo || "OPERATORE CPI";

    const elBoxSede = document.getElementById("home-box-user-sede");
    if (elBoxSede) elBoxSede.textContent = `Sede ${currentUser.sedeCpi || 'Lecco Centro'}`;

    const elBoxEmail = document.getElementById("home-box-user-email");
    if (elBoxEmail) elBoxEmail.textContent = currentUser.email || `${currentUser.username}@provincia.lecco.it`;

    const elDate = document.getElementById("home-welcome-date");
    if (elDate) {
      const now = new Date();
      elDate.textContent = `${now.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} • Centro per l'Impiego`;
    }

    // Recupera audit logs
    const logs = (window.store && typeof window.store.getAuditLogs === "function") 
      ? window.store.getAuditLogs() 
      : [];

    const badgeCount = document.getElementById("badge-home-activity-count");
    if (badgeCount) {
      badgeCount.textContent = `${Math.min(12, logs.length)} Eventi Recenti`;
    }

    if (logs.length === 0) {
      timelineContainer.innerHTML = `
        <div class="p-8 text-center text-slate-400 italic bg-white/50 rounded-2xl border border-slate-100">
          Nessuna attività recente registrata nella sessione.
        </div>
      `;
      return;
    }

    // Mostra gli ultimi 12 eventi
    const recentLogs = logs.slice(0, 12);

    timelineContainer.innerHTML = recentLogs.map(l => {
      let icon = "fa-clock";
      let iconColor = "text-blue-600 bg-blue-50 border-blue-200";
      let actionTag = "Modifica";

      const az = (l.azione || "").toUpperCase();
      if (az.includes("INSERIMENTO") || az.includes("CREA") || az.includes("NUOVO")) {
        icon = "fa-user-plus";
        iconColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
        actionTag = "Creazione Fascicolo";
      } else if (az.includes("WALLET") || az.includes("DOCUMENTO")) {
        icon = "fa-folder-open";
        iconColor = "text-amber-600 bg-amber-50 border-amber-200";
        actionTag = "Wallet Documentale";
      } else if (az.includes("NOTA") || az.includes("DIARIO") || az.includes("TIROCINIO")) {
        icon = "fa-clipboard-check";
        iconColor = "text-purple-600 bg-purple-50 border-purple-200";
        actionTag = "Diario / Tirocinio";
      } else if (az.includes("VERBALE") || az.includes("ASL") || az.includes("COMITATO")) {
        icon = "fa-file-signature";
        iconColor = "text-cyan-600 bg-cyan-50 border-cyan-200";
        actionTag = "Verbale Sanitario ASL";
      } else if (az.includes("LOGIN")) {
        icon = "fa-key";
        iconColor = "text-slate-600 bg-slate-100 border-slate-200";
        actionTag = "Accesso Sistema";
      }

      return `
        <div class="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/70 hover:bg-white hover:shadow-md hover:border-blue-200 transition border border-white/90 group">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm border shrink-0 ${iconColor} group-hover:scale-105 transition">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${iconColor}">
                  ${actionTag}
                </span>
                <span class="font-bold text-slate-900 text-xs font-heading truncate">
                  ${escapeHtml(l.target || l.modulo || 'Operazione')}
                </span>
              </div>
              <span class="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                ${formatRelativeTime(l.timestamp)}
              </span>
            </div>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">
              ${escapeHtml(l.dettagli || l.azione)}
            </p>
            <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
              <i class="fa-solid fa-user-shield text-[9px]"></i>
              <span>Operatore: <strong>${escapeHtml(l.operatore)}</strong> &bull; Modulo: ${escapeHtml(l.modulo)}</span>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Inizializza Gestione Profilo Operatore Personale
  function initProfileModal() {
    const modalProfile = document.getElementById("modal-operator-profile");
    const btnOpenInHeader = document.getElementById("btn-open-user-profile");
    const btnOpenInHome = document.getElementById("btn-home-open-profile");
    const btnEditInBox = document.getElementById("btn-home-edit-my-profile");
    const btnClose = document.getElementById("btn-close-modal-profile");
    const btnCancel = document.getElementById("btn-cancel-modal-profile");
    const formProfile = document.getElementById("form-operator-profile");

    const openProfile = () => {
      let u = { nomeCompleto: "Marco Galli", username: "admin", email: "admin.cpi@provincia.lecco.it", ruolo: "ADMIN", sedeCpi: "Lecco Centro" };
      const saved = localStorage.getItem("ROXANNE_CURRENT_USER");
      if (saved) {
        try { u = { ...u, ...JSON.parse(saved) }; } catch (e) {}
      }

      document.getElementById("profile-display-role").textContent = (u.ruolo || "OPERATORE CPI").toUpperCase();
      document.getElementById("profile-display-user").textContent = u.username || "admin";
      document.getElementById("prof-nome-completo").value = u.nomeCompleto || "";
      document.getElementById("prof-email").value = u.email || "";
      document.getElementById("prof-sede").value = u.sedeCpi || "Lecco Centro";
      document.getElementById("prof-password").value = "";

      if (modalProfile) modalProfile.classList.remove("hidden");
    };

    if (btnOpenInHeader) btnOpenInHeader.addEventListener("click", openProfile);
    if (btnOpenInHome) btnOpenInHome.addEventListener("click", openProfile);
    if (btnEditInBox) btnEditInBox.addEventListener("click", openProfile);

    if (btnClose && modalProfile) btnClose.addEventListener("click", () => modalProfile.classList.add("hidden"));
    if (btnCancel && modalProfile) btnCancel.addEventListener("click", () => modalProfile.classList.add("hidden"));

    if (formProfile) {
      formProfile.addEventListener("submit", async (e) => {
        e.preventDefault();
        let u = { id: 1, nomeCompleto: "Marco Galli", username: "admin", email: "admin.cpi@provincia.lecco.it", ruolo: "ADMIN", sedeCpi: "Lecco Centro" };
        const saved = localStorage.getItem("ROXANNE_CURRENT_USER");
        if (saved) {
          try { u = { ...u, ...JSON.parse(saved) }; } catch (e) {}
        }

        u.nomeCompleto = document.getElementById("prof-nome-completo").value.trim();
        u.email = document.getElementById("prof-email").value.trim();
        u.sedeCpi = document.getElementById("prof-sede").value.trim();

        const pass = document.getElementById("prof-password").value.trim();
        if (pass) u.password = pass;

        // Salva in localStorage
        localStorage.setItem("ROXANNE_CURRENT_USER", JSON.stringify(u));

        // Tenta sync con API
        try {
          await fetch(`/api/users/${u.id || 1}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(u)
          });
        } catch (err) {
          console.log("Offline mode, saved locally");
        }

        // Aggiorna display ovunque
        const display = document.getElementById("current-user-display");
        if (display) display.textContent = `${u.nomeCompleto} (${u.ruolo})`;

        if (modalProfile) modalProfile.classList.add("hidden");
        renderHomeFeed();

        if (window.RoxToast) {
          window.RoxToast.success("Profilo Aggiornato", "Le modifiche ai tuoi dati operatore sono state salvate.");
        }
      });
    }

    // Quick action cards in Home
    const cSearch = document.getElementById("card-home-go-search");
    if (cSearch) cSearch.addEventListener("click", () => window.navigateToSection && window.navigateToSection("section-search"));

    const cTirocini = document.getElementById("card-home-go-tirocini");
    if (cTirocini) cTirocini.addEventListener("click", () => window.navigateToSection && window.navigateToSection("section-tirocini"));

    const cMatcher = document.getElementById("card-home-go-matcher");
    if (cMatcher) cMatcher.addEventListener("click", () => window.navigateToSection && window.navigateToSection("section-matcher"));

    const cDash = document.getElementById("card-home-go-dashboard");
    if (cDash) cDash.addEventListener("click", () => window.navigateToSection && window.navigateToSection("section-dashboard"));

    const btnQuickNew = document.getElementById("btn-home-quick-new");
    if (btnQuickNew) {
      btnQuickNew.addEventListener("click", () => {
        const btn = document.getElementById("btn-nuovo-iscritto");
        if (btn) btn.click();
      });
    }

    const btnViewAlerts = document.getElementById("btn-home-view-tirocini-alerts");
    if (btnViewAlerts) {
      btnViewAlerts.addEventListener("click", () => {
        if (window.navigateToSection) window.navigateToSection("section-tirocini");
      });
    }
  }

  window.renderHomeFeed = renderHomeFeed;
  window.initProfileModal = initProfileModal;

})(window);
