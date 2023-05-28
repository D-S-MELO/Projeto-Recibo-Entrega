$(document).ready(function () {
  criaMascaraCampo();
  criaTabela();
  criaCampoAssinatura();
});

function criaCampoAssinatura() {
  const canvas = document.querySelector('canvas');

  const signaturePad = new SignaturePad(canvas);

  // Returns signature image as data URL (see https://mdn.io/todataurl for the list of possible parameters)
  signaturePad.toDataURL(); // save image as PNG
  signaturePad.toDataURL('image/jpeg'); // save image as JPEG
  signaturePad.toDataURL('image/jpeg', 0.5); // save image as JPEG with 0.5 image quality
  signaturePad.toDataURL('image/svg+xml'); // save image as SVG data url

  // Return svg string without converting to base64
  signaturePad.toSVG(); // "<svg...</svg>"
  signaturePad.toSVG({ includeBackgroundColor: true }); // add background color to svg output

  // Draws signature image from data URL (mostly uses https://mdn.io/drawImage under-the-hood)
  // NOTE: This method does not populate internal data structure that represents drawn signature. Thus, after using #fromDataURL, #toData won't work properly.
  signaturePad.fromDataURL('data:image/png;base64,iVBORw0K...');

  // Draws signature image from data URL and alters it with the given options
  signaturePad.fromDataURL('data:image/png;base64,iVBORw0K...', {
    ratio: 1,
    width: 500,
    height: 200,
    xOffset: 100,
    yOffset: 50,
  });

  // Returns signature image as an array of point groups
  const data = signaturePad.toData();

  // Draws signature image from an array of point groups
  signaturePad.fromData(data);

  // Draws signature image from an array of point groups, without clearing your existing image (clear defaults to true if not provided)
  signaturePad.fromData(data, { clear: false });

  // Clears the canvas
  signaturePad.clear();

  // Returns true if canvas is empty, otherwise returns false
  signaturePad.isEmpty();

  // Unbinds all event handlers
  signaturePad.off();

  // Rebinds all event handlers
  signaturePad.on();
}

function criaMascaraCampo() {
  $('#form_tot').inputmask('currency', {
    prefix: '',
    suffix: '',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    allowMinus: false,
    numericInput: true,
  });
}

function criaTabela() {
  var contadorLinhas = 0; // Inicializa o contador de linhas
  $('#icone').click(function () {
    // Capturar os valores do select e do input
    var produto = $('#form_produto').val();
    var quantidade = $('#form_qtd').val();

    // Criar uma nova linha na tabela
    var tabela = $('#tabela');
    var novaLinha = $('<tr></tr>');

    // Atribuir o name e o id da linha com base no contador
    var linhaNome = 'linha-' + tabela.find('tr').length;
    novaLinha.attr('name', linhaNome);
    novaLinha.attr('id', linhaNome);

    var colunaProduto = $('<td></td>').text(produto);
    var colunaQuantidade = $('<td></td>').text(quantidade);
    var colunaExcluir = $('<td></td>');

    // Adicionar botão "Excluir" na nova linha
    var botaoExcluir = $('<button></button>')
      .html("<i class='bi bi-trash' style='font-size:1rem; '></i>")
      .addClass('btn btn-danger');
    excluiLinha(botaoExcluir, novaLinha);
    colunaExcluir.append(botaoExcluir);

    // Preencher as células da nova linha com os valores capturados
    novaLinha.append(colunaProduto, colunaQuantidade, colunaExcluir);

    // Adicionar a nova linha à tabela
    tabela.append(novaLinha);

    // Incrementar o contador de linhas
    contadorLinhas++;

    // Limpar os campos de entrada de texto
    $('#form_produto').val('');
    $('#form_qtd').val('');
  });
}

function excluiLinha(botaoExcluir, novaLinha) {
  botaoExcluir.click(function () {
    novaLinha.remove(); // Excluir a linha atual
  });
}

function enviarDadosTabela() {
  var produtos = [];
  var rows = $('#tabela tr');

  var local = $('#form_local').val();
  var valor = $('#form_tot').val();

  //Itera sobre as linhas da tabela
  rows.each(function () {
    //Encontra as linhas
    var linha = $(this).find('td');

    //Recupera os dados do texto
    var produto = $(linha[0]).text();
    var quantidade = $(linha[1]).text();

    if (produto.trim() !== '' && quantidade.trim() !== '') {
      var linha = {
        produto: produto,
        quantidade: quantidade,
      };
      // Adiciona o objeto de dados ao array
      produtos.push(linha);
    }
  });

  // Recupera a imagem em Base64
  var canvas = document.getElementById('signature-pad');
  // Obtém o contexto 2D do canvas
  var context = canvas.getContext('2d');

  // Converte a imagem do canvas para Base64
  var assinatura = canvas.toDataURL();

  // Dados para envio, criação do PDF

  var dados = {
    local,
    valor,
    produtos,
    assinatura,
  };

  //Validação do Formulário para impedir campos em branco
  if (dados.produtos && dados.local && dados.valor) {
    $.ajax({
      url: '/gerar-pdf', // URL da rota Node.js
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(dados), // Converte os dados para JSON
      contentType: 'application/json',
      success: function (response) {
        var fileName = response.fileName;
        var filePath = response.filePath;
        var downloadUrl =
          '/download-pdf?fileName=' +
          encodeURIComponent(fileName) +
          '&filePath=' +
          encodeURIComponent(filePath);
        window.location.href = downloadUrl;
      },
      error: function (xhr, status, error) {
        console.log('Error generating PDF');
        console.log('Status:', status);
        console.log('Error:', error);
      },
    });
  } else {
    const produtos = dados.produtos;
    const local = dados.local;
    const valor = dados.valor;
    let camposNaoPreenchidos = '';

    if (produtos.length === 0) {
      camposNaoPreenchidos += 'Produtos\n';
    }

    if (!local) {
      camposNaoPreenchidos += 'Local de Entrega\n';
    }

    if (!valor) {
      camposNaoPreenchidos += 'Valor Total do Recibo\n';
    }

    console.log(produtos, local, valor);
    swal({
      title: 'Atenção Preencha os Campos!',
      text: camposNaoPreenchidos,
      icon: 'warning',
      button: 'Ok',
      width: '22em',
    });
  }
  console.log(dados.produtos);
}
