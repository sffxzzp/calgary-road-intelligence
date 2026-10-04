# Calgary Road Disruption Intelligence: Detailed Development Plan

Status: the original proposal is retained; see reports/DEVELOPMENT_STATUS.md for current implementation progress. The application uses Node data processing, React / MapLibre and browser-based analysis, without a separate API.

## Current Implementation and Future Boundaries (2026-10-04)

The following chapters preserve the initial proposal and subsequent design iterations. Older references to Python/APIs, single-year data, smoothed baselines or weather scenarios do not describe the current implementation. See README.md for usage and reports/DEVELOPMENT_STATUS.md for current status.

- Data: 27,805 official traffic reports from 2023–2026, 9,661 road/grid locations and 32,922 airport weather hours over the same period. UTC is retained; local filtering uses America/Edmonton. The latest day and 2026 year are incomplete.
- Historical inspection: edit Evidence scope before confirming application; equal weights and imported experimental type weights are supported. Weighting changes only the frequency signal; raw counts, growth and recurring dates retain their respective definitions.
- Forecasting: all-report/collision-related targets and equal/experimental type weighting are independently selectable. Poisson regression estimates report counts for the next 7/30 days. Historical backtesting and future forecasting are separate; future mode does not fabricate observed outcomes.
- Temporal validation: select regularization using 2023→2024 and 2023–2024→2025 folds; refit on 2023–2025; independent 2026 tests do not select parameters. This is not a one-shot annual forecast.
- Weight interpretation: model coefficients are predictive associations. Historical adaptation takes the positive part of the average coefficient across two time bins, then normalizes it. This is an unvalidated heuristic, not severity or scientifically established safety weighting. Equal-weight restoration and plan comparison are available.
- Deployment: Node/React/MapLibre without a separate API; output contains approximately 4 MB of gzip data, decoded natively in the browser or through a fallback library. Gzip does not reduce decoded memory use.
- Validation: current models do not consistently outperform simple baselines. Experimental notices and training convergence diagnostics remain visible. See the development status document for the current test/report index.

Future research: confirmed collision/injury data, traffic exposure, manually reviewed intersection associations and independent prospective validation. Weather forecasts, snow-clearing references, voice and live ingestion remain unfinished.

## 1. Project Objective

Provide Calgary road operations staff with a year-round inspection tool: identify road segments with recurring problems or recent increases in events using public traffic records, produce evidence-based inspection candidates, and recalculate when capacity or analysis conditions change.

The primary user is a road operations professional or traffic analyst. They need to answer:

- If only 10 or 20 locations can be inspected this round, which should be visited first?
- Why did a location enter the shortlist: many events, recent growth or repeated occurrences of a particular problem?
- How does the shortlist change when considering only morning peak, nighttime, weekends or winter weather?
- Which locations does the proposed approach prioritize compared with sorting only by event count?

The output is an inspection priority for traffic disruptions, not a validated crash-danger rating. The data lacks complete injury information; fewer crashes, reduced losses or improved snow clearance are not claimed as achieved outcomes.

Winter is an analysis perspective. Snow-clearing routes are a reference layer for existing municipal rules, not a policy this project intends to redefine.

## 2. Hackathon Case and Delivery Constraints

Use Option B, Energy and Infrastructure Systems, Case 5: Autonomous Calgary Collision-Hotspot Ranking Agent.

Official case directory:
https://github.com/nagusubra/industry-hackathon-lab/tree/main/01-energy-and-infrastructure-systems/Case%205%20-%20Autonomous%20Calgary%20Collision-Hotspot%20Ranking%20Agent

The original case requires a Top 20 shortlist, comparison with an event-count baseline, one weight change, shortlist overlap and explanations of ranking changes for at least three locations. This project retains those requirements and extends segment aggregation, interactive mapping and inspection shortlists.

Based on the handbook and repository reviewed:

- Teams have 2–5 registered members.
- Inform organizers of the selected stream and case, including additional sources and extensions.
- Deadline: October 4, 2026 at 12:00 MDT, or 18:00 UTC.
- Create a Hackathon Submission Issue in the official repository; one submission per team.
- Required content includes team information, a project description and 2–5 screenshots. A demo video or live URL is optional but recommended.
- On-site presentation: 5 minutes followed by 3 minutes of questions.
- Organizer starters, open-source libraries and public data may be used with attribution and a clear account of the team's own contribution.

