import type { Root as HastRoot } from "hast";
import { CONTINUE, visit } from "unist-util-visit";

import { scrapedColors } from "../types/scrapedColors";

function toHex(value: number) {
    Math.round(value).toString(16).padStart(2, "0");
}

function checkValidHex(str: string | undefined): boolean {
    if (!str) {return false;}
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(str);
}

function checkRgbBounds(...numbers: Array<number>): boolean {
    for (const num of numbers) {
        if (num < 0 || num > 255) {return false;}
    }
    return true;
}

function rgbToHex(color: string): string | undefined {
    if (checkValidHex(color)) {return color;}
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

    if (!r || !g || !b) {return undefined;}

    if (!checkRgbBounds(r, g, b)) {return undefined;}

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function getCssValue(cssString: string, key: string): string | undefined {
    const regex = new RegExp(`${key}\\s*[:|,]\\s*([^;)]+)`, "i");
    const match = cssString.match(regex);
    return match && match[1] ? match[1].trim() : undefined;
}

export const defaultColors = {
    primary: "#0D9373",
    light: "#55D799",
    dark: "#0D9373"
};

export async function downloadColors(hast: HastRoot): Promise<scrapedColors> {
    let primaryHexCode: string | undefined = undefined;
    let lightHexCode: string | undefined = undefined;
    visit(hast, "element", function (node) {
        if (node.tagName !== "style") {return CONTINUE;}
        if (node.properties.title !== "rm-custom-css") {return CONTINUE;}

        if (node.children.length !== 1 || !node.children[0] || node.children[0].type !== "text") {return CONTINUE;}

        const cssStr = node.children[0].value;
        const primaryColorKey = "--color-link-primary";
        const lightColorKey = "--color-link-primary";

        const primaryCssColorValue = getCssValue(cssStr, primaryColorKey);
        const lightCssColorValue = getCssValue(cssStr, lightColorKey);
        if (!primaryCssColorValue || !lightCssColorValue) {return CONTINUE;}

        primaryHexCode = rgbToHex(primaryCssColorValue);
        lightHexCode = rgbToHex(lightCssColorValue);
        return CONTINUE;
    });

    const isPrimaryValid = checkValidHex(primaryHexCode);
    const isLightValid = checkValidHex(lightHexCode);

    if (isPrimaryValid && isLightValid) {
        return {
            primary: primaryHexCode!,
            light: lightHexCode,
            dark: primaryHexCode
        };
    } else if (isPrimaryValid) {
        return {
            primary: primaryHexCode!,
            dark: primaryHexCode
        };
    } else {
        return defaultColors;
    }
}
