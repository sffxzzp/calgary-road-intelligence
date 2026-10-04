# Calgary Road Disruption Intelligence

A browser dashboard for historical road-inspection priorities and experimental traffic-report forecasting, developed for IEEE Industry Hackathon Option B, Energy & Infrastructure Case 5.

## Run

Node.js 22+ is required. No API keys or backend are needed.

```sh
npm ci
npm run compress:data
npm run dev
```

Open http://localhost:5173. Traffic and weather snapshots are bundled locally; OpenFreeMap vector tiles and optional Google Fonts require network access.

```sh
npm test
npm run build
npm run preview
```

## Data

The current fixed snapshot contains **27,805 traffic reports** from UTC January 2023 through October 2026, aggregated into **9,661 road/grid locations**. Calgary local dates span December 31, 2022 through October 3, 2026; boundary records are retained and the latest day/year is incomplete. The default analysis covers the latest 90 days.

**32,922 ECCC hourly weather observations** cover January 2023 through the latest available October 2026 hour. Events join weather by UTC hour; display, dates, peak periods and weekends use `America/Edmonton`, including daylight saving. Missing measurements remain unavailable. Airport weather is context, not road-surface evidence.

Sources and processing details: [DATA_SOURCES.md](DATA_SOURCES.md). Current audits and evaluations are in `reports/`.

## Historical analysis

- Map preview, linked Top 20 shortlist, evidence search, original reports, charts and geometric road-association review.
- Date, time-of-day, event-type and weather filters are drafts until **Apply evidence scope** is clicked. **Reset changes** discards edits.
- Frequency, recent growth and recurring-date scoring, adjustable capacity and a raw-count baseline.
- Persistent saved-plan comparison, ranking explanations and JSON report export.
- Automatic search over 21 priority mixes using six 2023–2025 windows; independent July 2026 outcome check. Historical evaluation uses separate 2026 windows.
- Timeline playback with looping, webpage expansion and browser fullscreen.

### Event-type weighting

Historical analysis provides **Equal event weights** and **Learned type weights · experimental**. Equal mode counts every report once. Learned mode applies imported type weights to the frequency signal only; raw counts, growth and recurrence retain their definitions.

To import weights: open Forward outlook, choose **Collision-related report hotspots** and **Learned type weights · experimental**, generate a forecast, expand **Learned event-type effects**, then click **Try learned type weights in historical ranking**. The original plan is saved and comparison opens. Switch back to equal weights without losing the imported weights.

Historical weights use the positive part of each type's average coefficient across the two history bins, normalized to mean 1. This is an **unvalidated adaptation**, not the full forecast model or severity weighting. Applying a model fitted through 2025 to earlier history is retrospective exploration, not an independent backtest.

## Experimental forecasting

Forward outlook has two independent controls:

| Control | Options |
|---|---|
| Target | All report hotspots / Collision-related report hotspots |
| Event-type weighting | Equal event weights / Learned type weights · experimental |

Equal mode pools report types in historical temporal features. Learned mode fits ten type-specific features: `log(1 + count)` for five categories over days 1–30 and 31–90. Both predict the selected target; a collision-related target does not imply confirmed crashes or injury risk.

The next **7 days** uses ridge-regularized Poisson; the next **30 days** uses precomputed pure Empirical Bayes on separate full-inventory units. Both rank expected report activity. Learned coefficients and transformed-input rate multipliers describe predictive associations, not per-event importance or causal effects.

- **Historical backtest:** choose a 2026 cutoff with a fully observed forecast window. Later outcomes are revealed explicitly.
- **Future forecast:** cutoff is fixed to the latest dataset date, currently October 3, 2026. No future observed counts or accuracy metrics are fabricated.
- **Time cross-validation:** train 2023 → validate 2024; train 2023–2024 → validate 2025. Each validation year has four rolling forecast windows. Select L2 strength from 0.001, 0.01, 0.1 and 1 using mean Poisson deviance, then refit on quarterly 2023–2025 windows. **2026 never selects parameters.**
- Forecast map, historical shortlist comparison, separate JSON export, rate baseline, equal-weight shortlist coverage, MAE, deviance and calibration totals.