Recheck the latest announcements before development. Scoring emphasizes data decisions and improvement (30%), industry problem (20%), software and architecture (20%), commercial applicability (15%) and presentation (15%).

## 3. First-Version Scope and Completion Criteria

### 3.1 Required: P0

1. Import real traffic-event data and report record counts, covered dates, missing fields and cleaning results.
2. Establish stable location IDs, preferably matched road segments; use spatial grids when matching is unreliable.
3. Calculate an event-count baseline by location and generate the Top 20.
4. Calculate candidate priorities incorporating recency and recurring-event signals; show the formula and contributions.
5. Support date range, time-of-day, event category and inspection-capacity filters.
6. Link map, ranking table and location details, allowing users to inspect original event evidence.
7. Support one replanning step: change weights or capacity, rerank and show entries, exits and rank movements.
8. Export shortlists and reports, preserving dataset versions and configurations for reproducibility.

P0 is complete when a fresh checkout starts using README instructions, cached local data supports the entire demonstration, and every ranking is traceable to records and parameters.

### 3.2 After P0: P1

- Official traffic-volume context: reliably matched sections can show event indicators relative to traffic exposure.
- Weather association: historical event distributions under snow, cold, rain and other conditions.
- Snow-route comparison: overlay existing route classes and explain intersections or proximity.
- Simple historical playback: monthly or weekly ranking changes.
- An LLM calling structured analysis tools to compare candidates and produce an evidence-backed brief.

### 3.3 If Time Allows: P2

- ElevenLabs narration of generated inspection briefs.
- Inspection routing: a simplified visit order for selected locations, explicitly labeled a route suggestion.
- Additional historical years and verified annual comparisons.

The first version does not promise real-time traffic, road-surface ice prediction, actual repair costs, injury prediction or full dispatch execution.

## 4. Data Plan

### 4.1 Core: Traffic Events

- Official portal: https://data.calgary.ca/Transportation-Transit/Traffic-Incidents/35ra-9556
- Case seed: `calgary_traffic_incidents_2025.csv`.
- Available fields: `incident_info`, `description`, `start_dt`, `quadrant`, `longitude`, `latitude`, `incident_count`; verify fields and meanings after downloading.
- Original purpose: archive traffic disruptions, including signal problems, hazardous road conditions, stalled vehicles and some collision reports.
- Project use: location aggregation, time-of-day analysis, recurring-problem discovery and ranking.

First complete the workflow with the seed, then obtain additional official records as needed. Reporting gaps, bias and non-collision events mean not all records can be described as crashes.

### 4.2 Spatial Foundation: Street Centreline

- https://data.calgary.ca/Transportation-Transit/Street-Centreline/4dx8-rtm5
- Original purpose: mapping road centrelines and segments.
- Project use: match events to segments, display road names and line-based hotspots.
- Verify: format, coordinate system, segment IDs, road-name fields, download size and completeness.

### 4.3 Additional Sources

| Data | Source | Original purpose | Project use and prerequisites |
|---|---|---|---|
| Traffic volume | https://data.calgary.ca/dataset/Traffic-Volumes-for-2024/cauu-7hnw | Average weekday road traffic | Context for event counts; verify year, units and segment correspondence |
| Historical weather | https://climate.weather.gc.ca/historical_data/search_historic_data_e.html | Weather-station observations | Join events by time and display weather conditions; confirm the station and required fields are downloadable |
| Priority snow routes | https://data.calgary.ca/Health-and-Safety/Snow-and-Ice-Clearing-Priority-Routes-Map/fuea-eg5z | Existing routes, priorities and service timelines | Winter layer; verify underlying data rather than treating the map page as a download endpoint |
| Traffic signals | https://data.calgary.ca/Health-and-Safety/Traffic-Signals/qr97-4jvx | Municipally maintained signal locations | Spatial context for signal-related events |

Connect one additional source first. Prefer volume if matching works; if matching is difficult and weather fields are available, connect weather instead.

### 4.4 Auditing and Traceability

Preserve source URLs, retrieval times, coverage dates, licenses, original field descriptions and checksums for every dataset. Analyze fixed snapshots so portal updates cannot silently change results.

After downloading, generate a report of row counts, unique locations, date range, missingness, geographic extent, duplicates and category distribution. Unverified fields must not enter core calculations.

## 5. Cleaning and Spatial Matching

