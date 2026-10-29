export function App() {
  return (
    <main className="wip">
      <p className="wip__status">
        <span className="wip__dot" aria-hidden="true" />
        In progress
      </p>

      <h1 className="wip__title">We’re working on it.</h1>

      <p className="wip__lede">
        A home for my projects, side builds, and experiments is on its way.
      </p>

      <div
        className="wip__track"
        role="progressbar"
        aria-label="Site under construction"
        aria-valuetext="In progress"
      >
        <span className="wip__bar" />
      </div>
    </main>
  )
}
