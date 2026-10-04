import type { Dataset } from "./domain/types";
export function DataMethodPage({data}: {data: Dataset}) {
  return (
    <div className="method">
      <h2>Data sources & methodology</h2>
      <p>
        Analysis uses fixed public-data snapshots. Traffic records are converted
        from UTC to America/Edmonton; nearest-road associations and report
        categories are approximate, not confirmed collision or road-safety
        labels.
      </p>
      <h3>External data sources</h3>
      <div className="source-cards">
        {[
          [
            "Traffic Incidents",
            "City of Calgary",
            "https://data.calgary.ca/Transportation-Transit/Traffic-Incidents/35ra-9556",
            `${data.audit.events.toLocaleString()} reports in the dashboard snapshot, local dates ${data.audit.first} ~ ${data.audit.last}; ${data.locations.length.toLocaleString()} observed road/grid locations. UTC source records start in January 2023, which includes local December 31, 2022. The separate offline EB pipeline uses the longer official archive with rolling three-year/monthly and five-year/annual histories.`,
          ],
          [
            "Street Centreline",
            "City of Calgary",
            "https://data.calgary.ca/Transportation-Transit/Street-Centreline/4dx8-rtm5",
            `${Number(data.audit.roads).toLocaleString()} road segments in the full city inventory. EB also derives 46,007 intersections (166,574 forecast units in total); these differ from the dashboard’s observed road/grid groups. Current geometry does not certify historical road identity.`,
          ],
          [
            "Traffic Volumes 2024",
            "City of Calgary",
            "https://data.calgary.ca/dataset/Traffic-Volumes-for-2024/cauu-7hnw",
            `${Number((data.audit.volumes as {sections: number}).sections).toLocaleString()} count sections in dashboard context. Nearby average-weekday traffic context only; proximity linkage and year mismatch prevent treating it as verified event exposure.`,
          ],
          [
            "Hourly Historical Weather",
            "Environment and Climate Change Canada",
            "https://climate.weather.gc.ca/climate_data/hourly_data_e.html?StationID=50430",
            `${Number(data.weather.audit.hours).toLocaleString()} hourly observations, ${data.weather.audit.firstUTC} ~ ${data.weather.audit.lastUTC}, at CALGARY INTL A (50430). Source local standard time (UTC−7) is converted to UTC before event matching. Airport weather is context, not road-surface measurement or a feature in the deployed EB models.`,
          ],
          ...[
            ["Traffic Volumes 2016", "6wve-2ets"], ["Traffic Volumes 2017", "nvuz-qykn"],
            ["Traffic Volumes 2018", "wwf6-cpsg"], ["Traffic Volumes 2019", "qeqv-tb2c"],
            ["Traffic Volumes 2022", "57me-rcwr"], ["Traffic Volumes 2023", "bjag-w7zi"],
          ].map(([name, id]) => [name, "City of Calgary", `https://data.calgary.ca/d/${id}`,
            "Yearly average-weekday traffic counts used by the offline EB pipeline. 2020–2021 releases are unavailable; missing exposure and publication-date uncertainty limit interpretation."]),
          ...[
            ["Traffic Signals", "qr97-4jvx"], ["Traffic Signs", "u6ce-yibw"], ["Crosswalks", "hxgg-rpad"],
          ].map(([name, id]) => [name, "City of Calgary", `https://data.calgary.ca/d/${id}`,
            "Current asset inventory supplies EB site characteristics and treatment-screening context. Undated assets and unknown removals prevent verified historical reconstruction."]),
          ["Crash Modification Factors", "FHWA CMF Clearinghouse", "https://www.cmfclearinghouse.org/",
            "External crash-treatment studies inform demonstration review suggestions. CMFs are not calibrated to Calgary traffic reports and do not establish avoided reports or safety gains."],
          [
            "Hackathon Starter Dataset",
            "IEEE case repository",
            "https://github.com/nagusubra/industry-hackathon-lab/tree/main/01-energy-and-infrastructure-systems/Case%205%20-%20Autonomous%20Calgary%20Collision-Hotspot%20Ranking%20Agent",
            "6,984 records in the case starter CSV. Used to inspect the case and compare source records; current analysis uses the official snapshot.",
          ],
          [
            "Vector Basemap",
            "OpenFreeMap / OpenMapTiles / OpenStreetMap",
            "https://openfreemap.org/",
            "Key-free map tiles, labels and buildings. Display context, independent of the official road-association dataset; requires network access.",
          ],
          [
            "Interface Fonts",
            "Google Fonts",
            "https://fonts.google.com/",
            "DM Sans and Space Grotesk provide interface typography. External font delivery is optional; local fallback fonts remain available. No analytical data is supplied.",
          ],
          [
            "Snow-Clearing Priority Routes",
            "City of Calgary · planned reference",
            "https://data.calgary.ca/Health-and-Safety/Snow-and-Ice-Clearing-Priority-Routes-Map/fuea-eg5z",
            "Proposed winter reference layer. Not currently imported or used in rankings; underlying downloadable data still needs verification.",
          ],
        ].map(([name, provider, url, description]) => (
          <article key={name}>
            <span>{provider}</span>
            <a href={url} target="_blank" rel="noreferrer">
              {name} ↗
            </a>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <h3>Why totals differ from the starter dataset</h3>
      <p>
        The historical comparison below concerns the 2025 subset only. The app
        now includes 2023–2026 reports, so its full totals are not directly
        comparable to the starter. The starter has 6,984 records; the original
        official UTC-year 2025 snapshot has 7,015. A one-to-one comparison
        matched 6,980 starter records by location, nearby coordinates and time
        offsets. After whitespace normalization, matched descriptions, quadrants
        and counts agree. Four starter records and 35 official records remained
        unmatched; this does not mean all 35 are newly added events.
      </p>
      <p>
        Seventeen official records occur in early UTC January 1 but still fall
        on local December 31, 2024. A local-2025 view of that original snapshot
        excludes them, producing 6,998 displayed events. The 4,100 locations are
        our road/grid aggregation of that view, not a location count supplied by
        the starter.
      </p>
      <p>
        Starter timestamps have mixed apparent time conventions: 1,538 matched
        records differ from official UTC by 7 hours, 3,114 by 6 hours, and 2,328
        share the same hour. This is consistent with local winter/summer time
        for some records and UTC-like values for others, but the underlying
        conversion history is unconfirmed. Official timestamps are
        minute-resolution; starter values retain seconds. Coordinates also
        differ slightly in decimal precision. The official explicit UTC field is
        used for time filtering and weather joins.
      </p>
      <h3>Scoring and interpretation</h3>
      <p>
        The 7-day Ridge Poisson model tunes on 2023→2024 and 2023–2024→2025
        folds, with 2026 replay outcomes reserved for evaluation. The 30-day
        model uses pure Empirical Bayes with rolling three-year history; the
        12-month model uses EB with rolling five-year history. Latest future
        snapshots can include completed 2026 observations in their training
        history; each historical replay only uses evidence before its cutoff.
        These are distinct fitting and replay workflows, not one fixed training split. The default map scope is the latest 90 days.
        Weather observations cover January 2023 through October 2026; missing
        station measurements remain explicitly unavailable. Frequency uses
        normalized log count; recent growth compares two 30-day windows with
        smoothing; recurrence uses distinct event dates. Forecasts estimate
        report counts, not crash probabilities. Road matching, incomplete
        reporting and sparse location histories limit the conclusions.
      </p>
      <p>
        <a
          href="https://data.calgary.ca/stories/s/Open-Calgary-Terms-of-Use/u45n-7awa"
          target="_blank"
          rel="noreferrer"
        >
          Calgary open-data terms ↗
        </a>{" "}
        ·{" "}
        <a
          href="https://www.canada.ca/en/environment-climate-change/corporate/transparency/terms-conditions.html"
          target="_blank"
          rel="noreferrer"
        >
          ECCC terms ↗
        </a>{" "}
        ·{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap attribution ↗
        </a>
      </p>
    </div>
  );
}
