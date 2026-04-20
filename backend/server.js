const express = require('express');
const cors = require('cors');
const streamRoutes = require('./routes/stream');

const app = express();

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/stream', streamRoutes);

// Exportando para a Vercel (Serverless)
module.exports = app;