1. Preserve original records and generate cleaned outputs separately; record removal/exclusion reasons.
2. Verify the timezone of `start_dt`. Standardize analysis time and correctly handle MDT/MST and daylight saving; do not assume timestamps without timezone information are UTC.
3. Filter invalid coordinates and points outside the study area, preserving exclusion counts.
4. Prefer source IDs for deduplication. If the seed lacks IDs, verify a time/location/description composite. Check whether `incident_count` is an aggregate before summing.
5. Classify using manually reviewed rules: collision-related, signals, road conditions, stalled vehicles and other. Preserve source text and assign ambiguous cases to Other / unverified.
6. Project roads and events into an appropriate Calgary metre coordinate system before measuring distances; coordinate differences are not metres.
7. Assign the nearest segment with a configurable maximum distance, initially 50 m and subsequently adjusted through review. Identify intersection/parallel-road matching confidence separately.
8. Report match rates, distance distributions and manual review results. If reliable matching is unavailable, use approximately 100–200 m grid cells labeled location areas.

Street matching is a spatial approximation, not confirmation of the event's lane.

## 6. Inspection Priority Method

### 6.1 Comparison Baseline

Within the same time, category and geographic scope, rank deduplicated event counts descending to obtain Top K. Break ties with stable location IDs for reproducibility.

### 6.2 First-Version Scoring

Begin with transparent rules rather than requiring a complex trained model:

`priority = w1 × frequency + w2 × recent_signal + w3 × recurrence`

- `frequency`: event count in the study period, transformed with `log(1 + count)` and normalized to 0–1 to limit domination by a few large hotspots.
- `recent_signal`: growth in a recent window relative to the preceding equal window. Default: 30 days versus the prior 30 days, requiring complete windows and smoothing for small samples.
- `recurrence`: the number of different dates or weeks with events, distinguishing concentrated reporting from repeated occurrences.
- Illustrative initial weights: 0.5 / 0.3 / 0.2. This is an engineering starting point to evaluate, not an industry standard.

Recent windows are relative to the selected historical cutoff. For example, a seed ending in late 2025 defines recency relative to that cutoff, not today.

Show a limited-evidence notice for sparse samples; do not automatically treat missing indicators as zero. Ranking details display counts, effective date range, score contributions and match quality.

### 6.3 Time Periods and Event Types

Support the full year/selected dates, weekdays/weekends, morning/evening peaks, nighttime and custom hours. Write peak/night definitions into configuration; initial periods are product settings.

Type filters change the analysis population. Without validated injury/severity fields, do not arbitrarily assign injury-risk weights to categories.

### 6.4 Replanning

Save the first plan, change capacity or weights, and recalculate. Display:

- Top K and rank changes relative to the baseline.
- Entering/exiting locations and explanations for at least three changes.
- Overlap for the same K; when K changes, show actual additions/removals without mixing comparison definitions.
- Events and recurring dates covered by the new shortlist, explicitly identified as record-coverage indicators.

### 6.5 Historical Evaluation

A changed ranking alone does not prove improvement. Add temporal holdout evaluation:

1. Rank a historical window and freeze weights.
2. Use real events in the subsequent window to measure shortlist coverage.
3. Compare with the event-count baseline at the same K and repeat across historical cutoffs.
4. Report subsequent-event coverage, shortlist stability and small-sample conditions.

Use separate tuning and final holdout windows to avoid selecting parameters after viewing results. Beating the baseline is not a predetermined conclusion; show better and worse conditions honestly.

### 6.6 Volume and Weather Extensions

Calculate exposure-adjusted indicators only when volume links and years are defensible. Average weekday volume is not real-time hourly traffic; combining 2024 volume with 2025 events requires disclosure of the year mismatch. It cannot directly produce crash probability.

Match weather by station distance and time, showing station provenance and missingness. If snowfall is unavailable, do not silently replace it with precipitation. Below-freezing temperature does not establish road ice.

Weather associations also require normalized comparisons: observation hours under each condition and events per hour. Snow-day totals depend on the number of snowy days. Associations do not prove weather caused events.

## 7. Automated Decision Workflow and Optional LLM

Core loop: read data → propose shortlist → assess against baseline and constraints → modify one plan → output shortlist and evidence.

Scoring criteria allow automatic ranking, optimization and rule adjustment; an LLM is not required. P0 implements a reproducible computational loop with user-triggered weight changes.

P1 may search a finite set of weights, compare them on historical validation windows, choose a plan respecting capacity and small-sample conditions, and report results on unused windows. Preserve every candidate parameter set and evaluation.

