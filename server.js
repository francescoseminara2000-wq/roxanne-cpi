require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('.')); // Serve static frontend files (index.html, css, js)

// --- API: PERSONE (ISCRITTI L.68/99) ---
app.get('/api/persone', async (req, res) => {
  try {
    const persone = await prisma.persona.findMany({
      include: {
        disponibilita: true,
        wallet: true,
        comitatoTecnico: true,
        progettiPIL: true,
        noteDiario: true,
        avviamenti: true
      },
      orderBy: { id: 'desc' }
    });
    res.json(persone);
  } catch (error) {
    console.error('Errore get /api/persone:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/persone/:id', async (req, res) => {
  try {
    const persona = await prisma.persona.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        disponibilita: true,
        wallet: true,
        comitatoTecnico: true,
        progettiPIL: true,
        noteDiario: true,
        avviamenti: true
      }
    });
    if (!persona) return res.status(404).json({ error: 'Persona non trovata' });
    res.json(persona);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper Sanitizer per Persona Prisma MySQL: Whitelist rigorosa sui soli campi esistenti in schema.prisma
function sanitizePersonaInput(raw) {
  const allowedScalars = [
    'numeroIscrizione', 'codice', 'nome', 'cognome', 'codiceFiscale', 'dataNascita', 'natoA', 'sesso', 'statoCivile',
    'comuneResidenza', 'residenzaProvincia', 'indirizzo', 'domicilioComune', 'domicilioProvincia', 'domicilioIndirizzo',
    'telefono', 'telefono1', 'telefono2', 'cellulare', 'email', 'patente',
    'categoria', 'categoriaLg6869', 'dataIscrizioneCO', 'dataIscrizioneFD', 'dataIscrizioneLista', 'tipologiaIscrizioneLista', 'dataAnzianita',
    'attivoNonAttivo', 'stato', 'disponibile', 'cancellato', 'lavoraSn', 'operatore', 'segnalatoDa', 'referente',
    'icPercentuale', 'diagnosi', 'diagnosiLastDescTipoSupporto', 'dataVerbale', 'dataRevisione', 'asl', 'patologia', 'handicapL104', 'allegatiLg68',
    'titoloStudioLast', 'titoloStudioAnnoInizio', 'titoloStudioPresso', 'votazione', 'anno', 'qualifica', 'patenteMuletto', 'ecdl',
    'inglese', 'spagnolo', 'francese', 'tedesco', 'altreLingue',
    'stazioneEretta', 'movimentazioneManuale', 'manualitaFine', 'artiSuperiori', 'vista', 'udito', 'colonna', 'lavoriInAltezza', 'contattoPubblico', 'supervisione',
    'impiegato', 'impiegatoMansione', 'cassa', 'commesso', 'magazzino', 'verde', 'socialeScuola', 'pulizie', 'impTecnico', 'impCommerciale',
    'receptionSegreteria', 'artigiano', 'artigianoMansione', 'grafica', 'informatica', 'tutteMansioni'
  ];

  const data = {};
  for (const key of allowedScalars) {
    if (raw[key] !== undefined) {
      data[key] = raw[key];
    }
  }

  // Mappatura compatibilità campi con nomi alternativi dal form UI
  if (raw.cognome === undefined && raw.last_name !== undefined) data.cognome = raw.last_name;
  if (raw.nome === undefined && raw.first_name !== undefined) data.nome = raw.first_name;
  if (!data.dataRevisione && raw.diagnosiLastDataRevisione) data.dataRevisione = raw.diagnosiLastDataRevisione;
  if (!data.dataVerbale && raw.diagnosiLastDataDiagnosi) data.dataVerbale = raw.diagnosiLastDataDiagnosi;

  // Numeric fields
  if (data.numeroIscrizione !== undefined) data.numeroIscrizione = parseInt(data.numeroIscrizione) || 10001;
  if (data.icPercentuale !== undefined) data.icPercentuale = parseInt(data.icPercentuale) || 0;
  if (data.anno !== undefined && data.anno !== null && data.anno !== "") data.anno = parseInt(data.anno) || null;
  else if (data.anno === "") data.anno = null;

  // Boolean fields
  const booleanFields = [
    'handicapL104', 'allegatiLg68', 'patenteMuletto', 'inglese', 'francese', 'spagnolo', 'tedesco',
    'stazioneEretta', 'movimentazioneManuale', 'manualitaFine', 'artiSuperiori', 'vista', 'udito', 'colonna', 'lavoriInAltezza', 'contattoPubblico', 'supervisione',
    'impiegato', 'cassa', 'commesso', 'magazzino', 'verde', 'socialeScuola', 'pulizie', 'impTecnico', 'impCommerciale', 'receptionSegreteria', 'artigiano', 'grafica', 'informatica', 'tutteMansioni'
  ];
  booleanFields.forEach(k => {
    if (data[k] !== undefined) data[k] = !!data[k];
  });

  // Date fields ISO or null
  const dateFields = ['dataNascita', 'dataIscrizioneCO', 'dataIscrizioneFD', 'dataIscrizioneLista', 'dataAnzianita', 'dataVerbale', 'dataRevisione'];
  dateFields.forEach(k => {
    if (data[k]) {
      try {
        const d = new Date(data[k]);
        data[k] = isNaN(d.getTime()) ? null : d.toISOString();
      } catch (e) {
        data[k] = null;
      }
    } else {
      data[k] = null;
    }
  });

  // Ensure unique codice
  if (!data.codice) {
    data.codice = `PERS-${data.numeroIscrizione || Date.now()}`;
  }

  return data;
}

app.post('/api/persone', async (req, res) => {
  try {
    const rawData = req.body;
    const disponibilita = rawData.disponibilita;
    const sanitized = sanitizePersonaInput(rawData);

    const newPersona = await prisma.persona.create({
      data: {
        ...sanitized,
        disponibilita: disponibilita ? {
          create: {
            orarioPreferito: disponibilita.orarioPreferito || "Full-Time",
            raggioMaxKm: parseInt(disponibilita.raggioMaxKm) || 25,
            mezzoMunit: !!disponibilita.mezzoMunit,
            smartWorking: !!disponibilita.smartWorking,
            disponibileTurni: !!disponibilita.disponibileTurni,
            disponibileFestivi: !!disponibilita.disponibileFestivi,
            noteDisponibilita: disponibilita.noteDisponibilita || ""
          }
        } : undefined
      },
      include: { disponibilita: true, wallet: true, comitatoTecnico: true, noteDiario: true, progettiPIL: true }
    });
    res.status(201).json(newPersona);
  } catch (error) {
    console.error('Errore post /api/persone:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/persone/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const rawData = req.body;
    const disponibilita = rawData.disponibilita;
    const sanitized = sanitizePersonaInput(rawData);

    const updated = await prisma.persona.update({
      where: { id },
      data: {
        ...sanitized,
        disponibilita: disponibilita ? {
          upsert: {
            create: {
              orarioPreferito: disponibilita.orarioPreferito || "Full-Time",
              raggioMaxKm: parseInt(disponibilita.raggioMaxKm) || 25,
              mezzoMunit: !!disponibilita.mezzoMunit,
              smartWorking: !!disponibilita.smartWorking,
              disponibileTurni: !!disponibilita.disponibileTurni,
              disponibileFestivi: !!disponibilita.disponibileFestivi,
              noteDisponibilita: disponibilita.noteDisponibilita || ""
            },
            update: {
              orarioPreferito: disponibilita.orarioPreferito,
              raggioMaxKm: parseInt(disponibilita.raggioMaxKm) || 25,
              mezzoMunit: !!disponibilita.mezzoMunit,
              smartWorking: !!disponibilita.smartWorking,
              disponibileTurni: !!disponibilita.disponibileTurni,
              disponibileFestivi: !!disponibilita.disponibileFestivi,
              noteDisponibilita: disponibilita.noteDisponibilita
            }
          }
        } : undefined
      },
      include: { disponibilita: true, wallet: true, comitatoTecnico: true, noteDiario: true, progettiPIL: true }
    });
    res.json(updated);
  } catch (error) {
    console.error('Errore put /api/persone/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- API: COMITATO TECNICO ASL ---
app.get('/api/comitato/:numIscriz', async (req, res) => {
  try {
    const list = await prisma.comitatoTecnico.findMany({
      where: { numeroIscrizione: parseInt(req.params.numIscriz) },
      orderBy: { dataSeduta: 'desc' }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/comitato', async (req, res) => {
  try {
    const newVerbale = await prisma.comitatoTecnico.create({
      data: req.body
    });
    res.status(201).json(newVerbale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/comitato/:id', async (req, res) => {
  try {
    await prisma.comitatoTecnico.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API: PROGETTI INSERIMENTO LAVORATIVO (PIL) ---
app.get('/api/pil/:numIscriz', async (req, res) => {
  try {
    const list = await prisma.progettoInserimentoLav.findMany({
      where: { numeroIscrizione: parseInt(req.params.numIscriz) },
      orderBy: { data: 'desc' }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pil', async (req, res) => {
  try {
    const newPil = await prisma.progettoInserimentoLav.create({
      data: req.body
    });
    res.status(201).json(newPil);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/pil/:id', async (req, res) => {
  try {
    await prisma.progettoInserimentoLav.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API: DIARIO OPERATORE ---
app.get('/api/diario/:numIscriz', async (req, res) => {
  try {
    const list = await prisma.notaDiario.findMany({
      where: { numeroIscrizione: parseInt(req.params.numIscriz) },
      orderBy: { data: 'desc' }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/diario', async (req, res) => {
  try {
    const newNota = await prisma.notaDiario.create({
      data: req.body
    });
    res.status(201).json(newNota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/diario/:id', async (req, res) => {
  try {
    await prisma.notaDiario.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API: WALLET DOCUMENTALE ---
app.post('/api/wallet', async (req, res) => {
  try {
    const newDoc = await prisma.documentoWallet.create({
      data: req.body
    });
    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/wallet/:id', async (req, res) => {
  try {
    await prisma.documentoWallet.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API: AUDIT LOGS ---
app.get('/api/audit', async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/audit', async (req, res) => {
  try {
    const log = await prisma.auditLog.create({
      data: req.body
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API: AUTHENTICATION & USERS (GESTIONE UTENZE & ADMIN) ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenziali non valide o utente inesistente' });
    }

    if (!user.attivo) {
      return res.status(403).json({ error: 'Account disabilitato dall\'amministratore' });
    }

    // Aggiorna ultimo accesso
    await prisma.user.update({
      where: { id: user.id },
      data: { ultimoAccesso: new Date() }
    });

    // Registra audit log di accesso
    await prisma.auditLog.create({
      data: {
        operatore: `${user.nomeCompleto} (${user.ruolo})`,
        azione: 'LOGIN_UTENTE',
        modulo: 'Autenticazione',
        target: user.username,
        dettagli: `Accesso riuscito con ruolo ${user.ruolo}`
      }
    });

    const { password: _, ...userWithoutPass } = user;
    res.json({ success: true, user: userWithoutPass });
  } catch (error) {
    console.error('Errore login:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        nomeCompleto: true,
        ruolo: true,
        sedeCpi: true,
        attivo: true,
        ultimoAccesso: true,
        createdAt: true
      },
      orderBy: { id: 'asc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = await prisma.user.create({
      data: req.body
    });
    const { password: _, ...userWithoutPass } = newUser;
    res.status(201).json(userWithoutPass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    const { password: _, ...userWithoutPass } = updated;
    res.json(userWithoutPass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Avvio Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ROXANNE CPI STANDALONE SERVER ONLINE`);
  console.log(`📡 URL API: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend Static: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
