import { stringToSlug } from "../utils";

export function Footer() {
  const teamYear = import.meta.env.VITE_TEAM_YEAR;
  const teamName = import.meta.env.VITE_TEAM_NAME;
  const teamSlug = stringToSlug(teamName);
  const repoPath =
    import.meta.env.VITE_REPOSITORY_PATH || `${teamYear}/${teamSlug}`;

  return (
    <footer className="pt-5 pb-5 footer py-5 mt-5 bg-dark text-white">
      <div className="container">
        <div className="row mb-4">
          <div className="col-lg-5 col-xs-12">
            <h4 className="mb-3">Jiangnan-China 2026</h4>
            <p>
              Temporary development wiki for Jiangnan-China while the official
              iGEM Team Wiki activation is not yet open. This repository is
              used to learn the stack, organize content early, and reduce
              last-minute work before the official Wiki freeze.
            </p>
          </div>
          <div className="col-lg-4 col-xs-12">
            <h4 className="mt-lg-0 mt-sm-3">Quick Links</h4>
            <ul className="m-2 p-2">
              <li>
                <a href="https://teams.igem.org/6172" target="_blank">
                  Team profile
                </a>
              </li>
              <li>
                <a
                  href="https://competition.igem.org/deliverables/team-wiki"
                  target="_blank"
                >
                  Team Wiki requirements
                </a>
              </li>
              <li>
                <a href="https://competition.igem.org/calendar" target="_blank">
                  Competition calendar
                </a>
              </li>
              <li>
                <a href={`https://gitlab.igem.org/${repoPath}`} target="_blank">
                  Development repository
                </a>
              </li>
            </ul>
          </div>
          <div className="col-lg-3 col-xs-12">
            <h4 className="mt-lg-0 mt-sm-4 mb-3">Current Status</h4>
            <p>Team ID: {import.meta.env.VITE_TEAM_ID}</p>
            <p className="mb-0">Official wiki: not activated yet</p>
            <p>Stack: React + TypeScript + Vite</p>
          </div>
        </div>
        <hr />
        {/* The following MUST be on every page: license information and link to the repository on gitlab.igem.org */}
        <div className="row mt-4">
          <div className="col">
            <p className="mb-0">
              <small>
                © {teamYear} - Content on this site is licensed under a{" "}
                <a
                  className="subfoot"
                  href="https://creativecommons.org/licenses/by/4.0/"
                  rel="license"
                >
                  Creative Commons Attribution 4.0 International license
                </a>
                .
              </small>
            </p>
            <p>
              <small>
                The repository used to create this website is available at{" "}
                <a href={`https://gitlab.igem.org/${repoPath}`}>
                  gitlab.igem.org/{repoPath}
                </a>
                .
              </small>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
