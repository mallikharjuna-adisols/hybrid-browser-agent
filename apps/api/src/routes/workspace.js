const express = require('express');
const { asyncHandler } = require('../lib/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { query } = require('../db');
const { listJobs, createBrowserJob } = require('../services/jobs');

const router = express.Router();

router.get('/overview', requireAuth, asyncHandler(async (req, res) => {
  const [workspaceResult, providersResult, jobs] = await Promise.all([
    query('SELECT * FROM workspaces WHERE id = $1 LIMIT 1', [req.auth.workspaceId]),
    query(
      `
        SELECT
          COUNT(*)::INT AS total,
          COUNT(*) FILTER (WHERE is_enabled = TRUE)::INT AS enabled
        FROM ai_providers
        WHERE workspace_id = $1
      `,
      [req.auth.workspaceId]
    ),
    listJobs(req.auth.workspaceId),
  ]);

  const workspace = workspaceResult.rows[0] || null;
  const providerStats = providersResult.rows[0] || { total: 0, enabled: 0 };

  res.json({
    workspace,
    metrics: {
      totalProviders: providerStats.total,
      enabledProviders: providerStats.enabled,
      queuedJobs: jobs.filter((job) => job.status === 'pending').length,
    },
    jobs,
  });
}));

router.post('/jobs', requireAuth, asyncHandler(async (req, res) => {
  const { jobName, plan } = req.body || {};

  if (!jobName || !plan || !Array.isArray(plan.steps)) {
    return res.status(400).json({ error: 'jobName and plan.steps are required.' });
  }

  const job = await createBrowserJob({
    workspaceId: req.auth.workspaceId,
    userId: req.auth.sub,
    source: 'dashboard',
    jobName,
    plan,
  });

  return res.status(201).json({ job });
}));

module.exports = router;
