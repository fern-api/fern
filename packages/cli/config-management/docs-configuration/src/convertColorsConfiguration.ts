import { assertNever } from "@fern-api/core-utils";
import { FernDocsConfig as RawDocs } from "@fern-api/docs-config-sdk";
import { DocsV1Write } from "@fern-api/fdr-sdk";
import { TaskContext } from "@fern-api/task-context";
import tinycolor from "tinycolor2";

export function convertColorsConfiguration(
    rawConfig: RawDocs.ColorsConfiguration,
    context: TaskContext
): DocsV1Write.ColorsConfigV3 {
    rawConfig.accentPrimary = rawConfig.accentPrimary ?? rawConfig.accentPrimaryDeprecated;

    const colorType = getColorType(rawConfig);
    switch (colorType) {
        case "dark":
            return {
                type: "dark",
                ...convertThemedColorConfig(rawConfig, context, "dark")
            };
        case "light":
            return {
                type: "light",
                ...convertThemedColorConfig(rawConfig, context, "light")
            };
        case "darkAndLight":
            return {
                type: "darkAndLight",
                dark: convertThemedColorConfig(rawConfig, context, "dark"),
                light: convertThemedColorConfig(rawConfig, context, "light")
            };
        default:
            assertNever(colorType);
    }
}

// exported for testing
export function getColorType({
    background,
    accentPrimary,
    accentPrimaryDeprecated
}: RawDocs.ColorsConfiguration): "dark" | "light" | "darkAndLight" {
    // if both background and accent colors are provided as strings,
    // we can determine the theme using just the background color

    accentPrimary = accentPrimary ?? accentPrimaryDeprecated;

    if (typeof background === "string" && typeof accentPrimary === "string") {
        return tinycolor(background).isDark() ? "dark" : "light";
    }

    if (background != null) {
        if (typeof background === "string") {
            return tinycolor(background).isDark() ? "dark" : "light";
        }
        if (background.dark != null && background.light != null) {
            return "darkAndLight";
        }
    }

    if (accentPrimary != null) {
        if (typeof accentPrimary === "string") {
            // the luminance of the accent color must always be the opposite of the theme
            // if the accent color is dark, the theme must be light and vice versa
            return tinycolor(accentPrimary).isLight() ? "dark" : "light";
        }
        if (accentPrimary.dark != null && accentPrimary.light != null) {
            return "darkAndLight";
        }
    }

    if (accentPrimary != null && background != null) {
        if (background.dark != null && accentPrimary.dark != null) {
            return "dark";
        }

        if (background.light != null && accentPrimary.light != null) {
            return "light";
        }
    }

    // prefer "darkAndLight" unless both the accentPrimary and background are pinned to the same theme
    return "darkAndLight";
}

