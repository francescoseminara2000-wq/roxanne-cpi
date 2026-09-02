/**
 * Roxanne CPI Light - Main Orchestrator / Entry Point
 * Architettura modulare pulita: coordina i moduli logici caricati
 */

document.addEventListener("DOMContentLoaded", () => {
  console.log("Inizializzazione Roxanne CPI Modulare...");

  // 1. Controlli Interfaccia (Datepicker, Select ricercabili, Textareas, ViewMode)
  if (typeof window.initCustomSearchableSelects === "function") window.initCustomSearchableSelects();
  if (typeof window.initCustomDatePickers === "function") window.initCustomDatePickers();
  if (typeof window.initViewModeSwitcher === "function") window.initViewModeSwitcher();
  if (typeof window.initAutoExpandTextareas === "function") window.initAutoExpandTextareas();

  // 2. Navigazione Top & Mobile Drawer
  if (typeof window.initMobileDrawer === "function") window.initMobileDrawer();
  if (typeof window.initTopNavigation === "function") window.initTopNavigation();
  if (typeof window.initHubSubTabs === "function") window.initHubSubTabs();

  // 3. Matcher & Moduli Funzionali
  if (typeof window.initMatcherModule === "function") window.initMatcherModule();
  if (typeof window.loadBrandingConfig === "function") window.loadBrandingConfig();

  // 4. Sessione Operatore & Preloader
  if (typeof window.initAuthSession === "function") window.initAuthSession();

  // 5. Primo Rendering Dashboard e Tabella Iscritti
  if (typeof window.renderDashboardAnalytics === "function") window.renderDashboardAnalytics();
  if (typeof window.renderMainSearchTable === "function") window.renderMainSearchTable();

  // 6. Sincronizzazione Remota Database MySQL via REST API
  if (window.store && typeof window.store.initRemoteSync === "function") {
    window.store.initRemoteSync();
  }

  // 7. Reset Database Handler di emergenza
  const btnResetDb = document.getElementById("btn-reset-db");
  if (btnResetDb) {
    btnResetDb.addEventListener("click", () => {
      if (confirm("Ripristinare i dati iniziali dal DB Access?")) {
        if (window.store && typeof window.store.resetToDefault === "function") {
          window.store.resetToDefault();
          if (typeof window.renderMainSearchTable === "function") window.renderMainSearchTable();
          if (typeof window.renderCitizenHub === "function") window.renderCitizenHub();
          if (typeof Swal !== "undefined") {
            Swal.fire({
              icon: 'success',
              title: 'Database Ripristinato',
              text: 'I dati iniziali sono stati ripristinati con successo.',
              confirmButtonColor: '#2563eb'
            });
          } else {
            alert("Database ripristinato!");
          }
        }
      }
    });
  }

  console.log("Roxanne CPI avviato con successo in architettura modulare.");
});
