import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes, useLocation } from "react-router-dom";
import { getPathMapping } from "../../utils";
import { useEffect, useLayoutEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { Header } from "../../components/Header";
import { NotFound } from "../../components/NotFound";
import { Footer } from "../../components/Footer";
import { MolecularLoader } from "../../components/MolecularLoader";
import { SectionNav } from "../../components/PageScaffold";

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

const App = () => {
  const pathMapping = getPathMapping();
  const location = useLocation();
  const currentPath = location.pathname || "/";

  const currentPage = pathMapping[currentPath];
  const isImmersiveResults = currentPath === "/results";
  const showStandardHeader =
    currentPath !== "/" && currentPath !== "/attributions" && !isImmersiveResults && !!currentPage;

  // Set Page Title
  const title = currentPage?.title || "Not Found";

  useEffect(() => {
    document.title = `${title || ""} | ${import.meta.env.VITE_TEAM_NAME} - iGEM ${import.meta.env.VITE_TEAM_YEAR}`;
  }, [title]);

  return (
    <div className="atlas-app-shell">
      <ScrollToTop />
      <MolecularLoader routeKey={location.pathname} />
      {/* Navigation */}
      <Navbar />

      {/* Header and PageContent */}
      <Routes>
        {Object.entries(pathMapping).map(
          ([
            path,
            {
              title,
              lead,
              component: Component,
              summaryBullets,
              heroFigure,
              ctaLinks,
              anchorSections,
            },
          ]) => (
            <Route
              key={path}
              path={path}
              element={
                <>
                  {showStandardHeader && path === currentPath ? (
                    <Header
                      title={title || ""}
                      lead={lead || ""}
                      summaryBullets={summaryBullets}
                      heroFigure={heroFigure}
                      ctaLinks={ctaLinks}
                    />
                  ) : null}
                  {path === "/" || path === "/attributions" ? (
                    <Component />
                  ) : (
                    <div className={`container page-shell ${path === "/results" ? "page-shell-results" : ""}`.trim()}>
                      {path !== "/results" && anchorSections?.length ? (
                        <SectionNav sections={anchorSections} />
                      ) : null}
                      <Component />
                    </div>
                  )}
                </>
              }
            />
          ),
        )}
        <Route
          path="*"
          element={
            <>
              <Header
                title="Not Found"
                lead="The requested URL was not found on this server."
              />
              <NotFound />
            </>
          }
        />
      </Routes>

      {/* Footer */}
      {/* MUST mention license AND have a link to team wiki's repository on gitlab.igem.org */}
      <Footer />
    </div>
  );
};

export default App;
