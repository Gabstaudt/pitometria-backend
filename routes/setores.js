const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obter todos os setores
router.get('/', async (req, res) => {
  try {
    const [setores] = await db.query('SELECT * FROM setores');
    res.json(setores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar um novo setor
router.post('/', async (req, res) => {
  const { nome } = req.body;
  try {
    await db.query('INSERT INTO setores (nome) VALUES (?)', [nome]);
    res.status(201).json({ message: 'Setor criado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar um setor
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  try {
    await db.query('UPDATE setores SET nome = ? WHERE id = ?', [nome, id]);
    res.json({ message: 'Setor atualizado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar um setor
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM setores WHERE id = ?', [id]);
    res.json({ message: 'Setor deletado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
