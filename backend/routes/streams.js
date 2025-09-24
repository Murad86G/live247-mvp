const express = require('express');
const controllerFactory = require('../controllers/streamsController');

module.exports = (db) => {
  const router = express.Router();
  const controller = controllerFactory(db);

  router.get('/', controller.getAll);
  router.post('/', controller.add);
  router.post('/:id/start', controller.start);
  router.post('/:id/stop', controller.stop);

  return router;
};