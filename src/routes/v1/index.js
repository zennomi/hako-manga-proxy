const express = require('express');
const userRoute = require('./user.route');
const mangaRoute = require('./manga.route');
const sourceRoute = require('./source.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/source',
    route: [sourceRoute, mangaRoute]
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
