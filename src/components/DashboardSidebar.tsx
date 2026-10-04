import { NavIcon } from "../NavIcon";
export function DashboardSidebar({ pages, tab, setTab, data }: any) {
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
          {pages.map((page:string) => (
            <button
              key={page}
              title={page}
              aria-label={page}
              className={tab === page ? "active" : ""}
              aria-current={tab === page ? "page" : undefined}
              onClick={() => setTab(page)}
            >
              <NavIcon index={{Agent:8,"Map preview":0,Evidence:1,"Plan comparison":2,"Forward outlook":4,"Weather context":5,"Data & method":7}[page] ?? 0} />
              <span className="nav-label">{page}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <i /> Historical operations lab
          <small>{data.audit.first} ~ {data.audit.last} · MOUNTAIN TIME</small>
        </div>
      </aside>
    </>
  );
}
