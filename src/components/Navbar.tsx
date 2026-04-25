import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import BootstrapNavbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, useLocation } from "react-router-dom";
import Pages from "../pages.ts";

export function Navbar() {
  const location = useLocation();

  const isActivePath = (path: string) =>
    path === "/" ? location.pathname === path : location.pathname.startsWith(path);

  const pages = Pages.map((item, pageIndex) => {
    if ("folder" in item && item.folder) {
      const folderIsActive = item.folder.some(
        (subpage) => subpage.path && isActivePath(subpage.path),
      );
      const folderItems = item.folder.map((subpage, subpageIndex) => {
        if (subpage.path) {
          const subpageIsActive = isActivePath(subpage.path);

          return (
            <NavDropdown.Item
              key={`subpage-${pageIndex}-${subpageIndex}`}
              as={Link}
              to={subpage.path}
              className={subpageIsActive ? "active" : undefined}
              aria-current={subpageIsActive ? "page" : undefined}
            >
              {subpage.name}
            </NavDropdown.Item>
          );
        }
      });
      return (
        <NavDropdown
          key={`page-${pageIndex}`}
          title={item.name}
          id={`page-${pageIndex}`}
          active={folderIsActive}
        >
          {folderItems}
        </NavDropdown>
      );
    } else if ("path" in item && item.path) {
      const pageIsActive = isActivePath(item.path);

      return (
        <Nav.Link
          key={`page-${pageIndex}`}
          as={Link}
          to={item.path}
          active={pageIsActive}
          aria-current={pageIsActive ? "page" : undefined}
        >
          {item.name}
        </Nav.Link>
      );
    }
  });

  return (
    <BootstrapNavbar expand="lg" className="bg-body-tertiary" fixed="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="brand-mark">
          {import.meta.env.VITE_TEAM_NAME} {import.meta.env.VITE_TEAM_YEAR}
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="left-aligned">{pages}</Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}
