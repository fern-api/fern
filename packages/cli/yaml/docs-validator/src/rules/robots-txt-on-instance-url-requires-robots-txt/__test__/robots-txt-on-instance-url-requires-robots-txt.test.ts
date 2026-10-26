import { describe, expect, it } from "vitest";

import { DocsConfigFileAstNodeTypes } from "../../../docsAst/DocsConfigFileAstVisitor.js";
import { RuleContext } from "../../../Rule.js";
import { RobotsTxtOnInstanceUrlRequiresRobotsTxtRule } from "../robots-txt-on-instance-url-requires-robots-txt.js";

async function violationsFor(config: object) {
    const visitor = await RobotsTxtOnInstanceUrlRequiresRobotsTxtRule.create({} as RuleContext);
    return (await visitor.file?.({ config } as unknown as DocsConfigFileAstNodeTypes["file"])) ?? [];
}

describe("robots-txt-on-instance-url-requires-robots-txt", () => {
    it("warns when the flag is on without agents.robots-txt", async () => {
        const violations = await violationsFor({ experimental: { robotsTxtOnInstanceUrl: true } });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("warning");
        expect(violations[0]?.message).toContain("agents.robots-txt");
    });

    it("passes when agents.robots-txt is set", async () => {
        expect(
            await violationsFor({
                experimental: { robotsTxtOnInstanceUrl: true },
                agents: { robotsTxt: "./robots.txt" }
            })
        ).toEqual([]);
    });

    it("passes when the flag is off or unset", async () => {
        expect(await violationsFor({ experimental: { robotsTxtOnInstanceUrl: false } })).toEqual([]);
        expect(await violationsFor({})).toEqual([]);
    });
});
