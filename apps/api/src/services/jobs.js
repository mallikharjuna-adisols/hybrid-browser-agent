const { browserJobStatuses } = require('@orbit/shared');
const { query, transaction } = require('../db');

function serializeJob(row) {
  return {
    id: row.id,
    source: row.source,
    jobName: row.job_name,
    status: row.status,
    plan: row.plan,
    result: row.result,
    errorMessage: row.error_message,
    lockedBy: row.locked_by,
    createdAt: row.created_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

async function createBrowserJob({ workspaceId = null, userId = null, source = 'dashboard', jobName, plan }) {
  const result = await query(
    `
      INSERT INTO browser_jobs (workspace_id, created_by_user_id, source, job_name, plan, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [workspaceId, userId, source, jobName, JSON.stringify(plan), browserJobStatuses.pending]
  );

  return serializeJob(result.rows[0]);
}

async function listJobs(workspaceId) {
  const result = await query(
    `
      SELECT *
      FROM browser_jobs
      WHERE workspace_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `,
    [workspaceId]
  );

  return result.rows.map(serializeJob);
}

async function claimNextJob(workerName) {
  return transaction(async (client) => {
    const selection = await client.query(
      `
        SELECT *
        FROM browser_jobs
        WHERE status = $1
        ORDER BY created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `,
      [browserJobStatuses.pending]
    );

    if (!selection.rows[0]) {
      return null;
    }

    const job = selection.rows[0];
    const updated = await client.query(
      `
        UPDATE browser_jobs
        SET status = $1,
            locked_by = $2,
            locked_at = NOW(),
            started_at = NOW(),
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `,
      [browserJobStatuses.running, workerName, job.id]
    );

    return serializeJob(updated.rows[0]);
  });
}

async function completeJob(jobId, payload) {
  const result = await query(
    `
      UPDATE browser_jobs
      SET status = $1,
          result = $2,
          completed_at = NOW(),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `,
    [browserJobStatuses.completed, JSON.stringify(payload), jobId]
  );

  return result.rows[0] ? serializeJob(result.rows[0]) : null;
}

async function failJob(jobId, errorMessage) {
  const result = await query(
    `
      UPDATE browser_jobs
      SET status = $1,
          error_message = $2,
          completed_at = NOW(),
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `,
    [browserJobStatuses.failed, errorMessage, jobId]
  );

  return result.rows[0] ? serializeJob(result.rows[0]) : null;
}

module.exports = {
  createBrowserJob,
  listJobs,
  claimNextJob,
  completeJob,
  failJob,
};
