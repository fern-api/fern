import { describe, expect, it } from "vitest";

import { resolveVariantsSettings, type VariantsLayout } from "../ParsedDocsConfiguration.js";
import { flattenRawTabLayouts, flattenRawTabVariants } from "../tabVariants.js";

const layout: VariantsLayout = {
    dropdownDefaultColumnHeight: 4,
    variantsDefaultColumnHeight: 8
};

describe("resolveVariantsSettings", () => {
    it("keeps today's sidebar dropdown with one column when nothing is set", () => {
        expect(
            resolveVariantsSettings({
                location: "sidebar",
                columnHeight: undefined,
                layout: undefined,
                hasHeaderTabs: true
            })
        ).toEqual({ location: "sidebar", columnHeight: undefined, fellBackToSidebar: false });
    });

    it("prefers the setting where the menu is used, then the layout default for that menu type", () => {
        const resolve = (location: "tab" | "sidebar", columnHeight: number | "no-limit" | undefined) =>
            resolveVariantsSettings({ location, columnHeight, layout, hasHeaderTabs: true });
        expect(resolve("tab", undefined)).toMatchObject({ location: "tab", columnHeight: 4 });
        expect(resolve("sidebar", undefined)).toMatchObject({ location: "sidebar", columnHeight: 8 });
        expect(resolve("tab", 2)).toMatchObject({ location: "tab", columnHeight: 2 });
        expect(resolve("tab", "no-limit")).toMatchObject({ location: "tab", columnHeight: undefined });
    });

    it("falls back to the sidebar without header tabs, keeping the dropdown's column height", () => {
        expect(
            resolveVariantsSettings({ location: "tab", columnHeight: undefined, layout, hasHeaderTabs: false })
        ).toEqual({ location: "sidebar", columnHeight: 4, fellBackToSidebar: true });
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

describe("flattenRawTabLayouts", () => {
    it("walks dropdown groups and variants nested under dropdown items", () => {
        const result = flattenRawTabLayouts({
            tab: "products",
            dropdown: [
                {
                    group: "Platform",
                    items: [
                        {
                            title: "Agents",
                            variants: [
                                { title: "Python", layout: [] },
                                { title: "TypeScript", slug: "ts", layout: [] }
                            ]
                        },
                        { title: "Studio", layout: [] }
                    ]
                },
                { link: "Status", href: "https://status.example.com" }
            ]
        });
        expect(result.map(({ owners, path }) => [owners.map((o) => o.title).join("/"), path.join(".")])).toEqual([
            ["Agents/Python", "dropdown.0.items.0.variants.0"],
            ["Agents/TypeScript", "dropdown.0.items.0.variants.1"],
            ["Studio", "dropdown.0.items.1"]
        ]);
    });
});
