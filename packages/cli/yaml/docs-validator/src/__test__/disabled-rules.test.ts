import { docsYml } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { Rule } from "../Rule.js";
import { runRulesOnDocsWorkspace } from "../validateDocsWorkspace.js";

function createWorkspace(check: docsYml.RawSchemas.CheckConfig | undefined): DocsWorkspace {
    return {
        type: "docs",
        workspaceName: undefined,
        absoluteFilePath: AbsoluteFilePath.of(__dirname),
        absoluteFilepathToDocsConfig: AbsoluteFilePath.of(`${__dirname}/docs.yml`),
        config: {
            instances: [],
            navigation: [],
            check
        }
    };
}

function createRule({ name, onCreate }: { name: string; onCreate: () => void }): Rule {
    return {
        name,
        create: async () => {
            onCreate();
            return {
                file: async () => [
                    {
                        message: `${name} violation`,
                        severity: "error"
                    }
                ]
            };
        }
    };
}

async function runWithRule(check: docsYml.RawSchemas.CheckConfig | undefined): Promise<{
    created: boolean;
    violations: string[];
}> {
    let created = false;
    const violations = await runRulesOnDocsWorkspace({
        workspace: createWorkspace(check),
        rules: [
            createRule({
                name: "missing-redirects",
                onCreate: () => {
                    created = true;
                }
            })
        ],
        context: createMockTaskContext(),
        apiWorkspaces: [],
        ossWorkspaces: []
    });
    return { created, violations: violations.map((violation) => violation.message) };
}

describe("check.rules severities", () => {
    it("does not initialize or report a rule configured as off", async () => {
        const { created, violations } = await runWithRule({ rules: { missingRedirects: "off" } });
        expect(created).toBe(false);
        expect(violations).toEqual([]);
    });

    it("still runs a rule configured as warn", async () => {
        const { created, violations } = await runWithRule({ rules: { missingRedirects: "warn" } });
        expect(created).toBe(true);
        expect(violations).toEqual(["missing-redirects violation"]);
    });

    it("only disables the rule that is turned off", async () => {
        const { created, violations } = await runWithRule({ rules: { brokenLinks: "off" } });
        expect(created).toBe(true);
        expect(violations).toEqual(["missing-redirects violation"]);
    });
});
