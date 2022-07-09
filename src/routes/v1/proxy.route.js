const express = require('express');
const { proxyController } = require('../../controllers');
const { injectSource } = require('../../middlewares/source');

const router = express.Router();


router
    .route('/parser')
    .get(proxyController.parseURL)

router
    .route('/:source')
    .get(proxyController.getSource)

router
    .route('/:source/:mangaId')
    .get(injectSource, proxyController.getManga)

router
    .route('/:source/:mangaId/:chapterId')
    .get(injectSource, proxyController.getChapter)

module.exports = router;