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
    violations: { message: string; severity: string }[];
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
    return {
        created,
        violations: violations.map((violation) => ({ message: violation.message, severity: violation.severity }))
    };
}

describe("check.rules severities", () => {
    it("does not initialize a rule configured as off, and reports it as a warning", async () => {
        const { created, violations } = await runWithRule({ rules: { missingRedirects: "off" } });
        expect(created).toBe(false);
        expect(violations).toEqual([
            {
                message: 'Rule "missing-redirects" is disabled in docs.yml and was not run.',
                severity: "warning"
            }
        ]);
    });

    it("still runs a rule configured as warn", async () => {
        const { created, violations } = await runWithRule({ rules: { missingRedirects: "warn" } });
        expect(created).toBe(true);
        expect(violations).toEqual([{ message: "missing-redirects violation", severity: "warning" }]);
    });

    it("only disables the rule that is turned off", async () => {
        const { created, violations } = await runWithRule({ rules: { brokenLinks: "off" } });
        expect(created).toBe(true);
        expect(violations).toEqual([
            {
                message: 'Rule "valid-markdown-links" is disabled in docs.yml and was not run.',
                severity: "warning"
            },
            { message: "missing-redirects violation", severity: "error" }
        ]);
    });
});
