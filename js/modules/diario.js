/**
 * Roxanne CPI Light - Diario Operatori Module
 */

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

window.renderDiarioTab = renderDiarioTab;
