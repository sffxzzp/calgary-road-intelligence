# Pitch and Live Demo Guide

Follow the [hackathon slides’ Pitch section](https://canva.link/f4u4rlrgfjq2fky): introduction 5–10 seconds, problem about 1 minute, demo 1–2 minutes, wrap-up 1–2 minutes. Target **4:10**, leaving **30 seconds of margin** within the previous 4:40 rehearsal budget. Confirm the organizers’ final limit.

## Preparation

Verify the deployed Agent with a real question; preload forecast data and map tiles. Rehearse the June 30 replay and one future location. Use a clean review profile and keep a screenshot/export backup. Keep credentials off screen.

## Introduction — 0:00–0:10

“We’re [team name]. Calgary Road Intelligence helps road analysts decide which locations to inspect first, understand the evidence, and plan ahead.”

## Problem — 0:10–1:10

Use these talking points naturally; avoid reading every detail:

- Municipal analysts have limited inspection capacity. Our dashboard contains **27,805 traffic reports**, including disruptions beyond confirmed crashes.
- A report list alone does not explain location priorities or preserve the reasoning behind an inspection decision.
- Recent report frequency is our transparent baseline. Across six exploratory monthly replays, EB covers **36.8 subsequent reports versus 33.0** at the same Top20 budget—about **12% more**. This is report coverage, not proven safety or financial benefit.

“We connect historical evidence, a forward outlook, and a documented analyst decision.”

## Live demonstration — 1:10–3:10

Reserve the full **two minutes for actual interaction**. Narrate briefly while clicking; do not add a separate feature tour.

| Time | Live action | One-line message |
|---|---|---|
| 1:10–1:40 | **Agent → 30-day EB → Latest future forecast**. Ask: “Which locations should we inspect first, and why?” Show the answer and ranking. | “Statistical models rank the locations; the Agent explains the selected evidence and uncertainty.” |
| 1:40–2:00 | **Map preview**: play the timeline briefly, then **Evidence**: open one location/source report. | “Each priority has evidence an analyst can inspect.” |
| 2:00–2:30 | **Forward outlook → Next 30 days → Historical backtest**. Select **2026-06-30**, generate and reveal outcomes. | “This replay covers 46 later reports with EB versus 36 with recent rate, at the same inspection budget.” |
| 2:30–3:10 | Switch to **Future forecast**, generate, select a location, mark **Worth inspecting**, add a note, save and **Export inspection shortlist**. | “The output is a documented human review plan.” |

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
