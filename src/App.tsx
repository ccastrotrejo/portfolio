import { DotField } from './components/DotField.tsx'
import { LocalTime } from './components/LocalTime.tsx'
import { bio, ext, links, person, projects, work } from './content.tsx'

export function App() {
  return (
    <div className="site">
      <DotField />
      <main className="site__page">
        <header className="site__header">
          <h1 className="site__name">{person.name}</h1>
          <p className="site__meta">
            {person.role} · {person.location}
          </p>
        </header>

        <section className="site__bio" aria-label="About">
          {bio.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>

        <section aria-labelledby="work">
          <h2 id="work" className="site__heading">
            Work
          </h2>
          <ul className="site__list">
            {work.map((r) => (
              <li key={`${r.company}-${r.period}`} className="site__row">
                <div>
                  <p className="site__row-title">
                    {r.company} <span className="site__row-sub">— {r.title}</span>
                  </p>
                  <p className="site__row-blurb">{r.summary}</p>
                </div>
                <span className="site__row-meta">{r.period}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="building">
          <h2 id="building" className="site__heading">
            Building
          </h2>
          <ul className="site__list site__list--links">
            {projects.map((p) => (
              <li key={p.name}>
                <a className="site__row site__row--link" href={p.href} {...ext}>
                  <div>
                    <p className="site__row-title">
                      {p.name}
                      <span className="site__arrow" aria-hidden="true">
                        ↗
                      </span>
                    </p>
                    <p className="site__row-blurb">{p.blurb}</p>
                  </div>
                  <span className="site__row-meta">{p.kind}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <footer className="site__footer">
          <p>
            {links.map((l, i) => (
              <span key={l.label}>
                {i > 0 && ' · '}
                <a href={l.href} {...(l.external ? ext : {})}>
                  {l.label}
                </a>
              </span>
            ))}
          </p>
          <LocalTime timeZone={person.timeZone} city={person.city} />
        </footer>
      </main>
    </div>
  )
}
