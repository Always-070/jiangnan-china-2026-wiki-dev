import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import BootstrapNavbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, useLocation } from "react-router-dom";

interface NavigationItem {
  name: string;
  path: string;
}

const judgePath: NavigationItem[] = [
  { name: "Description", path: "/description" },
  { name: "Engineering", path: "/engineering" },
  { name: "Results", path: "/results" },
  { name: "Human Practices", path: "/human-practices" },
  { name: "Safety", path: "/safety-and-security" },
];

const labPath: NavigationItem[] = [
  { name: "Experiments", path: "/experiments" },
  { name: "Notebook", path: "/notebook" },
  { name: "Measurement", path: "/measurement" },
  { name: "Model", path: "/model" },
  { name: "Software", path: "/software" },
];

const teamPath: NavigationItem[] = [
  { name: "Members", path: "/team" },
  { name: "Attributions", path: "/attributions" },
  { name: "Contribution", path: "/contribution" },
  { name: "Education", path: "/education" },
  { name: "Sustainability", path: "/sustainability" },
];

const morePath: NavigationItem[] = [
  { name: "Hardware", path: "/hardware" },
  { name: "Plant", path: "/plant" },
  { name: "Entrepreneurship", path: "/entrepreneurship" },
  { name: "Inclusivity", path: "/inclusivity" },
  { name: "Wiki Excellence", path: "/wiki-excellence" },
];

function NavigationGroup({
  id,
  title,
  items,
  isActivePath,
}: {
  id: string;
  title: string;
  items: NavigationItem[];
  isActivePath: (path: string) => boolean;
}) {
  const active = items.some((item) => isActivePath(item.path));

  return (
    <NavDropdown title={title} id={id} active={active}>
      {items.map((item) => {
        const itemIsActive = isActivePath(item.path);

        return (
          <NavDropdown.Item
            key={item.path}
            as={Link}
            to={item.path}
            className={itemIsActive ? "active" : undefined}
            aria-current={itemIsActive ? "page" : undefined}
          >
            {item.name}
          </NavDropdown.Item>
        );
      })}
    </NavDropdown>
  );
}

export function Navbar() {
  const location = useLocation();

  const isActivePath = (path: string) =>
    path === "/" ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <BootstrapNavbar expand="lg" className="bg-body-tertiary atlas-navbar" fixed="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="brand-mark">
          <span className="brand-mark-symbol" aria-hidden="true" />
          <span>
            {import.meta.env.VITE_TEAM_NAME}
            <small>{import.meta.env.VITE_TEAM_YEAR}</small>
          </span>
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="left-aligned">
            <Nav.Link
              as={Link}
              to="/"
              active={isActivePath("/")}
              aria-current={isActivePath("/") ? "page" : undefined}
            >
              Home
            </Nav.Link>
            <NavigationGroup
              id="judge-path-nav"
              title="Judge Path"
              items={judgePath}
              isActivePath={isActivePath}
            />
            <NavigationGroup
              id="lab-path-nav"
              title="Lab Path"
              items={labPath}
              isActivePath={isActivePath}
            />
            <NavigationGroup
              id="team-path-nav"
              title="Team"
              items={teamPath}
              isActivePath={isActivePath}
            />
            <NavigationGroup
              id="more-path-nav"
              title="More"
              items={morePath}
              isActivePath={isActivePath}
            />
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}
