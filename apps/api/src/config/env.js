const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: path.resolve(process.cwd(), '../../.env'),
});

dotenv.config();

const numberValue = (input, fallback) => {
  const parsed = Number(input);
  return Number.isFinite(parsed) ? parsed : fallback;
};

module.exports = {
  port: numberValue(process.env.PORT, 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'replace-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  workerToken: process.env.WORKER_TOKEN || '',
  mcpSharedSecret: process.env.MCP_SHARED_SECRET || '',
  autoMigrate: process.env.AUTO_MIGRATE !== 'false',
};
