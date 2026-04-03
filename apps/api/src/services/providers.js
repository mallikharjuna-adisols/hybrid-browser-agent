const { query } = require('../db');

function serializeProvider(row) {
  return {
    id: row.id,
    providerKey: row.provider_key,
    displayName: row.display_name,
    baseUrl: row.base_url,
    apiKeyMask: row.api_key ? `${row.api_key.slice(0, 4)}...${row.api_key.slice(-4)}` : '',
    defaultModel: row.default_model,
    websiteUrl: row.website_url,
    notes: row.notes,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listProviders(workspaceId) {
  const result = await query(
    `
      SELECT *
      FROM ai_providers
      WHERE workspace_id = $1
      ORDER BY updated_at DESC, created_at DESC
    `,
    [workspaceId]
  );

  return result.rows.map(serializeProvider);
}

async function upsertProvider(workspaceId, payload) {
  const result = await query(
    `
      INSERT INTO ai_providers (
        workspace_id,
        provider_key,
        display_name,
        base_url,
        api_key,
        default_model,
        website_url,
        notes,
        is_enabled
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (workspace_id, provider_key)
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        base_url = EXCLUDED.base_url,
        api_key = EXCLUDED.api_key,
        default_model = EXCLUDED.default_model,
        website_url = EXCLUDED.website_url,
        notes = EXCLUDED.notes,
        is_enabled = EXCLUDED.is_enabled,
        updated_at = NOW()
      RETURNING *
    `,
    [
      workspaceId,
      payload.providerKey,
      payload.displayName,
      payload.baseUrl,
      payload.apiKey,
      payload.defaultModel,
      payload.websiteUrl || '',
      payload.notes || '',
      payload.isEnabled !== false,
    ]
  );

  return serializeProvider(result.rows[0]);
}

async function deleteProvider(workspaceId, providerId) {
  const result = await query(
    'DELETE FROM ai_providers WHERE workspace_id = $1 AND id = $2 RETURNING id',
    [workspaceId, providerId]
  );
  return Boolean(result.rowCount);
}

module.exports = {
  listProviders,
  upsertProvider,
  deleteProvider,
};
