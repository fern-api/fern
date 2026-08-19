import { docsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import { FdrAPI as CjsFdrSdk } from "@fern-api/fdr-sdk";
import { CliError, TaskContext } from "@fern-api/task-context";
import tinycolor from "tinycolor2";

export function convertColorsConfiguration(
    rawConfig: docsYml.RawSchemas.ColorsConfiguration = { accentPrimary: undefined, background: undefined },
    context: TaskContext
): CjsFdrSdk.docs.v1.write.ColorsConfigV3 {
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
}: docsYml.RawSchemas.ColorsConfiguration): "dark" | "light" | "darkAndLight" {
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
    rawConfig: docsYml.RawSchemas.ColorsConfiguration,
    context: TaskContext,
    theme: "dark" | "light"
): CjsFdrSdk.docs.v1.write.ThemeConfig {
    const accentPrimaryColor =
        getColorInstanceFromRawConfigOrThrow(
            rawConfig.accentPrimary ?? rawConfig.accentPrimaryDeprecated,
            context,
            "accent-primary",
            theme
        ) ?? tinycolor.random();
    const backgroundColor = getColorInstanceFromRawConfigOrThrow(rawConfig.background, context, "background", theme);

    // we enforce contrast on the frontend, but we also want to warn the user if the color is not readable using fern check.
    // see: /packages/cli/yaml/docs-validator/src/rules/accent-color-contrast/index.ts

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
        )?.toRgb(),
        // Accent scale colors (accent-1 through accent-12) are automatically calculated from accentPrimary when undefined
        accent1: getColorInstanceFromRawConfigOrThrow(rawConfig.accent1, context, "accent-1", theme)?.toRgb(),
        accent2: getColorInstanceFromRawConfigOrThrow(rawConfig.accent2, context, "accent-2", theme)?.toRgb(),
        accent3: getColorInstanceFromRawConfigOrThrow(rawConfig.accent3, context, "accent-3", theme)?.toRgb(),
        accent4: getColorInstanceFromRawConfigOrThrow(rawConfig.accent4, context, "accent-4", theme)?.toRgb(),
        accent5: getColorInstanceFromRawConfigOrThrow(rawConfig.accent5, context, "accent-5", theme)?.toRgb(),
        accent6: getColorInstanceFromRawConfigOrThrow(rawConfig.accent6, context, "accent-6", theme)?.toRgb(),
        accent7: getColorInstanceFromRawConfigOrThrow(rawConfig.accent7, context, "accent-7", theme)?.toRgb(),
        accent8: getColorInstanceFromRawConfigOrThrow(rawConfig.accent8, context, "accent-8", theme)?.toRgb(),
        accent9: getColorInstanceFromRawConfigOrThrow(rawConfig.accent9, context, "accent-9", theme)?.toRgb(),
        accent10: getColorInstanceFromRawConfigOrThrow(rawConfig.accent10, context, "accent-10", theme)?.toRgb(),
        accent11: getColorInstanceFromRawConfigOrThrow(rawConfig.accent11, context, "accent-11", theme)?.toRgb(),
        accent12: getColorInstanceFromRawConfigOrThrow(rawConfig.accent12, context, "accent-12", theme)?.toRgb(),
        // NOTE: logo and backgroundImage filepaths need to be resolved in publishDocs.ts and not here.
        logo: undefined,
        backgroundImage: undefined
    };
}

export function getColorFromRawConfig(
    raw: docsYml.RawSchemas.ColorConfig | undefined,
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
    raw: docsYml.RawSchemas.ColorConfig | undefined,
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
            `'${typeof raw === "string" ? key : `colors.${key}.${theme}`}' should be a hex color of the format #FFFFFF`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    return instance;
}
