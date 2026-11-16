import { describe, expect, it } from "vitest";

import { collectIfRoles } from "../collect-if-roles.js";
import { getUndeclaredRoles } from "../index.js";

describe("collectIfRoles", () => {
    it("collects <If roles> and <If viewer> roles once each, after frontmatter", () => {
        const content = [
            "---",
            "title: Page",
            "---",
            '<If roles={["beta", "internal"]}>Internal</If>',
            '<If roles={["internal"]}>Again</If>',
            '<If viewer="partner">Partner</If>'
        ].join("\n");
        expect(collectIfRoles(content)).toEqual(["beta", "internal", "partner"]);
    });

    it("collects roles from nested <If> blocks and ignores non-role attributes", () => {
        const content = [
            '<If roles={["beta"]}>',
            "  Beta",
            '  <If roles={["internal"]} not>Not internal</If>',
            "</If>",
            '<If products={["platform"]}>Platform</If>',
            "<If loggedIn>Signed in</If>"
        ].join("\n");
        expect(collectIfRoles(content)).toEqual(["beta", "internal"]);
    });

    it("skips dynamic role values, non-If components and inline code", () => {
        const content = [
            "export const ROLES = ['secret'];",
            "",
            "<If roles={ROLES}>Dynamic</If>",
            '<Card roles={["beta"]}>Not an If</Card>',
            '`<If roles={["code"]}>` in inline code'
        ].join("\n");
        expect(collectIfRoles(content)).toEqual([]);
    });

    it("returns nothing for pages that fail to parse", () => {
        expect(collectIfRoles('<If roles={["beta"]}>unclosed')).toEqual([]);
    });
});

describe("getUndeclaredRoles", () => {
    it("returns the used roles missing from docs.yml roles", () => {
        expect(getUndeclaredRoles(["beta", "internal"], ["beta"])).toEqual(["internal"]);
        expect(getUndeclaredRoles(["beta"], ["beta"])).toEqual([]);
    });

    it("treats every used role as undeclared when docs.yml declares no roles", () => {
        expect(getUndeclaredRoles(["beta"], undefined)).toEqual(["beta"]);
    });
});