If integrated, the LLM interprets filter requests, calls implemented tools and summarizes results:

- `analyze_locations(filters)`: retrieve indicators and evidence.
- `rank_candidates(filters, weights, capacity)`: produce rankings.
- `compare_plans(plan_a, plan_b)`: compare shortlists.
- `evaluate_history(config)`: retrieve historical evaluation.
- `export_brief(plan_id)`: generate a brief.

The LLM must not invent event counts, risk conclusions or nonexistent repair proposals. Locations/numbers in briefs come from tool outputs with IDs and original-record references. If an API is unavailable, a template brief completes the same workflow.

ElevenLabs is only for narration after the core is complete, not a ranking dependency.

## 8. Interface and Demonstration Experience

Use one primary workbench centered on the map:

- Top: project name, coverage period, filtered event count and candidate-location count.
- Left: dates, periods, categories, capacity, weights and optional weather.
- Center: segment/area map with priority colors and linked selection.
- Right: Top K, rank movements and key indicators; click to open details.
- Bottom or separate panel: temporal distributions, category mix, baseline comparison and historical evaluation.

Location details include road/area name, count, recent records, distinct event dates, type distribution, ranking reasons, source examples and spatial-match quality.

Plan comparison holds analysis scope constant and distinguishes entering, exiting and retained locations. Snow routes need a separate legend so municipal route classes and project priority do not share ambiguous color meanings.

Do not render all raw events simultaneously. Default to aggregated locations/segments; show events after zooming or selection. If remote tiles fail, retain boundaries, segments, locations and shortlists for an offline demonstration.

## 9. Suggested Stack and Architecture

Proposed stack: Python processing plus a React map interface for spatial capability and presentation quality:

- Data: pandas, GeoPandas, Shapely; fixed outputs in Parquet/GeoJSON.
- API: FastAPI, Pydantic for analysis, ranking, comparison, details and export.
- Frontend: React + TypeScript + Vite.
- Map: MapLibre GL JS; charts with ECharts or familiar alternatives.
- Initial storage: local files and memory caches without a database.
- Optional: LLM tool calling and ElevenLabs voice.

First verify the runtime environment. If spatial dependencies are costly to install, use offline GeoJSON and grids for P0; if time is short, use Streamlit and a map component for the same workflow.

Data flow: official snapshot → cleaning/audit → location aggregation → features → ranking/evaluation → API → map/shortlist/brief.

Proposed directory layout:

```text
calgary-road-disruption-intelligence/
├── DEVELOPMENT_PLAN.md
├── README.md
├── DATA_SOURCES.md
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── services/        # ranking, comparison, export, optional agent
│   └── requirements.txt
├── frontend/
│   └── src/                # map, filters, lists, details, charts
├── pipelines/              # retrieval, cleaning, spatial matching, features
├── data/
│   ├── raw/                # original snapshots; sharing depends on license/size
│   ├── processed/          # cleaned demo data
│   └── manifest.json       # sources, time, fields, versions
├── configs/                # parameters, category rules, demo scenarios
├── reports/                # audits, historical evaluation, inspection briefs
└── tests/                  # cleaning, ranking and temporal holdout behavior
```

Initial API proposal: `GET /metadata`, `POST /rank`, `POST /compare`, `GET /locations/{id}`, `POST /evaluate`, `POST /export`. Share explicit field definitions; map and shortlist must use the same plan result.

## 10. Development Stages and Priorities

Times are estimates, not guaranteed durations. Complete a demonstrable result at each stage before proceeding.

| Stage | Estimate | Tasks | Reviewable output |
|---|---|---|---|
| 0: Data verification | 1–2 hours | Download seed, verify fields/timezones and road data; sample records | DATA_SOURCES, audit, aggregation choice |
| 1: Computation core | 2–3 hours | Deduplicate, classify, identify locations, count baseline and candidate scores | Top 20 CSV, evidence, configuration |
| 2: Map workbench | 3–4 hours | Link map, list, filters and details | First complete runnable demonstration |
| 3: Decision loop | 2–3 hours | Recompute, compare plans, entries/exits, historical evaluation | Baseline comparison and at least three real changes |
| 4: One additional source | 2–3 hours | Volume, weather or snow-route layer | One explainable additional analysis |
| 5: Delivery preparation | 1–2 hours | Documentation, screenshots, backup video, brief, rehearsal | Submission package and reproducible instructions |

