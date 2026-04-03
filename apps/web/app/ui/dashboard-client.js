'use client';

import { useEffect, useState } from 'react';

const starterPlan = JSON.stringify(
  {
    steps: [
      { action: 'navigate', target: { value: 'https://example.com' } },
      { action: 'wait', target: { value: '1000' } },
    ],
  },
  null,
  2
);

function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

export default function DashboardClient({ apiUrl, appName }) {
  const [mode, setMode] = useState('login');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('Bring your auth, providers, workers, and MCP traffic together.');
  const [catalog, setCatalog] = useState([]);
  const [providers, setProviders] = useState([]);
  const [overview, setOverview] = useState(null);
  const [session, setSession] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ fullName: '', email: '', password: '' });
  const [providerForm, setProviderForm] = useState({
    providerKey: '',
    displayName: '',
    baseUrl: '',
    apiKey: '',
    defaultModel: '',
    websiteUrl: '',
    notes: '',
    isEnabled: true,
  });
  const [jobForm, setJobForm] = useState({
    jobName: 'Open example.com',
    planText: starterPlan,
  });

  async function api(path, options = {}) {
      const response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Request failed.');
    }

    return data;
  }

  async function refreshSignedInState(currentToken = token) {
    if (!currentToken) {
      return;
    }

    const headers = { Authorization: `Bearer ${currentToken}` };
    const [me, workspaceResponse, providerResponse] = await Promise.all([
      fetch(`${apiUrl}/api/auth/me`, { headers }).then((res) => res.json()),
      fetch(`${apiUrl}/api/workspace/overview`, { headers }).then((res) => res.json()),
      fetch(`${apiUrl}/api/providers`, { headers }).then((res) => res.json()),
    ]);

    if (me.error) {
      throw new Error(me.error);
    }

    setSession(me);
    setOverview(workspaceResponse);
    setProviders(providerResponse.providers || []);
  }

  useEffect(() => {
    const storedToken = window.localStorage.getItem('orbit_token') || '';
    setToken(storedToken);

    fetch(`${apiUrl}/api/providers/catalog`)
      .then((response) => response.json())
      .then((data) => setCatalog(data.providers || []))
      .catch(() => setStatus('Could not load provider catalog.'));

    if (storedToken) {
      refreshSignedInState(storedToken)
        .then(() => setStatus('Session restored.'))
        .catch((error) => {
          window.localStorage.removeItem('orbit_token');
          setToken('');
          setStatus(error.message);
        });
    }
  }, []);

  async function handleAuthSubmit(event) {
    event.preventDefault();

    const payload = mode === 'login' ? loginForm : registerForm;
    const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const data = await api(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      window.localStorage.setItem('orbit_token', data.token);
      setToken(data.token);
      setStatus(mode === 'login' ? `Welcome back, ${data.user.fullName}.` : 'Workspace created.');
      await refreshSignedInState(data.token);
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function handleProviderSubmit(event) {
    event.preventDefault();

    try {
      await api('/api/providers', {
        method: 'POST',
        body: JSON.stringify(providerForm),
      });
      setStatus(`Saved ${providerForm.displayName}.`);
      setProviderForm({
        providerKey: '',
        displayName: '',
        baseUrl: '',
        apiKey: '',
        defaultModel: '',
        websiteUrl: '',
        notes: '',
        isEnabled: true,
      });
      await refreshSignedInState();
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function deleteProvider(id) {
    try {
      await api(`/api/providers/${id}`, { method: 'DELETE' });
      setStatus('Provider removed.');
      await refreshSignedInState();
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function queueJob(event) {
    event.preventDefault();
    const plan = parseJson(jobForm.planText);

    if (!plan || !Array.isArray(plan.steps)) {
      setStatus('Job plan must be valid JSON with a steps array.');
      return;
    }

    try {
      await api('/api/workspace/jobs', {
        method: 'POST',
        body: JSON.stringify({
          jobName: jobForm.jobName,
          plan,
        }),
      });
      setStatus('Browser job queued for Playwright worker.');
      await refreshSignedInState();
    } catch (error) {
      setStatus(error.message);
    }
  }

  function useProviderTemplate(provider) {
    setProviderForm({
      providerKey: provider.key,
      displayName: provider.name,
      baseUrl: provider.baseUrl,
      apiKey: '',
      defaultModel: provider.defaultModel,
      websiteUrl: provider.websiteUrl,
      notes: provider.note,
      isEnabled: true,
    });
    setStatus(`Loaded ${provider.name} defaults.`);
  }

  function signOut() {
    window.localStorage.removeItem('orbit_token');
    setToken('');
    setSession(null);
    setOverview(null);
    setProviders([]);
    setStatus('Signed out.');
  }

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Production AI SaaS starter</p>
          <h1>{appName}</h1>
          <p className="lead">
            Next.js on the front, Express and JWT in the middle, Postgres underneath,
            Playwright workers in the background, and an MCP bridge on the side.
          </p>
        </div>
        <div className="hero-badges">
          <span>Next.js</span>
          <span>Express</span>
          <span>Postgres</span>
          <span>Playwright</span>
          <span>MCP</span>
          <span>Docker</span>
        </div>
      </section>

      <section className="grid">
        <article className="card auth-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Authentication</p>
              <h2>{mode === 'login' ? 'Log in' : 'Create account'}</h2>
            </div>
            {token ? (
              <button className="ghostButton" onClick={signOut} type="button">
                Sign out
              </button>
            ) : null}
          </div>

          <div className="toggle">
            <button
              className={mode === 'login' ? 'toggleActive' : ''}
              onClick={() => setMode('login')}
              type="button"
            >
              Log in
            </button>
            <button
              className={mode === 'register' ? 'toggleActive' : ''}
              onClick={() => setMode('register')}
              type="button"
            >
              Register
            </button>
          </div>

          <form className="stack" onSubmit={handleAuthSubmit}>
            {mode === 'register' ? (
              <label>
                <span>Full name</span>
                <input
                  value={registerForm.fullName}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, fullName: event.target.value })
                  }
                  placeholder="Asha Patel"
                  required
                />
              </label>
            ) : null}
            <label>
              <span>Email</span>
              <input
                type="email"
                value={mode === 'login' ? loginForm.email : registerForm.email}
                onChange={(event) =>
                  mode === 'login'
                    ? setLoginForm({ ...loginForm, email: event.target.value })
                    : setRegisterForm({ ...registerForm, email: event.target.value })
                }
                placeholder="founder@orbit.app"
                required
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                value={mode === 'login' ? loginForm.password : registerForm.password}
                onChange={(event) =>
                  mode === 'login'
                    ? setLoginForm({ ...loginForm, password: event.target.value })
                    : setRegisterForm({ ...registerForm, password: event.target.value })
                }
                placeholder="Minimum 8 characters"
                required
              />
            </label>
            <button className="primaryButton" type="submit">
              {mode === 'login' ? 'Access workspace' : 'Create workspace'}
            </button>
          </form>

          <div className="statusPanel">{status}</div>
        </article>

        <article className="card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Workspace</p>
              <h2>Control surface</h2>
            </div>
            <span className="pill">{session?.user?.email || 'Signed out'}</span>
          </div>

          <div className="stats">
            <div className="stat">
              <span>Workspace</span>
              <strong>{overview?.workspace?.name || 'Not connected'}</strong>
              <small>{overview?.workspace?.slug || 'Create an account to start'}</small>
            </div>
            <div className="stat">
              <span>Providers</span>
              <strong>{overview?.metrics?.totalProviders || 0}</strong>
              <small>{overview?.metrics?.enabledProviders || 0} enabled</small>
            </div>
            <div className="stat">
              <span>Queued jobs</span>
              <strong>{overview?.metrics?.queuedJobs || 0}</strong>
              <small>Playwright worker polling API</small>
            </div>
          </div>

          <div className="subsection">
            <div className="subsectionHeader">
              <div>
                <p className="eyebrow">Free providers</p>
                <h3>Fastest path to launch</h3>
              </div>
            </div>
            <div className="catalog">
              {catalog.map((provider) => (
                <div className="miniCard" key={provider.key}>
                  <h4>{provider.name}</h4>
                  <p>{provider.note}</p>
                  <small>{provider.defaultModel}</small>
                  <div className="miniActions">
                    <button
                      className="ghostButton"
                      onClick={() => useProviderTemplate(provider)}
                      type="button"
                    >
                      Use template
                    </button>
                    <a className="linkButton" href={provider.signupUrl} target="_blank" rel="noreferrer">
                      Open signup
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="card wide">
          <div className="card-header">
            <div>
              <p className="eyebrow">Provider management</p>
              <h2>Store AI credentials</h2>
            </div>
          </div>

          <form className="formGrid" onSubmit={handleProviderSubmit}>
            {[
              ['providerKey', 'Provider key', 'openrouter'],
              ['displayName', 'Display name', 'OpenRouter'],
              ['baseUrl', 'Base URL', 'https://openrouter.ai/api/v1'],
              ['defaultModel', 'Default model', 'openai/gpt-4o-mini'],
              ['websiteUrl', 'Website URL', 'https://openrouter.ai'],
              ['apiKey', 'API key', 'Paste provider key'],
            ].map(([name, label, placeholder]) => (
              <label key={name}>
                <span>{label}</span>
                <input
                  type={name === 'apiKey' ? 'password' : 'text'}
                  value={providerForm[name]}
                  onChange={(event) => setProviderForm({ ...providerForm, [name]: event.target.value })}
                  placeholder={placeholder}
                  required={name !== 'websiteUrl'}
                />
              </label>
            ))}
            <label className="fullWidth">
              <span>Notes</span>
              <textarea
                rows={4}
                value={providerForm.notes}
                onChange={(event) => setProviderForm({ ...providerForm, notes: event.target.value })}
                placeholder="Routing rules, quotas, or free tier notes"
              />
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={providerForm.isEnabled}
                onChange={(event) =>
                  setProviderForm({ ...providerForm, isEnabled: event.target.checked })
                }
              />
              <span>Enable immediately</span>
            </label>
            <button className="primaryButton" type="submit">
              Save provider
            </button>
          </form>

          <div className="providerList">
            {providers.length ? (
              providers.map((provider) => (
                <div className="miniCard" key={provider.id}>
                  <h4>{provider.displayName}</h4>
                  <p>{provider.providerKey}</p>
                  <small>
                    {provider.defaultModel} · {provider.apiKeyMask}
                  </small>
                  <div className="miniActions">
                    <span className="pill">{provider.isEnabled ? 'Enabled' : 'Disabled'}</span>
                    <button className="dangerButton" onClick={() => deleteProvider(provider.id)} type="button">
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="emptyState">Sign in and save a provider to populate this list.</div>
            )}
          </div>
        </article>

        <article className="card wide">
          <div className="card-header">
            <div>
              <p className="eyebrow">Browser workers</p>
              <h2>Queue Playwright jobs</h2>
            </div>
          </div>

          <form className="stack" onSubmit={queueJob}>
            <label>
              <span>Job name</span>
              <input
                value={jobForm.jobName}
                onChange={(event) => setJobForm({ ...jobForm, jobName: event.target.value })}
                placeholder="Open example.com"
              />
            </label>
            <label>
              <span>Plan JSON</span>
              <textarea
                rows={10}
                value={jobForm.planText}
                onChange={(event) => setJobForm({ ...jobForm, planText: event.target.value })}
              />
            </label>
            <button className="primaryButton" type="submit">
              Queue worker job
            </button>
          </form>

          <div className="jobList">
            {overview?.jobs?.length ? (
              overview.jobs.map((job) => (
                <div className="miniCard" key={job.id}>
                  <h4>{job.jobName}</h4>
                  <p>{job.status}</p>
                  <small>{new Date(job.createdAt).toLocaleString()}</small>
                </div>
              ))
            ) : (
              <div className="emptyState">No jobs yet. Queue one from the panel above.</div>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
