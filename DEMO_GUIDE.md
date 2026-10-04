# Pitch and Live Demo Guide

Follow the [hackathon slides’ Pitch section](https://canva.link/f4u4rlrgfjq2fky): introduction 5–10 seconds, problem about 1 minute, demo 1–2 minutes, wrap-up 1–2 minutes. Target **4:10**, leaving **30 seconds of margin** within the previous 4:40 rehearsal budget. Confirm the organizers’ final limit.

## Preparation

The site opens on **Map preview**, with **Agent second** in the sidebar. Verify the deployed Agent with a real question; preload forecast data and map tiles. Rehearse the June 30 replay and one future location. Use a clean review profile and keep a screenshot/export backup. Keep credentials off screen.

## Introduction — 0:00–0:10

“We’re [team name]. Calgary Road Intelligence helps road analysts decide which locations to inspect first, understand the evidence, and plan ahead.”

## Problem Statement and Our Solution — 0:10–1:10

**Problem:** Municipal road teams have limited inspection capacity. With 27,805 reports across 9,661 observed locations, analysts need to answer: **Where should we inspect first, and why?** Reports include crashes, stalls and other disruptions.

**Current approach and gap:** Recent report frequency is a useful baseline, but a count alone does not explain recent changes or recurrence, estimate future activity, or preserve the reasoning behind an inspection decision.

**Say:** “Our solution connects four steps. Historical analysis turns reports into an evidence-backed priority list. EB forecasts help analysts plan ahead. The Agent explains the supplied rankings, reasons and uncertainty. Finally, analysts review a location, record their decision and export an inspection plan.”

**Transition:** “Let’s follow that workflow: identify a priority, check its evidence, look ahead, and document the decision.”

Keep this section to one minute. Show the measured comparison during the live replay rather than adding another explanation here.

## Live demonstration — 1:10–3:10

Reserve the full **two minutes for actual interaction**. Narrate briefly while clicking; do not add a separate feature tour.

| Time | Problem addressed | Live action and message |
|---|---|---|
| 1:10–1:35 | Which locations deserve attention first? | **Map preview**: show the historical Top20 and briefly play the timeline. **Evidence**: open one location/source report. “We prioritize using frequency, recent growth and recurrence, with reports an analyst can inspect.” |
| 1:35–2:05 | What may need attention next month? | **Forward outlook → Next 30 days → Historical backtest**. Select **2026-06-30**, generate and reveal outcomes. “At the same Top20 budget, EB covers 46 later reports versus 36 for recent rate. Across six exploratory replays, the averages are 36.8 versus 33.0—about 12% more report coverage.” |
| 2:05–2:35 | How can an analyst understand the model’s priorities? | **Agent → 30-day EB → Latest future forecast**. Ask: “Which locations should we inspect first, and why?” Show the answer and ranking. “Statistical models produce the ranks; the Agent explains selected evidence and uncertainty.” |
| 2:35–3:10 | How does analysis become a usable inspection plan? | Return to **Forward outlook**, switch to **Future forecast**, generate and select a location. Mark **Worth inspecting**, add a note, save and **Export inspection shortlist**. “The analyst makes and documents the final review decision.” |

If Agent latency uses too much time, show a genuine prepared response and continue. If behind schedule, skip timeline playback. Keep the replay comparison and review/export. Use screenshots if map tiles fail.

## Wrap-up — 3:10–4:10

“The monthly comparison is promising, but EB does not always win: August’s replay covers 35 reports versus the baseline’s 43. Forecasts estimate report activity, not crash risk, and suggested treatments need engineering review.

“Our proposed next step is a small municipal analyst pilot: measure candidate relevance and review time, verify location and infrastructure data, and run a frozen prospective evaluation. Municipal integration is a commercialization hypothesis, not established demand.

“We’re looking for domain feedback and a pilot partner to test whether this improves real inspection planning.”

## Backup answers — only for questions

- **Data:** 27,805 reports / 9,661 dashboard locations; full EB inventory has 120,567 segments + 46,007 intersections. These are different populations. Check Data & method for current dates and sources.
- **Algorithms:** 7-day ridge Poisson; 30-day pure EB with three-year history; annual EB with five-year history. Replays use evidence before their cutoff. Airport weather is context, not a deployed EB feature.
- **Agent:** OpenAI-compatible server-side integration; questions and selected evidence go to the provider. It explains supplied results and cannot verify field conditions. Historical backtests and weight-search tools now live under its historical evidence option.
- **Review:** saved locally, shared by export. CMF suggestions are external-study research candidates, not verified treatment benefits.
- **Architecture:** public data → offline EB → gzip snapshots → dashboard/review/export; seven-day fitting runs in a browser worker. Agent explanation is separate from statistical ranking.
