const CryptoJS = require("crypto-js");

const SECRET_KEY = "supersecretkey";

function encryptKey(key) {
  return CryptoJS.AES.encrypt(key, SECRET_KEY).toString();
}

function decryptKey(cipher) {
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = (db) => {
  return {
    getAll: (req, res) => {
      db.all("SELECT * FROM streams", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
    },

    add: (req, res) => {
      const { title, video_url, yt_key } = req.body;
      if (!title || !video_url || !yt_key) {
        return res.status(400).json({ error: "Missing fields" });
      }
      const encKey = encryptKey(yt_key);
      db.run(`INSERT INTO streams (title, video_url, yt_key) VALUES (?, ?, ?)`,
        [title, video_url, encKey],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: this.lastID, title, video_url, status: 'offline' });
        });
    },

    start: (req, res) => {
      const id = req.params.id;
      db.get("SELECT * FROM streams WHERE id = ?", [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Stream not found" });
        db.run("UPDATE streams SET status = 'online' WHERE id = ?", [id]);
        res.json({ message: `Stream ${row.title} started (mock).` });
      });
    },

    stop: (req, res) => {
      const id = req.params.id;
      db.get("SELECT * FROM streams WHERE id = ?", [id], (err, row) => {
        if (err || !row) return res.status(404).json({ error: "Stream not found" });
        db.run("UPDATE streams SET status = 'offline' WHERE id = ?", [id]);
        res.json({ message: `Stream ${row.title} stopped (mock).` });
      });
    }
  };
};