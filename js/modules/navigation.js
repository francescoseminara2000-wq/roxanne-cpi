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

  // Helper per attivare una sezione salvando lo stato
  function navigateToSection(sectionId, updateHash = true) {
    hideAllSections();

    let targetBtn = null;
    let renderFunc = null;

    if (sectionId === "section-dashboard") {
      targetBtn = btnDash;
      if (sectionDash) sectionDash.classList.remove("hidden");
      renderFunc = window.renderDashboardAnalytics;
    } else if (sectionId === "section-citizen-hub") {
      targetBtn = btnHub;
      if (sectionHub) sectionHub.classList.remove("hidden");
      renderFunc = window.renderCitizenHub;
    } else if (sectionId === "section-matcher") {
      targetBtn = btnMatcher;
      if (sectionMatcher) sectionMatcher.classList.remove("hidden");
      renderFunc = window.runMatcher;
    } else if (sectionId === "section-users") {
      targetBtn = btnUsers;
      if (sectionUsers) sectionUsers.classList.remove("hidden");
      renderFunc = window.renderUsersTable;
    } else if (sectionId === "section-audit") {
      targetBtn = btnAudit;
      if (sectionAudit) sectionAudit.classList.remove("hidden");
      renderFunc = window.renderAuditLogsTable;
    } else {
      // Default: Ricerca
      sectionId = "section-search";
      targetBtn = btnSearch;
      if (sectionSearch) sectionSearch.classList.remove("hidden");
      renderFunc = window.renderMainSearchTable;
    }

    setActiveBtn(targetBtn);
    if (typeof renderFunc === "function") renderFunc();

    try {
      sessionStorage.setItem("ROXANNE_ACTIVE_VIEW", sectionId);
      localStorage.setItem("ROXANNE_ACTIVE_VIEW", sectionId);
      if (updateHash) {
        const hashPart = sectionId.replace("section-", "");
        if (window.location.hash !== `#${hashPart}`) {
          history.replaceState(null, "", `#${hashPart}`);
        }
      }
    } catch (e) {}
  }

  window.navigateToSection = navigateToSection;

  if (btnDash) {
    btnDash.addEventListener("click", () => navigateToSection("section-dashboard"));
  }

  const btnDashNew = document.getElementById("btn-dash-new-cittadino");
  if (btnDashNew) {
    btnDashNew.addEventListener("click", () => {
      const btnNuovo = document.getElementById("btn-nuovo-iscritto");
      if (btnNuovo) btnNuovo.click();
    });
  }

  if (btnSearch) {
    btnSearch.addEventListener("click", () => navigateToSection("section-search"));
  }

  if (btnHub) {
    btnHub.addEventListener("click", () => navigateToSection("section-citizen-hub"));
  }

  if (btnMatcher) {
    btnMatcher.addEventListener("click", () => navigateToSection("section-matcher"));
  }

  if (btnUsers) {
    btnUsers.addEventListener("click", () => navigateToSection("section-users"));
  }

  if (btnAudit) {
    btnAudit.addEventListener("click", () => navigateToSection("section-audit"));
  }

  if (btnBackSearch) {
    btnBackSearch.addEventListener("click", () => navigateToSection("section-search"));
  }

  // Ripristina l'ultima schermata attiva dal Session/Local Storage o dall'URL Hash
  function restorePersistedNavigation() {
    const hash = (window.location.hash || "").replace("#", "").toLowerCase();
    const stored = sessionStorage.getItem("ROXANNE_ACTIVE_VIEW") || localStorage.getItem("ROXANNE_ACTIVE_VIEW");
    
    let target = "section-search";
    if (hash === "dashboard" || hash === "section-dashboard") {
      target = "section-dashboard";
    } else if (hash === "citizen-hub" || hash === "hub" || hash === "section-citizen-hub") {
      target = "section-citizen-hub";
    } else if (hash === "matcher" || hash === "section-matcher") {
      target = "section-matcher";
    } else if (hash === "users" || hash === "section-users") {
      target = "section-users";
    } else if (hash === "audit" || hash === "section-audit") {
      target = "section-audit";
    } else if (hash === "search" || hash === "section-search") {
      target = "section-search";
    } else if (stored) {
      target = stored;
    }

    navigateToSection(target, false);
  }

  window.restorePersistedNavigation = restorePersistedNavigation;

  // Ascolta cambi hash manuali o navigazione cronologia browser
  window.addEventListener("hashchange", () => {
    restorePersistedNavigation();
  });

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

  // --- CONTROLLER INGRANDIMENTO & SCALABILITÀ SCHERMATE (100% / 115% / 130%) ---
  const btnZoomNormal = document.getElementById("btn-zoom-normal");
  const btnZoomLarge = document.getElementById("btn-zoom-large");
  const btnZoomXLarge = document.getElementById("btn-zoom-xlarge");
  const zoomBtns = [btnZoomNormal, btnZoomLarge, btnZoomXLarge];

  function applyZoom(zoomLevel) {
    document.documentElement.classList.remove("zoom-100", "zoom-115", "zoom-130");
    document.documentElement.classList.add(`zoom-${zoomLevel}`);
    localStorage.setItem("ROXANNE_ZOOM_LEVEL", String(zoomLevel));

    zoomBtns.forEach(btn => {
      if (btn) {
        btn.classList.remove("active", "bg-white", "text-blue-600", "shadow-2xs");
        btn.classList.add("text-slate-600");
      }
    });

    const activeBtn = zoomLevel === 100 ? btnZoomNormal : zoomLevel === 130 ? btnZoomXLarge : btnZoomLarge;
    if (activeBtn) {
      activeBtn.classList.add("active", "bg-white", "text-blue-600", "shadow-2xs");
      activeBtn.classList.remove("text-slate-600");
    }
  }

  if (btnZoomNormal) btnZoomNormal.addEventListener("click", () => applyZoom(100));
  if (btnZoomLarge) btnZoomLarge.addEventListener("click", () => applyZoom(115));
  if (btnZoomXLarge) btnZoomXLarge.addEventListener("click", () => applyZoom(130));

  // Inizializza con livello 115% (Ampio & Leggibile di default)
  const savedZoom = parseInt(localStorage.getItem("ROXANNE_ZOOM_LEVEL")) || 115;
  applyZoom(savedZoom);
}

window.initMobileDrawer = initMobileDrawer;
window.initTopNavigation = initTopNavigation;
