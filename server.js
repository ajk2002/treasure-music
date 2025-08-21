const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Folders
const songsFolder = path.join(__dirname, 'uploads/songs');
const coversFolder = path.join(__dirname, 'uploads/covers');
const dataFile = path.join(__dirname, 'data/songs.json');

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Ensure folders exist
[songsFolder, coversFolder, path.join(__dirname, 'data')].forEach(folder => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
});

// Storage for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'song') cb(null, songsFolder);
    else if (file.fieldname === 'cover') cb(null, coversFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes
app.get('/songs', (req, res) => {
  if (!fs.existsSync(dataFile)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(dataFile));
  res.json(data);
});

app.post('/upload', upload.fields([{ name: 'song' }, { name: 'cover' }]), (req, res) => {
  const { title, lyrics } = req.body;
  const songFile = req.files['song'][0].filename;
  const coverFile = req.files['cover'][0].filename;

  let songs = [];
  if (fs.existsSync(dataFile)) songs = JSON.parse(fs.readFileSync(dataFile));

  songs.push({ title, songFile, coverFile, lyrics });
  fs.writeFileSync(dataFile, JSON.stringify(songs, null, 2));

  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
