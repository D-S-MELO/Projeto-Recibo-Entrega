const express = require('express');
const { init: initHandlebars } = require('./helpers/hadlebars');
const bodyParser = require('body-parser');
const path = require('path');

// inicialização
const app = express();
initHandlebars(app);

//middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Arquivos Estaticos
app.use(express.static(path.join(__dirname + '/public')));

// Rotas
app.use('/', require('./routes/index'));

//Configurações Servidor
const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log(`Server running on ${port}, http://localhost:${port}`)
);
