/**
 * Roxanne CPI Light - Main App Controller
 * Riprogettazione UI: Scheda 360° Raggruppata per Card Logiche & Editing In-Place
 */

// --- NATIVE TAILWIND GLASS-TOAST NOTIFICATION ENGINE ---
window.RoxToast = {
  container: null,
  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "roxanne-toast-container";
      document.body.appendChild(this.container);
    }
  },
  show({ title = "Notifica", message = "", type = "success", duration = 3200 }) {
    this.init();

    const toast = document.createElement("div");
    toast.className = `rox-toast rox-toast-${type}`;

    const iconMap = {
      success: '<i class="fa-solid fa-circle-check"></i>',
      error: '<i class="fa-solid fa-circle-xmark"></i>',
      warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
      info: '<i class="fa-solid fa-circle-info"></i>'
    };

    toast.innerHTML = `
      <div class="rox-toast-icon">
        ${iconMap[type] || iconMap.info}
      </div>
      <div class="rox-toast-content">
        <div class="rox-toast-title">${title}</div>
        ${message ? `<div class="rox-toast-message">${message}</div>` : ''}
      </div>
      <button class="rox-toast-close" aria-label="Chiudi notifica">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="rox-toast-progress">
        <div class="rox-toast-progress-bar" style="animation: roxToastProgress ${duration}ms linear forwards;"></div>
      </div>
    `;

    this.container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add("rox-toast-visible");
    });

    const closeBtn = toast.querySelector(".rox-toast-close");
    let timer = null;

    const removeToast = () => {
      if (timer) clearTimeout(timer);
      toast.classList.remove("rox-toast-visible");
      toast.classList.add("rox-toast-leaving");
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    };

    if (closeBtn) closeBtn.addEventListener("click", removeToast);
    if (duration > 0) timer = setTimeout(removeToast, duration);

    return toast;
  },
  success(title, message, duration) { return this.show({ title, message, type: 'success', duration }); },
  error(title, message, duration) { return this.show({ title, message, type: 'error', duration }); },
  info(title, message, duration) { return this.show({ title, message, type: 'info', duration }); },
  warning(title, message, duration) { return this.show({ title, message, type: 'warning', duration }); }
};

