import { docsYml, getColorFromRawConfig, getColorType } from "@fern-api/configuration-loader";
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
            severity: "fatal",
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
            severity: "fatal",
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
