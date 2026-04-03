const express = require('express');
const { freeProviders } = require('@orbit/shared');
const { asyncHandler } = require('../lib/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { listProviders, upsertProvider, deleteProvider } = require('../services/providers');

const router = express.Router();

router.get('/catalog', (req, res) => {
  res.json({ providers: freeProviders });
});

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const providers = await listProviders(req.auth.workspaceId);
  res.json({ providers });
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { providerKey, displayName, baseUrl, apiKey, defaultModel } = req.body || {};

  if (!providerKey || !displayName || !baseUrl || !apiKey || !defaultModel) {
    return res.status(400).json({
      error: 'providerKey, displayName, baseUrl, apiKey, and defaultModel are required.',
    });
  }

  const provider = await upsertProvider(req.auth.workspaceId, req.body);
  return res.status(201).json({ provider });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const deleted = await deleteProvider(req.auth.workspaceId, req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Provider not found.' });
  }
  return res.status(204).send();
}));

module.exports = router;
