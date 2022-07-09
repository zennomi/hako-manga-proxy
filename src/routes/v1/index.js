const express = require('express');
const userRoute = require('./user.route');
const proxyRoute = require('./proxy.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/proxy',
    route: [proxyRoute]
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
