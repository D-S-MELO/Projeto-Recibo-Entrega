const express = require('express');
const { init: initHandlebars } = require('./helpers/hadlebars');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
initHandlebars(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Arquivos Estaticos
app.use(express.static(path.join(__dirname + '/public')));
// Rotas
app.use('/', require('./routes/index'));

//Servidor
app.listen(3000);
