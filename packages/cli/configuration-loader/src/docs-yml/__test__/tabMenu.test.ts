import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

async function parseNavigation(
    rawDocsConfiguration: Omit<docsYml.RawSchemas.DocsConfiguration, "instances" | "title">
): Promise<docsYml.DocsNavigationConfiguration | undefined> {
    const parsed = await parseDocsConfiguration({
        rawDocsConfiguration: { instances: [], title: "Test", ...rawDocsConfiguration },
        // These paths shouldn't be used by this test case.
        absolutePathToFernFolder: AbsoluteFilePath.of("/tmp"),
        absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/tmp/docs.yml"),
        context: createMockTaskContext()
    });
    return parsed.navigation;
}

function tabbedItems(navigation: docsYml.DocsNavigationConfiguration | undefined): docsYml.TabbedNavigation[] {
    if (navigation?.type !== "tabbed") {
        throw new Error(`Expected tabbed navigation, got ${navigation?.type}`);
    }
    return navigation.items;
}

const tabs: docsYml.RawSchemas.DocsConfiguration["tabs"] = {
    guides: { displayName: "Guides" },
    products: {
        displayName: "Products",
        tabMenuColumnHeight: 2,
        tabMenu: [
            {
                group: "Platform",
                tabs: [
                    { tab: "agents", displayName: "Agents", subtitle: "Build AI agents", default: true },
                    { link: "Status", href: "https://status.example.com" }
                ]
            },
            { tab: "studio", displayName: "Studio", hidden: true }
        ]
    }
};

const navigation: docsYml.RawSchemas.DocsConfiguration["navigation"] = [
    { tab: "guides", layout: [] },
    { tab: "products" },
    { tab: "agents", variants: [{ group: "SDKs", items: [{ title: "Python", layout: [] }] }] },
    { tab: "studio", layout: [] }
];

describe("tab-menu", () => {
    it("puts the menu where its bare navigation entry is, with members, groups and links in menu order", async () => {
        const items = tabbedItems(await parseNavigation({ layout: { tabsPlacement: "header" }, tabs, navigation }));
        expect(items.map((item) => item.title)).toEqual(["Guides", "Products"]);

        const child = items[1]?.child;
        expect(child?.type).toBe("variants");
        if (child?.type !== "variants") {
            return;
        }
        expect(child.location).toBe("tab");
        expect(child.columnHeight).toBe(2);
        expect(child.variants.map((variant) => [variant.tabId, variant.title])).toEqual([
            ["agents", "Agents"],
            ["studio", "Studio"]
        ]);
        expect(child.variants[0]).toMatchObject({ subtitle: "Build AI agents", default: true });
        expect(child.variants[1]).toMatchObject({ hidden: true });
        expect(child.menu?.map((entry) => entry.type)).toEqual(["group", "variant"]);
        const [group] = child.menu ?? [];
        expect(group?.type === "group" ? group.children.map((entry) => entry.type) : []).toEqual(["variant", "link"]);
        // The menu and the variant list share objects, so the resolver can match them.
        expect(group?.type === "group" ? group.children[0] : undefined).toEqual({
            type: "variant",
            variant: child.variants[0]
        });
    });

    it("keeps a member's own variants, groups included, under that member", async () => {
        const items = tabbedItems(await parseNavigation({ layout: { tabsPlacement: "header" }, tabs, navigation }));
        const child = items[1]?.child;
        const agents = child?.type === "variants" ? child.variants[0] : undefined;
        expect(agents?.layout).toEqual([]);
        expect(agents?.nestedVariants?.variants.map((variant) => variant.title)).toEqual(["Python"]);
        expect(agents?.nestedVariants?.menu?.map((entry) => entry.type)).toEqual(["group"]);
    });

    it("gives members with the same display name different tab ids", async () => {
        const items = tabbedItems(
            await parseNavigation({
                layout: { tabsPlacement: "header" },
                tabs: {
                    products: {
                        displayName: "Products",
                        tabMenu: [
                            { tab: "agents", displayName: "Agents" },
                            { tab: "agents-v2", displayName: "Agents", slug: "agents-v2" }
                        ]
                    }
                },
                navigation: [{ tab: "products" }, { tab: "agents", layout: [] }, { tab: "agents-v2", layout: [] }]
            })
        );
        const child = items[0]?.child;
        expect(child?.type === "variants" ? child.variants.map((variant) => variant.tabId) : []).toEqual([
            "agents",
            "agents-v2"
        ]);
    });

    it("leaves plain tab variants without tab ids", async () => {
        const items = tabbedItems(
            await parseNavigation({
                tabs: { sdks: { displayName: "SDKs" } },
                navigation: [{ tab: "sdks", variants: [{ title: "Python", layout: [] }] }]
            })
        );
        const child = items[0]?.child;
        expect(child?.type).toBe("variants");
        expect(child?.type === "variants" ? child.variants.map((variant) => variant.tabId) : []).toEqual([undefined]);
    });
});
