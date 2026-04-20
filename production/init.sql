-- Schema de Produção - Stream Enrichment Platform

-- 1. Usuários e Segurança
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    stripe_customer_id VARCHAR(100),
    current_quota_minutes INTEGER DEFAULT 0, -- Minutos de IA usados no mês
    max_quota_minutes INTEGER DEFAULT 600,   -- Limite (padrão 10h)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Assinaturas e Planos
CREATE TYPE plan_status AS ENUM ('active', 'past_due', 'canceled', 'trialing');
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL, -- 'basic', 'premium', 'pro'
    status plan_status DEFAULT 'trialing',
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Jobs de Processamento (VOD)
CREATE TYPE job_status AS ENUM ('queued', 'processing', 'completed', 'failed');
CREATE TABLE processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    status job_status DEFAULT 'queued',
    progress INTEGER DEFAULT 0,
    s3_output_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. Logs de Auditoria e Stream
CREATE TABLE stream_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    stream_id VARCHAR(100),
    action VARCHAR(50), -- 'play', 'stop', 'failed_auth'
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_jobs_user ON processing_jobs(user_id);
CREATE INDEX idx_jobs_status ON processing_jobs(status);
