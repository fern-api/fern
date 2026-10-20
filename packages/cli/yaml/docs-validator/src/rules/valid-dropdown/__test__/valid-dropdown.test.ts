import { describe, expect, it } from "vitest";

import { DocsConfigFileAstNodeTypes } from "../../../docsAst/DocsConfigFileAstVisitor.js";
import { RuleContext } from "../../../Rule.js";
import { ValidDropdownRule } from "../valid-dropdown.js";

async function violationsFor(config: object) {
    const visitor = await ValidDropdownRule.create({} as RuleContext);
    return (await visitor.file?.({ config } as unknown as DocsConfigFileAstNodeTypes["file"])) ?? [];
}

const headerTabs = { tabsPlacement: "header" };

describe("valid-dropdown", () => {
    it("passes items with a layout or variants and links, with header tabs", async () => {
        expect(
            await violationsFor({
                layout: headerTabs,
                navigation: [
                    {
                        tab: "products",
                        dropdown: [
                            {
                                group: "Platform",
                                items: [
                                    { title: "Agents", variants: [{ title: "Python", layout: [] }] },
                                    { link: "Status", href: "https://status.example.com" }
                                ]
                            },
                            { title: "Studio", layout: [] }
                        ]
                    }
                ]
            })
        ).toEqual([]);
    });

    it("rejects an item with both or neither of layout and variants", async () => {
        const violations = await violationsFor({
            layout: headerTabs,
            navigation: [
                {
                    tab: "products",
                    dropdown: [{ title: "Both", layout: [], variants: [] }, { title: "Neither" }]
                }
            ]
        });
        expect(violations.map((v) => v.severity)).toEqual(["fatal", "fatal"]);
        expect(violations[0]?.message).toContain('"Both"');
        expect(violations[1]?.message).toContain('"Neither"');
    });

    it("rejects a tab that combines dropdown with variants", async () => {
        const violations = await violationsFor({
            layout: headerTabs,
            navigation: [{ tab: "products", dropdown: [], variants: [] }]
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("fatal");
    });

    it("warns that the dropdown falls back to the sidebar without header tabs", async () => {
        for (const layout of [
            undefined,
            { tabsPlacement: "sidebar" },
            { tabsPlacement: "header", disableHeader: true }
        ]) {
            const violations = await violationsFor({
                layout,
                navigation: [{ tab: "products", dropdown: [{ title: "Studio", layout: [] }] }]
            });
            expect(violations).toHaveLength(1);
            expect(violations[0]?.severity).toBe("warning");
            expect(violations[0]?.message).toContain("sidebar");
        }
    });
});
