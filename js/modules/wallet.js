/**
 * Roxanne CPI Light - Wallet Module
 * Fascicolo documentale, preview documenti e upload allegati
 */

  // --- RENDER WALLET TAB COMPLETO (STILE MANTINE VAULT CARD CON ANTEPRIMA INTEGRATA & DOWNLOAD) ---
  function renderWalletTab(persona) {
    const walletList = persona.wallet || [];
    const countBadge = document.getElementById("badge-wallet-count");
    if (countBadge) countBadge.textContent = walletList.length;

    const totalBadge = document.getElementById("wallet-total-badge");
    if (totalBadge) totalBadge.textContent = `${walletList.length} ${walletList.length === 1 ? 'documento' : 'documenti'}`;

    const grid = document.getElementById("wallet-files-grid");
    if (!grid) return;

    // Dropzone Quick Upload listener
    const dropzone = document.getElementById("wallet-dropzone-banner");
    const quickInput = document.getElementById("wallet-quick-file-input");
    if (dropzone && quickInput) {
      dropzone.onclick = () => quickInput.click();
      
      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.classList.add("border-amber-500", "bg-amber-50/50");
      };
      dropzone.ondragleave = () => {
        dropzone.classList.remove("border-amber-500", "bg-amber-50/50");
      };
      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.classList.remove("border-amber-500", "bg-amber-50/50");
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleWalletDirectUpload(e.dataTransfer.files[0], persona);
        }
      };

      quickInput.onchange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleWalletDirectUpload(e.target.files[0], persona);
        }
      };
    }

    // Ricerca / Filtro nel fascicolo
    const searchInput = document.getElementById("wallet-search-filter");
    if (searchInput) {
      searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        document.querySelectorAll(".wallet-doc-card").forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(query) ? "flex" : "none";
        });
      };
    }

    if (walletList.length === 0) {
      grid.innerHTML = `
        <div class="col-span-1 md:col-span-2 lg:col-span-3 py-10 text-center space-y-3 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
          <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl border border-amber-200">
            <i class="pi pi-folder-open"></i>
          </div>
          <h4 class="text-xs font-bold text-slate-800">Nessun Documento Archiviato</h4>
          <p class="text-[11px] text-slate-500 max-w-sm mx-auto">Non sono ancora presenti file per questo iscritto. Trascina un documento nel riquadro sopra o clicca su "Carica Documento".</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = walletList.map(doc => {
      const hasContent = !!doc.fileContent;
      const isPdf = (doc.nome && doc.nome.toLowerCase().endsWith('.pdf')) || (doc.fileType && doc.fileType.includes('pdf'));
      const isImage = (doc.fileType && doc.fileType.includes('image')) || (doc.nome && (doc.nome.endsWith('.png') || doc.nome.endsWith('.jpg') || doc.nome.endsWith('.jpeg')));

      const icon = isPdf ? "pi-file-pdf" : isImage ? "pi-image" : "pi-file";
      const badgeColor = isPdf ? "mantine-badge-light-rose" : isImage ? "mantine-badge-light-blue" : "mantine-badge-light-amber";
      const iconBg = isPdf ? "bg-rose-500/10 text-rose-600" : isImage ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600";

      return `
        <div class="wallet-doc-card mantine-paper p-4 flex flex-col justify-between space-y-3 transition-all hover:border-amber-400 group">
          
          <!-- Top Info -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 text-lg">
                <i class="pi ${icon}"></i>
              </div>
              <div class="space-y-1 min-w-0">
                <h4 class="text-xs font-bold text-slate-900 truncate" title="${escapeHtml(doc.nome)}">${escapeHtml(doc.nome)}</h4>
                <div class="flex flex-wrap items-center gap-1.5">
                  <span class="mantine-badge ${badgeColor} text-[9px] font-bold">${escapeHtml(doc.tipo || 'Documento')}</span>
                  <span class="text-[10px] text-slate-400 font-mono">${doc.dimensione || '100 KB'}</span>
                </div>
              </div>
            </div>

            <!-- Action buttons: Edit & Delete -->
            <div class="flex items-center gap-1 shrink-0">
              <button data-doc-id="${doc.id}" class="btn-edit-doc cursor-pointer text-slate-400 hover:text-amber-600 p-1.5 rounded-lg hover:bg-amber-50 transition" title="Modifica dettagli documento">
                <i class="pi pi-pencil text-xs"></i>
              </button>
              <button data-doc-id="${doc.id}" class="btn-delete-doc cursor-pointer text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition" title="Elimina documento">
                <i class="pi pi-trash text-xs"></i>
              </button>
            </div>
          </div>

          <!-- Description if present -->
          ${doc.descrizione ? `
            <div class="text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 leading-relaxed italic">
              ${escapeHtml(doc.descrizione)}
            </div>
          ` : ''}

          <!-- Bottom Actions Bar -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              ${hasContent ? `
                <button data-doc-id="${doc.id}" class="btn-preview-doc cursor-pointer text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1">
                  <i class="pi pi-eye"></i> Visualizza
                </button>
                <span class="text-slate-200">|</span>
                <a href="${doc.fileContent}" download="${doc.nome}" class="cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
                  <i class="pi pi-download"></i> Scarica
                </a>
              ` : `
                <span class="text-[10px] text-slate-400 flex items-center gap-1">
                  <i class="pi pi-check-circle text-emerald-600"></i> Archiviato
                </span>
              `}
            </div>

            <span class="text-[10px] font-mono text-slate-400">ID #${doc.id}</span>
          </div>

        </div>
      `;
    }).join("");

    // Preview Doc Handler - Apertura Diretta nel Visualizzatore Integrato del Sito
    document.querySelectorAll(".btn-preview-doc").forEach(btn => {
      btn.addEventListener("click", () => {
        const docId = btn.getAttribute("data-doc-id");
        const doc = (persona.wallet || []).find(d => String(d.id) === String(docId));
        if (doc) {
          if (typeof window.openDocumentViewer === "function") {
            window.openDocumentViewer(doc, persona);
          } else {
            alert(`Visualizzazione documento: ${doc.nome}`);
          }
        }
      });
    });

    // Edit doc metadata handler
    document.querySelectorAll(".btn-edit-doc").forEach(btn => {
      btn.addEventListener("click", () => {
        const docId = btn.getAttribute("data-doc-id");
        const doc = (persona.wallet || []).find(d => String(d.id) === String(docId));
        if (doc) {
          document.getElementById("edit-doc-id").value = doc.id;
          document.getElementById("edit-doc-nome").value = doc.nome || "";
          document.getElementById("edit-doc-tipo").value = doc.tipo || "Altro Documento";
          document.getElementById("edit-doc-descrizione").value = doc.descrizione || "";
          modalEditDoc.classList.remove("hidden");
        }
      });
    });

    // Delete doc handler
    document.querySelectorAll(".btn-delete-doc").forEach(btn => {
      btn.addEventListener("click", async () => {
        const docId = btn.getAttribute("data-doc-id");
        if (confirm("Eliminare questo documento dal fascicolo elettronico?")) {
          if (window.RoxLoading) window.RoxLoading.show("Eliminazione documento...");
          try {
            await window.store.deleteDocumentFromWallet(persona.id, docId);
            renderCitizenHub();
            RoxToast.success("Documento Rimosso", "Il file è stato eliminato dal fascicolo.");
          } catch (err) {
            alert(`Errore eliminazione: ${err.message}`);
          } finally {
            if (window.RoxLoading) window.RoxLoading.hide();
          }
        }
      });
    });
  }

  // File memorizzato temporaneamente da Drag & Drop in attesa di completamento form
  let pendingDroppedFile = null;

  // Drag & Drop Guided Upload: apre la modale precompilata per definire tipo e descrizione
  function handleWalletDirectUpload(file, persona) {
    if (!file || !persona) return;
    pendingDroppedFile = file;

    // Precompila form modale
    document.getElementById("doc-nome").value = file.name;
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type.includes('pdf');
    if (isPdf) {
      document.getElementById("doc-tipo").value = "Verbale INPS";
    } else if (file.name.toLowerCase().includes("cv") || file.name.toLowerCase().includes("curriculum")) {
      document.getElementById("doc-tipo").value = "Curriculum";
    } else if (file.name.toLowerCase().includes("l68") || file.name.toLowerCase().includes("legge68")) {
      document.getElementById("doc-tipo").value = "Verbale Legge 68";
    }
    document.getElementById("doc-descrizione").value = "";

    // Mostra badge file selezionato
    const dropBadge = document.getElementById("doc-drop-file-badge");
    const dropName = document.getElementById("doc-drop-file-name");
    const dropSize = document.getElementById("doc-drop-file-size");
    const fileContainer = document.getElementById("doc-file-input-container");
    const fileInput = document.getElementById("doc-file-input");

    if (dropBadge && dropName && dropSize) {
      dropName.textContent = file.name;
      dropSize.textContent = (file.size / 1024).toFixed(1) + " KB";
      dropBadge.classList.remove("hidden");
      if (fileContainer) fileContainer.classList.add("hidden");
      if (fileInput) fileInput.removeAttribute("required");
    }

    modalDoc.classList.remove("hidden");
    RoxToast.info("Completa Informazioni", "Specifica la tipologia del documento rilasciato prima di salvarlo.");
  }

  // --- UPLOAD WALLET FILE MODAL ---
  const modalDoc = document.getElementById("modal-upload-doc");
  const modalEditDoc = document.getElementById("modal-edit-doc");

  document.getElementById("btn-hub-upload-doc").addEventListener("click", () => {
    pendingDroppedFile = null;
    const dropBadge = document.getElementById("doc-drop-file-badge");
    const fileContainer = document.getElementById("doc-file-input-container");
    const fileInput = document.getElementById("doc-file-input");
    if (dropBadge) dropBadge.classList.add("hidden");
    if (fileContainer) fileContainer.classList.remove("hidden");
    if (fileInput) fileInput.setAttribute("required", "required");
    document.getElementById("form-upload-doc").reset();
    modalDoc.classList.remove("hidden");
  });

  const btnUploadTab = document.getElementById("btn-upload-file-wallet-tab");
  if (btnUploadTab) {
    btnUploadTab.addEventListener("click", () => {
      pendingDroppedFile = null;
      const dropBadge = document.getElementById("doc-drop-file-badge");
      const fileContainer = document.getElementById("doc-file-input-container");
      const fileInput = document.getElementById("doc-file-input");
      if (dropBadge) dropBadge.classList.add("hidden");
      if (fileContainer) fileContainer.classList.remove("hidden");
      if (fileInput) fileInput.setAttribute("required", "required");
      document.getElementById("form-upload-doc").reset();
      modalDoc.classList.remove("hidden");
    });
  }

  document.getElementById("btn-close-modal-doc").addEventListener("click", () => modalDoc.classList.add("hidden"));
  document.getElementById("btn-cancel-doc").addEventListener("click", () => modalDoc.classList.add("hidden"));

  const btnCloseEdit = document.getElementById("btn-close-modal-edit-doc");
  const btnCancelEdit = document.getElementById("btn-cancel-edit-doc");
  if (btnCloseEdit) btnCloseEdit.addEventListener("click", () => modalEditDoc.classList.add("hidden"));
  if (btnCancelEdit) btnCancelEdit.addEventListener("click", () => modalEditDoc.classList.add("hidden"));

  // Form Edit Document Details
  const formEditDoc = document.getElementById("form-edit-doc");
  if (formEditDoc) {
    formEditDoc.addEventListener("submit", async (e) => {
      e.preventDefault();
      const p = window.store.getSelectedPersona();
      if (!p) return;

      const docId = document.getElementById("edit-doc-id").value;
      const nome = document.getElementById("edit-doc-nome").value.trim();
      const tipo = document.getElementById("edit-doc-tipo").value;
      const descrizione = document.getElementById("edit-doc-descrizione").value.trim();

      if (window.RoxLoading) window.RoxLoading.show("Aggiornamento dettagli file...");
      try {
        await window.store.updateDocumentInWallet(p.id, docId, { nome, tipo, descrizione });
        modalEditDoc.classList.add("hidden");
        renderCitizenHub();
        RoxToast.success("Documento Aggiornato", "I dettagli del file sono stati salvati su MySQL.");
      } catch (err) {
        console.error("Errore modifica documento:", err);
        alert(`Impossibile modificare il documento: ${err.message}`);
      } finally {
        if (window.RoxLoading) window.RoxLoading.hide();
      }
    });
  }

  // Quick Direct Upload for Verbale Legge 68
  const btnUploadL68 = document.getElementById("btn-upload-verbale-l68");
  const fileInputL68 = document.getElementById("file-verbale-l68");
  if (btnUploadL68 && fileInputL68) {
    btnUploadL68.addEventListener("click", () => fileInputL68.click());
    fileInputL68.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const p = window.store.getSelectedPersona();
      if (file && p) {
        if (window.RoxLoading) window.RoxLoading.show(`Salvataggio verbale L.68 ${file.name}...`);
        const reader = new FileReader();
        reader.onload = async function(evt) {
          try {
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
          } catch (err) {
            alert(`Errore upload: ${err.message}`);
          } finally {
            if (window.RoxLoading) window.RoxLoading.hide();
          }
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
        if (window.RoxLoading) window.RoxLoading.show(`Salvataggio verbale IC ${file.name}...`);
        const reader = new FileReader();
        reader.onload = async function(evt) {
          try {
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
          } catch (err) {
            alert(`Errore upload: ${err.message}`);
          } finally {
            if (window.RoxLoading) window.RoxLoading.hide();
          }
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
    const file = pendingDroppedFile || (fileInput.files ? fileInput.files[0] : null);
    const nomeCustom = document.getElementById("doc-nome").value.trim();
    const tipo = document.getElementById("doc-tipo").value;
    const descrizione = document.getElementById("doc-descrizione").value.trim();

    if (file) {
      const fileName = nomeCustom || file.name;
      const fileSize = (file.size / 1024).toFixed(1) + " KB";

      if (window.RoxLoading) window.RoxLoading.show(`Invio ${fileName} su MySQL...`);

      const reader = new FileReader();
      reader.onload = async function(evt) {
        try {
          await window.store.addDocumentToWallet(p.id, {
            nome: fileName,
            tipo: tipo,
            descrizione: descrizione,
            dimensione: fileSize,
            fileContent: evt.target.result,
            fileType: file.type || "application/octet-stream"
          });

          pendingDroppedFile = null;
          modalDoc.classList.add("hidden");
          document.getElementById("form-upload-doc").reset();
          renderCitizenHub();
          RoxToast.success("Documento Salvato", `File ${fileName} aggiunto al Wallet.`);
        } catch (err) {
          console.error("Errore salvataggio file:", err);
          alert(`Impossibile salvare il documento: ${err.message}`);
        } finally {
          if (window.RoxLoading) window.RoxLoading.hide();
        }
      };

      reader.readAsDataURL(file);
    } else {
      RoxToast.warning("Nessun File", "Selezionare un file reale da caricare.");
    }
  });

window.renderWalletTab = renderWalletTab;

// ==========================================
// VISUALIZZATORE DOCUMENTALE INTEGRATO NEL SITO (IN-APP VIEWER)
// ==========================================
function openDocumentViewer(doc, persona) {
  if (!doc) return;

  const modalViewer = document.getElementById("modal-document-viewer");
  const stage = document.getElementById("viewer-stage");
  const titleEl = document.getElementById("viewer-doc-title");
  const typeEl = document.getElementById("viewer-doc-type");
  const sizeEl = document.getElementById("viewer-doc-size");
  const personEl = document.getElementById("viewer-doc-person");
  const iconBox = document.getElementById("viewer-doc-icon-box");
  const btnDownload = document.getElementById("viewer-btn-download");
  const btnOpenTab = document.getElementById("viewer-btn-open-tab");
  const btnPrint = document.getElementById("viewer-btn-print");
  const btnClose = document.getElementById("viewer-btn-close");

  if (!modalViewer || !stage) return;

  // Popolamento Metadati
  const docName = doc.nome || "Documento";
  const docType = doc.tipo || "Allegato Fascicolo";
  const docSize = doc.dimensione || "N/D";
  const personName = persona ? `${persona.cognome || ''} ${persona.nome || ''}`.trim() : "Fascicolo CPI";

  if (titleEl) titleEl.textContent = docName;
  if (typeEl) typeEl.textContent = docType;
  if (sizeEl) sizeEl.textContent = docSize;
  if (personEl) personEl.textContent = personName;

  const isPdf = (doc.fileType && doc.fileType.includes("pdf")) || docName.toLowerCase().endsWith(".pdf") || (doc.fileContent && doc.fileContent.startsWith("data:application/pdf"));
  const isImage = (doc.fileType && doc.fileType.includes("image")) || /\.(jpg|jpeg|png|webp|gif)$/i.test(docName) || (doc.fileContent && doc.fileContent.startsWith("data:image"));

  // Aggiorna icona
  if (iconBox) {
    if (isPdf) {
      iconBox.className = "w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-base shrink-0";
      iconBox.innerHTML = `<i class="pi pi-file-pdf"></i>`;
    } else if (isImage) {
      iconBox.className = "w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base shrink-0";
      iconBox.innerHTML = `<i class="pi pi-image"></i>`;
    } else {
      iconBox.className = "w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-base shrink-0";
      iconBox.innerHTML = `<i class="pi pi-file"></i>`;
    }
  }

  // Costruisci Stage per visualizzazione diretta nel sito
  if (!doc.fileContent) {
    stage.innerHTML = `
      <div class="text-center p-8 max-w-md bg-white rounded-2xl shadow-sm border border-slate-200">
        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-3xl">
          <i class="pi pi-exclamation-triangle"></i>
        </div>
        <h4 class="font-bold text-slate-800 text-lg mb-1 font-heading">Contenuto non disponibile in locale</h4>
        <p class="text-xs text-slate-500 mb-4">Il file ${escapeHtml(docName)} risulta registrato a database ma il flusso binario non è presente in questa sessione.</p>
      </div>
    `;
  } else if (isPdf) {
    stage.innerHTML = `
      <iframe id="viewer-active-frame" src="${doc.fileContent}" class="w-full h-full border-0 bg-slate-800" title="${escapeHtml(docName)}"></iframe>
    `;
  } else if (isImage) {
    stage.innerHTML = `
      <div class="w-full h-full overflow-auto flex items-center justify-center p-4 bg-slate-900/90">
        <img id="viewer-active-image" src="${doc.fileContent}" alt="${escapeHtml(docName)}" class="max-w-full max-h-full object-contain rounded-xl shadow-2xl transition duration-200">
      </div>
    `;
  } else {
    // Altro formato (testo, xml, generico)
    stage.innerHTML = `
      <iframe id="viewer-active-frame" src="${doc.fileContent}" class="w-full h-full border-0 bg-white" title="${escapeHtml(docName)}"></iframe>
    `;
  }

  // Pulsante Download
  if (btnDownload) {
    if (doc.fileContent) {
      btnDownload.href = doc.fileContent;
      btnDownload.download = docName;
      btnDownload.classList.remove("opacity-40", "pointer-events-none");
    } else {
      btnDownload.removeAttribute("href");
      btnDownload.classList.add("opacity-40", "pointer-events-none");
    }
  }

  // Pulsante Nuova Scheda
  if (btnOpenTab) {
    btnOpenTab.onclick = () => {
      if (!doc.fileContent) return;
      const newWin = window.open();
      if (newWin) {
        if (isImage) {
          newWin.document.write(`<html><head><title>${escapeHtml(docName)}</title></head><body style="margin:0;background:#0b1120;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${doc.fileContent}" style="max-width:98vw;max-height:98vh;object-contain:fit;"></body></html>`);
        } else {
          newWin.document.write(`<html><head><title>${escapeHtml(docName)}</title></head><body style="margin:0;height:100vh;"><iframe src="${doc.fileContent}" style="width:100%;height:100%;border:none;"></iframe></body></html>`);
        }
      }
    };
  }

  // Pulsante Stampa Diretta
  if (btnPrint) {
    btnPrint.onclick = () => {
      const activeFrame = document.getElementById("viewer-active-frame");
      const activeImg = document.getElementById("viewer-active-image");

      if (activeFrame && activeFrame.contentWindow) {
        try {
          activeFrame.contentWindow.focus();
          activeFrame.contentWindow.print();
        } catch (e) {
          window.print();
        }
      } else if (activeImg) {
        const printWin = window.open("", "_blank");
        if (printWin) {
          printWin.document.write(`<html><head><title>Stampa ${escapeHtml(docName)}</title></head><body style="margin:0;text-align:center;"><img src="${activeImg.src}" style="max-width:100%;"><script>window.onload=function(){window.print();window.close();};<\/script></body></html>`);
          printWin.document.close();
        }
      } else {
        window.print();
      }
    };
  }

  // Chiusura Modale
  function closeViewer() {
    modalViewer.classList.add("hidden");
    stage.innerHTML = ""; // scarica risorse/frame
    document.removeEventListener("keydown", onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      closeViewer();
    }
  }

  if (btnClose) {
    btnClose.onclick = closeViewer;
  }

  document.addEventListener("keydown", onKeyDown);

  // Mostra Modale
  modalViewer.classList.remove("hidden");
}

window.openDocumentViewer = openDocumentViewer;
