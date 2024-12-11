const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const db = require('../config/db');

//////////////////////////////////////// gerar planilha e estilo dela//////////////////////////////
router.get('/exportar', async (req, res) => {
  try {
      const setores = await db.query(
          `SELECT setores.nome AS setor, pontos.ep, pontos.ponto_de_medicao, 
          pontos.vazao_m3_h, pontos.dif, pontos.data_de_medicao, pontos.hora_de_medicao, 
          pontos.volume_m3, pontos.pressao_mca, pontos.latitude, pontos.longitude, 
          pontos.observacao 
          FROM setores 
          JOIN pontos_de_medicao AS pontos ON setores.id = pontos.setor_id`
      );

      const dados = setores[0];

      // Criar uma nova planilha Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Pontos de Medição');

      // Configuração das colunas
      worksheet.columns = [
          { header: 'Setor', key: 'setor', width: 20 },
          { header: 'EP', key: 'ep', width: 10 },
          { header: 'Ponto de Medição', key: 'ponto_de_medicao', width: 30 },
          { header: 'Vazão (m³/h)', key: 'vazao_m3_h', width: 15 },
          { header: 'Diferença', key: 'dif', width: 15 },
          { header: 'Data de Medição', key: 'data_de_medicao', width: 15 },
          { header: 'Hora de Medição', key: 'hora_de_medicao', width: 15 },
          { header: 'Volume (m³)', key: 'volume_m3', width: 15 },
          { header: 'Pressão (mca)', key: 'pressao_mca', width: 15 },
          { header: 'Latitude', key: 'latitude', width: 15 },
          { header: 'Longitude', key: 'longitude', width: 15 },
          { header: 'Observação', key: 'observacao', width: 50 }
      ];

      // Estilo do cabeçalho
      worksheet.getRow(1).font = { bold: true, size: 14 };
      worksheet.getRow(1).alignment = { horizontal: 'center' };
      worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF00' }
      };

      // Adicionar linhas com dados
      dados.forEach(linha => {
          worksheet.addRow({
              setor: linha.setor,
              ep: linha.ep,
              ponto_de_medicao: linha.ponto_de_medicao,
              vazao_m3_h: linha.vazao_m3_h,
              dif: linha.dif,
              data_de_medicao: linha.data_de_medicao,
              hora_de_medicao: linha.hora_de_medicao,
              volume_m3: linha.volume_m3,
              pressao_mca: linha.pressao_mca,
              latitude: linha.latitude,
              longitude: linha.longitude,
              observacao: linha.observacao
          });
      });
      // Gerar o arquivo Excel como buffer
      const buffer = await workbook.xlsx.writeBuffer();
      // Enviar o arquivo Excel como resposta
      res.setHeader('Content-Disposition', 'attachment; filename=pontos_de_medicao.xlsx');
      res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
  } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao exportar dados.');
  }
});
//////////////////////////////////////// gerar planilha e estilo dela//////////////////////////////


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
