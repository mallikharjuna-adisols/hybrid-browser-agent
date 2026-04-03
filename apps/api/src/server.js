const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { runSchema, query } = require('./db');
const authRoutes = require('./routes/auth');
const providerRoutes = require('./routes/providers');
const workspaceRoutes = require('./routes/workspace');
const internalRoutes = require('./routes/internal');
const mcpRoutes = require('./routes/mcp');

async function start() {
  if (env.autoMigrate) {
    await runSchema();
  }

  await query('SELECT 1');

  const app = express();

  app.use(cors({
    origin: env.corsOrigin.split(',').map((item) => item.trim()),
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      service: 'api',
      env: env.nodeEnv,
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/providers', providerRoutes);
  app.use('/api/workspace', workspaceRoutes);
  app.use('/api/internal', internalRoutes);
  app.use('/api/mcp', mcpRoutes);

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({
      error: error.message || 'Internal server error.',
    });
  });

  app.listen(env.port, () => {
    console.log(`Orbit API listening on ${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start API');
  console.error(error);
  process.exit(1);
});
