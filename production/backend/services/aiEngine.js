const { Queue, Worker } = require('bullmq');
const { spawn } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const db = require('./db'); // Conexão Postgres
const s3 = require('./s3'); // Client S3/Minio

// Configuração da Fila no Redis
const dubbingQueue = new Queue('dubbing-queue', { connection: { host: 'redis', port: 6379 } });

/**
 * Worker para processar os Jobs de Dublagem
 */
const dubbingWorker = new Worker('dubbing-queue', async job => {
  const { jobId, videoUrl, targetLang, userId } = job.data;
  const tempDir = path.join(__dirname, '../temp', jobId);
  
  try {
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    // 1. ATUALIZAR STATUS NO BANCO
    await db.query('UPDATE processing_jobs SET status = $1, progress = $2 WHERE id = $3', ['processing', 10, jobId]);

    // 2. EXTRAIR ÁUDIO ORIGINAL (FFMPEG REAL)
    const audioPath = path.join(tempDir, 'original.wav');
    await new Promise((resolve, reject) => {
      ffmpeg(videoUrl)
        .outputOptions('-vn', '-acodec pcm_s16le', '-ar 16000', '-ac 1')
        .save(audioPath)
        .on('end', resolve)
        .on('error', reject);
    });
    await db.query('UPDATE processing_jobs SET progress = 30 WHERE id = $3', [jobId]);

    // 3. TRANSCRIÇÃO COM FASTER-WHISPER (GPU)
    // Chamamos o script Python que carrega o modelo na VRAM
    console.log(`[AI] Iniciando Whisper para o job ${jobId}`);
    const transcriptionPath = path.join(tempDir, 'transcript.json');
    await runPythonScript('whisper_proc.py', [audioPath, transcriptionPath]);
    await db.query('UPDATE processing_jobs SET progress = 60 WHERE id = $3', [jobId]);

    // 4. GERAÇÃO DE TTS (EX: ELEVENLABS OU COQUI)
    // Simulando chamada para API ou binário local
    const dubbedAudioPath = path.join(tempDir, 'dubbed.mp3');
    await generateTTS(transcriptionPath, dubbedAudioPath, targetLang);
    await db.query('UPDATE processing_jobs SET progress = 80 WHERE id = $3', [jobId]);

    // 5. REMUX & UPLOAD PARA S3
    const finalUrl = await s3.uploadFile(dubbedAudioPath, `dubs/${jobId}.mp3`);
    
    // 6. FINALIZAR NO BANCO
    await db.query('UPDATE processing_jobs SET status = $1, progress = $2, s3_output_url = $3, completed_at = NOW() WHERE id = $4', 
      ['completed', 100, finalUrl, jobId]);

    // Limpar arquivos temporários
    fs.rmSync(tempDir, { recursive: true, force: true });
    
    return { success: true, url: finalUrl };

  } catch (error) {
    console.error(`[AI ERROR] Job ${jobId} falhou:`, error.message);
    await db.query('UPDATE processing_jobs SET status = $1, error_message = $2 WHERE id = $3', ['failed', error.message, jobId]);
    throw error;
  }
}, { connection: { host: 'redis', port: 6379 } });

/**
 * Helper para rodar scripts Python (Faster Whisper)
 */
function runPythonScript(scriptName, args) {
  return new Promise((resolve, reject) => {
    const py = spawn('python3', [path.join(__dirname, scriptName), ...args]);
    py.on('close', (code) => code === 0 ? resolve() : reject(new Error('Python script failed')));
  });
}

/**
 * Gerador de TTS (Implementação Real ou API)
 */
async function generateTTS(transcriptJson, outputPath, lang) {
  // Aqui entraria a integração com ElevenLabs ou Coqui TTS
  // Para produção, recomenda-se uma instância local de Coqui para zero custo de API
  console.log(`[TTS] Gerando áudio para idioma: ${lang}`);
  return new Promise(resolve => setTimeout(resolve, 2000));
}

module.exports = { dubbingQueue };
