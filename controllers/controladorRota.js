const { MASTER_DIR } = require('../helpers/constants');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const index = function (request, response, next) {
  const jsFiles = ['controller.js'];

  return response.render('./home', {
    layout: MASTER_DIR,
    jsFiles: { files: jsFiles },
  });
};

const add = function (req, res, next) {
  const { local, valor, produtos, assinatura } = req.body;

  const doc = new PDFDocument();

  doc.info.Title = 'Recibo de Entrega';

  const docWidth = doc.page.width;
  const contentWidth = docWidth - 2 * doc.page.margins.left;

  doc.text('Informações do Pedido', { align: 'center', fontSize: 40 });
  doc.moveDown();

  doc.fontSize(8).text(`Local de Entrega: ${local}`, { align: 'left' });
  doc.moveDown();

  doc
    .fontSize(8)
    .text(`Valor total dos produtos: R$ ${valor}`, { align: 'left' });
  doc.moveDown();

  doc.fontSize(8).text('Produtos:', { align: 'left' });
  produtos.forEach((produto) => {
    doc
      .fontSize(8)
      .text(`${produto.produto}: ${produto.quantidade}`, { indent: 20 });
  });
  doc.moveDown();

  const imagebase64Data = assinatura.replace(/^data:image\/png;base64,/, '');
  const signatureImage = Buffer.from(imagebase64Data, 'base64');
  const imageWidth = 80;
  const imageHeight = 80;
  const imageX = (docWidth - imageWidth) / 2;
  doc.text('Assinatura', { align: 'center', fontSize: 3 });
  doc.image(signatureImage, imageX, doc.y + 10, {
    width: imageWidth,
    height: imageHeight,
  });
  doc.moveDown();

  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, '0');
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const year = currentDate.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;
  doc.text(` Belo Horizonte - ${formattedDate}`, {
    align: 'center',
    fontSize: 12,
  });
  doc.moveDown();

  doc.end();

  const filesPath = path.join(__dirname, '..', 'files');

  if (!fs.existsSync(filesPath)) {
    fs.mkdirSync(filesPath);
  }

  const fileName = `pedido_${Date.now()}.pdf`;
  const filePath = path.join(filesPath, fileName);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  doc.pipe(fs.createWriteStream(filePath));

  res.json({ fileName: fileName, filePath: filePath });
};

const download = function (req, res, next) {
  const filePath = req.query.filePath;

  if (fs.existsSync(filePath)) {
    res.download(filePath, 'pedido.pdf', function (err) {
      if (err) {
        console.log('Erro ao fazer o download do arquivo:', err);
        res.status(500).send('Erro ao fazer o download do arquivo');
      }
    });
  } else {
    res.status(404).send('Arquivo não encontrado');
  }
};

module.exports = { index, add, download };
