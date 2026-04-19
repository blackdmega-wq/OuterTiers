export default function ApiDocs() {
  const endpoints = [
    {
      method: 'GET',
      path: '/rankings/overall',
      desc: 'Returns the overall rankings sorted by total points.',
      params: [],
    },
    {
      method: 'GET',
      path: '/rankings/:category',
      desc: 'Returns rankings for a specific game mode.',
      params: ['vanilla', 'uhc', 'pot', 'nethop', 'smp', 'sword', 'axe', 'mace', 'ltms', 'nodebuff'],
    },
    {
      method: 'GET',
      path: '/player/:username',
      desc: 'Returns detailed tier stats and overall rank for a specific player.',
      params: [],
    },
  ];

  return (
    <div className="apidocs-page">
      <div className="apidocs-hero">
        <div className="apidocs-hero-glow" />
        <div className="apidocs-hero-inner">
          <div className="apidocs-eyebrow">
            <span className="apidocs-eyebrow-dot" />
            Public REST API
          </div>
          <h1 className="apidocs-title">API Documentation</h1>
          <p className="apidocs-sub">
            Access OuterTiers player rankings and tier data programmatically.
            All endpoints return JSON. No authentication required.
          </p>
          <div className="apidocs-base-card">
            <span className="apidocs-base-label">Base URL</span>
            <code className="apidocs-base-url">https://api.outertiers.net/v1</code>
          </div>
        </div>
      </div>

      <div className="apidocs-container">
        <div className="apidocs-section-label">Endpoints</div>

        <div className="apidocs-endpoints">
          {endpoints.map((ep, i) => (
            <div key={i} className="apidocs-endpoint-card">
              <div className="apidocs-endpoint-header">
                <span className="apidocs-method">GET</span>
                <code className="apidocs-path">{ep.path}</code>
              </div>
              <p className="apidocs-desc">{ep.desc}</p>
              {ep.params.length > 0 && (
                <div className="apidocs-params">
                  <span className="apidocs-params-label">Categories:</span>
                  <div className="apidocs-params-chips">
                    {ep.params.map(p => (
                      <span key={p} className="apidocs-param-chip">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="apidocs-response-section">
          <div className="apidocs-section-label" style={{ marginBottom: 14 }}>Example Response</div>
          <pre className="apidocs-response-block">{`{
  "username": "PlayerName",
  "region": "EU",
  "points": 2450,
  "rank": 1,
  "tiers": {
    "vanilla": "HT3",
    "uhc": "HT2",
    "pot": "HT1",
    "sword": "LT1"
  }
}`}</pre>
        </div>

        <div className="apidocs-note-card">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1, color: '#5ba4f5' }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>The OuterTiers API is currently in private beta. Public access will be available soon. Join the Discord for updates.</p>
        </div>
      </div>
    </div>
  );
}
