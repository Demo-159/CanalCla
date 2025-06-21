const express = require('express');
const ffmpeg = require('fluent-ffmpeg');

const app = express();

const ORIGINAL_M3U8 = 'http://clbpktstvhls-1.clarovideo.com/bpk-tv/MEGAHD/hls_fk/index.m3u8';

app.get('/canal', (req, res) => {
  let headersSent = false;

  try {
    const command = ffmpeg(ORIGINAL_M3U8)
      .inputOptions([
        '-headers',
        'User-Agent: Mozilla/5.0\r\nReferer: https://clarovideo.com\r\nOrigin: https://clarovideo.com\r\n'
      ])
      .addOptions(['-filter:a volume=0.4', '-c:v copy', '-f hls'])
      .on('start', cmd => {
        console.log('FFmpeg ejecutando:', cmd);
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        headersSent = true;
      })
      .on('error', err => {
        console.error('Error FFmpeg:', err.message);
        if (!headersSent) {
          res.status(500).send('Error en el canal (FFmpeg no arrancó)');
        } else {
          // Ya se están transmitiendo datos, no podemos mandar headers de error.
          // Podríamos terminar la respuesta abruptamente:
          res.end(); // o simplemente dejar que el cliente maneje el corte
        }
      });

    command.pipe(res, { end: true });

  } catch (e) {
    if (!headersSent) {
      res.status(500).send('Error interno del servidor');
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
