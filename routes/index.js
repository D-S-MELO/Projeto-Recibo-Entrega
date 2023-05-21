const express = require('express');
const router = express.Router();

const Home = require('../controllers/controladorRota');

router.get('/', Home.index);
router.post('/gerar-pdf', Home.add);
router.get('/download-pdf', Home.download);
module.exports = router;
