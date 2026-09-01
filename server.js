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

app.post('/api/persone', async (req, res) => {
  try {
    const { disponibilita, wallet, ...personaData } = req.body;
    const newPersona = await prisma.persona.create({
      data: {
        ...personaData,
        disponibilita: disponibilita ? { create: disponibilita } : undefined,
        wallet: wallet ? { create: wallet } : undefined
      },
      include: { disponibilita: true, wallet: true }
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
    const { disponibilita, ...updatedFields } = req.body;
    
    const updated = await prisma.persona.update({
      where: { id },
      data: {
        ...updatedFields,
        disponibilita: disponibilita ? {
          upsert: {
            create: disponibilita,
            update: disponibilita
          }
        } : undefined
      },
      include: { disponibilita: true, wallet: true }
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

// Avvio Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ROXANNE CPI STANDALONE SERVER ONLINE`);
  console.log(`📡 URL API: http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend Static: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
