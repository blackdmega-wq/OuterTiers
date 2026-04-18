export default function ApiDocs() {
  return (
    <div className="api-docs-page">
      <div className="api-docs-container">
        <h1>API Documentation</h1>
        <p className="api-intro">The OuterTiers public API allows you to access player rankings and tier data programmatically.</p>

        <div className="api-section">
          <h2>Base URL</h2>
          <code className="api-code">https://api.outertiers.net/v1</code>
        </div>

        <div className="api-section">
          <h2>Endpoints</h2>
          <div className="api-endpoint">
            <div className="endpoint-header">
              <span className="method get">GET</span>
              <code>/rankings/overall</code>
            </div>
            <p>Returns the overall rankings sorted by points.</p>
          </div>
          <div className="api-endpoint">
            <div className="endpoint-header">
              <span className="method get">GET</span>
              <code>/rankings/:category</code>
            </div>
            <p>Returns rankings for a specific game mode. Categories: vanilla, uhc, pot, nethop, smp, sword, axe, ltms</p>
          </div>
          <div className="api-endpoint">
            <div className="endpoint-header">
              <span className="method get">GET</span>
              <code>/player/:username</code>
            </div>
            <p>Returns detailed stats for a specific player.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
