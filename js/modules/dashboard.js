/**
 * Roxanne CPI Light - Dashboard Analytics Module
 * Grafici ApexCharts e statistiche generali CPI
 */

let chartCatBreakdown = null;
let chartStatusBreakdown = null;

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

window.renderDashboardAnalytics = renderDashboardAnalytics;
