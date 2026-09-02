/**
 * Roxanne CPI Light - Matcher Module
 * Motore di matching domanda-offerta per il Collocamento Mirato L.68/99
 */

export function runMatcher() {
  const mansioneInput = document.getElementById("m-mansione");
  const minIcInput = document.getElementById("m-min-ic");
  const noErettaInput = document.getElementById("m-noeretta");
  const noCarichiInput = document.getElementById("m-nocarichi");

  const reqs = {
    mansione: mansioneInput ? mansioneInput.value : "",
    minIC: minIcInput ? parseInt(minIcInput.value) || 0 : 0,
    noStazioneEretta: noErettaInput ? noErettaInput.checked : false,
    noMovimentazioneCarichi: noCarichiInput ? noCarichiInput.checked : false
  };

  const persone = window.store.getPersone();
  const container = document.getElementById("matcher-results-container");
  if (!container) return;

  const evaluated = persone.map(p => {
    const res = window.MatcherEngine ? window.MatcherEngine.calculateScore(p, reqs) : { score: 50, matchReasons: [], incompatibilities: [] };
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
      if (typeof window.renderCitizenHub === "function") window.renderCitizenHub();
      const btnHub = document.getElementById("nav-mode-hub");
      if (btnHub) btnHub.click();
    });
  });
}

export function initMatcherModule() {
  const form = document.getElementById("form-full-matcher");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      runMatcher();
    });
  }
}

window.runMatcher = runMatcher;
window.initMatcherModule = initMatcherModule;
