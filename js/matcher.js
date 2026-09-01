/**
 * Chrono Stellar - Matcher Engine L.68/99
 * Calcolo compatibilità tra requisiti azienda e iscritti CPI
 */

class MatcherEngine {
  /**
   * Calcola lo score di compatibilità (0-100%) per un iscritto dati i filtri richiesti dall'azienda
   * @param {Object} persona 
   * @param {Object} requirements 
   */
  static calculateScore(persona, requirements) {
    let score = 100;
    let matchReasons = [];
    let incompatibilities = [];

    // 1. Filtro Categoria L.68
    if (requirements.categoria && requirements.categoria !== 'ALL') {
      if (persona.categoria === requirements.categoria) {
        matchReasons.push(`Categoria coincidente (${persona.categoria})`);
      } else {
        score -= 25;
        incompatibilities.push(`Categoria differente (richiesta: ${requirements.categoria}, iscritto: ${persona.categoria})`);
      }
    }

    // 2. Percentuale Invalidità Minima
    if (requirements.minIC && requirements.minIC > 0) {
      if (persona.icPercentuale >= requirements.minIC) {
        matchReasons.push(`Invalidità ${persona.icPercentuale}% >= ${requirements.minIC}%`);
      } else {
        score -= 30;
        incompatibilities.push(`Invalidità ${persona.icPercentuale}% inferiore al minimo richiesto (${requirements.minIC}%)`);
      }
    }

    // 3. Limitazioni Funzionali Incompatibili (Esclusioni)
    // Es. Se l'azienda richiede NO STAZIONE ERETTA PROLUNGATA, verifichiamo che persona.stazioneEretta == false
    if (requirements.noStazioneEretta && persona.stazioneEretta === true) {
      score -= 35;
      incompatibilities.push("Lavoro richiede assenza di stazione eretta prolungata, ma la persona ha piena idoneità eretta.");
    } else if (requirements.noStazioneEretta && persona.stazioneEretta === false) {
      matchReasons.push("Compatibile con mansione seduta (Stazione eretta limitata)");
    }

    if (requirements.noMovimentazioneCarichi && persona.movimentazioneManuale === true) {
      score -= 20;
    } else if (requirements.noMovimentazioneCarichi && persona.movimentazioneManuale === false) {
      matchReasons.push("Compatibile conMansione senza sollevamento carichi pesante");
    }

    if (requirements.noContattoPubblico && persona.contattoPubblico === true) {
      // Se l'azienda non vuole contatto col pubblico ed il candidato è idoneo, è okay
    } else if (requirements.noContattoPubblico && persona.contattoPubblico === false) {
      matchReasons.push("Idoneo a contesti senza contatto diretto col pubblico");
    }

    // 4. Mansione desiderata / Competenze
    if (requirements.mansione && requirements.mansione !== 'ALL') {
      const fieldName = requirements.mansione; // es. 'impiegato', 'magazzino', 'cassa', 'verde'
      if (persona[fieldName] === true) {
        score += 15;
        matchReasons.push(`Idoneità dichiarata per la mansione: ${fieldName.toUpperCase()}`);
      } else {
        score -= 15;
        incompatibilities.push(`Mancanza idoneità specifica per mansione: ${fieldName}`);
      }
    }

    // 5. Competenze Informatiche & Lingue
    if (requirements.richiedePc && persona.usoPc) {
      matchReasons.push("Competenze uso PC verificate");
    } else if (requirements.richiedePc && !persona.usoPc) {
      score -= 15;
      incompatibilities.push("Mancanza competenze informatiche di base");
    }

    if (requirements.richiedeInglese && persona.inglese) {
      matchReasons.push("Conoscenza lingua inglese verificate");
    } else if (requirements.richiedeInglese && !persona.inglese) {
      score -= 10;
      incompatibilities.push("Mancanza conoscenza lingua inglese");
    }

    // Normalizzazione score tra 0 e 100
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      matchReasons,
      incompatibilities
    };
  }
}

window.MatcherEngine = MatcherEngine;
