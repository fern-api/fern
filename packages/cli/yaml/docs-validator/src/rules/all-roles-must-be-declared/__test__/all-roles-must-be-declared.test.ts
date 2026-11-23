import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { collectIfRoles } from "../collect-if-roles.js";
import { AllRolesMustBeDeclaredRule, getUndeclaredRoles } from "../index.js";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

function fixture(name: string): AbsoluteFilePath {
    return join(FIXTURES_DIR, RelativeFilePath.of(name), RelativeFilePath.of("fern"));
}

describe("collectIfRoles", () => {
    it("collects <If roles> and <If viewer> roles once each, after frontmatter", () => {
        const content = [
            "---",
            "title: Page",
            "---",
            '<If roles={["beta", "internal"]}>Internal</If>',
            '<If roles={["internal"]}>Again</If>',
            '<If viewer={["partner"]}>Partner</If>'
        ].join("\n");
        expect(collectIfRoles(content)).toEqual(["beta", "internal", "partner"]);
    });

    it("skips single-string role values, which the renderer reads as an empty list", () => {
        const content = ['<If viewer="partner">Partner</If>', '<If roles={"support"}>Support</If>'].join("\n");
        expect(collectIfRoles(content)).toEqual([]);
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

describe("all-roles-must-be-declared", () => {
    it("reports an undeclared <If> role as fatal, with the page's path", async () => {
        const violations = await getViolationsForRule({
            rule: AllRolesMustBeDeclaredRule,
            absolutePathToFernDirectory: fixture("undeclared-if-role")
        });
        expect(violations).toEqual([
            expect.objectContaining({
                severity: "fatal",
                relativeFilepath: "pages/overview.mdx",
                message:
                    'Role "partner" is used in an <If> component but not declared at the top level of the docs.yml file.'
            })
        ]);
    });

    it("passes when every <If> role is declared", async () => {
        const violations = await getViolationsForRule({
            rule: AllRolesMustBeDeclaredRule,
            absolutePathToFernDirectory: fixture("declared-if-roles")
        });
        expect(violations).toEqual([]);
    });
});
