export default function ApiDocs() {
  const endpoints = [
    {
      method: 'GET',
      path: '/rankings/overall',
      desc: 'Returns the overall rankings sorted by total points.',
      params: [],
      color: '#58a6ff',
    },
    {
      method: 'GET',
      path: '/rankings/:category',
      desc: 'Returns rankings for a specific game mode.',
      params: ['vanilla', 'uhc', 'pot', 'nethop', 'smp', 'sword', 'axe', 'mace', 'ltms', 'nodebuff'],
      color: '#7ee787',
    },
    {
      method: 'GET',
      path: '/player/:username',
      desc: 'Returns detailed tier stats and overall rank for a specific player.',
      params: [],
      color: '#ffa657',
    },
  ];

  return (
    <div className="apidocs-page">
      <div className="apidocs-hero">
        <div className="apidocs-hero-glow" />
        <div className="apidocs-hero-glow2" />
        <div className="apidocs-hero-inner animate-fade-down">
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
            <div
              key={i}
              className="apidocs-endpoint-card animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s`, '--ep-color': ep.color } as React.CSSProperties}
            >
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

        <div className="apidocs-response-section animate-fade-up" style={{ animationDelay: '0.28s' }}>
          <div className="apidocs-section-label" style={{ marginBottom: 14 }}>Example Response</div>
          <div className="apidocs-response-wrapper">
            <div className="apidocs-response-topbar">
              <span className="apidocs-response-dot" style={{ background: '#ff5f57' }} />
              <span className="apidocs-response-dot" style={{ background: '#febc2e' }} />
              <span className="apidocs-response-dot" style={{ background: '#28c840' }} />
              <span className="apidocs-response-lang">JSON</span>
            </div>
            <pre
              className="apidocs-response-block"
              dangerouslySetInnerHTML={{ __html: `{
  <span class="json-key">"username"</span>: <span class="json-str">"PlayerName"</span>,
  <span class="json-key">"region"</span>:   <span class="json-str">"EU"</span>,
  <span class="json-key">"points"</span>:   <span class="json-num">2450</span>,
  <span class="json-key">"rank"</span>:     <span class="json-num">1</span>,
  <span class="json-key">"tiers"</span>: {
    <span class="json-key">"vanilla"</span>: <span class="json-str">"HT3"</span>,
    <span class="json-key">"uhc"</span>:     <span class="json-str">"HT2"</span>,
    <span class="json-key">"pot"</span>:     <span class="json-str">"HT1"</span>,
    <span class="json-key">"sword"</span>:   <span class="json-str">"LT1"</span>
  }
}` }}
            />
          </div>
        </div>

        <div className="apidocs-note-card animate-fade-up" style={{ animationDelay: '0.36s' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1, color: '#5ba4f5' }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>The OuterTiers API is currently in private beta. Public access will be available soon. Join the Discord for updates.</p>
        </div>
      </div>
    </div>
  );
}
