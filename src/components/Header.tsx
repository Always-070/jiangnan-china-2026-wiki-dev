import type {
  CallToAction,
  HeroFigure,
} from "./PageScaffold";
import { PageIntro } from "./PageScaffold";

interface HeaderProps {
  title: string;
  lead: string;
  summaryBullets?: string[];
  heroFigure?: HeroFigure;
  ctaLinks?: CallToAction[];
}

export function Header({
  title,
  lead,
  summaryBullets,
  heroFigure,
  ctaLinks,
}: HeaderProps) {
  return (
    <header className="bg-hero page-hero-shell">
      <div className="container">
        <PageIntro
          eyebrow="Jiangnan-China 2026"
          title={title}
          summary={lead}
          bullets={summaryBullets}
          heroFigure={heroFigure}
          ctaLinks={ctaLinks}
          tone="dark"
          className="page-hero"
        />
      </div>
    </header>
  );
}
