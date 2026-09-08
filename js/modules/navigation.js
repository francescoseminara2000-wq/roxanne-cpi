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

  let liquidNavInstance = null;

  function setActiveBtn(activeBtn) {
    [btnDash, btnSearch, btnHub, btnMatcher, btnAudit, btnUsers].forEach(btn => {
      if (btn) {
        btn.classList.remove("active");
        btn.classList.add("text-slate-500");
      }
    });
    if (activeBtn) {
      activeBtn.classList.add("active");
      activeBtn.classList.remove("text-slate-500");

      if (liquidNavInstance) {
        liquidNavInstance.updateTarget(activeBtn, true);
      }
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

  // Inizializza indicatore dinamico Liquid Glass sulla barra desktop
  liquidNavInstance = new LiquidGlassNavbar("#desktop-nav-container");
}

// ==========================================
// LIQUID GLASS SLIDING PILL SPRING ENGINE (JS VIA requestAnimationFrame)
// ==========================================
class LiquidGlassNavbar {
  constructor(wrapperSelector = "#desktop-nav-container") {
    this.wrapper = document.querySelector(wrapperSelector);
    if (!this.wrapper) return;

    this.baseNav = this.wrapper.querySelector("#desktop-nav-base");
    this.pill = this.wrapper.querySelector("#liquid-glass-pill");
    if (!this.baseNav || !this.pill) return;

    this.buttons = Array.from(this.baseNav.querySelectorAll(".nav-mode-btn"));

    // Posizioni animate: x (translate), w (width)
    this.current = { x: 0, w: 0 };
    this.target = { x: 0, w: 0 };
    this.velocity = { x: 0, w: 0 };

    this.animId = null;
    this.lastTime = null;

    this.init();
  }

  init() {
    // Snap immediato al primo rendering
    setTimeout(() => {
      const activeBtn = this.buttons.find(b => b.classList.contains("active")) || this.buttons[1] || this.buttons[0];
      if (activeBtn) {
        this.updateTarget(activeBtn, false);
        this.pill.classList.add("visible");
      }
    }, 60);

    // Gestione ridimensionamento finestra o zoom
    window.addEventListener("resize", () => {
      const activeBtn = this.buttons.find(b => b.classList.contains("active")) || this.buttons[0];
      if (activeBtn) {
        this.updateTarget(activeBtn, false);
      }
    });
  }

  updateTarget(targetBtn, animate = true) {
    if (!targetBtn || !this.pill || !this.baseNav) return;

    const navRect = this.baseNav.getBoundingClientRect();
    const btnRect = targetBtn.getBoundingClientRect();

    if (navRect.width === 0 || btnRect.width === 0) return;

    // Calcolo coordinate relative rispetto a #desktop-nav-base
    const targetX = btnRect.left - navRect.left;
    const targetW = btnRect.width;

    this.target = { x: targetX, w: targetW };

    if (!animate) {
      this.current.x = targetX;
      this.current.w = targetW;
      this.velocity.x = 0;
      this.velocity.w = 0;
      this.applyPillStyle();
      this.pill.classList.add("visible");
      return;
    }

    this.pill.classList.add("visible");

    if (!this.animId) {
      this.lastTime = performance.now();
      this.animId = requestAnimationFrame((t) => this.tick(t));
    }
  }

  tick(time) {
    const dt = Math.min((time - (this.lastTime || time)) / 1000, 0.032);
    this.lastTime = time;

    // PARAMETRI FISICI A MOLLA (Spring Dynamics con allungamento fluido e overshoot viscoso)
    const springStiffness = 320;
    const springDamping = 24;

    // Molla per la posizione X
    const forceX = -springStiffness * (this.current.x - this.target.x) - springDamping * this.velocity.x;
    this.velocity.x += forceX * dt;
    this.current.x += this.velocity.x * dt;

    // Molla per la larghezza W (allungamento / stretching reattivo)
    const forceW = -springStiffness * (this.current.w - this.target.w) - (springDamping * 0.9) * this.velocity.w;
    this.velocity.w += forceW * dt;
    this.current.w += this.velocity.w * dt;

    this.applyPillStyle();

    // Condizione di arresto quando le oscillazioni convergono
    const isSettled =
      Math.abs(this.current.x - this.target.x) < 0.1 &&
      Math.abs(this.velocity.x) < 0.1 &&
      Math.abs(this.current.w - this.target.w) < 0.1 &&
      Math.abs(this.velocity.w) < 0.1;

    if (isSettled) {
      this.current.x = this.target.x;
      this.current.w = this.target.w;
      this.velocity.x = 0;
      this.velocity.w = 0;
      this.applyPillStyle();
      this.animId = null;
    } else {
      this.animId = requestAnimationFrame((t) => this.tick(t));
    }
  }

  applyPillStyle() {
    this.pill.style.transform = `translate3d(${this.current.x.toFixed(2)}px, 0, 0)`;
    this.pill.style.width = `${this.current.w.toFixed(2)}px`;
  }
}

window.LiquidGlassNavbar = LiquidGlassNavbar;
window.initMobileDrawer = initMobileDrawer;
window.initTopNavigation = initTopNavigation;
