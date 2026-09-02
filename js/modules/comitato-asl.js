/**
 * Roxanne CPI Light - Comitato Tecnico ASL Module
 * Storico verbali ASL, relazioni mediche collegiali, stampa verbale ufficiale PDF
 */

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
                <button data-verbale-id="${c.id}" class="btn-print-verbale cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition shadow-xs flex items-center gap-1.5 font-heading">
                  <i class="fa-solid fa-file-pdf"></i>
                  <span>Stampa / PDF Ufficiale</span>
                </button>
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                  <i class="fa-solid fa-user-doctor mr-1"></i> ${escapeHtml(c.responsabile || 'Presidente ASL')}
                </span>
                <button data-verbale-id="${c.id}" class="btn-delete-verbale text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 text-xs cursor-pointer transition" title="Elimina questo verbale">
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

    // Print / PDF Verbale Handler
    container.querySelectorAll(".btn-print-verbale").forEach(btn => {
      btn.addEventListener("click", () => {
        const verbaleId = btn.getAttribute("data-verbale-id");
        const c = list.find(v => String(v.id) === String(verbaleId));
        if (c) generateComitatoReportPDF(c, p);
      });
    });

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

  // --- GENERATORE MODELLO PDF UFFICIALE COMITATO TECNICO (TITILLIUM WEB + LOGHI ISTITUZIONALI DINAMICI) ---
  function generateComitatoReportPDF(c, p) {
    const dataNascitaFmt = p.dataNascita ? formatDate(p.dataNascita.split("T")[0]) : (p.dataDiNascita ? formatDate(p.dataDiNascita.split("T")[0]) : "-");
    const dataSedutaFmt = c.dataSeduta ? formatDate(c.dataSeduta.split("T")[0]) : "-";
    const dataVerbaleFmt = c.dataVerbale ? formatDate(c.dataVerbale.split("T")[0]) : (p.diagnosiLastDataVerbale ? formatDate(p.diagnosiLastDataVerbale.split("T")[0]) : "-");

    // Retrieve configured logos from localStorage or fallback to high-quality SVG vector defaults
    const customLogo1 = localStorage.getItem("ROXANNE_PDF_LOGO_1");
    const customLogo2 = localStorage.getItem("ROXANNE_PDF_LOGO_2");
    const customLogo3 = localStorage.getItem("ROXANNE_PDF_LOGO_3");

    const defaultLogo1 = `<div style="display:flex; align-items:center; gap:8px;"><div style="width:34px; height:34px; border-radius:8px; background:linear-gradient(135deg,#059669,#0284c7); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:16px;">LC</div><div><div style="font-size:11pt; font-weight:800; color:#0f172a; letter-spacing:-0.3px; line-height:1.1;">PROVINCIA DI LECCO</div><div style="font-size:7.5pt; font-weight:700; color:#0284c7; text-transform:uppercase; letter-spacing:0.5px;">1995 - 2025 &bull; 30 ANNI</div></div></div>`;
    const defaultLogo2 = `<div style="display:flex; align-items:center; gap:8px;"><div style="width:32px; height:32px; border-radius:50%; background:#16a34a; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:15px;">&#10010;</div><div><div style="font-size:11pt; font-weight:900; color:#0f172a; line-height:1.1; letter-spacing:-0.3px;">LAVORO <span style="font-weight:400; color:#16a34a;">IN LOMBARDIA</span></div><div style="font-size:7.5pt; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.4px;">COLLOCAMENTO MIRATO L.68/99</div></div></div>`;
    const defaultLogo3 = `<div style="display:flex; align-items:center; gap:8px; justify-content:flex-end;"><div style="text-align:right;"><div style="font-size:7.5pt; color:#64748b; font-weight:600; text-transform:uppercase;">Sistema Socio Sanitario</div><div style="font-size:9pt; font-weight:800; color:#047857; line-height:1.1;">Regione Lombardia &bull; ATS Brianza</div><div style="font-size:8.5pt; font-weight:700; color:#0f172a;">ASST Lecco</div></div><div style="width:30px; height:30px; border-radius:6px; background:#047857; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold; font-size:14px;">&#10010;</div></div>`;

    const logo1Html = customLogo1 ? `<img src="${customLogo1}" style="max-height:48px; max-width:180px; object-contain:contain;">` : defaultLogo1;
    const logo2Html = customLogo2 ? `<img src="${customLogo2}" style="max-height:48px; max-width:180px; object-contain:contain;">` : defaultLogo2;
    const logo3Html = customLogo3 ? `<img src="${customLogo3}" style="max-height:48px; max-width:180px; object-contain:contain;">` : defaultLogo3;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Abilita i popup per visualizzare e stampare il modello PDF.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <title>Verbale Comitato Tecnico L.68/99 - ${escapeHtml(p.nome)}</title>
        
        <!-- Google Font: Titillium Web (AgID & Pubblica Amministrazione) -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,300;0,400;0,600;0,700;0,900;1,400;1,600&display=swap" rel="stylesheet">
        
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 10mm 12mm;
          }
          * {
            box-sizing: border-box;
            font-family: 'Titillium Web', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #0f172a;
          }
          body {
            margin: 0;
            padding: 0;
            background: #f1f5f9;
            font-size: 10.5pt;
            line-height: 1.35;
          }
          .pdf-sheet {
            background: #ffffff;
            width: 210mm;
            min-height: 297mm;
            margin: 15px auto;
            padding: 16mm 18mm;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            position: relative;
          }
          .page-break {
            page-break-after: always;
            break-after: page;
          }
          
          /* Header Logos Modern Bar */
          .header-logos {
            display: grid;
            grid-template-columns: 1.2fr 1.2fr 1.2fr;
            align-items: center;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 14px;
          }
          
          .main-title-badge {
            background: #f8fafc;
            border: 1.5px solid #cbd5e1;
            border-left: 5px solid #0284c7;
            border-radius: 6px;
            padding: 7px 12px;
            text-align: center;
            font-size: 10.5pt;
            font-weight: 800;
            color: #0f172a;
            margin: 10px 0 14px 0;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            line-height: 1.3;
          }

          /* Modern Executive Tables */
          table.bordered-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid #cbd5e1;
          }
          table.bordered-table td, table.bordered-table th {
            border: 1px solid #cbd5e1;
            padding: 5.5px 8px;
            vertical-align: middle;
            font-size: 9.5pt;
          }
          .label-col {
            font-weight: 700;
            width: 20%;
            background: #f8fafc;
            color: #475569;
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }
          .field-val {
            font-weight: 600;
            color: #0f172a;
          }
          .highlight-val {
            font-weight: 800;
            color: #0369a1;
            font-size: 10.5pt;
          }
          
          /* Section Headers */
          .section-title-bar {
            background: linear-gradient(90deg, #f1f5f9, #ffffff);
            border: 1px solid #cbd5e1;
            border-left: 4px solid #0284c7;
            padding: 5px 10px;
            font-weight: 800;
            font-size: 10pt;
            color: #0f172a;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin-top: 10px;
            border-radius: 4px 4px 0 0;
          }
          .section-body {
            border: 1px solid #cbd5e1;
            border-top: none;
            padding: 8px 10px;
            font-size: 9.5pt;
            background: #ffffff;
            margin-bottom: 10px;
            border-radius: 0 0 4px 4px;
          }
          
          .cb-group {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin: 4px 0;
          }
          .cb-item {
            display: inline-flex;
            align-items: center;
            font-size: 9pt;
            font-weight: 600;
          }
          .cb-box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 14px;
            height: 14px;
            border: 1.5px solid #0f172a;
            border-radius: 3px;
            margin-right: 6px;
            font-weight: 900;
            font-size: 9.5pt;
            line-height: 1;
            background: #f8fafc;
          }
          .cb-box.active {
            background: #0284c7;
            color: #ffffff;
            border-color: #0284c7;
          }
          
          .signatures-grid {
            margin-top: 22px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px 36px;
            font-size: 9.5pt;
          }
          .sig-box {
            border-bottom: 1px solid #94a3b8;
            padding-bottom: 4px;
            font-weight: 700;
            color: #1e293b;
          }
          .stamp-box {
            text-align: right;
            margin-top: 16px;
            font-size: 9pt;
            font-weight: 600;
            color: #475569;
          }
          
          /* Print Floating Control Bar */
          .no-print-bar {
            position: sticky;
            top: 0;
            z-index: 100;
            background: #0f172a;
            color: #fff;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.25);
            font-size: 13px;
          }
          .btn-print {
            background: #0284c7;
            color: #fff;
            border: none;
            padding: 9px 22px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .btn-print:hover {
            background: #0369a1;
            transform: translateY(-1px);
          }
          
          @media print {
            body { background: #ffffff; }
            .pdf-sheet {
              width: 100%;
              margin: 0;
              padding: 0;
              box-shadow: none;
            }
            .no-print-bar { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <div>
            <strong style="color:#38bdf8; font-size:14px;">Verbale Ufficiale Comitato Tecnico L.68/99</strong>
            <span style="color:#94a3b8; margin-left:10px;">Pratica N. ${escapeHtml(c.numPratica || '0')} &bull; ${escapeHtml(p.nome)} &bull; ${dataSedutaFmt}</span>
          </div>
          <button class="btn-print" onclick="window.print()">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/><path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/></svg>
            Stampa / Salva in PDF
          </button>
        </div>

        <!-- ==================== PAGINA 1 ==================== -->
        <div class="pdf-sheet">
          <div class="header-logos">
            <div>${logo1Html}</div>
            <div style="text-align:center;">${logo2Html}</div>
            <div>${logo3Html}</div>
          </div>

          <div class="main-title-badge">
            COMITATO TECNICO AI SENSI DELLA L. 68/99 - ART. 8 COMMI 1 E 1 BIS MODIFICATO DAL D.LGS 151/2015
          </div>

          <!-- Dati Anagrafici & Pratica -->
          <table class="bordered-table">
            <tr>
              <td class="label-col">Numero pratica</td>
              <td style="width: 28%;" class="highlight-val">${escapeHtml(c.numPratica || '0')}</td>
              <td class="label-col">Data nascita</td>
              <td class="field-val">${dataNascitaFmt}</td>
            </tr>
            <tr>
              <td class="label-col">Data seduta</td>
              <td class="field-val" style="font-weight: 800; color:#0f172a;">${dataSedutaFmt}</td>
              <td class="label-col">Stato civile</td>
              <td class="field-val">${escapeHtml(p.statoCivile || 'Celibe/Nubile')}</td>
            </tr>
            <tr>
              <td class="label-col">C.F.</td>
              <td class="field-val" style="font-family: monospace; font-weight: 700; font-size:10pt;">${escapeHtml(p.codiceFiscale || '-')}</td>
              <td class="label-col">Tipo patente</td>
              <td class="field-val">${escapeHtml(p.patente || '?')}</td>
            </tr>
            <tr>
              <td class="label-col">Nome e Cognome</td>
              <td class="field-val" style="font-weight: 800; font-size: 11pt; color:#0369a1;">${escapeHtml(p.nome || '-')}</td>
              <td class="label-col">Invalidità %</td>
              <td class="field-val" style="font-weight: 800; color:#e11d48; font-size:11pt;">${p.icPercentuale || '0'}%</td>
            </tr>
            <tr>
              <td class="label-col">Luogo di nascita</td>
              <td class="field-val">${escapeHtml(p.natoA || '-')}</td>
              <td class="label-col">Residente</td>
              <td class="field-val">${escapeHtml(p.comuneResidenza || 'Lecco')}</td>
            </tr>
            <tr>
              <td class="label-col">Domiciliato</td>
              <td class="field-val">${escapeHtml(p.indirizzo || p.domicilioIndirizzo || '-')}</td>
              <td class="label-col">Telefono</td>
              <td class="field-val">${escapeHtml(p.cellulare || p.telefono || '-')}</td>
            </tr>
          </table>

          <!-- Verbale I.C. / Patologia -->
          <table class="bordered-table" style="margin-top: -6px;">
            <tr>
              <td style="width: 55%;">
                <strong>Verbale I.C./I.L. rilasciato in data:</strong> ${dataVerbaleFmt}<br>
                <strong>dall'Asl / INPS:</strong> ${escapeHtml(c.asl || p.diagnosiLastDescCodiceAsl || 'ASST Lecco')}
              </td>
              <td style="width: 45%;">
                <div class="cb-item">
                  <span class="cb-box ${c.inCaricoAltriServizi ? 'active' : ''}">${c.inCaricoAltriServizi ? '&#10003;' : ''}</span>
                  <strong>In carico ad altri servizi</strong>
                </div>
                <div style="border-bottom: 1px dotted #94a3b8; height: 16px; margin-top: 4px;"></div>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="background:#fcfdfe;">
                <span class="label-col" style="background:transparent; padding:0; display:block; margin-bottom:2px;">Patologia Accertata:</span>
                <div style="font-weight: 600; color:#0f172a; line-height:1.4;">${escapeHtml(p.patologia || p.diagnosiLastPatologia || c.altrePatologie || 'Insufficienza mentale medio-grave con disturbi del comportamento.')}</div>
              </td>
            </tr>
          </table>

          <!-- Istruttoria realizzata tramite -->
          <div class="section-title-bar">ISTRUTTORIA REALIZZATA TRAMITE:</div>
          <div class="section-body" style="padding: 9px 12px;">
            <div class="cb-group" style="justify-content: space-between;">
              <div class="cb-item"><span class="cb-box active">&#10003;</span> Analisi documentazione</div>
              <div class="cb-item"><span class="cb-box ${c.colloquioDiretto !== false ? 'active' : ''}">${c.colloquioDiretto !== false ? '&#10003;' : ''}</span> Colloquio diretto</div>
              <div class="cb-item"><span class="cb-box"></span> Colloquio con i familiari</div>
              <div class="cb-item"><span class="cb-box"></span> Colloquio con altri servizi</div>
              <div class="cb-item"><span class="cb-box"></span> Altro</div>
            </div>
          </div>

          <!-- Prognosi Lavorativa -->
          <div class="section-title-bar">Prognosi lavorativa:</div>
          <div class="section-body" style="padding: 10px 12px;">
            <div class="cb-group" style="margin-bottom: 8px;">
              <div class="cb-item" style="width: 48%;"><span class="cb-box ${!c.supporto && !c.mediazione && !c.protetto ? 'active' : ''}">${!c.supporto && !c.mediazione && !c.protetto ? '&#10003;' : ''}</span> Senza interventi di supporto</div>
              <div class="cb-item" style="width: 48%;"><span class="cb-box ${c.protetto ? 'active' : ''}">${c.protetto ? '&#10003;' : ''}</span> Ambito protetto</div>
              <div class="cb-item" style="width: 48%;"><span class="cb-box ${c.mediazione || c.supporto ? 'active' : ''}">${c.mediazione || c.supporto ? '&#10003;' : ''}</span> Con il supporto di un servizio di mediazione</div>
              <div class="cb-item" style="width: 48%;"><span class="cb-box ${c.adozione ? 'active' : ''}">${c.adozione ? '&#10003;' : ''}</span> Con procedura di adozione</div>
            </div>
            <div style="margin-top: 8px; font-size: 9.5pt; border-top:1px dashed #cbd5e1; padding-top:6px;">
              <strong style="color:#0369a1;">Note di Prognosi:</strong> ${escapeHtml(c.prognosi || 'Idoneo all\'inserimento mirato con adozione di postazione ergonomica e supporto tutor.')}
            </div>
          </div>

          <!-- Firme Commissione -->
          <div class="signatures-grid">
            <div class="sig-box">Dr. Daniele Capano</div>
            <div class="sig-box">Dott.ssa Cristina Pagano</div>
            <div class="sig-box">Dr. Francesco Genna</div>
            <div class="sig-box">Dott.ssa Susanna Panariti</div>
            <div class="sig-box">Dr.ssa Felicita Burini</div>
            <div class="sig-box" style="border: none; text-align: right; font-size: 9pt; color:#64748b;">Timbro e data: _______________</div>
          </div>
        </div>

        <div class="page-break"></div>

        <!-- ==================== PAGINA 2 ==================== -->
        <div class="pdf-sheet">
          
          <div class="section-title-bar">ANAMNESI</div>
          <div class="section-body" style="min-height: 155px; line-height: 1.45; text-align: justify;">
            ${escapeHtml(c.anamnesi || p.diagnosi || 'Dagli atti e dalle valutazioni collegiali risulta accertato il quadro clinico funzionale depositato presso gli archivi ASL. Necessità di supporto e monitoraggio periodico in ambiente lavorativo protetto.')}
          </div>

          <div class="section-title-bar">PERCORSO SCOLASTICO</div>
          <div class="section-body" style="min-height: 48px;">
            ${escapeHtml(c.percorsoScolastico || p.titoloStudioLast || 'Dopo la licenza media ha svolto percorsi formativi di qualifica professionale.')}
          </div>

          <div class="section-title-bar">PERCORSO LAVORATIVO</div>
          <div class="section-body" style="min-height: 65px;">
            ${escapeHtml(c.percorsoLavorativo || 'Ha svolto tirocini di orientamento e formazione monitorati dai Servizi Specialistici e dal CPI.')}
          </div>

          <div style="text-align: center; margin: 16px 0 10px 0;">
            <span style="border: 2px solid #0284c7; background:#f0f9ff; color:#0369a1; padding: 4px 24px; font-weight: 800; font-size: 11pt; text-transform: uppercase; border-radius: 6px; letter-spacing:0.5px;">
              VALUTAZIONE FUNZIONALE
            </span>
          </div>

          <div class="section-title-bar">Autonomia Personale</div>
          <div class="section-body" style="min-height: 42px;">
            ${escapeHtml(c.autonomiaPers || 'Autonomo nelle attività di base. Richiede di essere accompagnato per gli spostamenti.')}
          </div>

          <div class="section-title-bar">Capacità Relazionali</div>
          <div class="section-body" style="min-height: 42px;">
            ${escapeHtml(c.capacitaRelazionali || 'Molto limitato, necessita di mediazione per adottare un comportamento adeguato al contesto di relazione.')}
          </div>

          <div class="section-title-bar">Abilità Cognitive</div>
          <div class="section-body" style="min-height: 42px;">
            ${escapeHtml(c.abilitaCognitive || 'Limitate alle mansioni pratiche e ripetitive.')}
          </div>

          <div class="section-title-bar">Capacità Lavorative</div>
          <div class="section-body" style="min-height: 52px;">
            ${escapeHtml(c.capacitaLavorative || c.prognosi || 'Idoneità circoscritta ad attività pratiche di assemblaggio o supporto con rispetto dei ritmi di lavoro.')}
          </div>

          <div style="margin-top: 32px; display: flex; justify-content: flex-end;">
            <div style="width: 320px; text-align: center;">
              <strong style="color:#0f172a; font-size:10pt;">Responsabile istruttoria:</strong><br><br>
              <div style="border-bottom: 1.5px solid #0f172a; width: 100%; margin-top: 14px;"></div>
              <span style="font-size: 9.5pt; color: #475569; font-weight:600;">${escapeHtml(c.responsabile || 'Presidente Comitato Tecnico ASL')}</span>
            </div>
          </div>

        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

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

window.renderComitatoTab = renderComitatoTab;
window.renderComitatoTecnicoTab = renderComitatoTab;
window.stampaVerbaleComitatoUfficiale = stampaVerbaleComitatoUfficiale;
