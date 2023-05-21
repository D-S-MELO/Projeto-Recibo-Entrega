const exphbs = require('express-handlebars');
var Handlebars = require('handlebars');
const {
  allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');

const { PARTIAL_DIR, LAYOUT_DIR, VIEWS_DIR } = require('./constants');
exports.init = function (app) {
  app.engine(
    'hbs',
    exphbs.engine({
      extname: 'hbs',
      partialsDir: PARTIAL_DIR,
      layoutsDir: LAYOUT_DIR,
      handlebars: allowInsecurePrototypeAccess(Handlebars),
      helpers: {},
    })
  );

  app.set('view engine', '.hbs');
  app.set('views', VIEWS_DIR);
};
