# Pitch and Demo Guide

Follow the Pitch section of the [Industry Hackathon slides](https://canva.link/f4u4rlrgfjq2fky): introduction **5–10 seconds**, problem **1 minute**, software demo **1–2 minutes**, wrap-up **1–2 minutes**. Target duration: **4:40**. Confirm the final event time limit with organizers.

## Main message

Calgary Road Intelligence helps road analysts turn historical traffic reports into an inspectable shortlist, look ahead with statistical forecasts, and ask an evidence-aware Agent to explain the results. The analyst makes the final decision.

## Before presenting

- Use the deployed site with Agent first in navigation. The current pages are Agent, Map preview, Evidence, Plan comparison, Forward outlook, Weather context, and Data & method.
- Verify the deployed Agent with a real question. It requires server-side `AGENT_BASE_URL`, `AGENT_MODEL`, and `AGENT_API_KEY` for an OpenAI-compatible service. Loading the page alone does not prove the provider works.
- Preload the 30-day snapshot and map tiles. Rehearse the June 30 replay and latest-future location example against the deployed snapshot; ranks can change after data refreshes.
- Use a clean browser profile or clear old local reviews. Keep a prepared export and screenshots as backups. Do not expose credentials during the demo.
- Prepare an Agent answer in advance so provider latency does not consume the live-demo budget. Show an actual saved response; do not present a mocked answer as a live provider result.

## 1. Introduction — 0:00–0:10

**Say:** “We’re [team name]. Calgary Road Intelligence helps road analysts decide which locations to review first, understand the evidence, and plan ahead.”

Replace the team-name placeholder before rehearsal.

## 2. Problem — 0:10–1:10

Cover the Pitch checklist: customer, context, root cause, alternative, and measurable impact.

- **Customer:** municipal road-operations and transportation analysts; a proposed customer, not an established customer relationship.
- **Context:** limited inspection capacity, with reports scattered across dates and locations. The dashboard snapshot has **27,805 reports** and **9,661 observed road/grid locations**. Reports include stalls and other disruptions, not only confirmed crashes.
- **Root cause:** a report list does not establish a reliable site, explain surrounding infrastructure, or preserve the reasoning behind a review decision.
- **Alternative:** rank by recent report frequency. This is a useful transparent baseline, but it cannot establish treatment suitability and can be unstable at sparse sites. Avoid unsupported comparisons with commercial products.
- **Measured proxy:** at a fixed Top20 budget, six exploratory 2026 monthly replays average **36.8 subsequent reports covered by EB versus 33.0 by recent rate**, about **12% more**. This measures report coverage, not avoided crashes, financial savings, or saved analyst time.

**Transition:** “We connect evidence, a forward outlook, and a documented human decision—with an Agent that explains the supplied results.”

## 3. Software demo — 1:10–3:00

Keep the live demo to **1:50**. Use prepared selections rather than touring every control.

| Time | Action | What to say |
|---|---|---|
| 1:10–1:30 | Start on **Agent**, select **30-day EB** and **Latest future forecast**. Show a prepared response to “Which locations should we inspect first, and why?” and the ranking table. | “The Agent explains the selected model evidence, using readable location names, supplied ranks and uncertainty. Statistical models produce the rankings; the language model explains them.” |
| 1:30–1:50 | Open **Map preview** with a pre-applied historical scope. Play the timeline briefly, then open **Evidence** for one shortlisted location and one source report. | “We can inspect the history behind a priority, rather than accept an unexplained score.” |
| 1:50–2:20 | **Forward outlook → Short-term · 7 / 30 days → Next 30 days → Historical backtest**. Select cutoff **2026-06-30**, click **Generate forecast**, then reveal outcomes. | “At the same 20-location budget, this replay covers **46** later reports with EB versus **36** with recent rate. EB blends a site’s own history with an expectation based on site characteristics.” |
| 2:20–2:40 | Switch to **Future forecast**, generate, and select **DEERFOOT TR SE & MEMORIAL DR SE** if it remains in the deployed shortlist. Show site facilities, evidence and a suggested improvement. | “These are investigation candidates. Mapped assets and external treatment studies provide context; they do not prove a treatment is appropriate.” |
| 2:40–3:00 | Mark one checklist item, choose **Worth inspecting**, add a brief note and save. Filter to that status and **Export inspection shortlist**. | “The result is a documented analyst review plan that can be shared.” |

Agent reads saved monthly reviews when a question is sent. Unsaved edits are not evidence. Its conversation is evidence-specific; changing the evidence selection resets it. Keep the selected location and the question aligned.

### Optional demonstrations — use only if time remains

- **Agent → Historical applied scope → Evaluate historical inspection plans:** expand **Current plan backtest · 90-day history → next 30 days**. Explain coverage at March, May and July 2026 cutoffs. The separate **Evaluate candidate plans** tool searches weights and checks a frozen holdout; ask the Agent to interpret results after running it. Automatic and Historical evaluation no longer have separate navigation pages. Change historical settings in Map preview; Agent has no Analysis Controls.
- **Forward outlook → Annual · 12 months:** show the full-inventory EB outlook, replay cutoff selector and review suggestions. Partial observed outcomes are not a completed annual validation.
- **Plan comparison:** save a historical plan, change settings, and show retained/entered/exited locations. Applying searched weights remains an explicit analyst action.
- **Data & method:** show current snapshot totals, source links, timezone conventions and why starter totals differ. **Weather context** shows airport-weather associations; it does not establish local road conditions.

## 4. Wrap-up — 3:00–4:40

**3:00–3:30 — Measured value and limits.** Restate the six-replay average, then give the counterexample: the **2026-08-31** replay covers **35 reports with EB versus 43 with recent rate**. EB does not win uniformly. These repeatedly inspected comparisons remain exploratory, not prospective proof of operational benefit.

**3:30–4:10 — Adoption and next steps.** Propose a small analyst pilot with the exported Top20. Measure review time, candidate relevance and usefulness of the proposed investigations. Verify location/asset associations, obtain confirmed crash severity and better exposure data, and freeze a prospective evaluation protocol. A municipal analytics or maintenance-system integration is a commercialization hypothesis; demand and pricing are unvalidated.

**4:10–4:40 — Closing ask.** “We turn historical reports into an inspectable shortlist, add a forward outlook, and explain the evidence through an Agent while preserving the analyst’s decision. Our next step is a pilot to test whether this improves real inspection planning. We’re looking for domain feedback and a pilot partner.”

## Judging alignment and architecture answer

The slides’ rubric allocates 30% to autonomous reasoning/data-driven decisions, 20% industrial relevance, 20% execution/architecture, 15% commercialization and 15% presentation/demo.

- Demonstrate statistical ranking, an explicit baseline comparison and evidence-grounded Agent explanations. The Agent cannot perform field verification or autonomously apply changes.
- Architecture: official public data → offline EB fitting → compressed forecast snapshots → dashboard/maps/review/export. The seven-day Poisson model runs separately in a browser worker. Agent requests go through a server endpoint to the configured OpenAI-compatible provider; selected evidence and questions leave the app, while API keys stay on the server.
- If the provider fails, continue with deterministic ranking and source evidence. If map tiles fail, use the table and export. Cut optional annual/CMF detail first; retain the problem, one measured comparison, human review and closing ask.

## Backup facts and Q&A

**Data populations.** Dashboard: 27,805 reports, local date range **2022-12-31 ~ 2026-10-03**, from official UTC records starting January 2023. The local December 2022 boundary is a timezone conversion, not an extra year of data. Full-inventory EB: **120,567 road segments + 46,007 derived intersections = 166,574 units**. These differ from the dashboard’s observed road/grid groups; cross-population rank overlap is invalid. Weather: **32,922 hourly airport observations**. Check Data & method for current values after a refresh.

**Models.** Seven-day: ridge Poisson, tuning with 2023→2024 and 2023–2024→2025 folds. Thirty-day: pure EB, rolling three-year history. Annual: EB with rolling five-year history. Historical replays only use evidence before their cutoff; latest-future fits can include completed 2026 observations. Airport weather is context, not a feature in the deployed EB models. Experimental learned event-type weighting is not verified severity weighting.

**Forecast boundaries.** Estimates concern report activity, not crash probabilities. Sparse reporting, current geometry, undated assets, unknown removals, incomplete exposure and publication-date uncertainty limit validity. Agent explanations do not make these inputs more certain.

**Treatment suggestions.** CMF matches are demonstration research candidates from external crash studies, not Calgary treatment recommendations or avoided-report estimates. Verify the linked study, actual ramp/intersection geometry, traffic control and engineering applicability. Zero mapped signals does not prove absence. Reviewer checklist items are feedback, not certified findings.

**Review storage.** Reviews are saved locally to the device/browser; export is the sharing mechanism. Monthly Agent context can include these saved reviews. Agent answers and ranking tables use only the selected supplied evidence, not unrestricted access to the entire database.

**Source audit.** `reports/demo-location-review.json` records a sampled latest-future Top10. Its 30 source examples matched dashboard source IDs and fitted date bounds when audited. This checks record traceability, not correct road assignment; it is not field or imagery verification and can become stale after regeneration.
