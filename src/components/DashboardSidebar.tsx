import { NavIcon } from "../NavIcon";
export function DashboardSidebar({ pages, tab, setTab }: any) {
  return (
    <>
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="mark">↗</span>
          <div className="sidebar-wordmark">
            CALGARY<small>ROAD INTELLIGENCE</small>
          </div>
        </div>
        <nav className="dashboard-nav" aria-label="Dashboard pages">
          <div className="panel-subtitle">WORKSPACE</div>
          {pages.map((page:string, i:number) => (
            <button
              key={page}
              title={page}
              aria-label={page}
              className={tab === page ? "active" : ""}
              aria-current={tab === page ? "page" : undefined}
              onClick={() => setTab(page)}
            >
              <NavIcon index={page === "Agent" ? 8 : i - 1} />
              <span className="nav-label">{page}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <i /> Historical operations lab
          <small>2025 SNAPSHOT · MOUNTAIN TIME</small>
        </div>
      </aside>
    </>
  );
}
