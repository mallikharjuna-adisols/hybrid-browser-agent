const path = require('path');
const dotenv = require('dotenv');
const { chromium } = require('playwright');

dotenv.config({
  path: path.resolve(process.cwd(), '../../.env'),
});

dotenv.config();

const API_URL = process.env.API_INTERNAL_URL || 'http://localhost:4000';
const WORKER_TOKEN = process.env.WORKER_TOKEN || '';
const WORKER_NAME = process.env.WORKER_NAME || `playwright-${process.pid}`;
const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS || 5000);

async function api(pathname, options = {}) {
  const response = await fetch(`${API_URL}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-worker-token': WORKER_TOKEN,
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Worker API request failed.');
  }
  return data;
}

async function executePlan(plan) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const events = [];

  try {
    for (const step of plan.steps) {
      const target = step.target ? step.target.value : '';

      if (step.action === 'navigate') {
        await page.goto(target);
        events.push(`Navigated to ${target}`);
      } else if (step.action === 'click') {
        await page.getByText(target).click();
        events.push(`Clicked text ${target}`);
      } else if (step.action === 'fill') {
        await page.locator(step.selector).fill(target);
        events.push(`Filled ${step.selector}`);
      } else if (step.action === 'wait') {
        await page.waitForTimeout(Number(target || 1000));
        events.push(`Waited ${target}ms`);
      }
    }

    return {
      events,
      finalUrl: page.url(),
      title: await page.title(),
    };
  } finally {
    await browser.close();
  }
}

async function pollForever() {
  if (!WORKER_TOKEN) {
    throw new Error('WORKER_TOKEN is required for the Playwright worker.');
  }

  while (true) {
    try {
      const claimed = await api('/api/internal/worker/jobs/claim', {
        method: 'POST',
        body: JSON.stringify({ workerName: WORKER_NAME }),
      });

      if (!claimed.job) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        continue;
      }

      try {
        const result = await executePlan(claimed.job.plan);

        await api(`/api/internal/worker/jobs/${claimed.job.id}/complete`, {
          method: 'POST',
          body: JSON.stringify(result),
        });

        console.log(`Completed job ${claimed.job.id}`);
      } catch (error) {
        await api(`/api/internal/worker/jobs/${claimed.job.id}/fail`, {
          method: 'POST',
          body: JSON.stringify({ errorMessage: error.message }),
        }).catch(() => {});

        console.error(`Failed job ${claimed.job.id}: ${error.message}`);
      }
    } catch (error) {
      console.error(error.message);
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
}

pollForever().catch((error) => {
  console.error('Worker boot failed');
  console.error(error);
  process.exit(1);
});
