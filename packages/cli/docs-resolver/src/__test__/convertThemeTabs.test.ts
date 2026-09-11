import { describe, expect, it } from "vitest";

import { docsYml } from "@fern-api/configuration";
import { DocsV1Write } from "@fern-api/fdr-sdk";

import { convertThemeTabs } from "../DocsDefinitionResolver.js";

const { TabsThemeStyle, TabsAlignment, TabsPlacement } = docsYml.RawSchemas;

function optionalValues<T extends Record<string, string>>(record: T): (T[keyof T] | undefined)[] {
    return [undefined, ...Object.values(record)];
}

describe("convertThemeTabs against the FDR write schema", () => {
    it("accepts every docs.yml tabs value (shorthand and object form)", () => {
        for (const style of Object.values(TabsThemeStyle)) {
            const result = DocsV1Write.DocsThemeConfigSchema.safeParse({ tabs: convertThemeTabs(style) });
            expect(result.success, `tabs: ${style}`).toBe(true);
        }
        for (const style of optionalValues(TabsThemeStyle)) {
            for (const alignment of optionalValues(TabsAlignment)) {
                for (const placement of optionalValues(TabsPlacement)) {
                    const tabs = { style, alignment, placement };
                    const result = DocsV1Write.DocsThemeConfigSchema.safeParse({ tabs: convertThemeTabs(tabs) });
                    expect(result.success, JSON.stringify(tabs)).toBe(true);
                }
            }
        }
    });

    it("rejects the raw lowercase placement/alignment, so the conversion is required", () => {
        const raw = { tabs: { alignment: "center", placement: "header" } };
        expect(DocsV1Write.DocsThemeConfigSchema.safeParse(raw).success).toBe(false);
    });

    it("accepts every other docs.yml theme property value as-is", () => {
        const {
            SidebarThemeConfig,
            BodyThemeConfig,
            PageActionsThemeConfig,
            FooterNavThemeConfig,
            LanguageSwitcherThemeConfig,
            ProductSwitcherThemeConfig
        } = docsYml.RawSchemas;
        const cases: [string, Record<string, string>][] = [
            ["sidebar", SidebarThemeConfig],
            ["body", BodyThemeConfig],
            ["page-actions", PageActionsThemeConfig],
            ["footerNav", FooterNavThemeConfig],
            ["language-switcher", LanguageSwitcherThemeConfig],
            ["product-switcher", ProductSwitcherThemeConfig]
        ];
        for (const [key, values] of cases) {
            for (const value of Object.values(values)) {
                const result = DocsV1Write.DocsThemeConfigSchema.safeParse({ [key]: value });
                expect(result.success, `${key}: ${value}`).toBe(true);
            }
        }
    });
});

describe("convertThemeTabs", () => {
    it("passes through the shorthand style string", () => {
        expect(convertThemeTabs("bubble")).toBe("bubble");
        expect(convertThemeTabs(undefined)).toBeUndefined();
    });

    it("uppercases placement and alignment to match the FDR enums", () => {
        expect(convertThemeTabs({ style: "default", alignment: "center", placement: "header" })).toEqual({
            style: "default",
            alignment: "CENTER",
            placement: "HEADER"
        });
        expect(convertThemeTabs({ placement: "sidebar", alignment: "left" })).toEqual({
            style: undefined,
            alignment: "LEFT",
            placement: "SIDEBAR"
        });
    });

    it("leaves unset placement and alignment undefined", () => {
        expect(convertThemeTabs({ style: "bubble" })).toEqual({
            style: "bubble",
            alignment: undefined,
            placement: undefined
        });
    });
});
