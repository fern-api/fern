import { describe, expect, it } from "vitest";

import { resolveVariantsSettings, type VariantsLayout } from "../ParsedDocsConfiguration.js";
import {
    flattenRawTabMenu,
    flattenRawTabVariants,
    getRawTabMenuMemberships,
    getRawTabSlugOwners
} from "../tabVariants.js";

const layout: VariantsLayout = {
    tabMenuDefaultColumnHeight: 4,
    tabMenuInteractOnClickOnly: undefined
};

describe("resolveVariantsSettings", () => {
    it("keeps today's sidebar selector with one column when nothing is set", () => {
        expect(
            resolveVariantsSettings({
                location: "sidebar",
                columnHeight: undefined,
                layout: undefined,
                hasHeaderTabs: true
            })
        ).toEqual({ location: "sidebar", columnHeight: undefined, fellBackToSidebar: false });
    });

    it("prefers the tab's tab-menu-column-height, then the layout default; sidebar selectors have no columns", () => {
        const resolve = (location: "tab" | "sidebar", columnHeight: number | "no-limit" | undefined) =>
            resolveVariantsSettings({ location, columnHeight, layout, hasHeaderTabs: true });
        expect(resolve("tab", undefined)).toMatchObject({ location: "tab", columnHeight: 4 });
        expect(resolve("sidebar", undefined)).toMatchObject({ location: "sidebar", columnHeight: undefined });
        expect(resolve("sidebar", 3)).toMatchObject({ location: "sidebar", columnHeight: undefined });
        expect(resolve("tab", 2)).toMatchObject({ location: "tab", columnHeight: 2 });
        expect(resolve("tab", "no-limit")).toMatchObject({ location: "tab", columnHeight: undefined });
    });

    it("falls back to a single-list sidebar selector without header tabs", () => {
        expect(resolveVariantsSettings({ location: "tab", columnHeight: 2, layout, hasHeaderTabs: false })).toEqual({
            location: "sidebar",
            columnHeight: undefined,
            fellBackToSidebar: true
        });
    });

    it("sets interactOnClickOnly only for header tab menus when the layout asks for it", () => {
        const clickOnly: VariantsLayout = { ...layout, tabMenuInteractOnClickOnly: true };
        const resolve = (location: "tab" | "sidebar", hasHeaderTabs: boolean) =>
            resolveVariantsSettings({ location, columnHeight: undefined, layout: clickOnly, hasHeaderTabs })
                .interactOnClickOnly;
        expect(resolve("tab", true)).toBe(true);
        expect(resolve("sidebar", true)).toBeUndefined();
        expect(resolve("tab", false)).toBeUndefined();
        expect(
            resolveVariantsSettings({ location: "tab", columnHeight: undefined, layout, hasHeaderTabs: true })
                .interactOnClickOnly
        ).toBeUndefined();
    });
});

describe("flattenRawTabVariants", () => {
    it("flattens groups, skips links and keeps each variant's path", () => {
        const variant = (title: string) => ({ title, layout: [] });
        const result = flattenRawTabVariants([
            variant("A"),
            { group: "Platform", items: [variant("B"), { link: "Status", href: "https://status.example.com" }] },
            { link: "Changelog", href: "/changelog" }
        ]);
        expect(result.map(({ variant: v, path }) => [v.title, path.join(".")])).toEqual([
            ["A", "variants.0"],
            ["B", "variants.1.items.0"]
        ]);
    });
});

describe("tab-menu helpers", () => {
    const tabs = {
        products: {
            displayName: "Products",
            tabMenu: [
                {
                    group: "Platform",
                    tabs: [
                        { tab: "agents", displayName: "Agents", subtitle: "Build AI agents" },
                        { link: "Status", href: "https://status.example.com" }
                    ]
                },
                { tab: "studio", displayName: "Studio", slug: "visual" }
            ]
        },
        other: { displayName: "Other", tabMenu: [{ tab: "agents", displayName: "Agents again" }] },
        guides: { displayName: "Guides", skipSlug: true }
    };

    it("flattens groups, skips links and keeps each member's path", () => {
        expect(
            flattenRawTabMenu(tabs.products.tabMenu).map(({ member, path }) => [member.tab, path.join(".")])
        ).toEqual([
            ["agents", "tab-menu.0.tabs.0"],
            ["studio", "tab-menu.1"]
        ]);
    });

    it("maps each member to the first menu that lists it", () => {
        const memberships = getRawTabMenuMemberships(tabs);
        expect([...memberships.entries()].map(([id, m]) => [id, m.menuTabId])).toEqual([
            ["agents", "products"],
            ["studio", "products"]
        ]);
    });

    it("nests member slugs under the menu tab", () => {
        expect(getRawTabSlugOwners(tabs, "studio")).toEqual([
            { title: "Products", slug: undefined, skipSlug: undefined },
            { title: "Studio", slug: "visual", skipSlug: undefined }
        ]);
        expect(getRawTabSlugOwners(tabs, "guides")).toEqual([{ title: "Guides", slug: undefined, skipSlug: true }]);
        expect(getRawTabSlugOwners(tabs, "missing")).toBeUndefined();
    });
});
