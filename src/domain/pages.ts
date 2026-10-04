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
    ].includes(tab),
    capacity: [
      "Map preview",
      "Plan comparison",
    ].includes(tab),
    weights: [
      "Map preview",
      "Plan comparison",
    ].includes(tab),
    save: ["Map preview", "Plan comparison"].includes(tab),
  };
}
