import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import type { RuleContext, RuleViolation } from "../../../Rule.js";
import { AllRolesMustBeDeclaredRule } from "../index.js";

const FERN_FOLDER = AbsoluteFilePath.of("/project/fern");

function createVisitor(roles: string[] | undefined) {
    return AllRolesMustBeDeclaredRule.create({
        workspace: { absoluteFilePath: FERN_FOLDER, config: { roles } }
    } as unknown as RuleContext);
}

async function visitPage(roles: string[] | undefined, content: string): Promise<RuleViolation[]> {
    const visitor = await createVisitor(roles);
    return (
        (await visitor.markdownPage?.({
            title: "Page",
            content,
            absoluteFilepath: AbsoluteFilePath.of("/project/fern/pages/page.mdx")
        })) ?? []
    );
}

describe("AllRolesMustBeDeclaredRule", () => {
    it("flags an undeclared viewers role as fatal", async () => {
        const visitor = await createVisitor(["beta"]);
        const violations = await visitor.permissions?.({ viewers: ["beta", "internal"] });
        expect(violations).toEqual([
            {
                severity: "fatal",
                message: 'Role "internal" is used but not declared at the top level of the docs.yml file.'
            }
        ]);
    });

    it("flags undeclared <If roles> and <If viewer> roles as fatal, once per role", async () => {
        const violations = await visitPage(
            ["beta"],
            [
                "---",
                "title: Page",
                "---",
                '<If roles={["beta", "internal"]}>Internal</If>',
                '<If roles={["internal"]}>Again</If>',
                '<If viewer="partner">Partner</If>'
            ].join("\n")
        );
        expect(violations).toEqual([
            {
                severity: "fatal",
                relativeFilepath: "pages/page.mdx",
                message:
                    'Role "internal" is used in an <If> component but not declared at the top level of the docs.yml file.'
            },
            {
                severity: "fatal",
                relativeFilepath: "pages/page.mdx",
                message:
                    'Role "partner" is used in an <If> component but not declared at the top level of the docs.yml file.'
            }
        ]);
    });

    it("flags <If> roles when docs.yml declares no roles", async () => {
        const violations = await visitPage(undefined, '<If roles={["beta"]}>Beta</If>');
        expect(violations.map((violation) => violation.message)).toEqual([
            'Role "beta" is used in an <If> component but not declared at the top level of the docs.yml file.'
        ]);
    });

    it("passes declared roles, nested <If> blocks and non-role <If> attributes", async () => {
        const violations = await visitPage(
            ["beta", "internal"],
            [
                '<If roles={["beta"]}>',
                "  Beta",
                '  <If roles={["internal"]} not>Not internal</If>',
                "</If>",
                '<If products={["platform"]}>Platform</If>',
                "<If loggedIn>Signed in</If>"
            ].join("\n")
        );
        expect(violations).toEqual([]);
    });

    it("skips dynamic role values and non-If components", async () => {
        const violations = await visitPage(
            [],
            [
                "export const ROLES = ['secret'];",
                "",
                "<If roles={ROLES}>Dynamic</If>",
                '<Card roles={["beta"]}>Not an If</Card>',
                '`<If roles={["code"]}>` in inline code'
            ].join("\n")
        );
        expect(violations).toEqual([]);
    });

    it("ignores pages that fail to parse", async () => {
        expect(await visitPage([], '<If roles={["beta"]}>unclosed')).toEqual([]);
    });
});
