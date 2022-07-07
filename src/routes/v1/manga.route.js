const express = require('express');
const mangaController = require('../../controllers/manga.controller');
const { injectSource } = require('../../middlewares/source');

const router = express.Router();

// router
//     .route('/')
//     .post(validate(userValidation.createUser), userController.createUser)
//     .get(validate(userValidation.getUsers), userController.getUsers);

router
    .route('/:source/:mangaId')
    .get(injectSource, mangaController.getManga)

module.exports = router;