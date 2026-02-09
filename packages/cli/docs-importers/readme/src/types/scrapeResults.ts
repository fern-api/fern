import { docsYml } from "@fern-api/configuration";

import { scrapedNavigation } from "./scrapedNavigation.js";
import { scrapedTab } from "./scrapedTab.js";

export interface ScrapeResult {
    success: boolean;
    message?: string;
    data?: {
        name: string;
        logo: docsYml.RawSchemas.LogoConfiguration | undefined;
        navigation: scrapedNavigation;
        tabs: Array<scrapedTab>;
        favicon: string;
        colors: docsYml.RawSchemas.ColorsConfiguration;
    };
}
