import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <main className="container not-found-state">
      <p className="not-found-kicker">Page missing</p>
      <h1 className="not-found-title">404</h1>
      <p className="not-found-copy">
        The page may have moved while the wiki story is still being assembled.
      </p>
      <Link to="/" className="intro-action intro-action-primary">
        Back to Home
      </Link>
    </main>
  );
}
