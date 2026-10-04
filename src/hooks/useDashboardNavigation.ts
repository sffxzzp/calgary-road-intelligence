import { useEffect, useState } from "react";
export const dashboardPages = [
  "Map preview",
  "Agent",
  "Evidence",
  "Plan comparison",
  "Forward outlook",
  "Weather context",
  "Data & method",
];
export const pageHash = (page: string) =>
  page.toLowerCase().replaceAll(" ", "-").replace("&", "and");
const currentPage = () =>
  dashboardPages.find((page) => pageHash(page) === location.hash.slice(1)) ??
  "Map preview";
export function useDashboardNavigation() {
  const [page, setPage] = useState(currentPage);
  useEffect(() => {
    const sync = () => setPage(currentPage());
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);
  return {
    page,
    navigate: (next: string) => {
      if (!dashboardPages.includes(next) || next === page) return;
      setPage(next);
      history.pushState(null, "", "#" + pageHash(next));
    },
  };
}
