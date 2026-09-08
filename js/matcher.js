/**
 * Chrono Stellar - Matcher Engine L.68/99 Potenziato
 * Calcolo multidimensionale della compatibilità tra requisiti aziendali e profili iscritti CPI
 */

class MatcherEngine {
  /**
   * Calcola lo score di compatibilità (0-100%) per un iscritto dati i filtri richiesti dall'azienda
   * @param {Object} persona 
   * @param {Object} requirements 
   * @returns {Object} { score, matchLevel, matchReasons, adaptations, incompatibilities }
   */
  static calculateScore(persona, requirements) {
    let score = 100;
    const matchReasons = [];
    const adaptations = [];
    const incompatibilities = [];

    // 1. Categoria L.68/99
    if (requirements.categoria && requirements.categoria !== 'ALL') {
      if (persona.categoria === requirements.categoria) {
        matchReasons.push(`Categoria L.68 coincidente (${persona.categoria})`);
      } else {
        score -= 25;
        incompatibilities.push(`Categoria differente (richiesta: ${requirements.categoria}, iscritto: ${persona.categoria || 'N.D.'})`);
      }
    }

    // 2. Percentuale di Invalidità Minima Richiesta (% IC)
    if (requirements.minIC !== undefined && requirements.minIC > 0) {
      const pIc = parseInt(persona.icPercentuale) || 0;
      if (pIc >= requirements.minIC) {
        matchReasons.push(`Percentuale invalidità ${pIc}% idonea (&ge; ${requirements.minIC}%)`);
      } else {
        score -= 30;
        incompatibilities.push(`Invalidità ${pIc}% inferiore alla soglia richiesta (${requirements.minIC}%)`);
      }
    }

    // 3. Mansione Ricercata e Idoneità Dichiarata
    if (requirements.mansione && requirements.mansione !== 'ALL') {
      const m = requirements.mansione;
      const isMatched = !!persona[m];
      
      if (isMatched) {
        score += 10;
        const subNote = persona[`${m}Mansione`] ? ` - ${persona[`${m}Mansione`]}` : '';
        matchReasons.push(`Idoneità professionale verificata per mansione: ${m.toUpperCase()}${subNote}`);
      } else {
        score -= 20;
        incompatibilities.push(`Non ha indicato idoneità o esperienza per mansione: ${m}`);
      }
    }

    // 4. Ergonomia & Postazione (Lavoro seduto / No stazione eretta prolungata)
    if (requirements.noStazioneEretta) {
      if (persona.stazioneEretta === false) {
        matchReasons.push("Pienamente compatibile con mansione a postazione seduta");
      } else {
        adaptations.push("La persona ha piena idoneità a stazione eretta; confermare preferenza per lavoro a sedere");
      }
    }

    // 5. No movimentazione carichi pesanti
    if (requirements.noMovimentazioneCarichi) {
      if (persona.movimentazioneManuale === false) {
        matchReasons.push("Compatibile con divieto aziendale di sollevamento carichi pesanti");
      } else {
        adaptations.push("Idoneo a carichi; verificare che l'attività non superi i limiti sanitari");
      }
    }

    // 6. Contatto con il pubblico (Ambiente protetto)
    if (requirements.noContattoPubblico) {
      if (persona.contattoPubblico === false) {
        matchReasons.push("Idoneo per postazioni interne protette senza contatto con pubblico");
      } else {
        adaptations.push("Candidato idoneo al pubblico; può operare sia in front-office che in back-office");
      }
    }

    // 7. Competenze Informatiche (Uso PC / ECDL)
    if (requirements.richiedePc) {
      const hasPc = persona.usoPc || persona.ecdl || persona.informatica;
      if (hasPc) {
        matchReasons.push("Competenze informatiche di base / ECDL / Pacchetto Office verificate");
      } else {
        score -= 15;
        incompatibilities.push("Mancanza di competenze informatiche certificate o di base");
      }
    }

    // 8. Lingua Inglese
    if (requirements.richiedeInglese) {
      if (persona.inglese) {
        matchReasons.push("Buona conoscenza della lingua inglese dichiarata");
      } else {
        score -= 10;
        incompatibilities.push("Mancanza conoscenza lingua inglese");
      }
    }

    // 9. Titolo di Studio Minimo
    if (requirements.titoloStudio && requirements.titoloStudio !== 'ALL') {
      const studio = (persona.titoloStudioLast || '').toLowerCase();
      if (requirements.titoloStudio === 'LAUREA') {
        if (studio.includes('laurea') || studio.includes('dottore') || studio.includes('master')) {
          matchReasons.push(`Titolo accademico idoneo: ${persona.titoloStudioLast}`);
        } else {
          score -= 20;
          incompatibilities.push("Non possiede titolo di Laurea richiesto");
        }
      } else if (requirements.titoloStudio === 'DIPLOMA') {
        if (studio.includes('diploma') || studio.includes('perito') || studio.includes('maturità') || studio.includes('laurea')) {
          matchReasons.push(`Diploma / Laurea verificato: ${persona.titoloStudioLast}`);
        } else {
          score -= 15;
          incompatibilities.push("Non possiede Diploma di scuola secondaria superiore");
        }
      }
    }

    // 10. Mobilità & Patente B
    if (requirements.automunito) {
      const disp = persona.disponibilita || {};
      const hasAuto = !!(disp.mezzoMunit || (persona.patente && persona.patente.includes('B')));
      if (hasAuto) {
        matchReasons.push("Automunito (Patente B e disponibilità mezzo proprio)");
      } else {
        score -= 15;
        incompatibilities.push("Non automunito (difficoltà di trasporto autonomo)");
      }
    }

    // 11. Smart Working
    if (requirements.smartWorking) {
      const disp = persona.disponibilita || {};
      if (disp.smartWorking) {
        matchReasons.push("Disponibile per modalità Smart Working / Lavoro agile");
      } else {
        adaptations.push("Disponibilità smart working non indicata esplicitamente");
      }
    }

    // 12. Filtro Territoriale (Comune di Residenza)
    if (requirements.comune && requirements.comune.trim()) {
      const qComune = requirements.comune.trim().toLowerCase();
      const pComune = (persona.comuneResidenza || '').toLowerCase();
      const pDomicilio = (persona.domicilioComune || '').toLowerCase();

      if (pComune.includes(qComune) || pDomicilio.includes(qComune)) {
        score += 10;
        matchReasons.push(`Territorialmente vicino alla sede (${persona.comuneResidenza})`);
      } else {
        adaptations.push(`Residente a ${persona.comuneResidenza || 'N.D.'}; verificare tempi di percorrenza`);
      }
    }

    // Supporti ergonomici personalizzati dal verbale ASL / Comitato
    if (persona.diagnosiLastDescTipoSupporto) {
      adaptations.push(`Adattamento ASL: ${persona.diagnosiLastDescTipoSupporto}`);
    }

    // Normalizzazione score 0-100%
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Livello di compatibilità
    let matchLevel = 'LOW';
    if (score >= 80) matchLevel = 'HIGH';
    else if (score >= 60) matchLevel = 'MEDIUM';

    return {
      score,
      matchLevel,
      matchReasons,
      adaptations,
      incompatibilities
    };
  }
}

window.MatcherEngine = MatcherEngine;
