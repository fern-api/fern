import { describe, expect, it } from "vitest";

import { DocsConfigFileAstNodeTypes } from "../../../docsAst/DocsConfigFileAstVisitor.js";
import { RuleContext } from "../../../Rule.js";
import { ValidTabMenuRule } from "../valid-tab-menu.js";

async function violationsFor(config: object) {
    const visitor = await ValidTabMenuRule.create({} as RuleContext);
    return (await visitor.file?.({ config } as unknown as DocsConfigFileAstNodeTypes["file"])) ?? [];
}

async function versionFileViolationsFor(siteConfig: object, content: object) {
    const visitor = await ValidTabMenuRule.create({ workspace: { config: siteConfig } } as unknown as RuleContext);
    return (
        (await visitor.versionFile?.({
            path: "versions/v2.yml",
            content,
            version: { displayName: "v2", path: "versions/v2.yml" }
        } as unknown as DocsConfigFileAstNodeTypes["versionFile"])) ?? []
    );
}

async function productFileViolationsFor(siteConfig: object, content: object) {
    const visitor = await ValidTabMenuRule.create({ workspace: { config: siteConfig } } as unknown as RuleContext);
    return (
        (await visitor.productFile?.({
            path: "products/api.yml",
            content,
            product: { displayName: "API", path: "products/api.yml" }
        } as unknown as DocsConfigFileAstNodeTypes["productFile"])) ?? []
    );
}

const rawProducts = {
    "display-name": "Products",
    "tab-menu": [
        { tab: "agents", "display-name": "Agents" },
        { tab: "studio", "display-name": "Studio" }
    ]
};

const headerTabs = { tabsPlacement: "header" };

const products = {
    displayName: "Products",
    tabMenu: [
        {
            group: "Platform",
            tabs: [
                { tab: "agents", displayName: "Agents", subtitle: "Build AI agents" },
                { link: "Status", href: "https://status.example.com" }
            ]
        },
        { tab: "studio", displayName: "Studio" }
    ]
};

const validNavigation = [
    { tab: "products" },
    { tab: "agents", variants: [{ group: "SDKs", items: [{ title: "Python", layout: [] }] }] },
    { tab: "studio", layout: [] }
];

