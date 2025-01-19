export type scrapedNavigationSection = {
    group: string;
    pages: scrapedNavigationEntry[];
};
export type scrapedNavigation = scrapedNavigationSection[];
export type scrapedNavigationGroup = {
    group: string;
    pages: scrapedNavigationEntry[];
    version?: string;
    icon?: string;
    iconType?:
        | "brands"
        | "duotone"
        | "light"
        | "regular"
        | "sharp-light"
        | "sharp-regular"
        | "sharp-solid"
        | "sharp-thin"
        | "solid"
        | "thin";
};
export type scrapedNavigationEntry = scrapedNavigationGroup | string;
