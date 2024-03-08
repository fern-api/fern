import { ColorsConfiguration } from "@fern-api/docs-config-sdk";
import { getColorFromRawConfig, getColorType } from "@fern-api/docs-configuration";
import tinycolor from "tinycolor2";
import { Rule, RuleViolation } from "../../Rule";

export const AccentColorContrastRule: Rule = {
    name: "accent-color-contrast",
    create: () => {
        return {
            file: async ({ config }) => {
                if (config.colors == null) {
                    return [];
                }
                // const accentPrimary = config.colors?.accentPrimary ?? config.colors?.accentPrimaryDeprecated;
                // const backgroundColor = config.colors?.background;

                const colorType = getColorType(config.colors);

                if (colorType === "dark") {
                    return validateTheme(config.colors, "dark");
                } else if (colorType === "light") {
                    return validateTheme(config.colors, "light");
                } else if (colorType === "darkAndLight") {
                    return [...validateTheme(config.colors, "dark"), ...validateTheme(config.colors, "light")];
                }
                return [];
            }
        };
    }
};

export function validateTheme(colors: ColorsConfiguration, theme: "dark" | "light"): RuleViolation[] {
    const accentPrimaryColor = getColorFromRawConfig(
        colors.accentPrimary ?? colors.accentPrimaryDeprecated,
        "accent-primary",
        theme
    );
    let backgroundColor = getColorFromRawConfig(colors.background, "background", theme);

    const ruleViolations: RuleViolation[] = [];

    if (backgroundColor != null) {
        if (!tinycolor(backgroundColor).isValid()) {
            ruleViolations.push({
                severity: "error",
                message: `Invalid background color provided for colors.background.${theme}: ${backgroundColor}.`
            });
        } else {
            const newBackground = enforceBackgroundTheme(tinycolor(backgroundColor), theme);
            if (tinycolor(backgroundColor).toHexString() !== newBackground.toHexString()) {
                ruleViolations.push({
                    severity: "warning",
                    message: `The provided background color for ${theme} mode is not ${theme} enough. It will be adjusted to ${newBackground.toHexString()}.`
                });
            }
            backgroundColor = newBackground.toHexString();
        }
    }

    if (accentPrimaryColor == null) {
        ruleViolations.push({
            severity: "warning",
            message: `No accent-color provided for ${theme} mode. A random color will be used.`
        });
    } else if (!tinycolor(accentPrimaryColor).isValid()) {
        ruleViolations.push({
            severity: "error",
            message: `Invalid accent-color provided for colors.accent-primary.${theme}: ${accentPrimaryColor}.`
        });
    } else {
        const backgroundColorWithFallback = tinycolor(backgroundColor ?? (theme === "dark" ? "#000" : "#FFF"));
        const accentPrimaryColorInstance = tinycolor(accentPrimaryColor);
        for (const standard of ["aaa", "aa", "ui"] as const) {
            const newAccentColor = increaseForegroundContrast(
                accentPrimaryColorInstance,
                backgroundColorWithFallback,
                standard
            );
            if (accentPrimaryColorInstance.toHexString() !== newAccentColor.toHexString()) {
                const ratio = tinycolor.readability(accentPrimaryColor, backgroundColorWithFallback);
                ruleViolations.push({
                    severity: "warning",
                    message: `The chosen accent color for ${theme} mode fails to meet minimum contrast requirements. The contrast ratio is ${ratio}, which is below WCAG ${standard.toUpperCase()} requirements (${getUserReadableRatio(
                        standard
                    )}). To enhance accessibility and ensure content readability, Fern will adjusted from ${accentPrimaryColor} to a more contrast-rich ${newAccentColor.toHexString()}.`
                });
            }
        }
    }

    return ruleViolations;
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

function getDesiredRatio(ratio: "aaa" | "aa" | "ui"): number {
    switch (ratio) {
        case "aaa":
            return 7;
        case "aa":
            return 4.5;
        case "ui":
            return 3;
    }
}

function getUserReadableRatio(ratio: "aaa" | "aa" | "ui"): string {
    switch (ratio) {
        case "aaa":
            return "7:1";
        case "aa":
            return "4.5:1";
        case "ui":
            return "3:1";
    }
}

function increaseForegroundContrast(
    foregroundColor: tinycolor.Instance,
    backgroundColor: tinycolor.Instance,
    ratio: "aaa" | "aa" | "ui"
): tinycolor.Instance {
    let newForgroundColor = foregroundColor;
    const dark = backgroundColor.isDark();
    const desiredRatio = getDesiredRatio(ratio);
    while (tinycolor.readability(newForgroundColor, backgroundColor) < desiredRatio) {
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
