/**
 * Roxanne CPI Light - UI Controls Module
 * Gestione Flatpickr, Custom Searchable Select, Textarea auto-expanding e View Mode Switcher
 */

window.currentResultsViewMode = "table"; // table | cards | compact

export function initCustomDatePickers() {
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

export function initCustomSearchableSelects() {
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

    // Search box if more than 2 options
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

export function initViewModeSwitcher() {
  const btnTable = document.getElementById("vm-table");
  const btnCards = document.getElementById("vm-cards");
  const btnCompact = document.getElementById("vm-compact");

  const viewTable = document.getElementById("view-results-table");
  const viewCards = document.getElementById("view-results-cards");
  const viewCompact = document.getElementById("view-results-compact");

  if (!btnTable || !btnCards || !btnCompact) return;

  function setViewMode(mode, activeBtn) {
    window.currentResultsViewMode = mode;
    [btnTable, btnCards, btnCompact].forEach(b => {
      b.classList.remove("active", "bg-blue-50", "text-blue-700", "border-blue-200", "font-semibold");
      b.classList.add("text-slate-600", "font-medium");
    });
    activeBtn.classList.add("active", "bg-blue-50", "text-blue-700", "border-blue-200", "font-semibold");
    activeBtn.classList.remove("text-slate-600", "font-medium");

    if (viewTable && viewCards && viewCompact) {
      [viewTable, viewCards, viewCompact].forEach(v => v.classList.add("hidden"));
      if (mode === "table") viewTable.classList.remove("hidden");
      if (mode === "cards") viewCards.classList.remove("hidden");
      if (mode === "compact") viewCompact.classList.remove("hidden");
    }

    if (typeof window.renderMainSearchTable === "function") {
      window.renderMainSearchTable();
    }
  }

  btnTable.addEventListener("click", () => setViewMode("table", btnTable));
  btnCards.addEventListener("click", () => setViewMode("cards", btnCards));
  btnCompact.addEventListener("click", () => setViewMode("compact", btnCompact));
}

export function initAutoExpandTextareas() {
  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = (el.scrollHeight + 4) + "px";
  }

  document.querySelectorAll(".auto-expand-textarea").forEach(tx => {
    tx.addEventListener("input", () => autoResize(tx));
    tx.addEventListener("focus", () => autoResize(tx));
    setTimeout(() => autoResize(tx), 100);
  });
}

// Window globals for backwards compatibility
window.initCustomDatePickers = initCustomDatePickers;
window.initCustomSearchableSelects = initCustomSearchableSelects;
window.initViewModeSwitcher = initViewModeSwitcher;
window.initAutoExpandTextareas = initAutoExpandTextareas;
