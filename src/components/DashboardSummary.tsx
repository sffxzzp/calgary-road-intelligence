export function DashboardSummary({
  tab,
  data,
  summaryPlan,
  plan,
  config,
  activeConfig,
  controlVisibility,
}: any) {
  return (
    <>
      {tab === "Data & method" && (
        <div className="dashboard-summary method-summary">
          <div>
            <span>TRAFFIC EVENT RECORDS</span>
            <strong>{data.audit.events.toLocaleString()}</strong>
            <small>
              UTC-year 2025 · {data.audit.duplicates} duplicates removed
            </small>
          </div>
          <div>
            <span>ROAD SEGMENTS</span>
            <strong>{data.audit.roads.toLocaleString()}</strong>
            <small>City street-centreline snapshot</small>
          </div>
          <div>
            <span>WEATHER OBSERVATIONS</span>
            <strong>{data.weather.audit.hours.toLocaleString()}</strong>
            <small>Hourly · Calgary International Airport</small>
          </div>
          <div>
            <span>DATA COVERAGE</span>
            <strong className="summary-context">2025 snapshot</strong>
            <small>Traffic · roads · weather · 2024 traffic volumes</small>
          </div>
        </div>
      )}
      <div
        className="dashboard-summary"
        hidden={["Forward outlook", "Data & method", "Agent"].includes(tab)}
      >
        <div
          hidden={["Historical evaluation"].includes(
            tab,
          )}
        >
          <span>EVENT RECORDS</span>
          <strong>{(summaryPlan ?? plan).selected.toLocaleString()}</strong>
          <small>in selected period</small>
        </div>
        <div
          hidden={["Historical evaluation"].includes(
            tab,
          )}
        >
          <span>ACTIVE LOCATIONS</span>
          <strong>{(summaryPlan ?? plan).rows.length.toLocaleString()}</strong>
          <small>road segments / areas</small>
        </div>
        <div hidden={["Evidence", "Weather context"].includes(tab)}>
          <span>INSPECTION CAPACITY</span>
          <strong>{plan.top.length}</strong>
          <small>prioritized locations</small>
        </div>
        <div>
          <span>ANALYSIS WINDOW</span>
          <strong className="summary-context">
            {config.period} · {config.category}
          </strong>
          <small className="summary-date">
            {["Historical evaluation"].includes(tab)
              ? "Fixed historical evaluation windows"
              : `${config.start} ~ ${activeConfig.end}`}
            {controlVisibility.weather && config.weather !== "All weather"
              ? ` · ${config.weather}`
              : ""}
          </small>
        </div>
      </div>
    </>
  );
}