The Poisson training protocol simulates rolling next-week forecasts within the next year, **not a one-shot annual forecast**. The separate EB30 snapshot uses fixed three-year history. Future weather is excluded. Models can reach the 600-iteration limit; diagnostics remain visible. Neither model has demonstrated consistent superiority over simple historical baselines. See [current status](reports/DEVELOPMENT_STATUS.md) for evaluation files and limits.

## Deployment

Vercel is configured to build `npm run build` and serve `dist`. Build produces gzip snapshots and removes uncompressed JSON from the output: approximately **3.56 MB traffic + 0.45 MB weather**. The browser uses native decompression or a lazy fallback. Compression reduces transfer/storage, not parsed memory.

GitHub-linked deployments run after pushes; local CLI deployment is also supported. To deploy locally, run `npx vercel` for a preview or `npx vercel --prod` for production. Source packages must include `pipelines/compress-data.mjs`, source JSON, the lockfile and Vite/Vercel configuration.

## Rebuild and verify

```sh
npm run fetch:data
npm run prepare:data
npm run fetch:weather
npm run prepare:weather
npm run compress:data
```

Raw downloads are ignored by Git. Refreshing snapshots changes the dataset version and invalidates saved comparison plans. Forecast training years remain explicitly fixed; refreshing data does not silently change the evaluation protocol.

Unit tests: `npm test`. Browser checks require Playwright Chromium and OS dependencies; relevant scripts include `tests/dashboard-browser.mjs`, `tests/evidence-scope-browser.mjs`, `tests/compressed-data-browser.mjs`, `tests/forecast-browser.mjs`, `tests/forecast-modes-browser.mjs`, and `tests/collision-forecast-browser.mjs`. Run `npm run test:browser` for all 20 browser suites; start the development server on port 5173 first. Test artifacts are written to temporary paths.

## Interpretation and attribution

This prioritizes reported disruptions for review. It does not establish fewer crashes, verified severity, road safety or causal weather effects. Text-derived categories, incomplete reporting, current road geometry, ambiguous junction/parallel matches and unverified traffic exposure limit conclusions. Candidate locations must be known at each forecast cutoff; later reports at unseen locations are reported separately.

