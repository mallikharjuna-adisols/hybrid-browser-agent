const bcrypt = require('bcryptjs');
const { query, transaction } = require('../db');

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    createdAt: user.created_at,
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

async function findUserByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase()]);
  return result.rows[0] || null;
}

async function createUserWithWorkspace({ email, fullName, password }) {
  const passwordHash = await bcrypt.hash(password, 10);

  return transaction(async (client) => {
    const userResult = await client.query(
      `
        INSERT INTO users (email, full_name, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [email.toLowerCase(), fullName, passwordHash]
    );

    const user = userResult.rows[0];
    const slug = `${slugify(fullName || email.split('@')[0] || 'workspace')}-${user.id.slice(0, 8)}`;
    const workspaceResult = await client.query(
      `
        INSERT INTO workspaces (owner_user_id, name, slug)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [user.id, `${fullName.split(' ')[0] || 'New'} Workspace`, slug]
    );

    return {
      user: sanitizeUser(user),
      workspace: workspaceResult.rows[0],
    };
  });
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password_hash);
}

async function getWorkspaceForUser(userId) {
  const result = await query(
    `
      SELECT *
      FROM workspaces
      WHERE owner_user_id = $1
      ORDER BY created_at ASC
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

module.exports = {
  sanitizeUser,
  findUserByEmail,
  createUserWithWorkspace,
  verifyPassword,
  getWorkspaceForUser,
};
