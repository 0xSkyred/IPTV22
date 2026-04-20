# 🚀 IPTV + IA Stream Enrichment Platform

Plataforma full-stack de streaming inteligente com bypass de latência para Live e dublagem via IA para VOD.

## 🏗️ Estrutura
- **/backend**: Node.js API & Proxy HLS.
- **/frontend-web**: Dashboard Administrativo em React.
- **/mobile-app**: Aplicativo Flutter com Player HLS.
- **/production**: Configurações de Docker, Nginx e Banco de Dados.

## 🛠️ Como rodar (Local)
1. Instale as dependências nas pastas `backend` e `frontend-web`.
2. Configure o seu banco de dados no `.env`.
3. Rode `npm start` em cada pasta.

## ☁️ Deploy Vercel
Este projeto já contém o arquivo `vercel.json` configurado para deploy monorepo.
