/**
 * Roxanne CPI Light - Branding Module
 * Personalizzazione logo istituzionale CPI e loghi PDF
 */

  // --- CONTROLLER BRANDING & PERSONALIZZAZIONE LOGO CPI & PDF ---
  let currentCustomLogoData = localStorage.getItem("ROXANNE_CUSTOM_LOGO") || null;
  let currentPdfLogo1Data = localStorage.getItem("ROXANNE_PDF_LOGO_1") || null;
  let currentPdfLogo2Data = localStorage.getItem("ROXANNE_PDF_LOGO_2") || null;
  let currentPdfLogo3Data = localStorage.getItem("ROXANNE_PDF_LOGO_3") || null;

  function loadBrandingConfig() {
    const savedTitle = localStorage.getItem("ROXANNE_BRAND_TITLE") || "ROXANNE STELLAR";
    const savedTag = localStorage.getItem("ROXANNE_BRAND_TAG") || "L.68/99";
    const savedSubtitle = localStorage.getItem("ROXANNE_BRAND_SUBTITLE") || "Gestionale Collocamento Mirato · Centro per l'Impiego";
    const savedLogo = localStorage.getItem("ROXANNE_CUSTOM_LOGO");

    // Update Header Text Elements
    const hTitle = document.getElementById("header-brand-title");
    const hTag = document.getElementById("header-brand-tag");
    const hSubtitle = document.getElementById("header-brand-subtitle");

    if (hTitle) hTitle.innerHTML = `<span class="text-blue-600">${escapeHtml(savedTitle)}</span>`;
    if (hTag) hTag.textContent = savedTag;
    if (hSubtitle) hSubtitle.textContent = savedSubtitle;

    // Update Admin Inputs
    const inTitle = document.getElementById("brand-title-input");
    const inTag = document.getElementById("brand-tag-input");
    const inSubtitle = document.getElementById("brand-subtitle-input");

    if (inTitle) inTitle.value = savedTitle;
    if (inTag) inTag.value = savedTag;
    if (inSubtitle) inSubtitle.value = savedSubtitle;

    // Apply Header Logo
    applyLogoToHeader(savedLogo);

    // Apply PDF Logos Previews
    renderPdfLogosPreview();
  }

  function renderPdfLogosPreview() {
    const p1 = document.getElementById("pdf-logo-1-preview");
    const p2 = document.getElementById("pdf-logo-2-preview");
    const p3 = document.getElementById("pdf-logo-3-preview");

    const l1 = localStorage.getItem("ROXANNE_PDF_LOGO_1");
    const l2 = localStorage.getItem("ROXANNE_PDF_LOGO_2");
    const l3 = localStorage.getItem("ROXANNE_PDF_LOGO_3");

    if (p1) p1.src = l1 || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Provincia_di_Lecco-Stemma.svg/120px-Provincia_di_Lecco-Stemma.svg.png";
    if (p2) p2.src = l2 || "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Lombardia-Bandiera.svg/180px-Lombardia-Bandiera.svg.png";
    if (p3) p3.src = l3 || "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Lombardia-Bandiera.svg/180px-Lombardia-Bandiera.svg.png";
  }

  function applyLogoToHeader(logoData) {
    const hBox = document.getElementById("header-logo-box");
    const hImg = document.getElementById("header-logo-img");
    const hIcon = document.getElementById("header-logo-icon");
    const pBox = document.getElementById("brand-logo-preview-box");
    const pImg = document.getElementById("brand-logo-img-preview");
    const pIcon = document.getElementById("brand-logo-icon-preview");
    const dynamicFavicon = document.getElementById("dynamic-favicon");

    const defaultFaviconSvg = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232563eb'><path d='M12 3L2 12h3v8h14v-8h3L12 3zm0 4.5c1.38 0 2.5 1.12 2.5 2.5S13.38 12.5 12 12.5 9.5 11.38 9.5 10 10.62 7.5 12 7.5zm-5 11.5c0-1.66 2.24-3 5-3s5 1.34 5 3H7z'/></svg>";

    if (logoData) {
      if (hImg) { 
        hImg.src = logoData; 
        hImg.style.display = "block";
        hImg.classList.remove("hidden"); 
      }
      if (hIcon) { 
        hIcon.style.display = "none";
        hIcon.classList.add("hidden"); 
      }
      if (hBox) {
        hBox.className = "h-10 max-w-[180px] flex items-center justify-center shrink-0 bg-transparent shadow-none border-0 overflow-hidden";
        hBox.style.background = "transparent";
      }

      if (pImg) { 
        pImg.src = logoData; 
        pImg.style.display = "block";
        pImg.classList.remove("hidden"); 
      }
      if (pIcon) { 
        pIcon.style.display = "none";
        pIcon.classList.add("hidden"); 
      }
      if (pBox) {
        pBox.className = "w-full h-16 rounded-2xl mx-auto flex items-center justify-center overflow-hidden border border-slate-200 bg-white shadow-xs p-1";
        pBox.style.background = "#ffffff";
      }

      // Update Browser Tab Favicon
      if (dynamicFavicon) {
        dynamicFavicon.href = logoData;
      }
    } else {
      if (hImg) { 
        hImg.src = ""; 
        hImg.style.display = "none";
        hImg.classList.add("hidden"); 
      }
      if (hIcon) { 
        hIcon.style.display = "block";
        hIcon.classList.remove("hidden"); 
      }
      if (hBox) {
        hBox.className = "w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 font-heading shrink-0 overflow-hidden";
        hBox.style.background = "";
      }

      if (pImg) { 
        pImg.src = ""; 
        pImg.style.display = "none";
        pImg.classList.add("hidden"); 
      }
      if (pIcon) { 
        pIcon.style.display = "block";
        pIcon.classList.remove("hidden"); 
      }
      if (pBox) {
        pBox.className = "w-16 h-16 rounded-2xl mx-auto flex items-center justify-center overflow-hidden border border-slate-200 bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/15";
        pBox.style.background = "";
      }

      // Reset Browser Tab Favicon
      if (dynamicFavicon) {
        dynamicFavicon.href = defaultFaviconSvg;
      }
    }
  }

  // Upload Custom Header Logo Handler
  const btnUploadLogo = document.getElementById("btn-upload-custom-logo");
  const inputLogo = document.getElementById("input-custom-logo");
  if (btnUploadLogo && inputLogo) {
    btnUploadLogo.addEventListener("click", () => inputLogo.click());
    inputLogo.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          currentCustomLogoData = evt.target.result;
          applyLogoToHeader(currentCustomLogoData);
          RoxToast.info("Anteprima Logo", "Premi 'Salva Configurazione' per applicare il nuovo logo definitivamente.", 3000);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Reset Header Logo Handler
  const btnResetLogo = document.getElementById("btn-reset-logo");
  if (btnResetLogo) {
    btnResetLogo.addEventListener("click", () => {
      currentCustomLogoData = null;
      applyLogoToHeader(null);
      RoxToast.info("Ripristino", "Logo predefinito reimpostato in anteprima.");
    });
  }

  // PDF Logos 1, 2, 3 Upload & Reset Handlers
  [1, 2, 3].forEach(idx => {
    const btnUp = document.getElementById(`btn-upload-pdf-logo-${idx}`);
    const inputUp = document.getElementById(`input-pdf-logo-${idx}`);
    const btnRes = document.getElementById(`btn-reset-pdf-logo-${idx}`);
    const prev = document.getElementById(`pdf-logo-${idx}-preview`);

    if (btnUp && inputUp) {
      btnUp.addEventListener("click", () => inputUp.click());
      inputUp.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(evt) {
            if (idx === 1) currentPdfLogo1Data = evt.target.result;
            if (idx === 2) currentPdfLogo2Data = evt.target.result;
            if (idx === 3) currentPdfLogo3Data = evt.target.result;
            if (prev) prev.src = evt.target.result;
            RoxToast.info(`Logo PDF #${idx}`, "Anteprima caricata. Clicca 'Salva Configurazione' per memorizzare.");
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (btnRes) {
      btnRes.addEventListener("click", () => {
        if (idx === 1) currentPdfLogo1Data = null;
        if (idx === 2) currentPdfLogo2Data = null;
        if (idx === 3) currentPdfLogo3Data = null;
        localStorage.removeItem(`ROXANNE_PDF_LOGO_${idx}`);
        renderPdfLogosPreview();
        RoxToast.info(`Logo PDF #${idx}`, "Ripristinato al modello istituzionale standard.");
      });
    }
  });

  // Save Branding Handler
  const btnSaveBranding = document.getElementById("btn-save-branding");
  if (btnSaveBranding) {
    btnSaveBranding.addEventListener("click", () => {
      const titleVal = document.getElementById("brand-title-input").value.trim() || "ROXANNE STELLAR";
      const tagVal = document.getElementById("brand-tag-input").value.trim() || "L.68/99";
      const subtitleVal = document.getElementById("brand-subtitle-input").value.trim() || "Gestionale Collocamento Mirato · Centro per l'Impiego";

      localStorage.setItem("ROXANNE_BRAND_TITLE", titleVal);
      localStorage.setItem("ROXANNE_BRAND_TAG", tagVal);
      localStorage.setItem("ROXANNE_BRAND_SUBTITLE", subtitleVal);

      if (currentCustomLogoData) {
        localStorage.setItem("ROXANNE_CUSTOM_LOGO", currentCustomLogoData);
      } else {
        localStorage.removeItem("ROXANNE_CUSTOM_LOGO");
      }

      if (currentPdfLogo1Data) localStorage.setItem("ROXANNE_PDF_LOGO_1", currentPdfLogo1Data);
      if (currentPdfLogo2Data) localStorage.setItem("ROXANNE_PDF_LOGO_2", currentPdfLogo2Data);
      if (currentPdfLogo3Data) localStorage.setItem("ROXANNE_PDF_LOGO_3", currentPdfLogo3Data);

      loadBrandingConfig();
      if (window.RoxToast) RoxToast.success("Identità Visiva & PDF Aggiornati", "Logo header, scritte e loghi del verbale PDF memorizzati.");
    });
  }

window.loadBrandingConfig = loadBrandingConfig;
