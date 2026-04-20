# Estágio de dependências de IA (Python + Faster Whisper)
FROM nvidia/cuda:12.2.0-base-ubuntu22.04 AS ai-builder
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg
RUN pip3 install faster-whisper

# Estágio principal do Node.js
FROM node:20-slim
WORKDIR /app

# Instala FFmpeg e dependências de sistema para o Node-Canvas ou similar se necessário
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip curl \
    && pip3 install faster-whisper \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copia arquivos de dependência
COPY package*.json ./
RUN npm install --production

# Copia o código fonte
COPY . .

# Variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000
CMD ["node", "server.js"]
