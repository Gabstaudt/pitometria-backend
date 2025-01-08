const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const db = require('../config/db');
const puppeteer = require('puppeteer');
const pool = require('../config/db');
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
    const query = `
      SELECT 
        pontos.id,
        pontos.ponto_de_medicao,
        pontos.ep,
        pontos.vazao_m3_h,
        pontos.pressao_mca,
        pontos.latitude,
        pontos.longitude,
        pontos.observacao,
        setores.nome AS setor_nome
      FROM pontos_de_medicao AS pontos
      LEFT JOIN setores ON setores.id = pontos.setor_id
    `;

    const [pontos] = await db.query(query); // Executa a consulta
    res.json(pontos); // Envia os dados para o frontend
  } catch (err) {
    console.error('Erro ao buscar pontos de medição:', err.message);
    res.status(500).json({ error: 'Erro ao buscar pontos de medição.' });
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
  const {
    ep,
    ponto_de_medicao,
    vazao_m3_h,
    dif,
    data_de_medicao,
    hora_de_medicao,
    volume_m3,
    pressao_mca,
    croqui,
    latitude,
    longitude,
    observacao,
  } = req.body;

  try {
    // Usar valor padrão para campos NOT NULL
    await db.query(
      `UPDATE pontos_de_medicao
       SET 
         ep = ?, 
         ponto_de_medicao = ?, 
         vazao_m3_h = ?, 
         dif = ?, 
         data_de_medicao = ?, 
         hora_de_medicao = ?, 
         volume_m3 = ?, 
         pressao_mca = ?, 
         croqui = ?, 
         latitude = ?, 
         longitude = ?, 
         observacao = ?
       WHERE id = ?`,
      [
        ep || null,
        ponto_de_medicao || null,
        vazao_m3_h || null,
        dif || null,
        data_de_medicao || '1970-01-01', 
        hora_de_medicao || null,
        volume_m3 || null,
        pressao_mca || null,
        croqui || null,
        latitude || null,
        longitude || null,
        observacao || null,
        id,
      ]
    );

    res.json({ message: 'Ponto de medição atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao atualizar ponto de medição:', err);
    res.status(500).json({ error: 'Erro ao atualizar ponto de medição.' });
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
//////////////////////testes////////////////////

router.get('/exportar-relatorio', async (req, res) => {
  try {
      // Iniciar o Puppeteer
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // Carregar a página do frontend
      await page.goto('http://localhost:3000/graficos', {
          waitUntil: 'networkidle2'
      });

      // Capturar a página como PDF
      const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true
      });

      await browser.close();

      // Enviar o PDF para download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');
      res.send(pdfBuffer);
  } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).send('Erro ao gerar relatório.');
  }
});

// Rota para fornecer dados ao frontend
router.get('/relatorios/dados-graficos', async (req, res) => {
  try {
      // Executar a consulta usando o pool de conexões
      const [dados] = await pool.execute(`
          SELECT 
              setores.nome AS categoria, 
              SUM(pontos_de_medicao.vazao_m3_h) AS total
          FROM 
              setores
          JOIN 
              pontos_de_medicao 
          ON 
              setores.id = pontos_de_medicao.setor_id
          GROUP BY 
              setores.nome
      `);

      // Preparar a resposta
      const resposta = dados.map(d => ({
          categoria: d.categoria,
          total: parseFloat(d.total), // Garantir que o valor seja numérico
      }));

      res.json(resposta); // Enviar os dados ao frontend
  } catch (error) {
      console.error('Erro ao buscar dados para gráficos:', error.message);
      res.status(500).json({ error: `Erro ao buscar dados: ${error.message}` });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT id, ponto_de_medicao, vazao_m3_h, pressao_mca, observacao 
      FROM pontos_de_medicao
      WHERE id = ?
    `;
    const [results] = await db.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Ponto de medição não encontrado.' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar ponto de medição.' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    ponto_de_medicao, ep, vazao_m3_h, pressao_mca, latitude, longitude, observacao
  } = req.body;

  try {
    const query = `
      UPDATE pontos_de_medicao
      SET ponto_de_medicao = ?, ep = ?, vazao_m3_h = ?, pressao_mca = ?, latitude = ?, longitude = ?, observacao = ?
      WHERE id = ?
    `;
    await db.query(query, [ponto_de_medicao, ep, vazao_m3_h, pressao_mca, latitude, longitude, observacao, id]);
    res.json({ message: 'Ponto de medição atualizado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar ponto de medição.' });
  }
});


module.exports = router;
