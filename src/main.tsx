import { AgentPage } from "./AgentPage";
import { useSavedPlan } from "./hooks/useSavedPlan";
import {
  useDashboardNavigation,
  dashboardPages as pages,
} from "./hooks/useDashboardNavigation";
import { usePlayback } from "./hooks/usePlayback";
import { EvidencePage } from "./components/EvidencePage";
import { MapPreview } from "./components/MapPreview";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { DashboardSummary } from "./components/DashboardSummary";
import { AnalysisControls } from "./components/AnalysisControls";
import { pageControls } from "./domain/pages";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useDataset } from "./hooks/useDataset";
import { useEventMap } from "./hooks/useEventMap";
import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import "./command.css";

import { defaults, rank, compare, evaluate, selectEvents } from "./analysis.mjs";
import { analysisScope, resolveFocus } from "./domain/scope.mjs";
import { DataMethodPage } from "./DataMethodPage";

import { ForecastPanel } from "./ForecastPanel";

import { WeatherPanel } from "./WeatherPanel";

import { ComparisonPanel, OptimizationPanel } from "./DecisionPanels";
import { useWorkerTask } from "./hooks/useWorkerTask";
import type {
  WorkerInput,
  OptimizationResult,
  RankedLocation,
  PointMotion,
} from "./domain/types";
type Row = RankedLocation;
function App() {
  const { page: tab, navigate: setTab } = useDashboardNavigation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle(
      "sidebar-collapsed",
      sidebarCollapsed,
    );
    try {
      localStorage.setItem("sidebar-collapsed", String(sidebarCollapsed));
    } catch {}
    return () => document.documentElement.classList.remove("sidebar-collapsed");
  }, [sidebarCollapsed]);
  const {
    result: optimization,
    busy: optimizing,
    error: optimizationError,
    run: runTask,
  } = useWorkerTask<WorkerInput, OptimizationResult>(
    () =>
      new Worker(new URL("./decision-worker.ts", import.meta.url), {
        type: "module",
      }),
  );
  const { data, error, warning, retry } = useDataset();
  const {
    snapshot: savedSnapshot,
    notice: savedNotice,
    save: saveSnapshot,
    clear: clearSaved,
  } = useSavedPlan(data);
  const saved = savedSnapshot?.plan ?? null,
    savedConfig = savedSnapshot?.config ?? null;
  const [config, setConfig] = useState(defaults),
    [selected, setSelected] = useState(""),
    [mapReady, setMapReady] = useState(false),
    [mapNotice, setMapNotice] = useState(""),
    [expanded, setExpanded] = useState(false),
    [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    if (data)
      setConfig((c) => ({
        ...c,
        start: new Date(
          Date.parse(data.audit.last + "T00:00:00Z") - 89 * 86400000,
        )
          .toISOString()
          .slice(0, 10),
        end: data.audit.last,
      }));
  }, [data]);
  const {
    playing,
    setPlaying,
    loop,
    setLoop,
    playDate,
    setPlayDate,
    speed,
    setSpeed,
    togglePlayback,
    timelineDays,
    timelinePosition,
  } = usePlayback(config);
  const mapShell = useRef<HTMLDivElement>(null),
    container = useRef<HTMLDivElement>(null),
    map = useRef<import("maplibre-gl").Map | null>(null),
    pointMotion = useRef<Map<string, PointMotion>>(new Map()),
    fadeFrame = useRef<number>(0);
  useEffect(() => {
    if (tab !== "Map preview") {
      setPlaying(false);
      setExpanded(false);
    } else requestAnimationFrame(() => map.current?.resize());
  }, [tab]);
  const controlVisibility = pageControls(tab);
  const activeConfig = useMemo(
    () => analysisScope(config, tab, playDate),
    [config, tab, playDate],
  );
  const summaryPlan = useMemo(
    () =>
      data && tab === "Weather context"
        ? rank(data.events, data.locations, {
            ...activeConfig,
            weather: "All weather",
          })
        : null,
    [data, activeConfig, tab],
  );
  const plan = useMemo(
    () => (data ? rank(data.events, data.locations, activeConfig) : null),
    [data, activeConfig],
  );
  const evaluation = useMemo(
    () => (data ? evaluate(data.events, data.locations, config) : []),
    [data, config],
  );
  const focus = plan ? resolveFocus(plan.rows, selected) : null;
  const change = saved && plan ? compare(saved, plan) : null;
  useEventMap({
    data,
    active: tab === "Map preview",
    container,
    map,
    plan,
    mapReady,
    setMapReady,
    setMapNotice,
    setSelected,
    pointMotion,
    fadeFrame,
    mapShell,
  });
  useEffect(() => {
    const update = () =>
      setFullscreen(document.fullscreenElement === mapShell.current);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("fullscreenchange", update);
    window.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("fullscreenchange", update);
      window.removeEventListener("keydown", key);
    };
  }, []);
  useEffect(() => {
    const shell = mapShell.current;
    if (!shell) return;
    const observer = new ResizeObserver(() => map.current?.resize());
    observer.observe(shell);
    return () => observer.disconnect();
  }, [data]);
  useEffect(() => {
    if (expanded) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [expanded]);
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await mapShell.current?.requestFullscreen();
    } catch {
      setExpanded(true);
    }
  }
  function savePlan() {
    if (data && plan) saveSnapshot(activeConfig);
  }
  function runOptimization() {
    if (!data || optimizing) return;
    runTask({
      events: data.events,
      locations: data.locations,
      config: { ...config, weights: [...config.weights] },
    });
  }
  function exportReport() {
    if (!data || !plan) return;
    const report = {
      version: "inspection-report-v1",
      createdAt: new Date().toISOString(),
      audit: data.audit,
      weatherAudit: data.weather.audit,
      config: activeConfig,
      shortlist: plan!.top.map((r: Row) => ({
        id: r.id,
        name: r.name,
        position: r.position,
        count: r.count,
        weightedActivity: r.weightedActivity,
        days: r.days,
        recent: r.recent,
        previous: r.previous,
        score: r.score,
        contributions: r.contributions,
        recordIds: r.records.map((e) => e.id),
        matchReview: r.records.map((e) => ({
          id: e.id,
          ...e.matchQuality,
        })),
      })),
      savedConfig,
      savedShortlist: saved?.top.map((r: Row) => ({
        id: r.id,
        position: r.position,
        count: r.count,
        score: r.score,
        contributions: r.contributions,
      })),
      optimization,
      limitations: [
        "Traffic disruption reports are not a complete collision or safety dataset.",
        "Nearest-road association is approximate.",
        "Historical validation does not establish causal benefit.",
      ],
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "calgary-inspection-report.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function exportPlan() {
    const lines = [
      "position,location,events,priority,distinct_days,recent_30_days,previous_30_days",
      ...plan!.top.map(
        (r: Row) =>
          `${r.position},"${r.name.replaceAll('"', '""')}",${r.count},${r.score.toFixed(2)},${r.days},${r.recent},${r.previous}`,
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" }),
      a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "calgary-inspection-shortlist.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  const timeline = (
    <div className={`map-timeline ${playing ? "is-playing" : ""}`}>
      <div className="timeline-controls">
        <button
          aria-label={playing ? "Pause timeline" : "Play timeline"}
          onClick={togglePlayback}
        >
          {playing ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="2"
                  width="3"
                  height="12"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  x="10"
                  y="2"
                  width="3"
                  height="12"
                  rx="1"
                  fill="currentColor"
                />
              </svg>{" "}
              Pause
            </>
          ) : (
            <>▶ Play</>
          )}
        </button>
        <strong>{playDate ?? config.end}</strong>
        <span className="timeline-mode">Cumulative events</span>
        <label>
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => setLoop(e.target.checked)}
          />{" "}
          Loop
        </label>
        <select
          aria-label="Playback speed"
          value={speed}
          onChange={(e) => setSpeed(+e.target.value)}
        >
          <option value={600}>Slow</option>
          <option value={250}>Normal</option>
          <option value={80}>Fast</option>
        </select>
        <button
          onClick={() => {
            setPlaying(false);
            setPlayDate(null);
          }}
        >
          Reset
        </button>
      </div>
      <input
        aria-label="Map timeline date"
        type="range"
        min="0"
        max={Math.max(1, timelineDays)}
        disabled={!timelineDays}
        value={timelinePosition}
        onChange={(e) => {
          setPlaying(false);
          setPlayDate(
            new Date(
              Date.parse(config.start + "T00:00:00Z") +
                Number(e.target.value) * 86400000,
            )
              .toISOString()
              .slice(0, 10),
          );
        }}
      />
      <div className="timeline-dates">
        <span>{config.start}</span>
        <span>{config.end}</span>
      </div>
    </div>
  );
  if (error)
    return (
      <div className="loading">
        <p>{error}</p>
        <button onClick={retry}>Retry loading data</button>
      </div>
    );
  if (!data || !plan)
    return (
      <div className="loading">Loading official Calgary event snapshot…</div>
    );
  return (
    <>
      <header className="admin-topbar">
        <button
          className="sidebar-toggle"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!sidebarCollapsed}
          onClick={() => setSidebarCollapsed((v) => !v)}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <rect x="3" y="4" width="18" height="16" rx="3" />
            <path d="M9 4v16" />
            <path d={sidebarCollapsed ? "m13 9 3 3-3 3" : "m16 9-3 3 3 3"} />
          </svg>
        </button>
        <div className="topbar-breadcrumb">
          Workspace <span>/</span> <strong>{tab}</strong>
        </div>
        <div className="header-note">
          <i /> HISTORICAL OPERATIONS LAB <span>2023–2026 SNAPSHOT · MT</span>
        </div>
        <div className="export-actions">
          {tab !== "Forward outlook" && (
            <>
              <button onClick={exportReport}>↓ Export report</button>
              <button onClick={exportPlan}>↓ Export shortlist</button>
            </>
          )}
        </div>
      </header>
      <main
        className={`admin-dashboard dashboard ${tab === "Map preview" ? "preview-page" : "analysis-page"}`}
      >
        <DashboardSidebar data={data} pages={pages} tab={tab} setTab={setTab} />
        <section className="center admin-workspace">
          {warning && (
            <div className="notice" role="status">
              {warning}
              <button onClick={retry}>Retry weather data</button>
            </div>
          )}
          <div className="dashboard-page-heading">
            <div className="eyebrow">
              {tab === "Forward outlook"
                ? "PROACTIVE ANALYSIS"
                : tab === "Map preview"
                  ? "DYNAMIC NETWORK PREVIEW"
                  : "REACTIVE ANALYSIS"}
            </div>
            <h2>{tab}</h2>
          </div>
          <DashboardSummary
            tab={tab}
            data={data}
            summaryPlan={summaryPlan}
            plan={plan}
            config={config}
            activeConfig={activeConfig}
            controlVisibility={controlVisibility}
          />
          {tab !== "Agent" && <AnalysisControls
            tab={tab}
            config={config}
            setConfig={setConfig}
            data={data}
            controlVisibility={controlVisibility}
            plan={plan}
            savePlan={savePlan}
            change={change}
          />}
          <MapPreview
            tab={tab}
            mapShell={mapShell}
            expanded={expanded}
            fullscreen={fullscreen}
            mapNotice={mapNotice}
            container={container}
            setExpanded={setExpanded}
            toggleFullscreen={toggleFullscreen}
            timeline={timeline}
            plan={plan}
            focus={focus}
            setSelected={setSelected}
            setTab={setTab}
            map={map}
          />
          <div
            className="bottom dashboard-content"
            hidden={tab === "Map preview"}
          >
            {tab === "Evidence" && (
              <EvidencePage
                selected={selected}
                focus={focus}
                plan={plan}
                setSelected={setSelected}
                config={config}
                activeConfig={activeConfig}
              />
            )}
            {tab === "Plan comparison" && savedNotice && (
              <div className="saved-plan-notice">
                <span>{savedNotice}</span>
                {saved && (
                  <button onClick={clearSaved}>Clear saved plan</button>
                )}
              </div>
            )}
            {tab === "Plan comparison" && (
              <ComparisonPanel
                saved={saved}
                plan={plan}
                savedConfig={savedConfig}
                config={activeConfig}
                onSelect={(id: string) => {
                  setSelected(id);
                  setTab("Evidence");
                }}
              />
            )}
            <div hidden={tab !== "Forward outlook"}>
              <ForecastPanel
                data={data}
                onApplyTypeWeights={(result) => {
                  const values = Array.from({ length: 5 }, (_, i) =>
                    Math.max(
                      0,
                      (result.coefficients[1 + i * 2] +
                        result.coefficients[2 + i * 2]) /
                        2,
                    ),
                  );
                  const sum = values.reduce((a, b) => a + b, 0);
                  if (!sum) return;
                  const types = [
                    "Collision-related",
                    "Road conditions",
                    "Signals",
                    "Stalled vehicle",
                    "Other / unverified",
                  ];
                  saveSnapshot(activeConfig);
                  setConfig((c) => ({
                    ...c,
                    typeWeightMode: "learned",
                    typeWeights: Object.fromEntries(
                      types.map((t, i) => [t, (values[i] * 5) / sum]),
                    ),
                    typeWeightSource: {
                      version: result.version,
                      datasetVersion: data.audit.downloadedAt,
                      horizon: result.horizon,
                      trainedThrough: "2025-12-31",
                      method: "positive-bin-mean normalized to mean 1",
                    },
                  }));
                  setTab("Plan comparison");
                }}
                onSelect={(id: string) => {
                  setSelected(id);
                  setTab("Evidence");
                  const location = data.locations.find((l) => l.id === id);
                  if (location)
                    map.current?.flyTo({
                      center: [location.lon, location.lat],
                      zoom: 14.5,
                      speed: 0.9,
                    });
                }}
              />
            </div>
            {tab === "Weather context" && (
              <WeatherPanel data={data} config={activeConfig} />
            )}
            {tab === "Agent" && <AgentPage data={data} evaluation={optimization && ["period", "category", "weather", "capacity", "typeWeights", "typeWeightMode"].every(key => JSON.stringify((optimization.filters as unknown as Record<string, unknown>)[key]) === JSON.stringify((config as unknown as Record<string, unknown>)[key])) ? optimization : null} evaluationTools={<>
<details><summary>Current plan backtest · 90-day history → next 30 days</summary>              <div className="evaluation">
                <p>
                  Current weights · exploratory 90-day history → next 30 days.
                  Coverage measures later recorded events at selected locations,
                  not safety improvement. Changing controls recomputes these
                  results. The separate weight-search tool below freezes and validates
                  a candidate plan independently.
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>History ends</th>
                      <th>Future events</th>
                      <th>Event-count baseline</th>
                      <th>Candidate plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluation.map((r) => (
                      <tr key={r.end}>
                        <td>{r.end}</td>
                        <td>{r.total}</td>
                        <td>{r.baseline}</td>
                        <td>
                          {r.candidate}{" "}
                          <span
                            className={
                              r.candidate >= r.baseline
                                ? "positive"
                                : "negative"
                            }
                          >
                            ({r.candidate - r.baseline >= 0 ? "+" : ""}
                            {r.candidate - r.baseline})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
</details>
              <OptimizationPanel
                result={optimization}
                busy={optimizing}
                error={optimizationError}
                config={config}
                onRun={runOptimization}
                onApply={() => {
                  if (!optimization) return;
                  savePlan();
                  setPlaying(false);
                  setPlayDate(null);
                  setConfig({ ...config, weights: [...optimization.weights] });
                  setTab("Plan comparison");
                }}
              />
 </>} historical={{backtest:evaluation,scope:activeConfig,selected:plan.selected,rows:plan.top.map((r:any)=>({...r,reportEvidence:selectEvents(data.events,activeConfig).filter((e:any)=>e.location===r.id).slice(-3)}))}} />}
            {tab === "Data & method" && <DataMethodPage data={data} />}
          </div>
        </section>
      </main>
      <footer>
        CASE 05 · ENERGY & INFRASTRUCTURE SYSTEMS
        <span>
          Historical decision support · inspect evidence before acting
        </span>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
