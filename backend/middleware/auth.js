/**
 * Auth & Quota Middleware
 * Prevents API costs from scaling out of control by limiting AI usage per user.
 */

const userQuotas = {
  'user_demo': {
    usedMinutes: 45,
    maxMinutes: 600 // 10h per month limit
  }
};

module.exports = (req, res, next) => {
  // Simple token simulation
  const userId = req.headers['x-user-id'] || 'user_demo';
  const quota = userQuotas[userId];

  if (!quota) {
    return res.status(401).json({ error: 'Usuário não autorizado.' });
  }

  // Cost Control: Check if user has AI budget remaining
  if (quota.usedMinutes >= quota.maxMinutes) {
    return res.status(403).json({ 
      error: 'Cota de IA esgotada.', 
      message: 'Você atingiu o limite de 10h de dublagem mensal.' 
    });
  }

  req.userId = userId;
  next();
};
