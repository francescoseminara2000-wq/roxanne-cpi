/**
 * Roxanne CPI Light - Wallet Module
 * Fascicolo documentale, preview documenti e upload allegati
 */

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

  // --- UPLOAD WALLET FILE MODAL ---
  const modalDoc = document.getElementById("modal-upload-doc");
  document.getElementById("btn-hub-upload-doc").addEventListener("click", () => modalDoc.classList.remove("hidden"));
  document.getElementById("btn-upload-file-wallet-tab").addEventListener("click", () => modalDoc.classList.remove("hidden"));
  document.getElementById("btn-close-modal-doc").addEventListener("click", () => modalDoc.classList.add("hidden"));
  document.getElementById("btn-cancel-doc").addEventListener("click", () => modalDoc.classList.add("hidden"));

  // Quick Direct Upload for Verbale Legge 68
  const btnUploadL68 = document.getElementById("btn-upload-verbale-l68");
  const fileInputL68 = document.getElementById("file-verbale-l68");
  if (btnUploadL68 && fileInputL68) {
    btnUploadL68.addEventListener("click", () => fileInputL68.click());
    fileInputL68.addEventListener("change", (e) => {
      const file = e.target.files[0];
      const p = window.store.getSelectedPersona();
      if (file && p) {
        RoxToast.info("Caricamento in corso...", `Salvataggio ${file.name} su MySQL...`, 2000);

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

window.renderWalletTab = renderWalletTab;