document.addEventListener("DOMContentLoaded", () => {
  let currentResultsViewMode = "table"; // table | cards | compact
  let chartCatBreakdown = null;
  let chartStatusBreakdown = null;

  // --- AD-HOC CUSTOM DATEPICKER INITIALIZATION (FLATPICKR IT) ---
  function initCustomDatePickers() {
    if (typeof flatpickr !== "undefined") {
      flatpickr.localize(flatpickr.l10ns.it);
      flatpickr("input[type='date'], .datepicker-input", {
        dateFormat: "Y-m-d",
        altInput: true,
        altFormat: "d/m/Y",
        allowInput: true,
        showMonths: 1,
        monthSelectorType: "static",
        prevArrow: '<i class="fa-solid fa-chevron-left text-slate-500 hover:text-blue-600 text-xs"></i>',
        nextArrow: '<i class="fa-solid fa-chevron-right text-slate-500 hover:text-blue-600 text-xs"></i>',
        disableMobile: true,
        animate: true
      });
    }
  }

  // --- AD-HOC CUSTOM SEARCHABLE SELECT ENGINE (ZERO NATIVE DROPDOWNS) ---
  function initCustomSearchableSelects() {
    document.querySelectorAll("select").forEach(selectEl => {
      if (selectEl.dataset.customized === "true") return;
      selectEl.dataset.customized = "true";
      selectEl.style.display = "none";

      const wrapper = document.createElement("div");
      wrapper.className = "custom-select-wrapper";
      wrapper.dataset.selectId = selectEl.id || "";

      const trigger = document.createElement("div");
      trigger.className = "custom-select-trigger";
      
      const currentSelectedOption = selectEl.options[selectEl.selectedIndex] || selectEl.options[0];
      const triggerText = document.createElement("span");
      triggerText.className = "truncate mr-2";
      triggerText.textContent = currentSelectedOption ? currentSelectedOption.text : "Seleziona...";
      
      const arrowIcon = document.createElement("i");
      arrowIcon.className = "fa-solid fa-chevron-down arrow-icon";
      trigger.appendChild(triggerText);
      trigger.appendChild(arrowIcon);

      const menu = document.createElement("div");
      menu.className = "custom-select-menu";

      // Search box if more than 3 options
      const hasSearch = selectEl.options.length >= 2;
      let searchInput = null;

      if (hasSearch) {
        const searchBox = document.createElement("div");
        searchBox.className = "custom-select-search-box";
        searchBox.innerHTML = `
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Cerca opzione..." class="focus:outline-none">
        `;
        searchInput = searchBox.querySelector("input");
        menu.appendChild(searchBox);
      }

      const optionsList = document.createElement("div");
      optionsList.className = "custom-select-options-list";

      function renderOptions(filterText = "") {
        optionsList.innerHTML = "";
        const query = filterText.toLowerCase().trim();
        let matchCount = 0;

        Array.from(selectEl.options).forEach(opt => {
          if (query && !opt.text.toLowerCase().includes(query)) return;
          matchCount++;

          const optDiv = document.createElement("div");
          optDiv.className = `custom-select-option ${opt.value === selectEl.value ? 'selected' : ''}`;
          optDiv.textContent = opt.text;
          optDiv.dataset.value = opt.value;

          optDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            selectEl.value = opt.value;
            triggerText.textContent = opt.text;
            wrapper.classList.remove("open");
            
            // Dispatch change event to native select
            selectEl.dispatchEvent(new Event("change", { bubbles: true }));
            renderOptions();
          });

          optionsList.appendChild(optDiv);
        });

        if (matchCount === 0) {
          optionsList.innerHTML = `<div class="custom-select-no-results">Nessuna opzione corrispondente</div>`;
        }
      }

      renderOptions();
      menu.appendChild(optionsList);

      wrapper.appendChild(trigger);
      wrapper.appendChild(menu);
      selectEl.parentNode.insertBefore(wrapper, selectEl.nextSibling);

      // Trigger click toggle
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.contains("open");
        
        // Close other custom selects
        document.querySelectorAll(".custom-select-wrapper.open").forEach(w => {
          if (w !== wrapper) w.classList.remove("open");
        });

        wrapper.classList.toggle("open", !isOpen);
        if (!isOpen && searchInput) {
          searchInput.value = "";
          renderOptions();
          setTimeout(() => searchInput.focus(), 50);
        }
      });

      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          renderOptions(e.target.value);
        });
        searchInput.addEventListener("click", (e) => e.stopPropagation());
      }

      // Sync if select value changed programmatically
      selectEl.addEventListener("updateCustomUI", () => {
        const selectedOpt = selectEl.options[selectEl.selectedIndex];
        if (selectedOpt) {
          triggerText.textContent = selectedOpt.text;
          renderOptions();
        }
      });
    });

    // Close on click outside
    document.addEventListener("click", () => {
      document.querySelectorAll(".custom-select-wrapper.open").forEach(w => w.classList.remove("open"));
    });
  }

  // --- VIEW MODE SWITCHER (TABELLA, CARDS, COMPATTO) ---
  function initViewModeSwitcher() {
    const btnTable = document.getElementById("vm-table");
    const btnCards = document.getElementById("vm-cards");
    const btnCompact = document.getElementById("vm-compact");

    const viewTable = document.getElementById("view-results-table");
    const viewCards = document.getElementById("view-results-cards");
    const viewCompact = document.getElementById("view-results-compact");

    function setViewMode(mode, activeBtn) {
      currentResultsViewMode = mode;
      [btnTable, btnCards, btnCompact].forEach(b => {
        b.classList.remove("active", "bg-blue-50", "text-blue-700", "border-blue-200", "font-semibold");
        b.classList.add("text-slate-600", "font-medium");
      });
      activeBtn.classList.add("active", "bg-blue-50", "text-blue-700", "border-blue-200", "font-semibold");
      activeBtn.classList.remove("text-slate-600", "font-medium");

      [viewTable, viewCards, viewCompact].forEach(v => v.classList.add("hidden"));
      if (mode === "table") viewTable.classList.remove("hidden");
      if (mode === "cards") viewCards.classList.remove("hidden");
      if (mode === "compact") viewCompact.classList.remove("hidden");

      renderMainSearchTable();
    }

    btnTable.addEventListener("click", () => setViewMode("table", btnTable));
    btnCards.addEventListener("click", () => setViewMode("cards", btnCards));
    btnCompact.addEventListener("click", () => setViewMode("compact", btnCompact));
  }

  // --- AUTO-EXPANDING TEXTAREAS CONTROLLER ---
  function initAutoExpandTextareas() {
    function autoResize(el) {
      el.style.height = "auto";
      el.style.height = (el.scrollHeight + 4) + "px";
    }

    document.querySelectorAll(".auto-expand-textarea").forEach(tx => {
      tx.addEventListener("input", () => autoResize(tx));
      tx.addEventListener("focus", () => autoResize(tx));
      // Initial resize if already has content
      setTimeout(() => autoResize(tx), 100);
    });
  }

  // --- INITIALIZATION ---
  initCustomSearchableSelects();
  initCustomDatePickers();
  initViewModeSwitcher();
  initMobileDrawer();
  initTopNavigation();
  initHubSubTabs();
  initAutoExpandTextareas();
  renderDashboardAnalytics();
  renderMainSearchTable();

  // Remote Database Auto-Sync (MySQL via Prisma)
  if (window.store && typeof window.store.initRemoteSync === "function") {
    window.store.initRemoteSync();
  }

  // --- MOBILE DRAWER NAVIGATION ---
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

          // Update desktop buttons too
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

  // --- DASHBOARD ANALYTICS RENDERER (APEXCHARTS + KPIS) ---
  function renderDashboardAnalytics() {
    const persone = window.store.getPersone() || [];
    const total = persone.length;

    const disoccupati = persone.filter(p => (p.stato || "").toLowerCase().includes("disoccupat")).length;
    const occupati = total - disoccupati;

    // Average IC
    const totalIc = persone.reduce((sum, p) => sum + (p.icPercentuale || 0), 0);
    const avgIc = total > 0 ? Math.round(totalIc / total) : 0;

    // Update KPI Card Numbers
    const kpiTot = document.getElementById("kpi-total-iscritti");
    const kpiDis = document.getElementById("kpi-total-disoccupati");
    const kpiOcc = document.getElementById("kpi-total-occupati");
    const kpiAvg = document.getElementById("kpi-avg-ic");

    if (kpiTot) kpiTot.textContent = total;
    if (kpiDis) kpiDis.textContent = disoccupati;
    if (kpiOcc) kpiOcc.textContent = occupati;
    if (kpiAvg) kpiAvg.textContent = `${avgIc}%`;

    // Category Breakdown (C.O. vs Art. 18 vs F.D. vs BSL)
    const catCO = persone.filter(p => (p.categoria || "").includes("C.O.")).length;
    const catArt18 = persone.filter(p => (p.categoria || "").includes("18")).length;
    const catFD = persone.filter(p => (p.categoria || "").includes("F.D.")).length;
    const catAltro = total - (catCO + catArt18 + catFD);

    // Chart 1: Donut Chart
    const catChartEl = document.getElementById("chart-cat-breakdown");
    if (catChartEl && typeof ApexCharts !== "undefined") {
      const catOptions = {
        series: [catCO || 1, catArt18 || 0, catFD || 0, catAltro || 0],
        labels: ['C.O. Disabili (Art.1)', 'Art. 18 Categorie Protette', 'F.D. Disabili', 'Altro/BSL'],
        chart: {
          type: 'donut',
          height: 240,
          fontFamily: 'Inter, sans-serif'
        },
        colors: ['#2563eb', '#6366f1', '#10b981', '#f59e0b'],
        legend: { position: 'bottom', fontSize: '11px' },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Totale L.68',
                  fontSize: '11px',
                  fontWeight: 600,
                  formatter: () => `${total}`
                }
              }
            }
          }
        },
        stroke: { show: false }
      };

      if (chartCatBreakdown) chartCatBreakdown.destroy();
      catChartEl.innerHTML = "";
      chartCatBreakdown = new ApexCharts(catChartEl, catOptions);
      chartCatBreakdown.render();
    }

    // Chart 2: Status Column Bar Chart
    const statusChartEl = document.getElementById("chart-status-breakdown");
    if (statusChartEl && typeof ApexCharts !== "undefined") {
      const statusOptions = {
        series: [{
          name: 'Iscritti',
          data: [disoccupati, occupati, persone.filter(p => (p.stato || "").toLowerCase().includes("tirocinio")).length]
        }],
        chart: {
          type: 'bar',
          height: 240,
          toolbar: { show: false },
          fontFamily: 'Inter, sans-serif'
        },
        plotOptions: {
          bar: {
            borderRadius: 8,
            columnWidth: '40%',
            distributed: true
          }
        },
        colors: ['#059669', '#2563eb', '#6366f1'],
        xaxis: {
          categories: ['In Cerca Attiva', 'Occupati T.Det/Indet', 'In Tirocinio'],
          labels: { style: { fontSize: '11px', fontWeight: 600 } }
        },
        legend: { show: false }
      };

      if (chartStatusBreakdown) chartStatusBreakdown.destroy();
      statusChartEl.innerHTML = "";
      chartStatusBreakdown = new ApexCharts(statusChartEl, statusOptions);
      chartStatusBreakdown.render();
    }
  }

  // --- TOP NAVIGATION MODE SWITCHER ---
  function initTopNavigation() {
    const btnDash = document.getElementById("nav-mode-dashboard");
    const btnSearch = document.getElementById("nav-mode-search");
    const btnHub = document.getElementById("nav-mode-hub");
    const btnMatcher = document.getElementById("nav-mode-matcher");
    const btnAudit = document.getElementById("nav-mode-audit");
    const btnBackSearch = document.getElementById("btn-back-to-search");

    const sectionDash = document.getElementById("section-dashboard");
    const sectionSearch = document.getElementById("section-search");
    const sectionHub = document.getElementById("section-citizen-hub");
    const sectionMatcher = document.getElementById("section-matcher");
    const sectionAudit = document.getElementById("section-audit");

    function setActiveBtn(activeBtn) {
      [btnDash, btnSearch, btnHub, btnMatcher, btnAudit].forEach(btn => {
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
        [sectionDash, sectionSearch, sectionHub, sectionMatcher, sectionAudit].forEach(s => s && s.classList.add("hidden"));
        if (sectionDash) sectionDash.classList.remove("hidden");
        renderDashboardAnalytics();
      });
    }

    const btnDashNew = document.getElementById("btn-dash-new-cittadino");
    if (btnDashNew) {
      btnDashNew.addEventListener("click", () => {
        const btnNuovo = document.getElementById("btn-nuovo-iscritto");
        if (btnNuovo) btnNuovo.click();
      });
    }

    btnSearch.addEventListener("click", () => {
      setActiveBtn(btnSearch);
      [sectionDash, sectionSearch, sectionHub, sectionMatcher, sectionAudit].forEach(s => s && s.classList.add("hidden"));
      sectionSearch.classList.remove("hidden");
      renderMainSearchTable();
    });

    btnHub.addEventListener("click", () => {
      setActiveBtn(btnHub);
      sectionSearch.classList.add("hidden");
      sectionHub.classList.remove("hidden");
      sectionMatcher.classList.add("hidden");
      if (sectionAudit) sectionAudit.classList.add("hidden");
      renderCitizenHub();
    });

    btnMatcher.addEventListener("click", () => {
      setActiveBtn(btnMatcher);
      sectionSearch.classList.add("hidden");
      sectionHub.classList.add("hidden");
      sectionMatcher.classList.remove("hidden");
      if (sectionAudit) sectionAudit.classList.add("hidden");
      runMatcher();
    });

    const btnUsers = document.getElementById("nav-mode-users");
    const sectionUsers = document.getElementById("section-users");

    if (btnUsers) {
      btnUsers.addEventListener("click", () => {
        setActiveBtn(btnUsers);
        [sectionDash, sectionSearch, sectionHub, sectionMatcher, sectionAudit, sectionUsers].forEach(s => s && s.classList.add("hidden"));
        if (sectionUsers) sectionUsers.classList.remove("hidden");
        renderUsersTable();
      });
    }

    if (btnAudit) {
      btnAudit.addEventListener("click", () => {
        setActiveBtn(btnAudit);
        [sectionDash, sectionSearch, sectionHub, sectionMatcher, sectionAudit, sectionUsers].forEach(s => s && s.classList.add("hidden"));
        sectionAudit.classList.remove("hidden");
        renderAuditLogsTable();
      });
    }

    // Logout Action
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        if (confirm("Effettuare il logout dalla sessione di lavoro?")) {
          localStorage.removeItem("ROXANNE_CURRENT_USER");
          document.getElementById("modal-login").classList.remove("hidden");
        }
      });
    }

    // Active User Switcher Listener
    const selectActiveUser = document.getElementById("select-active-user");
    if (selectActiveUser) {
      selectActiveUser.addEventListener("change", (e) => {
        const userName = e.target.options[e.target.selectedIndex].text;
        window.store.setActiveUser(userName);
      });
    }

    if (btnBackSearch) {
      btnBackSearch.addEventListener("click", () => {
        btnSearch.click();
      });
    }

    // Advanced Search filters listeners
    const searchInputs = ["af-nome", "af-cf", "af-num-iscriz", "af-comune", "af-categoria", "af-stato", "af-min-ic", "af-noeretta"];
    searchInputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener(el.tagName === "INPUT" && el.type !== "checkbox" ? "input" : "change", renderMainSearchTable);
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
        renderMainSearchTable();
      });
    }
  }

  // --- MAIN ADVANCED SEARCH TABLE RENDERER (MULTI-FIELD) ---
  function renderMainSearchTable() {
    const persone = window.store.getPersone();
    
    const filterNome = (document.getElementById("af-nome").value || "").toLowerCase().trim();
    const filterCf = (document.getElementById("af-cf").value || "").toLowerCase().trim();
    const filterNumIscriz = (document.getElementById("af-num-iscriz").value || "").trim();
    const filterComune = (document.getElementById("af-comune").value || "").toLowerCase().trim();
    const filterCat = document.getElementById("af-categoria").value;
    const filterStato = document.getElementById("af-stato").value;
    const filterMinIc = parseInt(document.getElementById("af-min-ic").value) || 0;
    const filterNoEretta = document.getElementById("af-noeretta").checked;

    const filtered = persone.filter(p => {
      const matchNome = !filterNome || p.nome.toLowerCase().includes(filterNome);
      const matchCf = !filterCf || p.codiceFiscale.toLowerCase().includes(filterCf);
      const matchNum = !filterNumIscriz || String(p.numeroIscrizione).includes(filterNumIscriz);
      const matchComune = !filterComune || (p.comuneResidenza && p.comuneResidenza.toLowerCase().includes(filterComune));
      const matchCat = filterCat === "ALL" || p.categoria === filterCat;
      const matchStato = filterStato === "ALL" || (filterStato === "Occupato" ? p.stato.includes("Occupato") : p.stato === filterStato);
      const matchIc = filterMinIc === 0 || p.icPercentuale >= filterMinIc;
      const matchEretta = !filterNoEretta || p.stazioneEretta === false;

      return matchNome && matchCf && matchNum && matchComune && matchCat && matchStato && matchIc && matchEretta;
    });

    document.getElementById("badge-search-count").textContent = `${filtered.length} Iscritti nel Database`;

    // 1. RENDER VISTA TABELLA
    const tbody = document.getElementById("tbody-main-search");
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-slate-400 italic">Nessun iscritto corrisponde ai criteri.</td></tr>`;
    } else {
      tbody.innerHTML = filtered.map(p => {
        const badgeClass = p.categoria === "C.O." ? "badge-co" : p.categoria === "Art. 18" ? "badge-art18" : "badge-fd";
        return `
          <tr class="hover:bg-slate-50 transition">
            <td class="px-5 py-4 font-bold text-slate-800">
              #${p.numeroIscrizione}
              <div class="text-[10px] text-slate-400 font-normal">${p.codice}</div>
            </td>
            <td class="px-5 py-4">
              <div class="font-bold text-slate-900 font-heading text-sm">${escapeHtml(p.nome)}</div>
              <div class="text-[11px] font-bold text-blue-700">${p.codiceFiscale}</div>
            </td>
            <td class="px-5 py-4">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}">${p.categoria}</span>
            </td>
            <td class="px-5 py-4 font-bold ${p.icPercentuale >= 67 ? 'text-rose-600' : 'text-slate-800'}">
              ${p.icPercentuale > 0 ? `${p.icPercentuale}% IC` : 'Art.18'}
            </td>
            <td class="px-5 py-4 text-slate-700 font-medium">${escapeHtml(p.comuneResidenza)}</td>
            <td class="px-5 py-4 text-slate-600">
              <div class="font-semibold text-slate-800">${p.stato || 'Disoccupato'}</div>
              <div class="text-[11px] text-slate-400">${escapeHtml(p.operatore || 'CPI Lecco')}</div>
            </td>
            <td class="px-5 py-4 text-right">
              <button data-id="${p.id}" class="btn-open-citizen-hub cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs font-heading">
                Apri Scheda 360° <i class="fa-solid fa-arrow-right ml-1 text-[10px]"></i>
              </button>
            </td>
          </tr>
        `;
      }).join("");
    }

    // 2. RENDER VISTA SCHEDE / CARDS
    const cardsContainer = document.getElementById("view-results-cards");
    if (filtered.length === 0) {
      cardsContainer.innerHTML = `<p class="text-xs text-slate-400 py-10 col-span-3 text-center italic">Nessun iscritto corrisponde ai criteri.</p>`;
    } else {
      cardsContainer.innerHTML = filtered.map(p => {
        const badgeClass = p.categoria === "C.O." ? "badge-co" : p.categoria === "Art. 18" ? "badge-art18" : "badge-fd";
        return `
          <div class="card-white p-5 space-y-3 card-white-interactive flex flex-col justify-between">
            <div class="space-y-2">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-bold text-slate-900 text-base font-heading">${escapeHtml(p.nome)}</h3>
                  <p class="text-xs font-mono text-blue-700 font-semibold">${p.codiceFiscale}</p>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}">${p.categoria}</span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                <div><span class="text-slate-400 text-[10px] block uppercase font-semibold">N. Iscrizione</span><strong class="text-slate-800 font-mono">#${p.numeroIscrizione}</strong></div>
                <div><span class="text-slate-400 text-[10px] block uppercase font-semibold">Invalidità Civile</span><strong class="${p.icPercentuale >= 67 ? 'text-rose-600 font-bold' : 'text-slate-800'}">${p.icPercentuale > 0 ? `${p.icPercentuale}%` : 'Art.18'}</strong></div>
                <div><span class="text-slate-400 text-[10px] block uppercase font-semibold">Residenza</span><strong class="text-slate-800">${escapeHtml(p.comuneResidenza)}</strong></div>
                <div><span class="text-slate-400 text-[10px] block uppercase font-semibold">Stato Occupaz.</span><strong class="text-emerald-700">${escapeHtml(p.stato || 'Disoccupato')}</strong></div>
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 flex justify-between items-center">
              <span class="text-[11px] text-slate-400"><i class="fa-solid fa-user-gear mr-1"></i> ${escapeHtml(p.operatore || 'CPI Lecco')}</span>
              <button data-id="${p.id}" class="btn-open-citizen-hub cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition font-heading">
                Apri Scheda 360°
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    // 3. RENDER VISTA ELENCO COMPATTO
    const compactContainer = document.getElementById("view-results-compact");
    if (filtered.length === 0) {
      compactContainer.innerHTML = `<p class="text-xs text-slate-400 py-10 text-center italic">Nessun iscritto corrisponde ai criteri.</p>`;
    } else {
      compactContainer.innerHTML = filtered.map(p => {
        const badgeClass = p.categoria === "C.O." ? "badge-co" : p.categoria === "Art. 18" ? "badge-art18" : "badge-fd";
        return `
          <div class="p-3.5 hover:bg-slate-50 transition flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <span class="font-mono font-bold text-xs text-blue-600 w-16">#${p.numeroIscrizione}</span>
              <div>
                <span class="font-bold text-slate-900 text-xs font-heading mr-2">${escapeHtml(p.nome)}</span>
                <span class="font-mono text-[11px] text-slate-400 mr-3">${p.codiceFiscale}</span>
                <span class="px-2 py-0.2 rounded text-[10px] font-bold uppercase ${badgeClass}">${p.categoria}</span>
              </div>
            </div>

            <div class="flex items-center space-x-6 text-xs">
              <span class="text-slate-600"><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i> ${escapeHtml(p.comuneResidenza)}</span>
              <span class="font-bold ${p.icPercentuale >= 67 ? 'text-rose-600' : 'text-slate-700'}">${p.icPercentuale > 0 ? `${p.icPercentuale}% IC` : 'Art.18'}</span>
              <button data-id="${p.id}" class="btn-open-citizen-hub cursor-pointer text-xs text-blue-600 font-semibold hover:underline font-heading">
                Apri Scheda <i class="fa-solid fa-chevron-right text-[10px] ml-0.5"></i>
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    // Attach click listeners to "Apri Scheda 360°"
    document.querySelectorAll(".btn-open-citizen-hub").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        window.store.setSelectedPersonaId(id);
        renderCitizenHub();

        // Switch view to Hub
        document.getElementById("nav-mode-hub").click();
      });
    });
  }

  // --- CITIZEN HUB SUB-TABS INITIALIZATION ---
  function initHubSubTabs() {
    const tabLinks = document.querySelectorAll(".hub-tab-link");
    tabLinks.forEach(link => {
      link.addEventListener("click", () => {
        const tabId = link.getAttribute("data-tab");
        
        tabLinks.forEach(l => l.classList.remove("active"));
        link.classList.add("active");

        document.querySelectorAll(".hub-tab-content").forEach(content => {
          content.classList.add("hidden");
        });

        const activeContent = document.getElementById(tabId);
        if (activeContent) {
          activeContent.classList.remove("hidden");
        }
      });
    });
  }

  // --- CITIZEN HUB 360° MASTER RENDERER (IN-PLACE INLINE EDITING) ---
  function renderCitizenHub() {
    const p = window.store.getSelectedPersona();
    if (!p) return;

    // Header Info (Safe rendering)
    const initials = (p.nome || "NN").split(" ").map(n => n.charAt(0)).join("").substring(0, 2);
    const elAvatar = document.getElementById("hub-avatar");
    const elNome = document.getElementById("hub-nome");
    const elCf = document.getElementById("hub-cf");
    const elNumIscriz = document.getElementById("hub-num-iscriz");
    const elResidenza = document.getElementById("hub-residenza");
    const elTel = document.getElementById("hub-tel");
    const elEmail = document.getElementById("hub-email");
    const elIcPerc = document.getElementById("hub-ic-perc");
    const elStatoBadge = document.getElementById("hub-stato-badge");

    if (elAvatar) elAvatar.textContent = initials;
    if (elNome) elNome.textContent = p.nome || "-";
    if (elCf) elCf.textContent = p.codiceFiscale || "-";
    if (elNumIscriz) elNumIscriz.textContent = `#${p.numeroIscrizione || '0'}`;
    if (elResidenza) elResidenza.textContent = p.comuneResidenza || "Lecco";
    if (elTel) elTel.textContent = p.cellulare || p.telefono1 || p.telefono || "-";
    if (elEmail) elEmail.textContent = p.email || "-";
    if (elIcPerc) elIcPerc.textContent = p.icPercentuale > 0 ? `${p.icPercentuale}%` : 'Art.18';
    if (elStatoBadge) elStatoBadge.textContent = p.stato || "Disoccupato";
    
    // Category Badge
    const catBadge = document.getElementById("hub-cat-badge");
    if (catBadge) {
      catBadge.textContent = p.categoria || "C.O.";
      catBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${p.categoria === "C.O." ? 'badge-co' : p.categoria === "Art. 18" ? 'badge-art18' : 'badge-fd'}`;
    }
    
    // Availability Status (if widget is present)
    const dispStatus = document.getElementById("hub-disp-status");
    if (dispStatus && p.disponibilita) {
      dispStatus.textContent = p.disponibilita.orarioPreferito || "Immediata";
    }

    // Render ApexCharts Radial Bar for % IC
    renderApexRadialIC(p.icPercentuale || 0);

    // Update Last Note in Header Widget
    const lastNoteBox = document.getElementById("hub-last-note-box");
    const lastNoteAuthor = document.getElementById("hub-last-note-author");
    const lastNoteDate = document.getElementById("hub-last-note-date");
    const lastNoteText = document.getElementById("hub-last-note-text");

    if (lastNoteAuthor && lastNoteDate && lastNoteText) {
      if (p.diario && p.diario.length > 0) {
        const latestNote = p.diario[0];
        const d = new Date(latestNote.data);
        const formattedDate = !isNaN(d) ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth()+1).padStart(2, '0')}/${d.getFullYear()}` : latestNote.data;
        
        lastNoteAuthor.textContent = latestNote.autore || "Operatore";
        lastNoteDate.textContent = formattedDate;
        lastNoteText.textContent = latestNote.testo || latestNote.tipo || "Nessun dettaglio testo";
        if (lastNoteBox) lastNoteBox.title = `Autore: ${latestNote.autore} - Clicca per andare al diario`;
      } else {
        lastNoteAuthor.textContent = "Nessuna nota";
        lastNoteDate.textContent = "--/--/----";
        lastNoteText.textContent = "Nessuna annotazione presente nel diario";
      }
    }

    // Click on last note box jumps to Diario tab
    if (lastNoteBox) {
      lastNoteBox.onclick = () => {
        const diarioTabBtn = document.querySelector(".hub-tab-link[data-tab='hub-tab-diario']");
        if (diarioTabBtn) diarioTabBtn.click();
      };
    }

    // --- TAB 1: ANAGRAFICA & CPI (IN-PLACE INPUT VALUES) ---
    const parts = (p.nome || "").split(" ");
    document.getElementById("ef-nome").value = p.first_name || p.nomeOnly || parts[0] || "";
    document.getElementById("ef-cognome").value = p.last_name || p.cognome || parts.slice(1).join(" ") || "";
    document.getElementById("ef-cf").value = p.codiceFiscale || "";
    document.getElementById("ef-num-iscriz").value = p.numeroIscrizione || "";
    document.getElementById("ef-codice").value = p.codice || "";
    document.getElementById("ef-data-nascita").value = p.dataNascita || "";
    document.getElementById("ef-nato-a").value = p.natoA || "";
    document.getElementById("ef-sesso").value = p.sesso || "M";
    document.getElementById("ef-patente").value = p.patente || "B";

    document.getElementById("ef-residenza").value = p.comuneResidenza || "";
    document.getElementById("ef-indirizzo").value = p.indirizzo || "";
    document.getElementById("ef-domicilio-comune").value = p.domicilioComune || "";
    document.getElementById("ef-domicilio-indirizzo").value = p.domicilioIndirizzo || "";

    document.getElementById("ef-tel").value = p.telefono || "";
    document.getElementById("ef-tel2").value = p.cellulare || p.telefono1 || "";
    document.getElementById("ef-email").value = p.email || "";
    document.getElementById("ef-stato-occup").value = p.stato || "Disoccupato";

    document.getElementById("ef-categoria").value = p.categoria || "C.O.";
    document.getElementById("ef-categoria-lg6869").value = p.categoriaLg6869 || "Art. 1 L.68/99";
    document.getElementById("ef-data-co").value = p.dataIscrizioneCO || p.dataIscrizioneFD || "";
    document.getElementById("ef-tipologia-lista").value = p.tipologiaIscrizioneLista || "Lista Unica Provinciale L.68/99";

    document.getElementById("ef-operatore").value = p.operatore || "CPI Lecco";
    document.getElementById("ef-segnalato").value = p.segnalatoDa || "";
    document.getElementById("ef-referente").value = p.referente || "";
    document.getElementById("ef-niscriz-manuale").value = p.nIscrizManuale || p.numeroIscrizione || "";

    // --- TAB 2: SANITARIO, DIAGNOSI & INPS (IN-PLACE INPUT VALUES) ---
    document.getElementById("ef-ic-perc").value = p.icPercentuale || 0;
    document.getElementById("ef-data-verbale").value = p.diagnosiLastDataDiagnosi || p.dataVerbale || "";
    document.getElementById("ef-verbale-num").value = p.diagnosiLastVerbale || "VERB-INPS-9942";
    document.getElementById("ef-data-revisione").value = p.diagnosiLastDataRevisione || "2028-11-20";

    document.getElementById("ef-tipo-minorazione").value = p.diagnosiLastTipoMinorazioni || "Motoria";
    document.getElementById("ef-invalido-psichico").value = p.diagnosiLastInvalidoPsichico || "NO";
    document.getElementById("ef-codice-asl").value = p.diagnosiLastCodiceAsl || "ASL-LC-01";
    document.getElementById("ef-desc-asl").value = p.diagnosiLastDescCodiceAsl || "ASST Lecco Ospedale Manzoni";

    document.getElementById("ef-patologia").value = p.diagnosiLastPatologia || "";
    document.getElementById("ef-handicap").value = p.diagnosiLastSituazioneHandicap || "Comma 1 Art. 3 L. 104/92";
    document.getElementById("ef-provenienza").value = p.diagnosiLastProvenienzaInformazioni || "Commissione Medica Integrata ATS Brianza";
    document.getElementById("ef-allegati-status").value = String(!!p.allegatiLg68);

    document.getElementById("ef-diagnosi").value = p.diagnosi || "";
    document.getElementById("ef-desc-supporto").value = p.diagnosiLastDescTipoSupporto || "";

    // Aggiornamento Stato Allegati Verbali Specifici
    const wallet = p.wallet || [];
    const docL68 = wallet.find(d => (d.nome && d.nome.toLowerCase().includes("l68")) || (d.tipo && d.tipo.toLowerCase().includes("legge 68")) || (d.tipo && d.tipo.toLowerCase().includes("verbale l.68")));
    const docIC = wallet.find(d => (d.nome && (d.nome.toLowerCase().includes("inps") || d.nome.toLowerCase().includes("invalidita") || d.nome.toLowerCase().includes("ic"))) || (d.tipo && d.tipo.toLowerCase().includes("inps")) || (d.tipo && d.tipo.toLowerCase().includes("invalidit")));

    const badgeL68 = document.getElementById("badge-verbale-l68");
    const btnPreviewL68 = document.getElementById("btn-preview-verbale-l68");
    if (badgeL68) {
      if (docL68) {
        badgeL68.textContent = "Allegato Presente";
        badgeL68.className = "text-[9px] font-bold px-2 py-0.2 rounded bg-emerald-100 text-emerald-800";
        if (btnPreviewL68) {
          btnPreviewL68.classList.remove("hidden");
          btnPreviewL68.onclick = () => {
            if (docL68.fileContent) {
              const win = window.open();
              if (win) win.document.write(`<iframe src="${docL68.fileContent}" style="width:100vw;height:100vh;border:none;"></iframe>`);
            } else {
              alert(`Documento presente nel fascicolo: ${docL68.nome}`);
            }
          };
        }
      } else {
        badgeL68.textContent = "Non allegato";
        badgeL68.className = "text-[9px] font-bold px-2 py-0.2 rounded bg-slate-200 text-slate-600";
        if (btnPreviewL68) btnPreviewL68.classList.add("hidden");
      }
    }

    const badgeIC = document.getElementById("badge-verbale-ic");
    const btnPreviewIC = document.getElementById("btn-preview-verbale-ic");
    if (badgeIC) {
      if (docIC) {
        badgeIC.textContent = "Allegato Presente";
        badgeIC.className = "text-[9px] font-bold px-2 py-0.2 rounded bg-emerald-100 text-emerald-800";
        if (btnPreviewIC) {
          btnPreviewIC.classList.remove("hidden");
          btnPreviewIC.onclick = () => {
            if (docIC.fileContent) {
              const win = window.open();
              if (win) win.document.write(`<iframe src="${docIC.fileContent}" style="width:100vw;height:100vh;border:none;"></iframe>`);
            } else {
              alert(`Documento presente nel fascicolo: ${docIC.nome}`);
            }
          };
        }
      } else {
        badgeIC.textContent = "Non allegato";
        badgeIC.className = "text-[9px] font-bold px-2 py-0.2 rounded bg-slate-200 text-slate-600";
        if (btnPreviewIC) btnPreviewIC.classList.add("hidden");
      }
    }

    // Trigger sync for all custom UI selects
    document.querySelectorAll("select").forEach(sel => {
      sel.dispatchEvent(new Event("updateCustomUI"));
    });

    // --- TAB 3: ISTRUZIONE (STUDIAMO EDITABILE IN-PLACE) ---
    const elTitoloLast = document.getElementById("ef-titolo-last");
    const elTitoloAnno = document.getElementById("ef-titolo-anno");
    const elTitoloVoto = document.getElementById("ef-titolo-voto");
    const elTitoloPresso = document.getElementById("ef-titolo-presso");
    const elQualifica = document.getElementById("ef-qualifica");
    const elPatente2 = document.getElementById("ef-patente-2");
    const elMuletto = document.getElementById("ef-muletto");
    const elEcdl = document.getElementById("ef-ecdl");
    const elInglese = document.getElementById("ef-inglese");
    const elSpagnolo = document.getElementById("ef-spagnolo");
    const elAltreLingue = document.getElementById("ef-altre-lingue");

    if (elTitoloLast) elTitoloLast.value = p.titoloStudioLast || "Diploma di Scuola Secondaria Superiore";
    if (elTitoloAnno) elTitoloAnno.value = p.anno || p.titoloStudioAnnoInizio || "1997";
    if (elTitoloVoto) elTitoloVoto.value = p.votazione || "85/100";
    if (elTitoloPresso) elTitoloPresso.value = p.titoloStudioPresso || p.istituto || "I.T.C. Viganò";
    if (elQualifica) elQualifica.value = p.qualifica || "Ragioniere Programmatore";
    if (elPatente2) elPatente2.value = p.patente || "B";
    if (elMuletto) elMuletto.value = String(!!p.patenteMuletto);
    if (elEcdl) elEcdl.value = p.ecdl || (p.usoPc ? "Sì (Certificato PC)" : "Base");
    if (elInglese) elInglese.value = p.inglese ? "Sì (Buono)" : "No";
    if (elSpagnolo) elSpagnolo.value = p.spagnolo ? "Sì" : "No";
    if (elAltreLingue) elAltreLingue.value = p.altreLingue || "Nessuna";

    // --- TAB 4: FUNZIONALE & MANSIONI ---
    renderFunzionaleTab(p);

    // --- TAB 5: DISPONIBILITA TAB ---
    renderDisponibilitaTab(p);

    // --- TAB 6: WALLET DOCUMENTALE ---
    renderWalletTab(p);

    // --- TAB 7: COMITATO TECNICO ASL ---
    renderComitatoTab(p);

    // --- TAB 8: PROGETTO INSERIMENTO (PIL L.68/99) ---
    renderPilTab(p);

    // --- TAB 9: DIARIO OPERATORE ---
    renderDiarioTab(p);
  }

  // --- INTERNAL HUB SUB-TABS SWITCHER ---
  function initHubSubTabs() {
    const tabLinks = document.querySelectorAll(".hub-tab-link");
    tabLinks.forEach(tab => {
      tab.addEventListener("click", () => {
        tabLinks.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const targetTab = tab.getAttribute("data-tab");
        document.querySelectorAll(".hub-tab-content").forEach(tc => tc.classList.add("hidden"));
        const activeContent = document.getElementById(targetTab);
        if (activeContent) activeContent.classList.remove("hidden");
      });
    });
  }

  // --- RENDER WALLET TAB COMPLETO (CON ANTEPRIMA INTEGRATA & DOWNLOAD) ---
  function renderWalletTab(persona) {
    const walletList = persona.wallet || [];
    const countBadge = document.getElementById("badge-wallet-count");
    if (countBadge) countBadge.textContent = walletList.length;

    const grid = document.getElementById("wallet-files-grid");
    if (!grid) return;

    if (walletList.length === 0) {
      grid.innerHTML = `
        <div class="col-span-1 md:col-span-2 lg:col-span-3 py-12 text-center space-y-3 bg-amber-50/40 rounded-2xl border border-dashed border-amber-200">
          <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl">
            <i class="fa-solid fa-folder-open"></i>
          </div>
          <h4 class="text-xs font-bold text-slate-800 font-heading">Nessun Documento Presente nel Wallet</h4>
          <p class="text-[11px] text-slate-500 max-w-sm mx-auto">Non sono ancora stati archiviati verbali sanitari, DID o curriculum per questo iscritto. Clicca su "+ Carica Documento" per allegare file reali.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = walletList.map(doc => {
      const hasContent = !!doc.fileContent;
      const isPdf = (doc.nome && doc.nome.toLowerCase().endsWith('.pdf')) || (doc.fileType && doc.fileType.includes('pdf'));
      const isImage = (doc.fileType && doc.fileType.includes('image')) || (doc.nome && (doc.nome.endsWith('.png') || doc.nome.endsWith('.jpg') || doc.nome.endsWith('.jpeg')));

      const iconClass = isPdf ? "fa-solid fa-file-pdf text-rose-600" : isImage ? "fa-solid fa-file-image text-blue-600" : "fa-solid fa-file-lines text-amber-600";
      const iconBg = isPdf ? "bg-rose-50 border-rose-200" : isImage ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200";

      return `
        <div class="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between space-y-3">
          <div class="flex items-start justify-between space-x-3">
            <div class="flex items-start space-x-3">
              <div class="w-10 h-10 rounded-xl ${iconBg} border flex items-center justify-center font-bold shrink-0 font-heading text-lg">
                <i class="${iconClass}"></i>
              </div>
              <div class="space-y-0.5">
                <h4 class="text-xs font-bold text-slate-900 line-clamp-1 font-heading" title="${escapeHtml(doc.nome)}">${escapeHtml(doc.nome)}</h4>
                <span class="inline-block text-[10px] font-bold px-2 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200">${escapeHtml(doc.tipo)}</span>
                <p class="text-[10px] text-slate-400 font-mono">Data: ${formatDate(doc.data)} &bull; ${doc.dimensione || 'Documento CPI'}</p>
              </div>
            </div>

            <button data-doc-id="${doc.id}" class="btn-delete-doc cursor-pointer text-slate-400 hover:text-rose-600 text-xs p-1.5 rounded-lg hover:bg-rose-50 transition" title="Elimina allegato">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>

          ${doc.descrizione ? `<p class="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed italic">${escapeHtml(doc.descrizione)}</p>` : ''}

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            ${hasContent ? `
              <div class="flex items-center gap-2">
                <button data-doc-id="${doc.id}" class="btn-preview-doc cursor-pointer text-xs text-amber-700 font-bold hover:underline flex items-center gap-1 font-heading">
                  <i class="fa-solid fa-eye"></i> Visualizza
                </button>
                <span class="text-slate-300">|</span>
                <a href="${doc.fileContent}" download="${doc.nome}" class="cursor-pointer text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 font-heading">
                  <i class="fa-solid fa-download"></i> Scarica
                </a>
              </div>
            ` : `
              <span class="text-[10px] text-slate-500 font-medium flex items-center gap-1"><i class="fa-solid fa-check-circle text-emerald-600"></i> Fascicolo Elettronico</span>
            `}
            <span class="text-[10px] font-mono text-slate-400">ID #${doc.id}</span>
          </div>
        </div>
      `;
    }).join("");

    // Preview Doc Handler
    document.querySelectorAll(".btn-preview-doc").forEach(btn => {
      btn.addEventListener("click", () => {
        const docId = btn.getAttribute("data-doc-id");
        const doc = (persona.wallet || []).find(d => String(d.id) === String(docId));
        if (doc && doc.fileContent) {
          const win = window.open();
          if (win) {
            win.document.write(`
              <html>
                <head><title>${escapeHtml(doc.nome)} - Anteprima Roxanne CPI</title></head>
                <body style="margin:0; background:#0f172a; display:flex; justify-content:center; align-items:center; height:100vh;">
                  ${doc.fileContent.startsWith('data:image') 
                    ? `<img src="${doc.fileContent}" style="max-width:95vw; max-height:95vh; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">`
                    : `<iframe src="${doc.fileContent}" style="width:100vw; height:100vh; border:none;"></iframe>`
                  }
                </body>
              </html>
            `);
          }
        }
      });
    });

    // Delete doc handler
    document.querySelectorAll(".btn-delete-doc").forEach(btn => {
      btn.addEventListener("click", () => {
        const docId = btn.getAttribute("data-doc-id");
        if (confirm("Eliminare questo documento dal wallet del cittadino?")) {
          window.store.deleteDocumentFromWallet(persona.id, docId);
          renderCitizenHub();
        }
      });
    });
  }

  // --- RENDER DISPONIBILITA TAB ---
  function renderDisponibilitaTab(persona) {
    const disp = persona.disponibilita || {};

    const elOrario = document.getElementById("disp-orario");
    const elTurni = document.getElementById("disp-turni");
    const elRaggio = document.getElementById("disp-raggio");
    const elSede = document.getElementById("disp-sede");
    const elAutomunito = document.getElementById("disp-automunito");
    const elSmart = document.getElementById("disp-smart");
    const elNote = document.getElementById("disp-note");

    if (elOrario) elOrario.value = disp.orarioPreferito || "Part-Time 30h";
    if (elTurni) elTurni.value = disp.turni || (disp.disponibileTurni ? "Turni Diurni (Mattina/Pomeriggio)" : "Solo Diurno");
    if (elRaggio) elRaggio.value = disp.raggioMaxKm ? String(disp.raggioMaxKm) : "20";
    if (elSede) elSede.value = disp.sedeTerritoriale || "";
    if (elAutomunito) elAutomunito.value = disp.mezzoMunit !== undefined ? String(disp.mezzoMunit) : "true";
    if (elSmart) elSmart.value = disp.smartWorking !== undefined ? (disp.smartWorking ? "Ibrido" : "Solo Presenza") : "Ibrido";
    if (elNote) elNote.value = disp.noteDisponibilita || "";

    // Sync custom selects for Tab 5
    [elOrario, elTurni, elRaggio, elAutomunito, elSmart].forEach(el => {
      if (el) el.dispatchEvent(new Event("updateCustomUI"));
    });
  }

  // --- RENDER FUNZIONALE TAB ---
  function renderFunzionaleTab(p) {
    const funzContainer = document.getElementById("hub-funzionale-list");
    const flags = [
      { key: "stazioneEretta", label: "Stazione Eretta Prolungata", ok: p.stazioneEretta },
      { key: "movimentazioneManuale", label: "Movimentazione Carichi", ok: p.movimentazioneManuale },
      { key: "manualitaFine", label: "Manualità Fine Bilanciata", ok: p.manualitaFine },
      { key: "colonna", label: "Idoneità Colonna Vertebrale", ok: p.colonna },
      { key: "lavoriInAltezza", label: "Lavori in Altezza / Scale", ok: p.lavoriInAltezza },
      { key: "contattoPubblico", label: "Contatto Diretto col Pubblico", ok: p.contattoPubblico }
    ];

    if (funzContainer) {
      funzContainer.innerHTML = flags.map(f => `
        <label class="flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${f.ok ? 'bg-purple-50/70 text-purple-900 border-purple-200 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200'}">
          <span class="font-semibold text-xs">${f.label}</span>
          <input type="checkbox" data-flag="${f.key}" ${f.ok ? 'checked' : ''} class="cb-flag-func rounded border-slate-300 text-purple-600 focus:ring-0">
        </label>
      `).join("");
    }

    const mansContainer = document.getElementById("hub-mansioni-list");
    const mansioni = [
      { key: "impiegato", name: "Impiegato / Amministrativo", active: p.impiegato },
      { key: "cassa", name: "Addetto Cassa", active: p.cassa },
      { key: "commesso", name: "Commesso / Vendita", active: p.commesso },
      { key: "magazzino", name: "Magazziniere", active: p.magazzino },
      { key: "verde", name: "Manutenzione Verde", active: p.verde },
      { key: "socialeScuola", name: "Servizi Scolastici", active: p.socialeScuola },
      { key: "pulizie", name: "Addetto Pulizie", active: p.pulizie },
      { key: "impTecnico", name: "Impiegato Tecnico", active: p.impTecnico },
      { key: "receptionSegreteria", name: "Reception / Front Office", active: p.receptionSegreteria }
    ];

    if (mansContainer) {
      mansContainer.innerHTML = mansioni.map(m => `
        <label class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${m.active ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'} flex items-center space-x-2">
          <input type="checkbox" data-mansione="${m.key}" ${m.active ? 'checked' : ''} class="cb-mansione-chip rounded border-slate-300 text-blue-600 focus:ring-0">
          <span>${m.name}</span>
        </label>
      `).join("");
    }
  }

  // --- RENDER COMITATO TECNICO TAB (STORICO MULTI-VERBALI E RELAZIONI ASL) ---
  function renderComitatoTab(p) {
    const list = window.store.getComitatoTecnicoByNumIscriz(p.numeroIscrizione);
    const container = document.getElementById("hub-comitato-det-content");

    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div class="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto text-xl">
            <i class="fa-solid fa-building-columns"></i>
          </div>
          <h4 class="text-xs font-bold text-slate-700 font-heading">Nessun Verbale ASL Registrato</h4>
          <p class="text-[11px] text-slate-400 max-w-sm mx-auto">Non sono ancora presenti relazioni o verbali del Comitato Tecnico per questo iscritto. Clicca su "+ Nuovo Verbale Comitato" per registrarne uno.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-4">
        ${list.map((c, index) => `
          <div class="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-cyan-300 hover:shadow-xs transition space-y-4">
            <div class="flex items-center justify-between border-b border-slate-200/70 pb-3">
              <div class="flex items-center space-x-3">
                <span class="w-7 h-7 rounded-xl bg-cyan-100 text-cyan-800 font-extrabold flex items-center justify-center text-xs font-heading">
                  #${index + 1}
                </span>
                <div>
                  <h4 class="text-xs font-extrabold text-slate-900 font-heading">
                    Verbale N. <span class="font-mono text-cyan-700">${escapeHtml(c.numPratica || 'N/D')}</span>
                  </h4>
                  <p class="text-[10px] text-slate-400 font-medium">Seduta ASL del <strong class="text-slate-700">${formatDate(c.dataSeduta)}</strong> &bull; ${escapeHtml(c.asl || 'ASST Lecco')}</p>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                  <i class="fa-solid fa-user-doctor mr-1"></i> ${escapeHtml(c.responsabile || 'Presidente ASL')}
                </span>
                <button data-verbale-id="${c.id}" class="btn-delete-verbale text-slate-400 hover:text-rose-600 p-1 text-xs cursor-pointer" title="Elimina questo verbale">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>

            <!-- Prognosi Lavorativa Evidenziata -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span class="text-[9px] uppercase font-bold text-cyan-600 block tracking-wider font-heading">Prognosi Lavorativa Formulata</span>
              <p class="text-xs text-slate-800 font-medium leading-relaxed italic">${escapeHtml(c.prognosi || 'Nessuna prognosi specificata')}</p>
            </div>

            <!-- Griglia Valutazioni Dettagliate -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
              <div class="p-2.5 rounded-xl bg-white border border-slate-200/70">
                <span class="text-[9px] uppercase font-bold text-slate-400 block font-heading">Percorso Scolastico</span>
                <strong class="text-slate-800 font-medium text-[11px] block truncate">${escapeHtml(c.percorsoScolastico || '-')}</strong>
              </div>

              <div class="p-2.5 rounded-xl bg-white border border-slate-200/70">
                <span class="text-[9px] uppercase font-bold text-slate-400 block font-heading">Esperienza Lavorativa</span>
                <strong class="text-slate-800 font-medium text-[11px] block truncate">${escapeHtml(c.percorsoLavorativo || '-')}</strong>
              </div>

              <div class="p-2.5 rounded-xl bg-white border border-slate-200/70">
                <span class="text-[9px] uppercase font-bold text-slate-400 block font-heading">Autonomia Spostamenti</span>
                <strong class="text-emerald-700 font-bold text-[11px] block">${escapeHtml(c.autonomiaPers || 'Autonomo')}</strong>
              </div>

              <div class="p-2.5 rounded-xl bg-white border border-slate-200/70">
                <span class="text-[9px] uppercase font-bold text-slate-400 block font-heading">Abilità Cognitive & Relazioni</span>
                <strong class="text-blue-700 font-bold text-[11px] block truncate">${escapeHtml(c.abilitaCognitive || 'Nella norma')} / ${escapeHtml(c.capacitaRelazionali || 'Buone')}</strong>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    // Delete Verbale Handler
    container.querySelectorAll(".btn-delete-verbale").forEach(btn => {
      btn.addEventListener("click", () => {
        const verbaleId = btn.getAttribute("data-verbale-id");
        if (confirm("Sei sicuro di voler eliminare questo verbale del Comitato Tecnico?")) {
          window.store.deleteVerbaleComitato(verbaleId);
          renderCitizenHub();
        }
      });
    });
  }

  // --- RENDER DIARIO & TIROCINI TIMELINE TAB ---
  function renderDiarioTab(p) {
    const diarioNotes = window.store.getNoteDiarioByNumIscriz(p.numeroIscrizione);
    const container = document.getElementById("hub-diario-timeline");

    if (diarioNotes.length === 0) {
      container.innerHTML = `<p class="text-xs text-slate-400 py-6 italic text-center">Nessuna annotazione presente nel diario dell'iscritto.</p>`;
      return;
    }

    // Sort by Date Descending
    diarioNotes.sort((a, b) => new Date(b.data) - new Date(a.data));

    container.innerHTML = `
      <div class="diario-timeline space-y-6">
        ${diarioNotes.map(n => {
          const isTirocinio = n.tipoNota === "Monitoraggio Tirocinio";
          const dotClass = isTirocinio ? "diario-tirocinio" : "diario-op";
          const badgeClass = isTirocinio ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-blue-700 border-blue-200";
          const icon = isTirocinio ? "fa-graduation-cap text-purple-600" : "fa-user-pen text-blue-600";

          return `
            <div class="diario-timeline-item">
              <div class="diario-timeline-dot ${dotClass}"></div>
              
              <div class="card-white p-4 space-y-2 border border-slate-200 shadow-xs">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-xs font-bold px-2.5 py-0.5 rounded-full border ${badgeClass} font-heading flex items-center gap-1.5">
                      <i class="fa-solid ${icon}"></i>
                      ${escapeHtml(n.tipoNota || "Diario Operativo")}
                    </span>
                    <span class="text-xs font-bold text-slate-800 font-heading">${escapeHtml(n.firma)}</span>
                  </div>
                  <span class="font-mono text-xs text-slate-500 font-semibold"><i class="fa-solid fa-calendar-day mr-1 text-slate-400"></i> ${formatDate(n.data)}</span>
                </div>

                <p class="text-xs text-slate-700 leading-relaxed pt-1">${escapeHtml(n.noteDiDiario)}</p>

                <div class="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                  <span>Operatore CPI: <strong>${escapeHtml(n.operatore || 'CPI Lecco')}</strong></span>
                  <span class="font-mono text-slate-400">#${n.id}</span>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  // --- RENDER PROGETTO INSERIMENTO LAVORATIVO (PIL L.68/99) ---
  function renderPilTab(p) {
    const list = window.store.getProgettiInserimentoLavByNumIscriz(p.numeroIscrizione);
    const container = document.getElementById("hub-pil-content-list");

    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div class="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto text-xl">
            <i class="fa-solid fa-file-signature"></i>
          </div>
          <h4 class="text-xs font-bold text-slate-700 font-heading">Nessun Progetto PIL Registrato</h4>
          <p class="text-[11px] text-slate-400 max-w-sm mx-auto">Non sono ancora stati formulati progetti individuali di inserimento lavorativo (PIL) per questo cittadino. Clicca su "+ Nuovo Progetto PIL" per redigerne uno.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="space-y-4">
        ${list.map((pil, idx) => `
          <div class="p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-teal-300 hover:shadow-xs transition space-y-4">
            
            <div class="flex items-center justify-between border-b border-slate-200/70 pb-3">
              <div class="flex items-center space-x-3">
                <span class="w-7 h-7 rounded-xl bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-xs font-heading">
                  #${idx + 1}
                </span>
                <div>
                  <h4 class="text-xs font-extrabold text-slate-900 font-heading">
                    Piano Individuale PIL &bull; Codice <span class="font-mono text-teal-700">${escapeHtml(pil.idDote || 'Standard L.68')}</span>
                  </h4>
                  <p class="text-[10px] text-slate-400 font-medium">Data Redazione: <strong class="text-slate-700">${formatDate(pil.data)}</strong> &bull; Iscritto: ${escapeHtml(pil.nome)} (${escapeHtml(pil.codiceFiscale)})</p>
                </div>
              </div>

              <div class="flex items-center space-x-2">
                <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                  <i class="fa-solid fa-user-tie mr-1"></i> ${escapeHtml(pil.tutor || 'Operatore CPI')}
                </span>
                <button data-pil-id="${pil.id}" class="btn-delete-pil text-slate-400 hover:text-rose-600 p-1 text-xs cursor-pointer" title="Elimina questo progetto PIL">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>

            <!-- Progetto Inserimento Target -->
            <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span class="text-[9px] uppercase font-bold text-teal-600 block tracking-wider font-heading">Obiettivi & Progetto di Inserimento</span>
              <p class="text-xs text-slate-800 font-medium leading-relaxed italic">${escapeHtml(pil.progettoInserimento || 'Nessun progetto specificato')}</p>
            </div>

            <!-- Profili Dettagliati Griglia (4 colonne) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                <span class="text-[9px] uppercase font-bold text-slate-400 block font-heading">Profilo Dinamico Funzionale</span>
                <p class="text-slate-700 text-[11px] leading-snug line-clamp-3">${escapeHtml(pil.profiloDinamicoFunzionale || '-')}</p>
              </div>

              <div class="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                <span class="text-[9px] uppercase font-bold text-slate-400 block font-heading">Profilo Sanitario & Ausili</span>
                <p class="text-slate-700 text-[11px] leading-snug line-clamp-3">${escapeHtml(pil.profiloSanitario || '-')}</p>
              </div>

              <div class="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                <span class="text-[9px] uppercase font-bold text-slate-400 block font-heading">Profilo Lavorativo / Storico</span>
                <p class="text-slate-700 text-[11px] leading-snug line-clamp-3">${escapeHtml(pil.profiloLavorativo || '-')}</p>
              </div>

              <div class="p-3 rounded-xl bg-white border border-slate-200/70 space-y-1">
                <span class="text-[9px] uppercase font-bold text-slate-400 block font-heading">Personale & Sociale</span>
                <p class="text-slate-700 text-[11px] leading-snug line-clamp-3">${escapeHtml(pil.profiloPersonaleSociale || '-')}</p>
              </div>
            </div>

            <!-- Box Criticità & Positività -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div class="p-3 rounded-xl bg-rose-50/40 border border-rose-200/80 space-y-0.5">
                <span class="text-[9px] uppercase font-bold text-rose-600 block font-heading"><i class="fa-solid fa-triangle-exclamation mr-1"></i> Aspetti di Criticità / Limiti</span>
                <p class="text-slate-700 text-[11px] font-medium leading-relaxed">${escapeHtml(pil.aspettiCriticita || 'Nessuna criticità segnalata')}</p>
              </div>

              <div class="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-0.5">
                <span class="text-[9px] uppercase font-bold text-emerald-700 block font-heading"><i class="fa-solid fa-circle-check mr-1"></i> Punti di Forza & Risorse</span>
                <p class="text-slate-700 text-[11px] font-medium leading-relaxed">${escapeHtml(pil.aspettiPositivita || 'Nessun punto di forza specificato')}</p>
              </div>
            </div>

          </div>
        `).join("")}
      </div>
    `;

    // Delete PIL Handler
    container.querySelectorAll(".btn-delete-pil").forEach(btn => {
      btn.addEventListener("click", () => {
        const pilId = btn.getAttribute("data-pil-id");
        if (confirm("Eliminare questa scheda del Progetto di Inserimento (PIL)?")) {
          window.store.deleteProgettoInserimentoLav(pilId);
          renderCitizenHub();
        }
      });
    });
  }

  // --- DIZIONARIO TERRITORIALE UFFICIALE COMUNI, PROVINCE E CAP ---
  const COMUNI_MAP = {
    "Lecco": { prov: "LC", cap: "23900" },
    "Abbadia Lariana": { prov: "LC", cap: "23821" },
    "Airuno": { prov: "LC", cap: "23881" },
    "Annone di Brianza": { prov: "LC", cap: "23841" },
    "Ballabio": { prov: "LC", cap: "23811" },
    "Barzanò": { prov: "LC", cap: "23891" },
    "Bellano": { prov: "LC", cap: "23822" },
    "Bosisio Parini": { prov: "LC", cap: "23842" },
    "Bulciago": { prov: "LC", cap: "23892" },
    "Calco": { prov: "LC", cap: "23885" },
    "Calolziocorte": { prov: "LC", cap: "23801" },
    "Carenno": { prov: "LC", cap: "23802" },
    "Casatenovo": { prov: "LC", cap: "23880" },
    "Cassago Brianza": { prov: "LC", cap: "23893" },
    "Cassina Valsassina": { prov: "LC", cap: "23817" },
    "Castello di Brianza": { prov: "LC", cap: "23884" },
    "Cernusco Lombardone": { prov: "LC", cap: "23870" },
    "Cesana Brianza": { prov: "LC", cap: "23861" },
    "Civate": { prov: "LC", cap: "23862" },
    "Colico": { prov: "LC", cap: "23823" },
    "Colle Brianza": { prov: "LC", cap: "23886" },
    "Costa Masnaga": { prov: "LC", cap: "23845" },
    "Cremella": { prov: "LC", cap: "23894" },
    "Cremeno": { prov: "LC", cap: "23814" },
    "Dervio": { prov: "LC", cap: "23824" },
    "Dolzago": { prov: "LC", cap: "23843" },
    "Galbiate": { prov: "LC", cap: "23851" },
    "Garlate": { prov: "LC", cap: "23852" },
    "Imbersago": { prov: "LC", cap: "23898" },
    "Introbio": { prov: "LC", cap: "23815" },
    "Lomagna": { prov: "LC", cap: "23871" },
    "Malgrate": { prov: "LC", cap: "23864" },
    "Mandello del Lario": { prov: "LC", cap: "23826" },
    "Merate": { prov: "LC", cap: "23807" },
    "Missaglia": { prov: "LC", cap: "23873" },
    "Molteno": { prov: "LC", cap: "23847" },
    "Monte Marenzo": { prov: "LC", cap: "23804" },
    "Montevecchia": { prov: "LC", cap: "23874" },
    "Monticello Brianza": { prov: "LC", cap: "23876" },
    "Nibionno": { prov: "LC", cap: "23895" },
    "Oggiono": { prov: "LC", cap: "23848" },
    "Olgiate Molgora": { prov: "LC", cap: "23887" },
    "Olginate": { prov: "LC", cap: "23854" },
    "Osnago": { prov: "LC", cap: "23875" },
    "Paderno d'Adda": { prov: "LC", cap: "23877" },
    "Robbiate": { prov: "LC", cap: "23899" },
    "Rogeno": { prov: "LC", cap: "23849" },
    "Sirone": { prov: "LC", cap: "23844" },
    "Sirtori": { prov: "LC", cap: "23888" },
    "Valgreghentino": { prov: "LC", cap: "23857" },
    "Valmadrera": { prov: "LC", cap: "23868" },
    "Varenna": { prov: "LC", cap: "23829" },
    "Vercurago": { prov: "LC", cap: "23808" },
    "Verderio": { prov: "LC", cap: "23879" },
    "Viganò": { prov: "LC", cap: "23896" },
    "Milano": { prov: "MI", cap: "20100" },
    "Monza": { prov: "MB", cap: "20900" },
    "Como": { prov: "CO", cap: "22100" },
    "Bergamo": { prov: "BG", cap: "24100" }
  };

  function updateComuneGeoData() {
    const comRes = document.getElementById("ef-residenza").value;
    const geoRes = COMUNI_MAP[comRes] || { prov: "LC", cap: "23900" };
    document.getElementById("ef-residenza-prov").value = geoRes.prov;
    document.getElementById("ef-residenza-cap").value = geoRes.cap;

    const comDom = document.getElementById("ef-domicilio-comune").value;
    const geoDom = COMUNI_MAP[comDom] || { prov: "LC", cap: "23900" };
    document.getElementById("ef-domicilio-prov").value = geoDom.prov;
    document.getElementById("ef-domicilio-cap").value = geoDom.cap;
  }

  document.getElementById("ef-residenza").addEventListener("change", updateComuneGeoData);
  document.getElementById("ef-domicilio-comune").addEventListener("change", updateComuneGeoData);

  // --- APEXCHARTS RADIAL BAR RENDERER ---
  let apexChartIC = null;
  function renderApexRadialIC(percent) {
    const container = document.getElementById("hub-ic-radial-chart");
    if (!container || typeof ApexCharts === "undefined") return;

    const val = Math.min(Math.max(percent, 0), 100);
    const color = val >= 67 ? "#e11d48" : val >= 46 ? "#2563eb" : "#059669";

    const options = {
      series: [val],
      chart: {
        height: 110,
        width: 110,
        type: 'radialBar',
        sparkline: { enabled: true }
      },
      plotOptions: {
        radialBar: {
          hollow: { size: '55%' },
          track: { background: '#f1f5f9', strokeWidth: '100%' },
          dataLabels: {
            name: { show: false },
            value: {
              offsetY: 5,
              fontSize: '15px',
              fontWeight: 800,
              fontFamily: 'Outfit, sans-serif',
              color: color,
              formatter: (v) => `${v}%`
            }
          }
        }
      },
      colors: [color],
      stroke: { lineCap: 'round' }
    };

    if (apexChartIC) {
      apexChartIC.destroy();
    }
    container.innerHTML = "";
    apexChartIC = new ApexCharts(container, options);
    apexChartIC.render();
  }

  // --- NEW CITIZEN REGISTRATION (OPEN FULL CLEAN GUIDED HUB DIRECTLY) ---
  const btnNuovoIscritto = document.getElementById("btn-nuovo-iscritto");
  if (btnNuovoIscritto) {
    btnNuovoIscritto.addEventListener("click", () => {
      // Create new empty draft citizen in store
      const persone = window.store.getPersone();
      const nextNum = persone.reduce((max, p) => Math.max(max, p.numeroIscrizione || 0), 10450) + 1;
      
      const newCitizenDraft = {
        id: `p-${Date.now()}`,
        codice: `ISCR-${nextNum}`,
        numeroIscrizione: nextNum,
        nome: "Nuovo Iscritto",
        first_name: "",
        cognome: "",
        codiceFiscale: "",
        dataNascita: "",
        natoA: "",
        sesso: "M",
        patente: "B",
        comuneResidenza: "Lecco",
        residenzaProvincia: "LC",
        residenzaCap: "23900",
        indirizzo: "",
        domicilioComune: "Lecco",
        domicilioProvincia: "LC",
        domicilioCap: "23900",
        domicilioIndirizzo: "",
        telefono: "",
        cellulare: "",
        email: "",
        categoria: "C.O.",
        categoriaLg6869: "Art. 1 Comma 1 Disabili",
        stato: "Disoccupato",
        operatore: "Marco Galli",
        dataIscrizioneCO: new Date().toISOString().split("T")[0],
        icPercentuale: 0,
        diagnosi: "",
        patologia: "",
        disponibilita: {
          orarioPreferito: "Full-Time",
          turniDisponibili: "Diurno",
          sedePreferita: "Lecco e limitrofi",
          autoMunito: true
        },
        wallet: [],
        diario: [
          {
            id: `d-${Date.now()}`,
            data: new Date().toISOString().split("T")[0],
            autore: "Marco Galli (Admin CPI)",
            tipo: "Presa in Carico",
            testo: "Apertura nuova scheda iscritto al collocamento mirato L.68/99. In attesa di completamento anagrafico e verbale sanitario."
          }
        ]
      };

      // Set as selected in store and open Full Hub View
      window.store.persone.unshift(newCitizenDraft);
      window.store.saveToStorage();
      window.store.setSelectedPersona(newCitizenDraft.id);

      // Open Hub Section
      document.querySelectorAll("main > section").forEach(sec => sec.classList.add("hidden"));
      const secHub = document.getElementById("section-citizen-hub");
      if (secHub) secHub.classList.remove("hidden");

      renderCitizenHub();

      // Switch to first sub-tab (Anagrafica)
      const tabAnagrafica = document.querySelector(".hub-tab-link[data-tab='hub-tab-panoramica']");
      if (tabAnagrafica) tabAnagrafica.click();

      // Guided Feedback Alert
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: 'info',
          title: 'Nuova Scheda Iscritto L.68/99',
          html: `È stata inizializzata una nuova scheda pulita (N. Iscrizione <b>#${nextNum}</b>).<br><br>Compila i campi guidati di <b>Anagrafica</b> e <b>Quadro Sanitario</b>, poi premi <b>Salva Scheda</b> per confermare.`,
          confirmButtonColor: '#2563eb',
          confirmButtonText: 'Inizia Compilazione'
        }).then(() => {
          setTimeout(() => {
            const inputNome = document.getElementById("ef-nome");
            if (inputNome) inputNome.focus();
          }, 150);
        });
      }
    });
  }

  // --- SAVE INLINE IN-PLACE EDITING FROM CITIZEN HUB ---
  const btnSaveInline = document.getElementById("btn-save-inline-hub");
  if (btnSaveInline) {
    btnSaveInline.addEventListener("click", () => {
      const p = window.store.getSelectedPersona();
      if (!p) return;

      const first = document.getElementById("ef-nome").value.trim();
      const last = document.getElementById("ef-cognome").value.trim();
      const cf = document.getElementById("ef-cf").value.trim().toUpperCase();

      if (!first || !cf) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: 'warning',
            title: 'Campi Obbligatori Mancanti',
            text: 'Nome e Codice Fiscale sono campi obbligatori per il salvataggio.',
            confirmButtonColor: '#2563eb'
          });
        } else {
          alert("Attenzione: Nome e Codice Fiscale sono campi obbligatori.");
        }
        return;
      }

      // Collect functional flags
      const funzPayload = {};
      document.querySelectorAll(".cb-flag-func").forEach(cb => {
        funzPayload[cb.getAttribute("data-flag")] = cb.checked;
      });

      // Collect mansioni flags
      const mansPayload = {};
      document.querySelectorAll(".cb-mansione-chip").forEach(cb => {
        mansPayload[cb.getAttribute("data-mansione")] = cb.checked;
      });

      const updatedPayload = {
        nome: `${first} ${last}`.trim(),
        first_name: first,
        cognome: last,
        codiceFiscale: cf,
        numeroIscrizione: parseInt(document.getElementById("ef-num-iscriz").value) || p.numeroIscrizione,
        dataNascita: document.getElementById("ef-data-nascita").value,
        natoA: document.getElementById("ef-nato-a").value,
        sesso: document.getElementById("ef-sesso").value,
        patente: document.getElementById("ef-patente").value,
        comuneResidenza: document.getElementById("ef-residenza").value,
        residenzaProvincia: document.getElementById("ef-residenza-prov").value,
        residenzaCap: document.getElementById("ef-residenza-cap").value,
        indirizzo: document.getElementById("ef-indirizzo").value,
        domicilioComune: document.getElementById("ef-domicilio-comune").value,
        domicilioProvincia: document.getElementById("ef-domicilio-prov").value,
        domicilioCap: document.getElementById("ef-domicilio-cap").value,
        domicilioIndirizzo: document.getElementById("ef-domicilio-indirizzo").value,
        telefono: document.getElementById("ef-tel").value,
        cellulare: document.getElementById("ef-tel2").value,
        email: document.getElementById("ef-email").value,
        stato: document.getElementById("ef-stato-occup").value,
        categoria: document.getElementById("ef-categoria").value,
        categoriaLg6869: document.getElementById("ef-categoria-lg6869").value,
        dataIscrizioneCO: document.getElementById("ef-data-co").value,
        tipologiaIscrizioneLista: document.getElementById("ef-tipologia-lista").value,
        operatore: document.getElementById("ef-operatore").value,
        segnalatoDa: document.getElementById("ef-segnalato").value,
        referente: document.getElementById("ef-referente").value,
        nIscrizManuale: parseInt(document.getElementById("ef-niscriz-manuale").value) || p.numeroIscrizione,

        icPercentuale: parseInt(document.getElementById("ef-ic-perc").value) || 0,
        diagnosiLastDataDiagnosi: document.getElementById("ef-data-verbale").value,
        dataVerbale: document.getElementById("ef-data-verbale").value,
        diagnosiLastVerbale: document.getElementById("ef-verbale-num").value,
        diagnosiLastDataRevisione: document.getElementById("ef-data-revisione").value,
        diagnosiLastTipoMinorazioni: document.getElementById("ef-tipo-minorazione").value,
        diagnosiLastInvalidoPsichico: document.getElementById("ef-invalido-psichico").value,
        diagnosiLastCodiceAsl: document.getElementById("ef-codice-asl").value,
        diagnosiLastDescCodiceAsl: document.getElementById("ef-desc-asl").value,
        diagnosiLastPatologia: document.getElementById("ef-patologia").value,
        diagnosiLastSituazioneHandicap: document.getElementById("ef-handicap").value,
        diagnosiLastProvenienzaInformazioni: document.getElementById("ef-provenienza").value,
        allegatiLg68: document.getElementById("ef-allegati-status").value === "true",
        diagnosi: document.getElementById("ef-diagnosi").value,
        diagnosiLastDescTipoSupporto: document.getElementById("ef-desc-supporto").value,

        // Studiamo (Istruzione)
        titoloStudioLast: document.getElementById("ef-titolo-last").value,
        anno: document.getElementById("ef-titolo-anno").value,
        votazione: document.getElementById("ef-titolo-voto").value,
        titoloStudioPresso: document.getElementById("ef-titolo-presso").value,
        qualifica: document.getElementById("ef-qualifica").value,
        patenteMuletto: document.getElementById("ef-muletto").value === "true",
        ecdl: document.getElementById("ef-ecdl").value,
        inglese: document.getElementById("ef-inglese").value.includes("Sì"),
        spagnolo: document.getElementById("ef-spagnolo").value === "Sì",
        altreLingue: document.getElementById("ef-altre-lingue").value,

        ...funzPayload,
        ...mansPayload
      };

      window.store.updatePersona(p.id, updatedPayload);

      RoxToast.success("Scheda Salvata", "Tutte le modifiche anagrafiche e sanitarie sono state memorizzate su MySQL.");
      renderCitizenHub();
    });
  }

  // --- CONTROLLER WIZARD GUIDATO INSERIMENTO / MODIFICA ISCRITTO L.68/99 ---
  let currentWizardStep = 1;
  const totalWizardSteps = 5;

  function setWizardStep(step) {
    currentWizardStep = Math.max(1, Math.min(step, totalWizardSteps));

    // Update Step Contents visibility
    for (let i = 1; i <= totalWizardSteps; i++) {
      const stepContent = document.getElementById(`wizard-step-${i}`);
      if (stepContent) {
        if (i === currentWizardStep) {
          stepContent.classList.remove("hidden");
        } else {
          stepContent.classList.add("hidden");
        }
      }
    }

    // Update Stepper Tabs active classes
    document.querySelectorAll(".wizard-step-tab").forEach(tab => {
      const s = parseInt(tab.getAttribute("data-step"));
      const circle = tab.querySelector("span:first-child");
      if (s === currentWizardStep) {
        tab.classList.remove("text-slate-400");
        tab.classList.add("text-blue-600");
        circle.className = "w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px]";
      } else if (s < currentWizardStep) {
        tab.classList.remove("text-slate-400", "text-blue-600");
        tab.classList.add("text-emerald-600");
        circle.className = "w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px]";
      } else {
        tab.classList.remove("text-blue-600", "text-emerald-600");
        tab.classList.add("text-slate-400");
        circle.className = "w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[11px]";
      }
    });

    // Update Footer controls
    const lblStep = document.getElementById("wizard-current-step-label");
    if (lblStep) lblStep.textContent = currentWizardStep;

    const btnPrev = document.getElementById("btn-wizard-prev");
    const btnNext = document.getElementById("btn-wizard-next");
    const btnSubmit = document.getElementById("btn-wizard-submit");

    if (btnPrev) btnPrev.disabled = (currentWizardStep === 1);

    if (currentWizardStep === totalWizardSteps) {
      if (btnNext) btnNext.classList.add("hidden");
      if (btnSubmit) btnSubmit.classList.remove("hidden");
    } else {
      if (btnNext) btnNext.classList.remove("hidden");
      if (btnSubmit) btnSubmit.classList.add("hidden");
    }
  }

  function openWizardPersona(persona = null) {
    const modal = document.getElementById("modal-persona");
    const form = document.getElementById("form-wizard-persona");
    if (!modal || !form) return;

    form.reset();
    currentWizardStep = 1;
    setWizardStep(1);

    const titleEl = document.getElementById("modal-persona-title");
    const badgeEl = document.getElementById("wizard-badge-mode");
    const idInput = document.getElementById("wizard-persona-id");

    if (persona) {
      if (titleEl) titleEl.textContent = `Modifica Scheda: ${persona.nome || ''} ${persona.cognome || ''}`;
      if (badgeEl) badgeEl.textContent = `Aggiornamento Iscritto #${persona.numeroIscrizione || persona.id}`;
      if (idInput) idInput.value = persona.id;

      // Fill Step 1
      document.getElementById("w-nome").value = persona.nome || "";
      document.getElementById("w-cognome").value = persona.cognome || "";
      document.getElementById("w-cf").value = persona.codiceFiscale || "";
      document.getElementById("w-data-nascita").value = persona.dataNascita ? persona.dataNascita.split("T")[0] : "";
      document.getElementById("w-nato-a").value = persona.natoA || "";
      document.getElementById("w-sesso").value = persona.sesso || "M";
      document.getElementById("w-stato-civile").value = persona.statoCivile || "Celibe/Nubile";
      document.getElementById("w-comune-res").value = persona.comuneResidenza || "";
      document.getElementById("w-prov-res").value = persona.residenzaProvincia || "LC";
      document.getElementById("w-indirizzo-res").value = persona.indirizzo || "";
      document.getElementById("w-cellulare").value = persona.cellulare || "";
      document.getElementById("w-telefono").value = persona.telefono || "";
      document.getElementById("w-email").value = persona.email || "";

      // Fill Step 2
      document.getElementById("w-categoria").value = persona.categoria || "C.O.";
      document.getElementById("w-cat-specifica").value = persona.categoriaLg6869 || "";
      document.getElementById("w-ic-perc").value = persona.icPercentuale || "";
      document.getElementById("w-attivo").value = persona.attivoNonAttivo || "Attivo";
      document.getElementById("w-stato-occup").value = persona.stato || "Disoccupato";
      document.getElementById("w-data-iscrizione").value = persona.dataIscrizioneCO ? persona.dataIscrizioneCO.split("T")[0] : "";
      document.getElementById("w-data-revisione").value = persona.dataRevisione ? persona.dataRevisione.split("T")[0] : "";
      document.getElementById("w-asl").value = persona.asl || "";
      document.getElementById("w-patologia").value = persona.patologia || "";
      document.getElementById("w-diagnosi").value = persona.diagnosi || "";
      document.getElementById("w-supporto-postazione").value = persona.diagnosiLastDescTipoSupporto || "";
      document.getElementById("w-l104").checked = !!persona.handicapL104;
      document.getElementById("w-allegati-l68").checked = persona.allegatiLg68 !== false;

      // Fill Step 3
      document.getElementById("w-titolo-studio").value = persona.titoloStudioLast || "";
      document.getElementById("w-istituto").value = persona.titoloStudioPresso || "";
      document.getElementById("w-anno-titolo").value = persona.anno || "";
      document.getElementById("w-votazione").value = persona.votazione || "";
      document.getElementById("w-qualifica").value = persona.qualifica || "";
      document.getElementById("w-ecdl").value = persona.ecdl || "Sì (Certificato PC)";
      document.getElementById("w-patente").value = persona.patente || "B";
      document.getElementById("w-lang-en").checked = !!persona.inglese;
      document.getElementById("w-lang-fr").checked = !!persona.francese;
      document.getElementById("w-lang-es").checked = !!persona.spagnolo;
      document.getElementById("w-lang-de").checked = !!persona.tedesco;
      document.getElementById("w-patente-muletto").checked = !!persona.patenteMuletto;

      // Fill Step 4
      document.getElementById("w-stazione-eretta").checked = persona.stazioneEretta !== false;
      document.getElementById("w-movimentazione").checked = persona.movimentazioneManuale !== false;
      document.getElementById("w-manualita").checked = persona.manualitaFine !== false;
      document.getElementById("w-arti-superiori").checked = persona.artiSuperiori !== false;
      document.getElementById("w-vista").checked = persona.vista !== false;
      document.getElementById("w-udito").checked = persona.udito !== false;
      document.getElementById("w-colonna").checked = persona.colonna !== false;
      document.getElementById("w-pubblico").checked = persona.contattoPubblico !== false;

      document.getElementById("w-m-impiegato").checked = !!persona.impiegato;
      document.getElementById("w-m-reception").checked = !!persona.receptionSegreteria;
      document.getElementById("w-m-magazzino").checked = !!persona.magazzino;
      document.getElementById("w-m-cassa").checked = !!persona.cassa;
      document.getElementById("w-m-pulizie").checked = !!persona.pulizie;
      document.getElementById("w-m-verde").checked = !!persona.verde;
      document.getElementById("w-m-artigiano").checked = !!persona.artigiano;
      document.getElementById("w-m-informatica").checked = !!persona.informatica;

      // Fill Step 5
      const disp = persona.disponibilita || {};
      document.getElementById("w-orario").value = disp.orarioPreferito || "Full-Time (40h)";
      document.getElementById("w-raggio-km").value = disp.raggioMaxKm || 25;
      document.getElementById("w-operatore-cpi").value = persona.operatore || "Marco Galli (Admin CPI)";
      document.getElementById("w-mezzo-munito").checked = disp.mezzoMunit !== false;
      document.getElementById("w-smartworking").checked = !!disp.smartWorking;
      document.getElementById("w-turni").checked = !!disp.disponibileTurni;
      document.getElementById("w-festivi").checked = !!disp.disponibileFestivi;
      document.getElementById("w-note-disponibilita").value = disp.noteDisponibilita || "";
    } else {
      if (titleEl) titleEl.textContent = "Procedura Guidata Inserimento Iscritto";
      if (badgeEl) badgeEl.textContent = "Nuova Presa in Carico L.68/99";
      if (idInput) idInput.value = "";
    }

    modal.classList.remove("hidden");
  }

  // Stepper Listeners
  document.querySelectorAll(".wizard-step-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const targetStep = parseInt(tab.getAttribute("data-step"));
      setWizardStep(targetStep);
    });
  });

  const btnWizardPrev = document.getElementById("btn-wizard-prev");
  if (btnWizardPrev) {
    btnWizardPrev.addEventListener("click", () => {
      if (currentWizardStep > 1) setWizardStep(currentWizardStep - 1);
    });
  }

  const btnWizardNext = document.getElementById("btn-wizard-next");
  if (btnWizardNext) {
    btnWizardNext.addEventListener("click", () => {
      // Step 1 Validation
      if (currentWizardStep === 1) {
        const nome = document.getElementById("w-nome").value.trim();
        const cf = document.getElementById("w-cf").value.trim();
        if (!nome || !cf) {
          alert("Compilare almeno il Nome e il Codice Fiscale del cittadino per procedere.");
          return;
        }
      }
      if (currentWizardStep < totalWizardSteps) setWizardStep(currentWizardStep + 1);
    });
  }

  const btnCloseWizard = document.getElementById("btn-close-modal-persona");
  if (btnCloseWizard) {
    btnCloseWizard.addEventListener("click", () => {
      document.getElementById("modal-persona").classList.add("hidden");
    });
  }

  // Stepper Form Submission
  const btnWizardSubmit = document.getElementById("btn-wizard-submit");
  if (btnWizardSubmit) {
    btnWizardSubmit.addEventListener("click", async () => {
      const idVal = document.getElementById("wizard-persona-id").value;
      const isEdit = !!idVal;

      const personaPayload = {
        nome: document.getElementById("w-nome").value.trim(),
        cognome: document.getElementById("w-cognome").value.trim(),
        codiceFiscale: document.getElementById("w-cf").value.trim().toUpperCase(),
        dataNascita: document.getElementById("w-data-nascita").value ? new Date(document.getElementById("w-data-nascita").value).toISOString() : null,
        natoA: document.getElementById("w-nato-a").value.trim(),
        sesso: document.getElementById("w-sesso").value,
        statoCivile: document.getElementById("w-stato-civile").value,
        comuneResidenza: document.getElementById("w-comune-res").value.trim(),
        residenzaProvincia: document.getElementById("w-prov-res").value.trim().toUpperCase(),
        indirizzo: document.getElementById("w-indirizzo-res").value.trim(),
        cellulare: document.getElementById("w-cellulare").value.trim(),
        telefono: document.getElementById("w-telefono").value.trim(),
        email: document.getElementById("w-email").value.trim(),

        categoria: document.getElementById("w-categoria").value,
        categoriaLg6869: document.getElementById("w-cat-specifica").value.trim(),
        icPercentuale: parseInt(document.getElementById("w-ic-perc").value) || 0,
        attivoNonAttivo: document.getElementById("w-attivo").value,
        stato: document.getElementById("w-stato-occup").value,
        dataIscrizioneCO: document.getElementById("w-data-iscrizione").value ? new Date(document.getElementById("w-data-iscrizione").value).toISOString() : null,
        dataRevisione: document.getElementById("w-data-revisione").value ? new Date(document.getElementById("w-data-revisione").value).toISOString() : null,
        asl: document.getElementById("w-asl").value.trim(),
        patologia: document.getElementById("w-patologia").value.trim(),
        diagnosi: document.getElementById("w-diagnosi").value.trim(),
        diagnosiLastDescTipoSupporto: document.getElementById("w-supporto-postazione").value.trim(),
        handicapL104: document.getElementById("w-l104").checked,
        allegatiLg68: document.getElementById("w-allegati-l68").checked,

        titoloStudioLast: document.getElementById("w-titolo-studio").value.trim(),
        titoloStudioPresso: document.getElementById("w-istituto").value.trim(),
        anno: parseInt(document.getElementById("w-anno-titolo").value) || null,
        votazione: document.getElementById("w-votazione").value.trim(),
        qualifica: document.getElementById("w-qualifica").value.trim(),
        ecdl: document.getElementById("w-ecdl").value,
        patente: document.getElementById("w-patente").value.trim(),
        inglese: document.getElementById("w-lang-en").checked,
        francese: document.getElementById("w-lang-fr").checked,
        spagnolo: document.getElementById("w-lang-es").checked,
        tedesco: document.getElementById("w-lang-de").checked,
        patenteMuletto: document.getElementById("w-patente-muletto").checked,

        stazioneEretta: document.getElementById("w-stazione-eretta").checked,
        movimentazioneManuale: document.getElementById("w-movimentazione").checked,
        manualitaFine: document.getElementById("w-manualita").checked,
        artiSuperiori: document.getElementById("w-arti-superiori").checked,
        vista: document.getElementById("w-vista").checked,
        udito: document.getElementById("w-udito").checked,
        colonna: document.getElementById("w-colonna").checked,
        contattoPubblico: document.getElementById("w-pubblico").checked,

        impiegato: document.getElementById("w-m-impiegato").checked,
        receptionSegreteria: document.getElementById("w-m-reception").checked,
        magazzino: document.getElementById("w-m-magazzino").checked,
        cassa: document.getElementById("w-m-cassa").checked,
        pulizie: document.getElementById("w-m-pulizie").checked,
        verde: document.getElementById("w-m-verde").checked,
        artigiano: document.getElementById("w-m-artigiano").checked,
        informatica: document.getElementById("w-m-informatica").checked,

        operatore: document.getElementById("w-operatore-cpi").value.trim(),
        disponibilita: {
          orarioPreferito: document.getElementById("w-orario").value,
          raggioMaxKm: parseInt(document.getElementById("w-raggio-km").value) || 25,
          mezzoMunit: document.getElementById("w-mezzo-munito").checked,
          smartWorking: document.getElementById("w-smartworking").checked,
          disponibileTurni: document.getElementById("w-turni").checked,
          disponibileFestivi: document.getElementById("w-festivi").checked,
          noteDisponibilita: document.getElementById("w-note-disponibilita").value.trim()
        }
      };

      if (isEdit) {
        await window.store.updatePersona(idVal, personaPayload);
      } else {
        await window.store.addPersona(personaPayload);
      }

      document.getElementById("modal-persona").classList.add("hidden");
      renderMainSearchTable();
      renderCitizenHub();

      RoxToast.success(
        isEdit ? "Scheda Aggiornata" : "Nuovo Iscritto Registrato",
        `La pratica per ${personaPayload.nome} ${personaPayload.cognome} è stata salvata su MySQL!`
      );
    });
  }

  // Hook Quick New Persona buttons to Stepper Wizard
  const btnQuickNew = document.getElementById("btn-quick-new-persona");
  if (btnQuickNew) {
    btnQuickNew.addEventListener("click", () => openWizardPersona(null));
  }

  const btnNuovoIscrittoSearch = document.getElementById("btn-nuovo-iscritto");
  if (btnNuovoIscrittoSearch) {
    btnNuovoIscrittoSearch.addEventListener("click", () => openWizardPersona(null));
  }

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

  // --- SAVE DISPONIBILITA FORM ---
  const formDisp = document.getElementById("form-disponibilita-hub");
  if (formDisp) {
    formDisp.addEventListener("submit", (e) => {
      e.preventDefault();
      const p = window.store.getSelectedPersona();
      if (!p) return;

      const disponibilitaData = {
        orarioPreferito: document.getElementById("disp-orario").value,
        turni: document.getElementById("disp-turni").value,
        raggioMaxKm: parseInt(document.getElementById("disp-raggio").value) || 20,
        sedeTerritoriale: document.getElementById("disp-sede").value,
        mezzoMunit: document.getElementById("disp-automunito").value === "true",
        smartWorking: document.getElementById("disp-smart").value,
        noteDisponibilita: document.getElementById("disp-note").value
      };

      window.store.updatePersona(p.id, { disponibilita: disponibilitaData });
      
      if (typeof Swal !== "undefined") {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Disponibilità lavorativa salvata!',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        alert("Disponibilità aggiornata con successo!");
      }
      renderCitizenHub();
    });
  }

  // --- UPLOAD WALLET FILE MODAL ---
  const modalDoc = document.getElementById("modal-upload-doc");
  document.getElementById("btn-hub-upload-doc").addEventListener("click", () => modalDoc.classList.remove("hidden"));
  document.getElementById("btn-upload-file-wallet-tab").addEventListener("click", () => modalDoc.classList.remove("hidden"));
  document.getElementById("btn-close-modal-doc").addEventListener("click", () => modalDoc.classList.add("hidden"));
  document.getElementById("btn-cancel-doc").addEventListener("click", () => modalDoc.classList.add("hidden"));

  // Quick Direct Upload for Verbale L.68
  const btnUploadL68 = document.getElementById("btn-upload-verbale-l68");
  const fileInputL68 = document.getElementById("file-verbale-l68");
  if (btnUploadL68 && fileInputL68) {
    btnUploadL68.addEventListener("click", () => fileInputL68.click());
    fileInputL68.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const p = window.store.getSelectedPersona();
      if (file && p) {
        if (typeof Swal !== "undefined") {
          Swal.fire({
            title: 'Caricamento Verbale Legge 68...',
            html: `
              <div class="space-y-3 pt-2">
                <p class="text-xs text-slate-600 font-medium">Lettura file <b>${file.name}</b> e memorizzazione su MySQL...</p>
                <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                  <div class="bg-rose-600 h-2.5 rounded-full animate-pulse" style="width: 100%"></div>
                </div>
              </div>
            `,
            allowOutsideClick: false,
        const reader = new FileReader();
        reader.onload = async function(evt) {
          await window.store.addDocumentToWallet(p.id, {
            nome: file.name,
            tipo: "Verbale Legge 68",
            descrizione: "Verbale collegiale L.68/99 allegato direttamente dalla sezione sanitaria",
            dimensione: (file.size / 1024).toFixed(1) + " KB",
            fileContent: evt.target.result,
            fileType: file.type
          });

          renderCitizenHub();
          RoxToast.success("Verbale L.68 Allegato", `File ${file.name} memorizzato nel fascicolo.`);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Quick Direct Upload for Verbale Invalidità Civile
  const btnUploadIC = document.getElementById("btn-upload-verbale-ic");
  const fileInputIC = document.getElementById("file-verbale-ic");
  if (btnUploadIC && fileInputIC) {
    btnUploadIC.addEventListener("click", () => fileInputIC.click());
    fileInputIC.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const p = window.store.getSelectedPersona();
      if (file && p) {
        RoxToast.info("Caricamento in corso...", `Salvataggio ${file.name} su MySQL...`, 2000);

        const reader = new FileReader();
        reader.onload = async function(evt) {
          await window.store.addDocumentToWallet(p.id, {
            nome: file.name,
            tipo: "Verbale INPS / Invalidità Civile",
            descrizione: "Verbale di invalidità civile allegato direttamente dalla sezione sanitaria",
            dimensione: (file.size / 1024).toFixed(1) + " KB",
            fileContent: evt.target.result,
            fileType: file.type
          });

          renderCitizenHub();
          RoxToast.success("Verbale IC Allegato", `File ${file.name} memorizzato nel fascicolo.`);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  document.getElementById("form-upload-doc").addEventListener("submit", (e) => {
    e.preventDefault();
    const p = window.store.getSelectedPersona();
    if (!p) return;

    const fileInput = document.getElementById("doc-file-input");
    const file = fileInput.files ? fileInput.files[0] : null;
    const nomeCustom = document.getElementById("doc-nome").value.trim();
    const tipo = document.getElementById("doc-tipo").value;
    const descrizione = document.getElementById("doc-descrizione").value.trim();

    if (file) {
      const fileName = nomeCustom || file.name;
      const fileSize = (file.size / 1024).toFixed(1) + " KB";

      RoxToast.info("Caricamento Wallet...", `Invio ${fileName} su MySQL...`, 2000);

      const reader = new FileReader();
      reader.onload = async function(evt) {
        await window.store.addDocumentToWallet(p.id, {
          nome: fileName,
          tipo: tipo,
          descrizione: descrizione,
          dimensione: fileSize,
          fileContent: evt.target.result,
          fileType: file.type
        });

        modalDoc.classList.add("hidden");
        document.getElementById("form-upload-doc").reset();
        renderCitizenHub();
        RoxToast.success("Documento Salvato", `File ${fileName} aggiunto al Wallet.`);
      };

      reader.readAsDataURL(file);
    } else {
      RoxToast.warning("Nessun File", "Selezionare un file reale da caricare.");
    }
  });

  // --- ADD NOTA DIARIO MODAL ---
  const modalNota = document.getElementById("modal-nota-diario");
  document.getElementById("btn-hub-add-nota").addEventListener("click", () => modalNota.classList.remove("hidden"));
  document.getElementById("btn-add-diario-tab").addEventListener("click", () => modalNota.classList.remove("hidden"));
  document.getElementById("btn-close-modal-nota").addEventListener("click", () => modalNota.classList.add("hidden"));
  document.getElementById("btn-cancel-nota").addEventListener("click", () => modalNota.classList.add("hidden"));

  document.getElementById("form-nota-diario").addEventListener("submit", (e) => {
    e.preventDefault();
    const p = window.store.getSelectedPersona();
    if (!p) return;

    const tipoNota = document.getElementById("nota-tipo-select").value;
    const testo = document.getElementById("nota-testo").value.trim();
    const firma = document.getElementById("nota-firma").value.trim();

    if (testo) {
      window.store.addNotaDiario({
        numeroIscrizione: p.numeroIscrizione,
        nome: p.nome,
        tipoNota: tipoNota,
        data: new Date().toISOString().split('T')[0],
        noteDiDiario: testo,
        firma: firma || "Operatore CPI Lecco",
        operatore: "CPI Lecco"
      });

      modalNota.classList.add("hidden");
      document.getElementById("nota-testo").value = "";
      renderCitizenHub();
      RoxToast.success("Nota Aggiunta", "La nuova annotazione è stata registrata nel diario.");
    }
  });

  // --- ADD VERBALE COMITATO TECNICO MODAL ---
  const modalComitato = document.getElementById("modal-verbale-comitato");
  const btnAddVerbaleComitato = document.getElementById("btn-add-verbale-comitato");
  const btnCloseModalComitato = document.getElementById("btn-close-modal-comitato");
  const btnCancelModalComitato = document.getElementById("btn-cancel-modal-comitato");
  const formVerbaleComitato = document.getElementById("form-verbale-comitato");

  if (btnAddVerbaleComitato && modalComitato) {
    btnAddVerbaleComitato.addEventListener("click", () => {
      const p = window.store.getSelectedPersona();
      if (!p) return;
      document.getElementById("com-data-seduta").value = new Date().toISOString().split('T')[0];
      document.getElementById("com-pratica").value = `${Math.floor(4000 + Math.random() * 5000)}/ASL`;
      modalComitato.classList.remove("hidden");
    });
  }

  if (btnCloseModalComitato && modalComitato) {
    btnCloseModalComitato.addEventListener("click", () => modalComitato.classList.add("hidden"));
  }

  if (btnCancelModalComitato && modalComitato) {
    btnCancelModalComitato.addEventListener("click", () => modalComitato.classList.add("hidden"));
  }

  if (formVerbaleComitato) {
    formVerbaleComitato.addEventListener("submit", (e) => {
      e.preventDefault();
      const p = window.store.getSelectedPersona();
      if (!p) return;

      const verbaleData = {
        numeroIscrizione: p.numeroIscrizione,
        personaId: p.id,
        numPratica: document.getElementById("com-pratica").value.trim(),
        dataSeduta: document.getElementById("com-data-seduta").value,
        dataVerbale: (document.getElementById("com-data-verbale") || {}).value || "",
        asl: document.getElementById("com-asl").value.trim(),
        prognosi: document.getElementById("com-prognosi").value.trim(),
        anamnesi: (document.getElementById("com-anamnesi") || {}).value || "",
        altrePatologie: (document.getElementById("com-altre-patologie") || {}).value || "",
        capacitaLavorative: (document.getElementById("com-cap-lavorative") || {}).value || "",
        capacitaRelazionali: (document.getElementById("com-relazionali") || {}).value || "Buone",
        percorsoScolastico: document.getElementById("com-scolastico").value.trim(),
        percorsoLavorativo: document.getElementById("com-lavorativo").value.trim(),
        autonomiaPers: document.getElementById("com-autonomia").value,
        abilitaCognitive: document.getElementById("com-cognitive").value,
        responsabile: document.getElementById("com-responsabile").value.trim(),
        supporto: !!(document.getElementById("com-supporto") || {}).checked,
        mediazione: !!(document.getElementById("com-mediazione") || {}).checked,
        protetto: !!(document.getElementById("com-protetto") || {}).checked,
        adozione: !!(document.getElementById("com-adozione") || {}).checked
      };

      window.store.addVerbaleComitato(verbaleData);
      modalComitato.classList.add("hidden");
      formVerbaleComitato.reset();
      renderCitizenHub();
      RoxToast.success("Verbale ASL Registrato", "Pratica Comitato Tecnico archiviata con successo.");
    });
  }

  // --- ADD PROGETTO INSERIMENTO (PIL) MODAL ---
  const modalPil = document.getElementById("modal-progetto-pil");
  const btnAddPilTab = document.getElementById("btn-add-pil-tab");
  const btnCloseModalPil = document.getElementById("btn-close-modal-pil");
  const btnCancelModalPil = document.getElementById("btn-cancel-modal-pil");
  const formProgettoPil = document.getElementById("form-progetto-pil");

  if (btnAddPilTab && modalPil) {
    btnAddPilTab.addEventListener("click", () => {
      const p = window.store.getSelectedPersona();
      if (!p) return;
      document.getElementById("pil-data").value = new Date().toISOString().split('T')[0];
      document.getElementById("pil-iddote").value = `DOTE-L68-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`;
      modalPil.classList.remove("hidden");
    });
  }

  if (btnCloseModalPil && modalPil) {
    btnCloseModalPil.addEventListener("click", () => modalPil.classList.add("hidden"));
  }

  if (btnCancelModalPil && modalPil) {
    btnCancelModalPil.addEventListener("click", () => modalPil.classList.add("hidden"));
  }

  if (formProgettoPil) {
    formProgettoPil.addEventListener("submit", (e) => {
      e.preventDefault();
      const p = window.store.getSelectedPersona();
      if (!p) return;

      const pilData = {
        numeroIscrizione: p.numeroIscrizione,
        nome: p.nome,
        codiceFiscale: p.codiceFiscale,
        data: document.getElementById("pil-data").value,
        idDote: document.getElementById("pil-iddote").value.trim(),
        tutor: document.getElementById("pil-operatore").value.trim(),
        progettoInserimento: document.getElementById("pil-progetto").value.trim(),
        profiloDinamicoFunzionale: document.getElementById("pil-funzionale").value.trim(),
        profiloSanitario: document.getElementById("pil-sanitario").value.trim(),
        profiloScolastico: document.getElementById("pil-scolastico").value.trim(),
        profiloLavorativo: document.getElementById("pil-lavorativo").value.trim(),
        profiloPersonaleSociale: document.getElementById("pil-sociale").value.trim(),
        valutazioneLavorativa: document.getElementById("pil-valutazione").value.trim(),
        aspettiCriticita: document.getElementById("pil-criticita").value.trim(),
        aspettiPositivita: document.getElementById("pil-positivita").value.trim()
      };

      window.store.addProgettoInserimentoLav(pilData);
      modalPil.classList.add("hidden");
      formProgettoPil.reset();
      renderCitizenHub();
      RoxToast.success("Progetto PIL Salvato", "Progetto individuale registrato su MySQL.");
    });
  }

  // --- MATCHER RUNNER ---
  function runMatcher() {
    const reqs = {
      mansione: document.getElementById("m-mansione").value,
      minIC: parseInt(document.getElementById("m-min-ic").value) || 0,
      noStazioneEretta: document.getElementById("m-noeretta").checked,
      noMovimentazioneCarichi: document.getElementById("m-nocarichi").checked
    };

    const persone = window.store.getPersone();
    const container = document.getElementById("matcher-results-container");

    const evaluated = persone.map(p => {
      const res = window.MatcherEngine.calculateScore(p, reqs);
      return { persona: p, score: res.score, matchReasons: res.matchReasons, incompatibilities: res.incompatibilities };
    });

    evaluated.sort((a, b) => b.score - a.score);

    container.innerHTML = evaluated.map(res => `
      <div class="card-white p-5 space-y-3">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-slate-900 text-sm font-heading">${escapeHtml(res.persona.nome)}</h3>
            <p class="text-xs text-slate-500">Cat: <strong class="text-slate-700">${res.persona.categoria}</strong> | % Invalidità: <strong class="text-slate-700">${res.persona.icPercentuale}%</strong></p>
          </div>
          <span class="text-sm font-extrabold px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-heading">
            ${res.score}% MATCH
          </span>
        </div>
        <div class="text-xs text-slate-600 space-y-1">
          ${res.matchReasons.map(r => `<div class="text-emerald-700"><i class="fa-solid fa-check text-[10px] mr-1"></i> ${r}</div>`).join("")}
        </div>
        <div class="pt-2 flex justify-end">
          <button data-id="${res.persona.id}" class="btn-select-from-matcher cursor-pointer text-xs text-blue-600 font-semibold hover:underline font-heading">
            Apri Scheda 360° <i class="fa-solid fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    `).join("");

    document.querySelectorAll(".btn-select-from-matcher").forEach(btn => {
      btn.addEventListener("click", () => {
        window.store.setSelectedPersonaId(btn.getAttribute("data-id"));
        renderCitizenHub();
        document.getElementById("nav-mode-hub").click();
      });
    });
  }

  document.getElementById("form-full-matcher").addEventListener("submit", (e) => {
    e.preventDefault();
    runMatcher();
  });

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

  // --- GESTIONE LOGIN & SESSIONE PROTETTA ---
  const modalLogin = document.getElementById("modal-login");
  const formLogin = document.getElementById("form-login");
  const currentUserDisplay = document.getElementById("current-user-display");

  // Toggle Show/Hide Password
  const btnTogglePass = document.getElementById("btn-toggle-password");
  const loginPassInput = document.getElementById("login-password");
  if (btnTogglePass && loginPassInput) {
    btnTogglePass.addEventListener("click", () => {
      const isPass = loginPassInput.type === "password";
      loginPassInput.type = isPass ? "text" : "password";
      btnTogglePass.textContent = isPass ? "Nascondi" : "Mostra";
    });
  }

  // Check saved session
  const savedUserJson = localStorage.getItem("ROXANNE_CURRENT_USER");
  if (savedUserJson) {
    try {
      const savedUser = JSON.parse(savedUserJson);
      if (currentUserDisplay) {
        currentUserDisplay.textContent = `${savedUser.nomeCompleto} (${savedUser.ruolo})`;
      }
      if (modalLogin) modalLogin.classList.add("hidden");
    } catch (e) {
      if (modalLogin) modalLogin.classList.remove("hidden");
    }
  } else {
    if (modalLogin) modalLogin.classList.remove("hidden");
  }

  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value.trim();
      const password = document.getElementById("login-password").value.trim();

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem("ROXANNE_CURRENT_USER", JSON.stringify(data.user));
          if (currentUserDisplay) {
            currentUserDisplay.textContent = `${data.user.nomeCompleto} (${data.user.ruolo})`;
          }
          modalLogin.classList.add("hidden");
          RoxToast.success("Autenticato", `Benvenuto ${data.user.nomeCompleto} (${data.user.ruolo})`);
        } else {
          // Errore reale dal backend MySQL
          RoxToast.error("Accesso Negato", data.error || "Credenziali non valide o utente inesistente.", 4000);
        }
      } catch (err) {
        console.error("Errore connessione server:", err);
        RoxToast.error("Errore di Rete", "Impossibile raggiungere il database di autenticazione.");
      }
    });
  }

  // Reset DB Listener
  const btnResetDb = document.getElementById("btn-reset-db");
  if (btnResetDb) {
    btnResetDb.addEventListener("click", () => {
      if (confirm("Ripristinare i dati iniziali dal DB Access?")) {
        window.store.resetToDefault();
        renderMainSearchTable();
        renderCitizenHub();
        if (typeof Swal !== "undefined") {
          Swal.fire({
            icon: 'success',
            title: 'Database Ripristinato',
            text: 'I dati iniziali del DB Access sono stati ripristinati con successo.',
            confirmButtonColor: '#2563eb'
          });
        } else {
          alert("Database ripristinato!");
        }
      }
    });
  }

  // Helper Utils
  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
});
