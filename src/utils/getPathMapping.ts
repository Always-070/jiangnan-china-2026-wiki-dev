import pages from "../pages.ts";
import type {
  CallToAction,
  HeroFigure,
  PageAnchor,
} from "../components/PageScaffold";

export const getPathMapping = () => {
  return pages.reduce<{
    [key: string]: {
      name: string | undefined;
      title: string | undefined;
      component: React.FC;
      lead: string | undefined;
      summaryBullets?: string[];
      anchorSections?: PageAnchor[];
      heroFigure?: HeroFigure;
      ctaLinks?: CallToAction[];
    };
  }>((map, item) => {
    if ("path" in item && item.path && item.component) {
      map[item.path] = {
        name: item.name,
        title: item.title,
        component: item.component,
        lead: item.lead,
        summaryBullets: item.summaryBullets,
        anchorSections: item.anchorSections,
        heroFigure: item.heroFigure,
        ctaLinks: item.ctaLinks,
      };
    } else if ("folder" in item && item.folder) {
      item.folder.forEach((page) => {
        if (page.path && page.component) {
          map[page.path] = {
            name: page.name,
            title: page.title,
            component: page.component,
            lead: page.lead,
            summaryBullets: page.summaryBullets,
            anchorSections: page.anchorSections,
            heroFigure: page.heroFigure,
            ctaLinks: page.ctaLinks,
          };
        }
      });
    }
    return map;
  }, {});
};
