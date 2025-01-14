import { docsYml } from "@fern-api/configuration";
import { stripLeadingSlash } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { scrapedLogo } from "../types/scrapedLogo";

const LOGO_DEFAULT_HEIGHT = 28;

export declare namespace convertLogo {
    interface Args {
        logo: scrapedLogo;
    }
}

export function convertLogo({ logo }: convertLogo.Args): docsYml.RawSchemas.LogoConfiguration | undefined {
    if (logo == null) {
        return undefined;
    }

    if (typeof logo === "string") {
        const relativeFilepath = RelativeFilePath.of(stripLeadingSlash(logo));
        return {
            light: relativeFilepath,
            dark: relativeFilepath,
            height: LOGO_DEFAULT_HEIGHT
        };
    }

    const relativeFilepathToLight = RelativeFilePath.of(stripLeadingSlash(logo.light));
    const relativeFilepathToDark = RelativeFilePath.of(stripLeadingSlash(logo.dark));
    return {
        light: relativeFilepathToLight,
        dark: relativeFilepathToDark,
        href: undefined,
        height: LOGO_DEFAULT_HEIGHT
    };
}
