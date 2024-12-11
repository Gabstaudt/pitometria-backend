const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obter todos os pontos de medição
router.get('/', async (req, res) => {
  try {
    const [pontos] = await db.query('SELECT * FROM pontos_de_medicao');
    res.json(pontos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar um novo ponto de medição
router.post('/', async (req, res) => {
  const { ep, ponto_de_medicao, vazao_m3_h, dif, data_de_medicao, hora_de_medicao, volume_m3, pressao_mca, croqui, latitude, longitude, observacao, setor_id } = req.body;
  try {
    await db.query(
      'INSERT INTO pontos_de_medicao (ep, ponto_de_medicao, vazao_m3_h, dif, data_de_medicao, hora_de_medicao, volume_m3, pressao_mca, croqui, latitude, longitude, observacao, setor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ep, ponto_de_medicao, vazao_m3_h, dif, data_de_medicao, hora_de_medicao, volume_m3, pressao_mca, croqui, latitude, longitude, observacao, setor_id]
    );
    res.status(201).json({ message: 'Ponto de medição criado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar um ponto de medição
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { ep, ponto_de_medicao, vazao_m3_h, dif, data_de_medicao, hora_de_medicao, volume_m3, pressao_mca, croqui, latitude, longitude, observacao, setor_id } = req.body;
  try {
    await db.query(
      'UPDATE pontos_de_medicao SET ep = ?, ponto_de_medicao = ?, vazao_m3_h = ?, dif = ?, data_de_medicao = ?, hora_de_medicao = ?, volume_m3 = ?, pressao_mca = ?, croqui = ?, latitude = ?, longitude = ?, observacao = ?, setor_id = ? WHERE id = ?',
      [ep, ponto_de_medicao, vazao_m3_h, dif, data_de_medicao, hora_de_medicao, volume_m3, pressao_mca, croqui, latitude, longitude, observacao, setor_id, id]
    );
    res.json({ message: 'Ponto de medição atualizado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar um ponto de medição
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM pontos_de_medicao WHERE id = ?', [id]);
    res.json({ message: 'Ponto de medição deletado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
