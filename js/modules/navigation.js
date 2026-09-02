/**
 * Roxanne CPI Light - Top Navigation & Mobile Drawer Controller
 * Switcher sezioni di primo livello (Dashboard, Ricerca, Scheda 360°, Matcher, Utenze, Audit)
 */

function initMobileDrawer() {
  const btnToggle = document.getElementById("btn-mobile-menu-toggle");
  const drawer = document.getElementById("mobile-drawer");
  const btnClose = document.getElementById("btn-close-mobile-drawer");
  const backdrop = document.getElementById("mobile-drawer-backdrop");

  if (btnToggle && drawer) {
    btnToggle.addEventListener("click", () => drawer.classList.remove("hidden"));
    const close = () => drawer.classList.add("hidden");
    if (btnClose) btnClose.addEventListener("click", close);
    if (backdrop) backdrop.addEventListener("click", close);

    document.querySelectorAll(".mobile-nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetSecId = btn.dataset.target;
        document.querySelectorAll("main > section").forEach(sec => sec.classList.add("hidden"));
        const targetSec = document.getElementById(targetSecId);
        if (targetSec) targetSec.classList.remove("hidden");

        if (targetSecId === "section-dashboard") {
          const dashBtn = document.getElementById("nav-mode-dashboard");
          if (dashBtn) dashBtn.click();
        } else if (targetSecId === "section-search") {
          const sBtn = document.getElementById("nav-mode-search");
          if (sBtn) sBtn.click();
        }
        close();
      });
    });
  }
}

function initTopNavigation() {
  const btnDash = document.getElementById("nav-mode-dashboard");
  const btnSearch = document.getElementById("nav-mode-search");
  const btnHub = document.getElementById("nav-mode-hub");
  const btnMatcher = document.getElementById("nav-mode-matcher");
  const btnUsers = document.getElementById("nav-mode-users");
  const btnAudit = document.getElementById("nav-mode-audit");
  const btnBackSearch = document.getElementById("btn-back-to-search");

  const sectionDash = document.getElementById("section-dashboard");
  const sectionSearch = document.getElementById("section-search");
  const sectionHub = document.getElementById("section-citizen-hub");
  const sectionMatcher = document.getElementById("section-matcher");
  const sectionAudit = document.getElementById("section-audit");
  const sectionUsers = document.getElementById("section-users");

  function hideAllSections() {
    const allSecs = [sectionDash, sectionSearch, sectionHub, sectionMatcher, sectionAudit, sectionUsers];
    allSecs.forEach(s => {
      if (s) s.classList.add("hidden");
    });
  }

  function setActiveBtn(activeBtn) {
    [btnDash, btnSearch, btnHub, btnMatcher, btnAudit, btnUsers].forEach(btn => {
      if (btn) {
        btn.classList.remove("active", "bg-white", "text-blue-600", "shadow-xs", "font-semibold");
        btn.classList.add("text-slate-600", "font-medium");
      }
    });
    if (activeBtn) {
      activeBtn.classList.add("active", "bg-white", "text-blue-600", "shadow-xs", "font-semibold");
      activeBtn.classList.remove("text-slate-600", "font-medium");
    }
  }

  if (btnDash) {
    btnDash.addEventListener("click", () => {
      setActiveBtn(btnDash);
      hideAllSections();
      if (sectionDash) sectionDash.classList.remove("hidden");
      if (typeof window.renderDashboardAnalytics === "function") window.renderDashboardAnalytics();
    });
  }

  const btnDashNew = document.getElementById("btn-dash-new-cittadino");
  if (btnDashNew) {
    btnDashNew.addEventListener("click", () => {
      const btnNuovo = document.getElementById("btn-nuovo-iscritto");
      if (btnNuovo) btnNuovo.click();
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener("click", () => {
      setActiveBtn(btnSearch);
      hideAllSections();
      if (sectionSearch) sectionSearch.classList.remove("hidden");
      if (typeof window.renderMainSearchTable === "function") window.renderMainSearchTable();
    });
  }

  if (btnHub) {
    btnHub.addEventListener("click", () => {
      setActiveBtn(btnHub);
      hideAllSections();
      if (sectionHub) sectionHub.classList.remove("hidden");
      if (typeof window.renderCitizenHub === "function") window.renderCitizenHub();
    });
  }

  if (btnMatcher) {
    btnMatcher.addEventListener("click", () => {
      setActiveBtn(btnMatcher);
      hideAllSections();
      if (sectionMatcher) sectionMatcher.classList.remove("hidden");
      if (typeof window.runMatcher === "function") window.runMatcher();
    });
  }

  if (btnUsers) {
    btnUsers.addEventListener("click", () => {
      setActiveBtn(btnUsers);
      hideAllSections();
      if (sectionUsers) sectionUsers.classList.remove("hidden");
      if (typeof window.renderUsersTable === "function") window.renderUsersTable();
    });
  }

  if (btnAudit) {
    btnAudit.addEventListener("click", () => {
      setActiveBtn(btnAudit);
      hideAllSections();
      if (sectionAudit) sectionAudit.classList.remove("hidden");
      if (typeof window.renderAuditLogsTable === "function") window.renderAuditLogsTable();
    });
  }

  if (btnBackSearch) {
    btnBackSearch.addEventListener("click", () => {
      if (btnSearch) btnSearch.click();
    });
  }

  // Advanced Search filters listeners
  const searchInputs = ["af-nome", "af-cf", "af-num-iscriz", "af-comune", "af-categoria", "af-stato", "af-min-ic", "af-noeretta"];
  searchInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener(el.tagName === "INPUT" && el.type !== "checkbox" ? "input" : "change", () => {
        if (typeof window.renderMainSearchTable === "function") window.renderMainSearchTable();
      });
    }
  });

  const btnResetSearch = document.getElementById("btn-reset-advanced-search");
  if (btnResetSearch) {
    btnResetSearch.addEventListener("click", () => {
      document.getElementById("af-nome").value = "";
      document.getElementById("af-cf").value = "";
      document.getElementById("af-num-iscriz").value = "";
      document.getElementById("af-comune").value = "";
      document.getElementById("af-categoria").value = "ALL";
      document.getElementById("af-stato").value = "ALL";
      document.getElementById("af-min-ic").value = "";
      document.getElementById("af-noeretta").checked = false;
      if (typeof window.renderMainSearchTable === "function") window.renderMainSearchTable();
    });
  }
}

window.initMobileDrawer = initMobileDrawer;
window.initTopNavigation = initTopNavigation;
