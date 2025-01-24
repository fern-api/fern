import { docsYml } from "@fern-api/configuration";

import { MintJsonSchema } from "./mintlify";

export function convertColors(colors: MintJsonSchema["colors"]): docsYml.RawSchemas.ColorsConfiguration {
    return {
        accentPrimary: {
            // TODO: verify that we want to use colors.dark/light as the primary accent color
            dark: colors.dark ?? colors.primary,
            light: colors.light ?? colors.primary
        },
        background: {
            dark: colors.background?.dark,
            light: colors.background?.light
        }
    };
}
