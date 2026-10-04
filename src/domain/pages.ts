export function pageControls(tab: string) {
  return {
    dates: [
      "Map preview",
      "Evidence",
      "Plan comparison",
      "Weather context",
    ].includes(tab),
    period: !["Forward outlook", "Data & method", "Agent"].includes(tab),
    category: !["Forward outlook", "Data & method", "Agent"].includes(tab),
    weather: [
      "Map preview",
      "Evidence",
      "Plan comparison",
      "Historical evaluation",
    ].includes(tab),
    capacity: [
      "Map preview",
      "Plan comparison",
      "Historical evaluation",
    ].includes(tab),
    weights: [
      "Map preview",
      "Plan comparison",
      "Historical evaluation",
    ].includes(tab),
    save: ["Map preview", "Plan comparison"].includes(tab),
  };
}