describe("valid-tab-menu", () => {
    it("passes members with a layout or variants, groups and links, with header tabs", async () => {
        expect(await violationsFor({ layout: headerTabs, tabs: { products }, navigation: validNavigation })).toEqual(
            []
        );
    });

    it("rejects a member with no navigation entry, or one with neither layout nor variants", async () => {
        const violations = await violationsFor({
            layout: headerTabs,
            tabs: { products },
            navigation: [{ tab: "products" }, { tab: "agents" }]
        });
        expect(violations.map((v) => v.severity)).toEqual(["fatal", "fatal"]);
        expect(violations[0]?.message).toContain('"agents"');
        expect(violations[0]?.message).toContain("needs a layout or variants");
        expect(violations[1]?.message).toContain('"studio"');
        expect(violations[1]?.message).toContain("no entry in navigation");
    });

    it("rejects a member listed in two menus or also defined under tabs", async () => {
        const violations = await violationsFor({
            layout: headerTabs,
            tabs: {
                products,
                more: { displayName: "More", tabMenu: [{ tab: "studio", displayName: "Studio" }] },
                agents: { displayName: "Agents" }
            },
            navigation: validNavigation
        });
        const messages = violations.map((v) => v.message);
        expect(violations.every((v) => v.severity === "fatal")).toBe(true);
        expect(messages.some((m) => m.includes('"agents"') && m.includes("also under tabs"))).toBe(true);
        expect(messages.some((m) => m.includes('"studio"') && m.includes("more than once"))).toBe(true);
    });

    it("rejects a navigation tab that isn't defined anywhere", async () => {
        const violations = await violationsFor({
            layout: headerTabs,
            tabs: { products },
            navigation: [...validNavigation, { tab: "typo", layout: [] }]
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain('"typo"');
    });

    it("rejects a menu tab with its own layout or variants", async () => {
        const violations = await violationsFor({
            layout: headerTabs,
            tabs: { products },
            navigation: [{ tab: "products", layout: [] }, ...validNavigation.slice(1)]
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("fatal");
    });

    it("rejects members in navigation when their menu tab isn't", async () => {
        const violations = await violationsFor({
            layout: headerTabs,
            tabs: { products },
            navigation: validNavigation.slice(1)
        });
        expect(violations.map((v) => v.message)).toEqual([
            expect.stringContaining('menu tab "products" isn\'t'),
            expect.stringContaining('menu tab "products" isn\'t')
        ]);
    });

    it("warns when a tab sets tab-menu-column-height without a tab-menu", async () => {
        const violations = await violationsFor({
            layout: headerTabs,
            tabs: {
                products: { ...products, tabMenuColumnHeight: 3 },
                guides: { displayName: "Guides", tabMenuColumnHeight: 2 }
            },
            navigation: [...validNavigation, { tab: "guides", layout: [] }]
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("warning");
        expect(violations[0]?.message).toContain('"guides"');
    });

    it("warns that the menu falls back to the sidebar without header tabs", async () => {
        for (const layout of [
            undefined,
            { tabsPlacement: "sidebar" },
            { tabsPlacement: "header", disableHeader: true }
        ]) {
            const violations = await violationsFor({ layout, tabs: { products }, navigation: validNavigation });
            expect(violations).toHaveLength(1);
            expect(violations[0]?.severity).toBe("warning");
            expect(violations[0]?.message).toContain("sidebar");
        }
    });

    it("uses theme.tabs.placement over layout.tabs-placement for the sidebar fallback", async () => {
        expect(
            await violationsFor({
                layout: { tabsPlacement: "sidebar" },
                theme: { tabs: { placement: "header" } },
                tabs: { products },
                navigation: validNavigation
            })
        ).toEqual([]);
        const violations = await violationsFor({
            layout: headerTabs,
            theme: { tabs: { placement: "sidebar" } },
            tabs: { products },
            navigation: validNavigation
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("sidebar");
    });

    it("checks tab menus in version files", async () => {
        const violations = await versionFileViolationsFor(
            { layout: headerTabs },
            { tabs: { products: rawProducts }, navigation: [{ tab: "products" }, { tab: "agents", layout: [] }] }
        );
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("fatal");
        expect(violations[0]?.message).toContain('"studio"');
        expect(
            await versionFileViolationsFor(
                { layout: headerTabs },
                {
                    tabs: { products: rawProducts },
                    navigation: [{ tab: "products" }, { tab: "agents", layout: [] }, { tab: "studio", layout: [] }]
                }
            )
        ).toEqual([]);
    });

    it("checks tab menus in product files, using the site's tab placement", async () => {
        const content = {
            tabs: { products: rawProducts },
            navigation: [{ tab: "products" }, { tab: "agents", layout: [] }, { tab: "studio", layout: [] }]
        };
        expect(await productFileViolationsFor({ layout: headerTabs }, content)).toEqual([]);
        const violations = await productFileViolationsFor({}, content);
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("warning");
    });

    it("rejects menu tabs that would get the same URL slug", async () => {
        const violations = await violationsFor({
            layout: headerTabs,
            tabs: {
                products: {
                    displayName: "Products",
                    tabMenu: [
                        { tab: "agents", displayName: "Agents" },
                        { group: "More", tabs: [{ tab: "agents-v2", displayName: "Agents" }] },
                        { tab: "studio", displayName: "Agents", slug: "studio" }
                    ]
                }
            },
            navigation: [
                { tab: "products" },
                { tab: "agents", layout: [] },
                { tab: "agents-v2", layout: [] },
                { tab: "studio", layout: [] }
            ]
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("fatal");
        expect(violations[0]?.message).toContain('"agents", "agents-v2"');
        expect(violations[0]?.message).toContain('"agents"');
    });
});
