const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Avvio seeding database Roxanne L.68/99...');

  // 1. Inserimento Cittadino Esempio
  const persona = await prisma.persona.upsert({
    where: { codiceFiscale: 'RSSMRA78A01E507X' },
    update: {},
    create: {
      numeroIscrizione: 10452,
      codice: 'PERS-001',
      nome: 'Mario',
      cognome: 'Rossi',
      codiceFiscale: 'RSSMRA78A01E507X',
      dataNascita: new Date('1978-01-15'),
      natoA: 'Lecco',
      sesso: 'M',
      statoCivile: 'Coniugato/a',
      comuneResidenza: 'Lecco',
      residenzaProvincia: 'LC',
      indirizzo: 'Via Roma 45',
      domicilioComune: 'Lecco',
      domicilioProvincia: 'LC',
      domicilioIndirizzo: 'Via Roma 45',
      cellulare: '3389876543',
      telefono: '0341123456',
      email: 'mario.rossi@email.it',
      patente: 'B, C, Muletto',
      categoria: 'C.O.',
      categoriaLg6869: 'Disabili Fisici (Art. 1)',
      dataIscrizioneCO: new Date('2018-03-10'),
      dataIscrizioneLista: new Date('2018-03-10'),
      tipologiaIscrizioneLista: 'Lista Unica Provinciale L.68/99',
      dataAnzianita: new Date('2018-03-10'),
      attivoNonAttivo: 'Attivo',
      stato: 'Disoccupato',
      disponibile: 'Sì',
      operatore: 'CPI Lecco (M. Galli)',
      segnalatoDa: 'Servizi Sociali Lecco',
      referente: 'Dott.ssa Bianchi',
      icPercentuale: 67,
      diagnosi: 'Esiti poliomielite arto inferiore sinistro con deficit deambulazione prolungata.',
      diagnosiLastDescTipoSupporto: 'Adattamento postazione ergonomica e sedia regolabile con supporto lombare.',
      dataVerbale: new Date('2018-01-20'),
      dataRevisione: new Date('2028-01-20'),
      asl: 'ASST Lecco Ospedale Manzoni',
      patologia: 'Minorazione Motoria Arto Inferiore',
      handicapL104: true,
      allegatiLg68: true,
      titoloStudioLast: 'Diploma di Ragioneria / Perito Commerciale',
      titoloStudioAnnoInizio: '1992',
      titoloStudioPresso: 'I.T.C. Viganò Merate',
      votazione: '85/100',
      anno: 1997,
      qualifica: 'Ragioniere Programmatore',
      patenteMuletto: true,
      ecdl: 'Sì (Certificato PC)',
      inglese: true,
      spagnolo: false,
      stazioneEretta: false,
      movimentazioneManuale: false,
      manualitaFine: true,
      artiSuperiori: true,
      vista: true,
      udito: true,
      colonna: false,
      lavoriInAltezza: false,
      contattoPubblico: true,
      supervisione: false,
      impiegato: true,
      impiegatoMansione: 'Contabile Junior / Data Entry',
      cassa: false,
      commesso: false,
      magazzino: false,
      verde: false,
      socialeScuola: false,
      pulizie: false,
      impTecnico: true,
      impCommerciale: false,
      receptionSegreteria: true,
      disponibilita: {
        create: {
          orarioPreferito: 'Part-Time Mattina (25-30h)',
          disponibileTurni: false,
          disponibileFestivi: false,
          disponibileTrasferte: false,
          smartWorking: true,
          raggioMaxKm: 25,
          mezzoMunit: true,
          noteDisponibilita: 'Preferenza per sede Lecco o comuni limitrofi raggiungibili in auto.'
        }
      },
      wallet: {
        create: [
          { nome: 'Verbale_Invalidita_Civile_INPS_2026.pdf', tipo: 'Verbale INPS', data: new Date('2026-01-15'), dimensione: '1.2 MB' },
          { nome: 'Relazione_Funzionale_Comitato_ASL.pdf', tipo: 'Relazione ASL', data: new Date('2025-11-20'), dimensione: '840 KB' },
          { nome: 'Curriculum_Vitae_Mario_Rossi.pdf', tipo: 'Curriculum', data: new Date('2026-02-01'), dimensione: '420 KB' }
        ]
      },
      comitatoTecnico: {
        create: [
          {
            numeroIscrizione: 10452,
            numPratica: '4520/ASL',
            dataSeduta: new Date('2025-11-15'),
            dataVerbale: new Date('2025-11-20'),
            asl: 'ASST Lecco Ospedale Manzoni',
            prognosi: 'Soggetto con buone capacità lavorative in mansioni d\'ufficio sedentarie o con postazione ergonomica. Evitare movimentazione carichi e stazione eretta prolungata.',
            percorsoScolastico: 'Diploma di Ragioneria (85/100). Buone competenze informatiche e contabili.',
            percorsoLavorativo: 'Esperienza decennale come impiegato amministrativo e addetto al protocollo.',
            autonomiaPers: 'Autonomo con mezzo proprio adattato',
            abilitaCognitive: 'Nella norma',
            capacitaRelazionali: 'Buone, collaborativo',
            responsabile: 'Dott.ssa Anna Verdi (Presidente Comitato)'
          }
        ]
      },
      progettiPIL: {
        create: [
          {
            numeroIscrizione: 10452,
            nome: 'Mario Rossi',
            codiceFiscale: 'RSSMRA78A01E507X',
            data: new Date('2026-01-20'),
            idDote: 'DOTE-L68-2026-88',
            tutor: 'Marco Galli (Admin CPI)',
            progettoInserimento: 'Attivazione percorso di tirocinio mirato di 6 mesi finalizzato all\'inserimento come impiegato contabile.',
            profiloDinamicoFunzionale: 'Buona capacità di concentrazione e rispetto delle consegne. Necessita di pause per compiti a videoterminale.',
            profiloSanitario: 'Disabilità motoria arto inferiore sinistro (67% IC).',
            profiloScolastico: 'Diploma Ragioneria ITC Viganò.',
            profiloLavorativo: 'Impiegato amministrativo back office.',
            profiloPersonaleSociale: 'Persona affidabile e motivata al reinserimento.',
            valutazioneLavorativa: 'Idoneo per impiego amministrativo e accoglienza.',
            aspettiCriticita: 'No movimentazione carichi > 10kg.',
            aspettiPositivita: 'Ottimo uso PC, Excel e gestionali.'
          }
        ]
      },
      noteDiario: {
        create: [
          {
            numeroIscrizione: 10452,
            nome: 'Mario Rossi',
            tipoNota: 'Diario Operativo',
            data: new Date('2026-02-15'),
            noteDiDiario: 'Effettuato colloquio di aggiornamento DID e disponibilità lavorativa.',
            firma: 'Operatore M. Galli',
            operatore: 'CPI Lecco'
          }
        ]
      }
    }
  });

  console.log(`✅ Database popolato con successo! ID Persona creata: ${persona.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
