import { describe, expect, it } from "vitest";

import { resolveVariantsSettings, type VariantsLayout } from "../ParsedDocsConfiguration.js";
import { flattenRawTabVariants } from "../tabVariants.js";

const layout: VariantsLayout = {
    defaultLocation: "tab",
    defaultColumnHeight: 8,
    tabDefaultColumnHeight: 4,
    sidebarDefaultColumnHeight: undefined
};

describe("resolveVariantsSettings", () => {
    it("keeps today's sidebar dropdown with one column when nothing is set", () => {
        expect(
            resolveVariantsSettings({
                location: undefined,
                columnHeight: undefined,
                layout: undefined,
                hasHeaderTabs: true
            })
        ).toEqual({ location: "sidebar", columnHeight: undefined, fellBackToSidebar: false });
    });

    it("prefers the tab setting, then the location default, then the general default", () => {
        const resolve = (location: "tab" | "sidebar" | undefined, columnHeight: number | "no-limit" | undefined) =>
            resolveVariantsSettings({ location, columnHeight, layout, hasHeaderTabs: true });
        expect(resolve(undefined, undefined)).toMatchObject({ location: "tab", columnHeight: 4 });
        expect(resolve("sidebar", undefined)).toMatchObject({ location: "sidebar", columnHeight: 8 });
        expect(resolve(undefined, 2)).toMatchObject({ location: "tab", columnHeight: 2 });
        expect(resolve(undefined, "no-limit")).toMatchObject({ location: "tab", columnHeight: undefined });
    });

    it("falls back to the sidebar without header tabs", () => {
        expect(
            resolveVariantsSettings({ location: "tab", columnHeight: undefined, layout, hasHeaderTabs: false })
        ).toEqual({ location: "sidebar", columnHeight: 8, fellBackToSidebar: true });
    });
});

describe("flattenRawTabVariants", () => {
    it("flattens groups, skips links and keeps each variant's path", () => {
        const variant = (title: string) => ({ title, layout: [] });
        const result = flattenRawTabVariants([
            variant("A"),
            { group: "Platform", variants: [variant("B"), { link: "Status", href: "https://status.example.com" }] },
            { link: "Changelog", href: "/changelog" }
        ]);
        expect(result.map(({ variant: v, path }) => [v.title, path.join(".")])).toEqual([
            ["A", "variants.0"],
            ["B", "variants.1.variants.0"]
        ]);
    });
});
