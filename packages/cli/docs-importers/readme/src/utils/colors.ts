import { docsYml } from "@fern-api/configuration";
import type { Root as HastRoot } from "hast";
import { CONTINUE, visit } from "unist-util-visit";

import { defaultColors } from "../constants";

function rgbToHex(color: string): string | undefined {
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
        return color;
    }
    color = color.trim().toLowerCase();
    let r: number | undefined, g: number | undefined, b: number | undefined;
    if (/^\d+\s+\d+\s+\d+(\s+[0-9.]+)?$/.test(color)) {
        [r, g, b] = color.split(/\s+/).map(Number);
    } else {
        const values = color.match(/^rgba?\((\d+),(\d+),(\d+)(?:,([0-9.]+))?\)$/);
        if (!values) {
            return undefined;
        }
        [, r, g, b] = values.map(Number);
    }
    if (!r || !g || !b || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        return undefined;
    }
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export async function getColors(hast: HastRoot): Promise<docsYml.RawSchemas.ColorsConfiguration> {
    let primaryHexCode: string | undefined;
    let lightHexCode: string | undefined;

    visit(hast, "element", function (node) {
        if (
            node.tagName !== "style" ||
            node.properties.title !== "rm-custom-css" ||
            node.children.length !== 1 ||
            !node.children[0] ||
            node.children[0].type !== "text"
        ) {
            return CONTINUE;
        }

        const cssStr = node.children[0].value;
        const colorKey = "--color-link-primary";
        const regex = new RegExp(`${colorKey}\\s*[:|,]\\s*([^;)]+)`, "i");

        const primaryCssColorValue = cssStr.match(regex)?.[1]?.trim();
        const lightCssColorValue = cssStr.match(regex)?.[1]?.trim();

        if (!primaryCssColorValue || !lightCssColorValue) {
            return CONTINUE;
        }

        primaryHexCode = rgbToHex(primaryCssColorValue);
        lightHexCode = rgbToHex(lightCssColorValue);
        return CONTINUE;
    });

    if (primaryHexCode && lightHexCode) {
        return {
            accentPrimary: {
                dark: primaryHexCode,
                light: lightHexCode
            },
            background: {
                dark: undefined,
                light: undefined
            }
        };
    } else if (primaryHexCode) {
        return {
            accentPrimary: {
                dark: primaryHexCode,
                light: primaryHexCode
            },
            background: {
                dark: undefined,
                light: undefined
            }
        };
    }
    return defaultColors;
}
