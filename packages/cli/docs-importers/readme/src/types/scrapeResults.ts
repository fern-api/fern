import { scrapedColors } from "./scrapedColors";
import { scrapedLogo } from "./scrapedLogo";
import { scrapedNavigation } from "./scrapedNavigation";
import { scrapedTab } from "./scrapedTab";

export interface ScrapeResult {
    success: boolean;
    message?: string;
    data?: {
        name: string;
        logo: scrapedLogo;
        navigation: scrapedNavigation;
        tabs: Array<scrapedTab>;
        favicon: string;
        colors: scrapedColors;
    };
}
