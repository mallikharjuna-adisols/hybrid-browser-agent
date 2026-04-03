const express = require('express');
const { asyncHandler } = require('../lib/asyncHandler');
const { signToken } = require('../lib/jwt');
const { requireAuth } = require('../middleware/auth');
const {
  sanitizeUser,
  findUserByEmail,
  createUserWithWorkspace,
  verifyPassword,
  getWorkspaceForUser,
} = require('../services/users');

const router = express.Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { email, fullName, password } = req.body || {};

  if (!email || !fullName || !password) {
    return res.status(400).json({ error: 'email, fullName, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'User already exists.' });
  }

  const created = await createUserWithWorkspace({ email, fullName, password });
  const token = signToken({
    sub: created.user.id,
    email: created.user.email,
    workspaceId: created.workspace.id,
  });

  return res.status(201).json({
    token,
    user: created.user,
    workspace: {
      id: created.workspace.id,
      name: created.workspace.name,
      slug: created.workspace.slug,
    },
  });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const user = await findUserByEmail(email || '');

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const valid = await verifyPassword(user, password || '');
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const workspace = await getWorkspaceForUser(user.id);
  const token = signToken({
    sub: user.id,
    email: user.email,
    workspaceId: workspace ? workspace.id : null,
  });

  return res.json({
    token,
    user: sanitizeUser(user),
    workspace,
  });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await findUserByEmail(req.auth.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const workspace = await getWorkspaceForUser(user.id);
  return res.json({
    user: sanitizeUser(user),
    workspace,
  });
}));

module.exports = router;
