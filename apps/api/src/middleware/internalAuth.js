const env = require('../config/env');

function requireWorkerToken(req, res, next) {
  if (!env.workerToken || req.headers['x-worker-token'] !== env.workerToken) {
    return res.status(401).json({ error: 'Unauthorized worker.' });
  }

  return next();
}

function requireMcpSecret(req, res, next) {
  if (!env.mcpSharedSecret || req.headers['x-mcp-secret'] !== env.mcpSharedSecret) {
    return res.status(401).json({ error: 'Unauthorized MCP request.' });
  }

  return next();
}

module.exports = {
  requireWorkerToken,
  requireMcpSecret,
};
