import { assertNever } from "@fern-api/core-utils";
import { FernDocsConfig as RawDocs } from "@fern-api/docs-config-sdk";
import { DocsV1Write } from "@fern-api/fdr-sdk";
import { TaskContext } from "@fern-api/task-context";
import tinycolor from "tinycolor2";
import { BackgroundImage, Logo } from "./ParsedDocsConfiguration";

export function convertColorsConfiguration(
    rawConfig: RawDocs.ColorsConfiguration,
    logo: Logo | undefined,
    backgroundImage: BackgroundImage | undefined,
    context: TaskContext
): DocsV1Write.ColorsConfigV3 {
    const colorType = getColorType(rawConfig);
    switch (colorType) {
        case "dark":
            return {
                type: "dark",
                ...convertThemedColorConfig(rawConfig, logo, backgroundImage, context, "dark")
            };
        case "light":
            return {
                type: "light",
                ...convertThemedColorConfig(rawConfig, logo, backgroundImage, context, "light")
            };
        case "darkAndLight":
            return {
                type: "darkAndLight",
                dark: convertThemedColorConfig(rawConfig, logo, backgroundImage, context, "dark"),
                light: convertThemedColorConfig(rawConfig, logo, backgroundImage, context, "light")
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
    logo: Logo | undefined,
    backgroundImage: BackgroundImage | undefined,
    context: TaskContext,
    theme: "dark" | "light"
): DocsV1Write.ThemeConfig {
    let accentPrimaryColor =
        getColorInstanceFromRawConfig(rawConfig.accentPrimary, context, "accent-primary", theme) ?? tinycolor.random();
    let backgroundColor = getColorInstanceFromRawConfig(rawConfig.background, context, "background", theme);

    if (backgroundColor != null) {
        const newBackgroundColor = enforceBackgroundTheme(tinycolor(backgroundColor.toString()), theme);
        if (newBackgroundColor.toHexString() !== backgroundColor.toHexString()) {
            context.logger.warn(
                `The chosen shade, 'colors.background' in ${theme} mode, fails to meet minimum contrast requirements. The brightness is ${backgroundColor.getBrightness()}. To enhance accessibility and ensure content readability, Fern will adjust from ${backgroundColor.toHexString()} to a more contrast-rich ${newBackgroundColor.toHexString()}.`
            );
            backgroundColor = newBackgroundColor;
        }
    }

    if (accentPrimaryColor != null) {
        const backgroundColorWithFallback = backgroundColor ?? tinycolor(theme === "dark" ? "#000" : "#FFF");
        const newAccentPrimaryColor = increaseForegroundContrast(
            tinycolor(accentPrimaryColor.toString()),
            backgroundColorWithFallback
        );
        if (newAccentPrimaryColor.toHexString() !== accentPrimaryColor.toHexString()) {
            const ratio = tinycolor.readability(accentPrimaryColor, backgroundColorWithFallback);
            context.logger.warn(
                `The chosen shade, 'colors.accent-primary' in ${theme} mode, fails to meet minimum contrast requirements. The contrast ratio is ${ratio}, which is below WCAG AA requirements (4.5:1). To enhance accessibility and ensure content readability, Fern will adjust from ${accentPrimaryColor.toHexString()} to a more contrast-rich ${newAccentPrimaryColor.toHexString()}.`
            );
            accentPrimaryColor = newAccentPrimaryColor;
        }
    }

    return {
        accentPrimary: accentPrimaryColor.toRgb(),
        background: backgroundColor?.toRgb(),
        border: getColorInstanceFromRawConfig(rawConfig.border, context, "border", theme)?.toRgb(),
        sidebarBackground: getColorInstanceFromRawConfig(
            rawConfig.sidebarBackground,
            context,
            "sidebar-background",
            theme
        )?.toRgb(),
        headerBackground: getColorInstanceFromRawConfig(
            rawConfig.headerBackground,
            context,
            "header-background",
            theme
        )?.toRgb(),
        cardBackground: getColorInstanceFromRawConfig(
            rawConfig.cardBackground,
            context,
            "card-background",
            theme
        )?.toRgb(),
        // filepaths need to be resolved in publishDocs.ts to fileID
        logo: logo?.[theme]?.filepath,
        backgroundImage: backgroundImage?.[theme]?.filepath
    };
}

export function increaseForegroundContrast(
    foregroundColor: tinycolor.Instance,
    backgroundColor: tinycolor.Instance
): tinycolor.Instance {
    let newForgroundColor = foregroundColor;
    const dark = backgroundColor.isDark();
    while (!tinycolor.isReadable(newForgroundColor, backgroundColor)) {
        if (dark ? newForgroundColor.getBrightness() === 255 : newForgroundColor.getBrightness() === 0) {
            // if the color is already at its maximum or minimum brightness, stop adjusting
            break;
        }
        // if the accent color is still not readable, adjust it by 1% until it is
        // if the theme is dark, lighten the color, otherwise darken it
        newForgroundColor = dark ? newForgroundColor.lighten(1) : newForgroundColor.darken(1);
    }
    return newForgroundColor;
}

export function enforceBackgroundTheme(color: tinycolor.Instance, theme: "dark" | "light"): tinycolor.Instance {
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
            `'${typeof raw === "string" ? key : `colors.${key}.${theme}`}' should be a hex color of the format #FFFFFF`
        );
    }
    return color;
}
