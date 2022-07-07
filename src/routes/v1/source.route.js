const express = require('express');
const sourceController = require('../../controllers/source.controller');

const router = express.Router();

router
    .route('/:source')
    .get(sourceController.getSource)

module.exports = router;