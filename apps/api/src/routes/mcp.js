const express = require('express');
const { asyncHandler } = require('../lib/asyncHandler');
const { requireMcpSecret } = require('../middleware/internalAuth');
const { createBrowserJob } = require('../services/jobs');

const router = express.Router();

router.get('/manifest', (req, res) => {
  res.json({
    name: 'orbit-browser-tools',
    version: '1.0.0',
    transport: 'http',
    tools: [
      {
        name: 'run-browser-plan',
        description: 'Queue a Playwright browser plan for asynchronous execution.',
        inputSchema: {
          type: 'object',
          properties: {
            jobName: { type: 'string' },
            workspaceId: { type: 'string' },
            plan: { type: 'object' },
          },
          required: ['jobName', 'plan'],
        },
      },
    ],
  });
});

router.post('/tools/run-browser-plan', requireMcpSecret, asyncHandler(async (req, res) => {
  const { jobName, workspaceId = null, plan } = req.body || {};

  if (!jobName || !plan || !Array.isArray(plan.steps)) {
    return res.status(400).json({ error: 'jobName and plan.steps are required.' });
  }

  const job = await createBrowserJob({
    workspaceId,
    source: 'mcp',
    jobName,
    plan,
  });

  return res.status(202).json({
    accepted: true,
    job,
  });
}));

module.exports = router;
