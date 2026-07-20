const express = require('express');
const router = express.Router();
const db = require('../db');

// Add favorite
router.post('/', (req, res) => {
  const { user_id, media_id } = req.body;
  db.query(
    'INSERT INTO favorites (user_id, media_id) VALUES (?, ?)',
    [user_id, media_id],
    (err) => { if(err) return res.status(500).json(err); res.json({ message: 'Added to favorites' }); }
  );
});

// Get user favorites
router.get('/:user_id', (req, res) => {
  const userId = req.params.user_id;
  db.query(
    'SELECT media.* FROM media JOIN favorites ON media.id = favorites.media_id WHERE favorites.user_id = ?',
    [userId],
    (err, results) => { if(err) return res.status(500).json(err); res.json(results); }
  );
});

// Remove favorite
router.delete('/', (req, res) => {
  const { user_id, media_id } = req.body;
  db.query(
    'DELETE FROM favorites WHERE user_id = ? AND media_id = ?',
    [user_id, media_id],
    (err) => { if(err) return res.status(500).json(err); res.json({ message: 'Removed from favorites' }); }
  );
});

module.exports = router;