If road matching is unreliable at stage 0, immediately use grids. If the core is unfinished before stage 2, pause additional data work. If holdout results do not support candidate scores, show the results and improve the method rather than cherry-picking an apparent gain.

Reserve at least 1–2 hours before submission to stop adding features and check materials/demo.

## 11. Suggested Team Responsibilities

- Two people: one handles data/scoring/API, the other map/interactions/presentation; jointly define evaluation and pitch.
- Three people: data/spatial processing, backend/scoring and frontend/visualization.
- Four–five people: add historical evaluation/industry validation and additional data/presentation roles.

Agree on location IDs, result structures and configurations first to avoid different frontend/backend shortlists.

## 12. Verification and Quality Requirements

Key checks:

- Correct timestamps; recent indicators exclude records after the cutoff.
- No double counting in deduplication/aggregation; metre-based spatial distances.
- Reviewed classification examples; no forced inference of missing/unknown categories.
- Stable outputs, capacity limits and clear empty-result feedback.
- Baseline/candidate use the same scope, location unit and K.
- Score explanations match inputs; Top K changes are counted correctly.
- Traceability from records to ranks and reconcilable processing counts.
- Evaluation across multiple historical windows rather than one favorable period.
- Map, details and list reference the same plan ID; the core demo works without network access.

An attractive map does not replace computational verification, and differences caused by weights do not alone establish effectiveness.

## 13. Pitch and Live Demonstration

Follow [DEMO_GUIDE.md](DEMO_GUIDE.md) and the organizers’ Pitch guidance. Reserve two minutes for live interaction within a 4:10 pitch, leaving 30 seconds of rehearsal margin. Begin with a short introduction and a one-minute problem statement: municipal analysts face limited inspection capacity and fragmented traffic-report evidence; recent frequency is the transparent alternative.

Open Agent from the default Map preview page, explain a supplied shortlist, inspect a historical report, compare the June 30 EB replay with recent rate, then save and export an analyst review. Keep algorithm detail for questions. Close with limitations, a measurable analyst pilot and a request for domain feedback. Report coverage is a proxy, not proven safety improvement.

Choose real locations/scenarios beforehand and preserve fixed configurations. Never rewrite events or evaluation results for presentation.

## 14. Final Submission Materials

- README: objective, team contribution, startup instructions, architecture diagram and demo guidance.
- DATA_SOURCES: all sources, licenses, coverage, cleaning and limitations.
- Fixed demo data/configurations; retrieval instructions for large files.
- Data audit and historical evaluation reports.
- 2–5 screenshots: main map, details, comparison and optional evaluation/additional layer.
- Optional video of no more than 5 minutes and a live URL.
- Repository link and running instructions in the official submission Issue.

## 15. Pilot Value and Further Validation

Start a real pilot with a small group of road analysts. Have them review candidates and source evidence, marking whether investigation is worthwhile, whether the issue is already known and what information is missing.

The prototype can measure subsequent-report coverage and analysis time. Demonstrating useful inspections requires staff feedback and actual inspection results. Operations also require formal ingestion, continuous quality monitoring and accepted prioritization rules.

## 16. Mentor Feedback and Next Direction: Reactive + Proactive

This section records the latest mentor direction and takes precedence over the earlier first-version scope. Rahul and Gaurav recommend retaining retrospective analysis as the core and adding a proactive demo. Attempt verifiable approaches despite limited data, and disclose limitations/improvement paths in the pitch.

### Reactive: Core Retrospective Workflow

Purpose: help operations staff understand what happened and which locations deserve earlier inspection.

Summarize historical events, show temporal/category distributions, generate Top 20, explain ranks and compare inspection plans. Mentors used the term crash data, but the source includes multiple disruptions. Product/presentation labels remain traffic events / disruptions rather than calling every record a confirmed crash.

### Proactive: Forward-Looking Demo Extension

Purpose: identify locations needing earlier attention before the next period, using evidence available at the historical cutoff.

Add a separate Forward outlook view with historical cutoff, next-7/30-day horizon and optional weather scenarios. Use only pre-cutoff frequency, trends and recurrence to estimate subsequent activity or produce forward-looking priorities; show differences from reactive Top 20, explanations and limited-evidence notices.

First establish a smoothed historical-rate baseline, then compare trend approaches; clearly label outputs experimental. Future weather is a user-defined scenario, not later observed weather treated as known. Historical filtering is association, not forecasting. Holdout evaluation is a validation method, not by itself a proactive product feature.

