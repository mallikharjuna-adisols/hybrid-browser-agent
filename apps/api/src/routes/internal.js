const express = require('express');
const { asyncHandler } = require('../lib/asyncHandler');
const { requireWorkerToken } = require('../middleware/internalAuth');
const { claimNextJob, completeJob, failJob } = require('../services/jobs');

const router = express.Router();

router.post('/worker/jobs/claim', requireWorkerToken, asyncHandler(async (req, res) => {
  const workerName = req.body && req.body.workerName ? req.body.workerName : 'worker';
  const job = await claimNextJob(workerName);
  return res.json({ job });
}));

router.post('/worker/jobs/:id/complete', requireWorkerToken, asyncHandler(async (req, res) => {
  const job = await completeJob(req.params.id, req.body || {});
  return res.json({ job });
}));

router.post('/worker/jobs/:id/fail', requireWorkerToken, asyncHandler(async (req, res) => {
  const job = await failJob(req.params.id, (req.body && req.body.errorMessage) || 'Unknown worker error');
  return res.json({ job });
}));

module.exports = router;
