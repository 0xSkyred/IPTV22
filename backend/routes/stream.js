const express = require('express');
const router = express.Router();
const videoProcessor = require('../services/videoProcessor');
const authMiddleware = require('../middleware/auth');
const axios = require('axios');

/**
 * POST /api/stream/process
 * Logic: Live bypasses heavy AI to keep latency < 500ms. VOD goes to async queue.
 */
router.post('/process', authMiddleware, async (req, res) => {
  const { streamUrl, type, features, userId } = req.body;

  if (type === 'live') {
    // BYPASS: AI audio dubbing is disabled for live to avoid 3-8s latency
    // Live only uses external data overlays (simulated in frontend)
    return res.json({
      success: true,
      streamUrl: `/api/stream/proxy/manifest?url=${encodeURIComponent(streamUrl)}`,
      mode: 'live-bypass',
      notice: 'Dublagem desativada em Live para manter latência zero. Use legendas inteligentes.'
    });
  }

  // VOD: Async processing allowed since real-time is not a priority
  const jobId = videoProcessor.addToQueue({ streamUrl, features, userId });

  res.json({
    success: true,
    jobId,
    mode: 'vod-async',
    message: 'Processamento de VOD iniciado. Acompanhe o status pelo Job ID.'
  });
});

/**
 * GET /api/stream/proxy/manifest
 * SSAI (Server Side Ad Insertion) Proxy
 * Injects #EXT-X-CUE tags into original manifest
 */
router.get('/proxy/manifest', async (req, res) => {
  try {
    const { url } = req.query;
    const response = await axios.get(url);
    let manifest = response.data;

    // SSAI Logic: Inject Ad markers every X segments or based on cues
    // This allows the player to trigger native ads without modifying video frames
    const lines = manifest.split('\n');
    const modifiedLines = [];
    
    lines.forEach((line, index) => {
      modifiedLines.push(line);
      // Mock: Inject CUE marker after every 10th segment
      if (line.startsWith('#EXTINF') && index % 20 === 0) {
        modifiedLines.push('#EXT-X-CUE-OUT:DURATION=30');
        modifiedLines.push('#EXT-X-CUE-IN');
      }
    });

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(modifiedLines.join('\n'));
  } catch (err) {
    res.status(500).send('Erro ao processar manifesto remoto.');
  }
});

module.exports = router;
