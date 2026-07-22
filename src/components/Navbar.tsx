import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import BootstrapNavbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Link, useLocation } from "react-router-dom";

interface NavigationItem {
  name: string;
  path: string;
}

const projectPath: NavigationItem[] = [
  { name: "Description", path: "/description" },
  { name: "Engineering", path: "/engineering" },
  { name: "Results", path: "/results" },
  { name: "Steroid Game", path: "/steroid-tile-atlas" },
  { name: "Contribution", path: "/contribution" },
  { name: "Wiki Excellence", path: "/wiki-excellence" },
];

const wetLabPath: NavigationItem[] = [
  { name: "Experiments", path: "/experiments" },
  { name: "Notebook", path: "/notebook" },
  { name: "Measurement", path: "/measurement" },
  { name: "Safety", path: "/safety-and-security" },
  { name: "Plant", path: "/plant" },
];

const dryLabPath: NavigationItem[] = [
  { name: "Model", path: "/model" },
  { name: "Software", path: "/software" },
  { name: "Hardware", path: "/hardware" },
];

const humanPracticePath: NavigationItem[] = [
  { name: "Human Practices", path: "/human-practices" },
  { name: "Education", path: "/education" },
  { name: "Strain Lab", path: "/strain-personality-lab" },
  { name: "Inclusivity", path: "/inclusivity" },
  { name: "Sustainability", path: "/sustainability" },
  { name: "Entrepreneurship", path: "/entrepreneurship" },
];

const teamPath: NavigationItem[] = [
  { name: "Members", path: "/team" },
  { name: "Attributions", path: "/attributions" },
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
    path === "/"
      ? location.pathname === path
      : location.pathname.startsWith(path);

  return (
    <BootstrapNavbar
      expand="lg"
      className="bg-body-tertiary atlas-navbar"
      fixed="top"
    >
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
              id="project-path-nav"
              title="Project"
              items={projectPath}
              isActivePath={isActivePath}
            />
            <NavigationGroup
              id="wet-lab-path-nav"
              title="Wet Lab"
              items={wetLabPath}
              isActivePath={isActivePath}
            />
            <NavigationGroup
              id="dry-lab-path-nav"
              title="Dry Lab"
              items={dryLabPath}
              isActivePath={isActivePath}
            />
            <NavigationGroup
              id="human-practice-path-nav"
              title="Human Practice"
              items={humanPracticePath}
              isActivePath={isActivePath}
            />
            <NavigationGroup
              id="team-path-nav"
              title="Team"
              items={teamPath}
              isActivePath={isActivePath}
            />
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}
