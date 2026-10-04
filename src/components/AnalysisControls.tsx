import { useEffect, useState } from "react";
import type { AnalysisConfig } from "../domain/types";
import { WEATHER_OPTIONS } from "../weather.mjs";
export function AnalysisControls({
  tab,
  config,
  setConfig,
  data,
  controlVisibility,
  plan,
  savePlan,
  change,
}: {
  tab: string;
  config: AnalysisConfig;
  setConfig: (config: AnalysisConfig) => void;
  data: any;
  controlVisibility: ReturnType<typeof import("../domain/pages").pageControls>;
  plan: any;
  savePlan: () => void;
  change: any;
}) {
  const scope = {
    start: config.start,
    end: config.end,
    period: config.period,
    category: config.category,
    weather: config.weather,
  };
  const [draft, setDraft] = useState(scope);
  useEffect(() => {
    setDraft({
      start: config.start,
      end: config.end,
      period: config.period,
      category: config.category,
      weather: config.weather,
    });
  }, [
    config.start,
    config.end,
    config.period,
    config.category,
    config.weather,
  ]);
  const pending = Object.keys(scope).some(
    (key) =>
      draft[key as keyof typeof draft] !== scope[key as keyof typeof scope],
  );
  const valid = Boolean(
    draft.start &&
    draft.end &&
    draft.start <= draft.end &&
    draft.start >= data.audit.first &&
    draft.end <= data.audit.last,
  );
  return (
    <>
      {" "}
      <div
        hidden={["Forward outlook", "Data & method", "Agent"].includes(tab)}
        className={`page-controls ${tab === "Evidence" ? "evidence-controls" : ""}`}
      >
        <details className="dashboard-controls">
          <summary>Analysis controls</summary>
          <div className="panel-heading">
            Analysis controls <span>01</span>
          </div>
          <div className="panel-subtitle">CONFIGURE THE MISSION</div>
          <div className="control-scope">
            <h3>Evidence scope</h3>
            {controlVisibility.dates && (
              <>
                <label>Date window</label>
                <div className="dates">
                  <input
                    aria-label="Start date"
                    type="date"
                    min={data.audit.first}
                    max={data.audit.last}
                    value={draft.start}
                    onChange={(e) =>
                      e.target.value &&
                      setDraft({
                        ...draft,
                        start: e.target.value,
                        end:
                          e.target.value > draft.end
                            ? e.target.value
                            : draft.end,
                      })
                    }
                  />
                  <input
                    aria-label="End date"
                    type="date"
                    min={draft.start}
                    max={data.audit.last}
                    value={draft.end}
                    onChange={(e) =>
                      e.target.value &&
                      setDraft({ ...draft, end: e.target.value })
                    }
                  />
                </div>
              </>
            )}
            {controlVisibility.period && (
              <>
                <label>Time of day · Calgary local</label>
                <select
                  value={draft.period}
                  onChange={(e) =>
                    setDraft({ ...draft, period: e.target.value })
                  }
                >
                  {[
                    "All hours",
                    "Morning peak",
                    "Evening peak",
                    "Night",
                    "Weekend",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </>
            )}
            {controlVisibility.category && (
              <>
                <label>Event type</label>
                <select
                  value={draft.category}
                  onChange={(e) =>
                    setDraft({ ...draft, category: e.target.value })
                  }
                >
                  {["All types", ...Object.keys(data.audit.categories)].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
              </>
            )}
            {controlVisibility.weather && (
              <>
                <label>Weather context</label>
                <select
                  aria-label="Weather condition"
                  value={draft.weather}
                  onChange={(e) =>
                    setDraft({ ...draft, weather: e.target.value })
                  }
                >
                  {WEATHER_OPTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <p className="hint">
                  Airport hourly observations; below freezing does not mean road
                  ice.
                </p>
              </>
            )}
            <div className="scope-apply-actions">
              <button
                className="primary"
                disabled={!pending || !valid}
                onClick={() => setConfig({ ...config, ...draft })}
              >
                Apply evidence scope
              </button>
              <button disabled={!pending} onClick={() => setDraft(scope)}>
                Reset changes
              </button>
              {pending && (
                <span role="status">
                  {valid
                    ? "Changes pending · apply to update analysis"
                    : "Choose dates within the available data range"}
                </span>
              )}
            </div>
          </div>
          <div
            className="control-priority"
            hidden={!controlVisibility.capacity}
          >
            <h3>Ranking & capacity</h3>
            <label>
              Event-type weighting
              <select
                aria-label="Historical weighting"
                value={
                  config.typeWeightMode ??
                  (config.typeWeights ? "learned" : "equal")
                }
                onChange={(e) =>
                  setConfig({
                    ...config,
                    typeWeightMode: e.target.value as "equal" | "learned",
                  })
                }
              >
                <option value="equal">Equal event weights</option>
                <option value="learned" disabled={!config.typeWeights}>
                  Learned type weights · experimental
                </option>
              </select>
            </label>
            {!config.typeWeights && (
              <p className="hint">
                Generate a type-weighted forecast and import its learned weights
                to enable the experimental historical mode.
              </p>
            )}
            {config.typeWeights && config.typeWeightMode !== "equal" && (
              <div className="notice">
                <strong>Experimental learned type weights</strong>
                <p>
                  Applied to frequency only · {config.typeWeightSource?.horizon}
                  -day collision model · trained through 2025. Not severity
                  weights.
                </p>
                {Object.entries(config.typeWeights).map(([type, w]) => (
                  <p key={type}>
                    {type}: {w.toFixed(2)}×
                  </p>
                ))}
                <button
                  onClick={() =>
                    setConfig({
                      ...config,
                      typeWeightMode: "equal",
                    })
                  }
                >
                  Restore equal event weights
                </button>
              </div>
            )}
            {controlVisibility.capacity && (
              <>
                <label>
                  Inspection capacity <b>{config.capacity} locations</b>
                </label>
                <input
                  aria-label="Inspection capacity"
                  type="range"
                  min="5"
                  max="40"
                  value={config.capacity}
                  onChange={(e) =>
                    setConfig({ ...config, capacity: +e.target.value })
                  }
                />
              </>
            )}
            {controlVisibility.weights && (
              <>
                <label>Priority mix</label>
                <p className="hint">
                  Transparent, adjustable signals. Scores indicate priority
                  within this view.
                </p>
                {["Event frequency", "Recent growth", "Recurring dates"].map(
                  (s, i) => (
                    <div className="weight" key={s}>
                      <label>
                        {s}
                        <b>{Math.round(config.weights[i] * 100)}</b>
                      </label>
                      <input
                        aria-label={s}
                        type="range"
                        min="0"
                        max="100"
                        value={config.weights[i] * 100}
                        onChange={(e) => {
                          const w = [...config.weights];
                          w[i] = +e.target.value / 100;
                          setConfig({ ...config, weights: w });
                        }}
                      />
                    </div>
                  ),
                )}
                {controlVisibility.weights && plan.weightFallback && (
                  <p className="notice">
                    No active scoring weights. Using the event-count baseline.
                  </p>
                )}
                {controlVisibility.weights && !plan.complete && (
                  <p className="notice">
                    Recent growth is disabled: select at least 60 days for
                    equal-window comparison.
                  </p>
                )}
              </>
            )}
            {controlVisibility.save && (
              <>
                <button className="primary" onClick={savePlan}>
                  Save current plan for comparison
                </button>
                {change && (
                  <div className="comparison">
                    <strong>
                      {change.entered.length} in · {change.exited.length} out
                    </strong>
                    <p>
                      {change.retained} locations retained from saved plan.
                      Adjust Analysis controls above to compare.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="source-note">
            SOURCE QUALITY
            <div>
              {(data.audit.matchRate * 100).toFixed(1)}% within 50 m of a road
            </div>
            <p>
              Nearest-road approximation; parallel roads and intersections need
              review. Events include unverified reports.
            </p>
          </div>
        </details>
      </div>
    </>
  );
}
