const express = require('express');
const { proxyController } = require('../../controllers');
const { injectSource } = require('../../middlewares/source');
const { setCache } = require('../../middlewares/cache');

const router = express.Router();

router
    .route('/parser')
    .get(proxyController.parseURL)

router
    .route('/:source')
    .get(proxyController.getSource)

router
    .route('/:source/sections')
    .get(injectSource, setCache(3600), proxyController.getHomepageSections)

router
    .route('/:source/:mangaId')
    .get(injectSource, setCache(3600), proxyController.getManga)

router
    .route('/:source/:mangaId/:chapterId')
    .get(injectSource, setCache(3600), proxyController.getChapter)

module.exports = router;