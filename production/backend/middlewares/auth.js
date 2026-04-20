const jwt = require('jsonwebtoken');
const db = require('../services/db');

/**
 * Middleware de Autenticação JWT com verificação de Assinatura
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido.' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário e status de assinatura no Postgres
    const userQuery = await db.query(`
      SELECT u.*, s.status as sub_status 
      FROM users u 
      LEFT JOIN subscriptions s ON u.id = s.user_id 
      WHERE u.id = $1`, [decoded.userId]);

    const user = userQuery.rows[0];

    if (!user) return res.status(401).json({ error: 'Usuário inválido.' });

    // Bloqueio se a assinatura não estiver ativa (para rotas de IA)
    if (req.path.includes('/process') && user.sub_status !== 'active') {
      return res.status(403).json({ error: 'Assinatura inativa. Regularize o pagamento para usar a IA.' });
    }

    // Bloqueio por quota
    if (user.current_quota_minutes >= user.max_quota_minutes) {
      return res.status(403).json({ error: 'Cota mensal de IA esgotada.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};
