// backend/routes/plans.js
const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // GET /api/plans -> return list of plans
  router.get('/', (req, res) => {
    db.all(
      `SELECT id, name, price, streams_limit, cpu_limit, storage_limit, description FROM plans ORDER BY price ASC`,
      [],
      (err, rows) => {
        if (err) {
          console.error('Error fetching plans:', err);
          return res.status(500).json({ error: 'DB error' });
        }
        res.json(rows);
      }
    );
  });

  return router;
};