Sources: City of Calgary Traffic Incidents, Street Centreline and Traffic Volumes 2024; ECCC CALGARY INTL A; OpenFreeMap/OpenMapTiles/OpenStreetMap; optional Google Fonts. Hackathon context comes from [industry-hackathon-lab](https://github.com/nagusubra/industry-hackathon-lab). Snow-route reference, voice narration, LLM integration and live ingestion remain future work.

## Annual planning research

Forward outlook now includes **Annual · 12 months**, a precomputed Empirical Bayes outlook on an independent full road/intersection inventory. It displays expected reports, 90% predictive intervals, prior/history contributions and unit-specific source examples. Shared source IDs link annual units to dashboard locations; they are not interchangeable units or directly comparable Top20 populations. Annual mode ignores weather/time/type controls. See [analysis/README.md](analysis/README.md) for the offline Python workflow.

The annual pipeline now normalizes complete calendar-year ridge targets to 365-day rates (including leap years) and validates dataset fingerprints before export. Updated backtests include last-year counts and historical-rate baselines. Current road inventory and volume release-time limitations remain. Same-unit short-horizon EB comparisons are exploratory, not proof the short-term model should be replaced.

## Thirty-day EB default

The dashboard's next30 outlook now uses pure EB, precomputed by `analysis/export_short.py` on the same full-inventory road/intersection units as the comparison. Three-year history is fixed, not tuned; all report types are pooled. Six historical cutoffs and a latest-complete-date future forecast are exported to `public/data/forecast-eb30.json.gz`. Future outcomes are null. Refresh the offline pipeline to add cutoffs or newer data.

Seven-day forecasts retain browser Ridge Poisson, collision targets and experimental learned-type options. These controls do not apply to EB30. EB unit evidence is displayed independently; reactive Top20 overlap and learned-weight imports are not calculated across different unit definitions. The 30-day choice follows exploratory average gains, not uniform superiority or operational validation.

## Five-minute demo

1. Start with historical priorities: explain the evidence period, inspect one location and show its source reports. These are reported disruptions, not all confirmed crashes.
2. Open Forward outlook → next30. Use the June 30 replay, generate the Top20, open the map and select a location to explain own-history versus similar-site contributions.
3. Reveal later outcomes. Compare EB against the recent-rate baseline; explain that aggregate improvement is experimental and individual windows can lose.
4. Switch to Future forecast. Show the complete-date cutoff, uncertainty intervals and export. No future accuracy is claimed.
5. Close with the practical proposal: analysts review a shortlist, confirm local context and record whether inspection was useful. Better crash/severity data, exposure and prospective feedback are the next validation steps.

The next7 Poisson and annual EB modes are additional planning horizons; their units and controls differ. Keep the main presentation focused on historical review and next30 outlook.

Monthly future outlook also offers CMF-based treatment research in selected-location evidence. Candidates depend on nearby mapped controls and road class, and require expert verification. External crash modification factors are shown with study references; they are not used to calculate reductions in traffic-event reports. Signal/sign/crosswalk features now enter the EB SPF; current/undated asset and removal-history limitations remain.

Monthly location evidence displays mapped facility counts and proximity limitations, a desk/site-review checklist, decision and reviewer notes. Save review persists on this device, isolated by snapshot fingerprint, mode, forecast period and EB location. Saved reviews are included in forecast JSON exports; drafts are not automatically saved or shared with teammates. These records support a pilot review workflow, not validation of safety benefits.

Monthly forecast map points open the same location evidence as table rows; selecting a row recentres an open map. Review-status filtering affects the model Top20 table only, preserving the full forecast map and evaluation. Export inspection shortlist downloads the currently filtered Top20 locations with coordinates, predictions, facilities and saved reviews.

The presentation should follow [DEMO_GUIDE.md](DEMO_GUIDE.md), aligned to the organizers' Pitch slides: short introduction, one-minute problem statement, 1–2 minute solution/demo, and 1–2 minute closing. The earlier five-minute click-through is background preparation; this pitch structure takes precedence.

Annual outlook supports confirmed selection of precomputed month-end replay cutoffs from 2025 onward, alongside the latest future forecast. Run `OPENBLAS_NUM_THREADS=1 analysis/.venv/bin/python analysis/export_annual_replays.py` to regenerate per-cutoff gzip files and their index. Historical replay uses fixed five-year history, independent of later model-window selection. Incomplete observation periods are explicitly marked; current-geometry/undated-asset caveats still apply.

## Evidence Agent

The Agent page chats with selected monthly EB Top20 or one location, including source evidence, evaluation and saved local reviews. Configure server-only `AGENT_BASE_URL` (including `/v1` if required), `AGENT_MODEL` and `AGENT_API_KEY` in Vercel, then redeploy. The provider must support OpenAI-compatible Chat Completions. No key is included in the browser. Local API testing requires `vercel dev`; plain Vite serves only the UI.

Questions and selected evidence are sent to the configured provider. Responses are model-generated and require review; the agent cannot execute changes or verify site conditions. The endpoint has request-size limits and timeout, but no user authentication/rate limiting: add access controls before broadly sharing a paid-provider deployment. Annual/seven-day context is not yet included.

Agent evidence sources now include the applied historical shortlist (with matching filtered source samples), generated latest-future seven-day Poisson, monthly EB replays/future, and annual latest/replay snapshots. Seven-day target/weighting settings require regenerating context before asking. Every request includes curated project purpose, methods, provenance, page workflows and interpretation limits. It does not automatically read arbitrary repository files or all reports, and model understanding is not guaranteed by supplying context. Real provider calls remain unverified until configured.

Agent is the default landing page and first sidebar entry, with its own conversation icon. Assistant prose renders Markdown/GFM (headings, lists, tables and code); raw HTML is not enabled and links use safe URL handling. Existing page deep links remain valid.

PR #2 matching rules were restored at user request: signalized intersections → visibility/signing; unsignalized intersections with Skeletal Road → ramp-meter candidate; qualifying stop-controlled arterials → signal; Skeletal Road segments → variable speed limit. This coarse rule set does not verify geometry or warrants. Annual columns label CMF arithmetic as demo estimates, not validated report/crash reductions. This supersedes earlier notes that ramp inference was removed.

Historical plan evaluation lives in the Agent’s historical evidence tools. Run the deterministic weight search and holdout check there, then ask the Agent to explain the supplied results. Change analysis settings in Map preview; applying a plan still requires an explicit click.