export function convertThemedColorConfig(
    rawConfig: RawDocs.ColorsConfiguration,
    context: TaskContext,
    theme: "dark" | "light"
): DocsV1Write.ThemeConfig {
    const accentPrimaryColor =
        getColorInstanceFromRawConfigOrThrow(
            rawConfig.accentPrimary ?? rawConfig.accentPrimaryDeprecated,
            context,
            "accent-primary",
            theme
        ) ?? tinycolor.random();
    const backgroundColor = getColorInstanceFromRawConfigOrThrow(rawConfig.background, context, "background", theme);

    // we enforce contrast on the frontend
    // the following is moved to fern-check but preserved here for reference
    // see: /packages/cli/yaml/docs-validator/src/rules/accent-color-contrast/index.ts

    // if (backgroundColor != null) {
    //     const newBackgroundColor = enforceBackgroundTheme(tinycolor(backgroundColor.toString()), theme);
    //     if (newBackgroundColor.toHexString() !== backgroundColor.toHexString()) {
    //         context.logger.warn(
    //             `The chosen shade, 'colors.background' in ${theme} mode, fails to meet minimum contrast requirements. The brightness is ${backgroundColor.getBrightness()}. To enhance accessibility and ensure content readability, Fern will adjust from ${backgroundColor.toHexString()} to a more contrast-rich ${newBackgroundColor.toHexString()}.`
    //         );
    //         backgroundColor = newBackgroundColor;
    //     }
    // }

    // if (accentPrimaryColor != null) {
    //     const backgroundColorWithFallback = backgroundColor ?? tinycolor(theme === "dark" ? "#000" : "#FFF");
    //     const newAccentPrimaryColor = increaseForegroundContrast(
    //         tinycolor(accentPrimaryColor.toString()),
    //         backgroundColorWithFallback
    //     );
    //     if (newAccentPrimaryColor.toHexString() !== accentPrimaryColor.toHexString()) {
    //         const ratio = tinycolor.readability(accentPrimaryColor, backgroundColorWithFallback);
    //         context.logger.warn(
    //             `The chosen shade, 'colors.accent-primary' in ${theme} mode, fails to meet minimum contrast requirements. The contrast ratio is ${ratio}, which is below WCAG AA requirements (4.5:1). To enhance accessibility and ensure content readability, Fern will adjust from ${accentPrimaryColor.toHexString()} to a more contrast-rich ${newAccentPrimaryColor.toHexString()}.`
    //         );
    //         accentPrimaryColor = newAccentPrimaryColor;
    //     }
    // }

    return {
        accentPrimary: accentPrimaryColor.toRgb(),
        background: backgroundColor?.toRgb(),
        border: getColorInstanceFromRawConfigOrThrow(rawConfig.border, context, "border", theme)?.toRgb(),
        sidebarBackground: getColorInstanceFromRawConfigOrThrow(
            rawConfig.sidebarBackground,
            context,
            "sidebar-background",
            theme
        )?.toRgb(),
        headerBackground: getColorInstanceFromRawConfigOrThrow(
            rawConfig.headerBackground,
            context,
            "header-background",
            theme
        )?.toRgb(),
        cardBackground: getColorInstanceFromRawConfigOrThrow(
            rawConfig.cardBackground,
            context,
            "card-background",
            theme
        )?.toRgb()
        // NOTE: logo and backgroundImage filepaths need to be resolved in publishDocs.ts and not here.
    };
}

// export function increaseForegroundContrast(
//     foregroundColor: tinycolor.Instance,
//     backgroundColor: tinycolor.Instance
// ): tinycolor.Instance {
//     let newForgroundColor = foregroundColor;
//     const dark = backgroundColor.isDark();
//     while (!tinycolor.isReadable(newForgroundColor, backgroundColor)) {
//         if (dark ? newForgroundColor.getBrightness() === 255 : newForgroundColor.getBrightness() === 0) {
//             // if the color is already at its maximum or minimum brightness, stop adjusting
//             break;
//         }
//         // if the accent color is still not readable, adjust it by 1% until it is
//         // if the theme is dark, lighten the color, otherwise darken it
//         newForgroundColor = dark ? newForgroundColor.lighten(1) : newForgroundColor.darken(1);
//     }
//     return newForgroundColor;
// }

export function getColorFromRawConfig(
    raw: RawDocs.ColorConfig | undefined,
    key: string,
    theme: "dark" | "light"
): string | undefined {
    if (raw == null) {
        return undefined;
    }

    let rawColor = typeof raw === "string" ? raw : raw[theme];

    if (rawColor == null && key === "accent-primary" && typeof raw !== "string") {
        // if accent-primary, fall back to the opposite theme
        rawColor = raw[theme === "dark" ? "light" : "dark"];
    }

    if (rawColor == null) {
        return undefined;
    }

    return rawColor;
}

export function getColorInstanceFromRawConfigOrThrow(
    raw: RawDocs.ColorConfig | undefined,
    context: TaskContext,
    key: string,
    theme: "dark" | "light"
): tinycolor.Instance | undefined {
    const color = getColorFromRawConfig(raw, key, theme);
    if (color == null) {
        return undefined;
    }
    const instance = tinycolor(color);
    if (!instance.isValid()) {
        context.failAndThrow(
            `'${typeof raw === "string" ? key : `colors.${key}.${theme}`}' should be a hex color of the format #FFFFFF`
        );
    }
    return instance;
}
