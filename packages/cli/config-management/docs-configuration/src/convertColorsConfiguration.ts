import { assertNever } from "@fern-api/core-utils";
import { DocsV1Write } from "@fern-api/fdr-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernDocsConfig as RawDocs } from "@fern-fern/docs-config";
import tinycolor from "tinycolor2";

export function convertColorsConfiguration(
    rawConfig: RawDocs.ColorsConfiguration,
    context: TaskContext
): DocsV1Write.ColorsConfigV3 {
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
    accentPrimary
}: RawDocs.ColorsConfiguration): "dark" | "light" | "darkAndLight" {
    // if both background and accent colors are provided as strings,
    // we can determine the theme using just the background color
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
): DocsV1Write.DarkModeConfig | DocsV1Write.LightModeConfig {
    let accentPrimaryColor = getColorInstanceFromRawConfig(rawConfig.accentPrimary, context, "accentPrimary", theme);
    let backgroundColor = getColorInstanceFromRawConfig(rawConfig.background, context, "background", theme);

    if (backgroundColor != null) {
        const newBackgroundColor = enforceTheme(backgroundColor, theme);
        if (newBackgroundColor !== backgroundColor) {
            context.logger.warn(
                `The chosen shade, 'backgroundColor' in ${theme} mode, fails to meet minimum contrast requirements. To enhance accessibility and ensure content readability, Fern will adjust from ${backgroundColor.toHexString()} to a more contrast-rich ${newBackgroundColor.toHexString()}.`
            );
            backgroundColor = newBackgroundColor;
        }
        backgroundColor = newBackgroundColor;
    }

    if (accentPrimaryColor != null) {
        const backgroundColorWithFallback = backgroundColor ?? (theme === "dark" ? "#000" : "#FFF");
        if (!tinycolor.isReadable(accentPrimaryColor, backgroundColorWithFallback)) {
            // the accent color must always be the opposite of the theme
            let newAccentPrimaryColor = enforceTheme(accentPrimaryColor, theme === "dark" ? "light" : "dark");

            // if the accent color is still not readable, darken it until it is
            while (
                !tinycolor.isReadable(newAccentPrimaryColor, backgroundColorWithFallback) ||
                newAccentPrimaryColor.getBrightness() === 0
            ) {
                newAccentPrimaryColor = newAccentPrimaryColor.darken(1);
            }

            const ratio = tinycolor.readability(accentPrimaryColor, backgroundColorWithFallback);
            context.logger.warn(
                `The chosen shade, 'accentColor' in ${theme} mode, fails to meet minimum contrast requirements. The contrast ratio is ${ratio}. To enhance accessibility and ensure content readability, Fern will adjust from ${accentPrimaryColor.toHexString()} to a more contrast-rich ${newAccentPrimaryColor.toHexString()}.`
            );
            accentPrimaryColor = newAccentPrimaryColor;
        }
    }

    return {
        accentPrimary: toRgb(accentPrimaryColor),
        background: toRgb(backgroundColor)
    };
}

function enforceTheme(color: tinycolor.Instance, theme: "dark" | "light"): tinycolor.Instance;
function enforceTheme(color: tinycolor.Instance | undefined, theme: "dark" | "light"): tinycolor.Instance | undefined;
function enforceTheme(color: tinycolor.Instance | undefined, theme: "dark" | "light"): tinycolor.Instance | undefined {
    if (color == null) {
        return undefined;
    }

    if (theme === "dark" && color.isDark()) {
        return color;
    } else if (theme === "light" && color.isLight()) {
        return color;
    }

    return getOppositeBrightness(color);
}

function getOppositeBrightness(color: tinycolor.Instance): tinycolor.Instance;
function getOppositeBrightness(color: tinycolor.Instance | undefined): tinycolor.Instance | undefined;
function getOppositeBrightness(color: tinycolor.Instance | undefined): tinycolor.Instance | undefined {
    if (color == null) {
        return undefined;
    }

    const { h, s, v } = color.toHsv();
    return tinycolor({ h, s, v: 1 - v });
}

function toRgb(color: tinycolor.Instance): DocsV1Write.RgbColor;
function toRgb(color: tinycolor.Instance | undefined): DocsV1Write.RgbColor | undefined;
function toRgb(color: tinycolor.Instance | undefined): DocsV1Write.RgbColor | undefined {
    if (color == null) {
        return undefined;
    }
    const { r, g, b } = color.toRgb();
    return { r, g, b };
}

function getColorInstanceFromRawConfig(
    raw: RawDocs.ColorConfig | undefined,
    context: TaskContext,
    key: string,
    theme: "dark" | "light"
): tinycolor.Instance | undefined {
    if (raw == null) {
        return undefined;
    }

    const rawColor = typeof raw === "string" ? raw : raw[theme] ?? raw.dark ?? raw.light;

    if (rawColor == null) {
        return undefined;
    }

    const color = tinycolor(rawColor);
    if (!color.isValid()) {
        context.failAndThrow(
            `'${typeof raw === "string" ? key : `${key}.${theme}`}' should be a hex color of the format #FFFFFF`
        );
    }
    return color;
}
