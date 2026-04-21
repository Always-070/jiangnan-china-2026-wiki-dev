import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from "react-router-dom";
import { getPathMapping, stringToSlug } from "../../utils";
import { useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { Header } from "../../components/Header";
import { NotFound } from "../../components/NotFound";
import { Footer } from "../../components/Footer";
import { SectionNav } from "../../components/PageScaffold";

const App = () => {
  const pathMapping = getPathMapping();
  const currentPath =
    location.pathname
      .split(`${stringToSlug(import.meta.env.VITE_TEAM_NAME)}`)
      .pop() || "/";

  const currentPage = pathMapping[currentPath];
  const showStandardHeader =
    currentPath !== "/" && currentPath !== "/attributions" && !!currentPage;

  // Set Page Title
  const title = currentPage?.title || "Not Found";

  useEffect(() => {
    document.title = `${title || ""} | ${import.meta.env.VITE_TEAM_NAME} - iGEM ${import.meta.env.VITE_TEAM_YEAR}`;
  }, [title]);

  return (
    <>
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
                    <div className="container page-shell">
                      {anchorSections?.length ? (
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
    </>
  );
};

export default App;
