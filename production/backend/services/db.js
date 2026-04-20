const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper para log de queries em produção
module.exports = {
  query: (text, params) => {
    const start = Date.now();
    return pool.query(text, params).then(res => {
      const duration = Date.now() - start;
      console.log(`[DB] Executed query in ${duration}ms`, { text, rows: res.rowCount });
      return res;
    });
  },
  pool
};