Validation: calculate at multiple cutoffs using earlier records, then measure subsequent-event coverage at equal capacity. If estimating counts, report errors too. Keep parameter selection and final tests separate. Show baselines, failures and sparse evidence rather than only favorable examples.

### Development and Demonstration Order

1. Preserve the complete reactive workflow and clarify both modes.
2. Add cutoff, horizon and forward indicators, preserving versions/configuration.
3. Add proactive map/shortlist and reactive comparisons with at least three change explanations.
4. Complete temporal holdout evaluation and prepare a fixed historical replay.
5. Present Reactive first, then the Proactive experiment, followed by limitations/improvements in the Pitch-format presentation.

### Pitch Limitations and Future Improvements

Historical coverage is limited, reporting incomplete, injury/severity information absent, road associations ambiguous and airport weather unrepresentative of individual roads. Forward indicators are not validated crash probabilities, ice predictions or safety promises.

Future improvements: multi-year records with consistent time conventions, confirmed collision/severity data, better intersection aggregation, matching traffic exposure and forecasts available at prediction time. Assess practical value through additional independent periods and road-operations feedback.

## 17. Annual EB Integration and Model Replacement Gate

Provide a separate precomputed 12-month Empirical Bayes outlook following PR #1: use the full road/intersection inventory, site-only SPF, shrinkage, uncertainty and source evidence. Keep its units distinct from reactive locations, compare against ridge, last-year counts and historical rates, and expose partial-year evaluation dates. Reproduce offline fits with pinned dependencies and reject exports whose prepared-data fingerprint differs from the backtest.

Retain the short-term model until controlled comparisons support replacement. Evaluate pure EB on identical units at 7- and 30-day horizons, select history windows using earlier expanding-year folds, and freeze the protocol before evaluating later uninspected periods. Report Top20/Top100 coverage, count calibration and active-site error, including losses. Existing repeatedly inspected 2026 experiments are exploratory. Verify historical geometry, volume publication dates and junction assignments before claiming operational or fully point-in-time validation.

### Thirty-day product decision

Use precomputed pure EB for next30 on the validated full-inventory unit definition, with six replay cutoffs and latest-complete-date future output. Retain seven-day Poisson separately. State pooled types, fixed three-year history and exploratory evidence; preserve source evidence and intervals. Further tuning and prospective validation remain required before claims of reliable improvement.

### PR #2: site assets and candidate treatments

Enrich site characteristics with mapped signals, signs and crossings. Reproduce annual and short-horizon evaluations after feature changes. Show CMF studies as expert-review candidates on monthly future evidence, retaining study context and uncertainty. Do not convert all-report forecasts into predicted crash reductions, infer ramps from road class, or treat mapped proximity as verified infrastructure linkage.

### Analyst feedback workflow

Display mapped facilities with association limitations, then offer a context-aware inspection checklist and explicit saved review. Separate decisions, notes and checked review steps from verified field findings. Isolate local records by data snapshot, forecast period and location; include saved feedback in exported plans. Team synchronization and inspection outcomes remain later pilot work.

## 18. Current Dashboard and Agent Workflow

Navigation order is Map preview (default landing), Agent, Evidence, Plan comparison, Forward outlook, Weather context, and Data & method. Sidebar labels use icons without numeric prefixes or a WORKSPACE heading; the footer displays the actual local snapshot date range.

Agent explains supplied historical, seven-day Poisson, monthly EB and annual EB evidence through an OpenAI-compatible server endpoint. It renders Markdown and readable location rankings. It does not execute field actions or replace statistical ranking. Credentials stay server-side; selected evidence and questions are sent to the provider.

Historical evaluation and automatic weight search are consolidated into Agent’s historical evidence tools. Current-plan backtests compare 90-day history rankings against subsequent 30-day recorded-report coverage at three 2026 cutoffs. Weight search separately checks a frozen holdout. Pass computed results to Agent for explanation, invalidate stale results after setting changes, and require explicit confirmation to apply weights. Historical settings are changed in Map preview; Agent has no Analysis Controls.

Data & method reads dashboard counts and dates from the loaded snapshot, distinguishes observed road/grid groups from full-inventory EB units, and lists traffic, geometry, yearly volumes, assets, weather and CMF sources. Rolling EB histories and latest-future fits must not be described as one fixed 2023–2025 training split.
