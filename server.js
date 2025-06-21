const express = require('express');
const ffmpeg = require('fluent-ffmpeg');

const app = express();

// URL original del m3u8 (cámbiala por la tuya)
const ORIGINAL_M3U8 = 'http://clbpktstvhls-1.clarovideo.com/bpk-tv/MEGAHD/hls_fk/index.m3u8';

app.get('/', (req, res) => {
  res.send('Servidor de canal con volumen reducido');
});

app.get('/canal', (req, res) => {
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');

  ffmpeg(ORIGINAL_M3U8)
    .addOptions(['-filter:a volume=0.4', '-c:v copy', '-f hls'])
    .on('start', cmd => console.log('FFmpeg ejecutando:', cmd))
    .on('error', err => console.error('Error FFmpeg:', err))
    .pipe(res, { end: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
