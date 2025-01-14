import { docsYml } from "@fern-api/configuration";

import { scrapedColors } from "../types/scrapedColors";

export function convertColors(colors: scrapedColors): docsYml.RawSchemas.ColorsConfiguration {
    return {
        accentPrimary: {
            dark: colors.dark ?? colors.primary,
            light: colors.light ?? colors.primary
        },
        background: {
            dark: colors.background?.dark,
            light: colors.background?.light
        }
    };
}
