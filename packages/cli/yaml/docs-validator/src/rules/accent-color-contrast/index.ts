import tinycolor from "tinycolor2";

import { docsYml, getColorFromRawConfig, getColorType } from "@fern-api/configuration-loader";

import { Rule, RuleViolation } from "../../Rule";

export const AccentColorContrastRule: Rule = {
    name: "accent-color-contrast",
    create: () => {
        return {
            file: async ({ config }) => {
                if (config.colors == null) {
                    return [];
                }

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

export function validateTheme(
    colors: docsYml.RawSchemas.ColorsConfiguration,
    theme: "dark" | "light"
): RuleViolation[] {
    const accentPrimaryColor = getColorFromRawConfig(
        colors.accentPrimary ?? colors.accentPrimaryDeprecated,
        "accent-primary",
        theme
    );
    let backgroundColor =
        getColorFromRawConfig(colors.background, "background", theme) ?? (theme === "dark" ? "#000" : "#FFF");

    const ruleViolations: RuleViolation[] = [];

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
        const ratio = tinycolor.readability(accentPrimaryColor, backgroundColor);
        const readableRatio = `${ratio.toFixed(2)}:1`;

        if (ratio < 3) {
            ruleViolations.push({
                severity: "warning",
                message: `The contrast ratio between the accent color and the background color for ${theme} mode is ${readableRatio}. It should be at least 3:1.`
            });
        } else if (ratio < 4.5) {
            ruleViolations.push({
                severity: "warning",
                message: `The contrast ratio between the accent color and the background color for ${theme} mode is ${readableRatio}. Fern will adjust the color to meet the minimum contrast ratio of 4.5:1 for WCAG AA and 7:1 for WCAG AAA.`
            });
        } else if (ratio < 7) {
            ruleViolations.push({
                severity: "warning",
                message: `The contrast ratio between the accent color and the background color for ${theme} mode is ${readableRatio}. Fern will adjust the color to meet the minimum contrast ratio of 7:1 for WCAG AAA.`
            });
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
