import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { DocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { Rule } from "../Rule.js";
import { MissingRedirectsRule } from "../rules/missing-redirects/index.js";
import { ValidDocsEndpoints } from "../rules/valid-docs-endpoints/index.js";
import { runRulesOnDocsWorkspace } from "../validateDocsWorkspace.js";

function trackedRule(name: string, created: string[]): Rule {
    return {
        name,
        create: () => {
            created.push(name);
            return {};
        }
    };
}

function workspaceWithCheck(check: DocsWorkspace["config"]["check"]): DocsWorkspace {
    return {
        type: "docs",
        workspaceName: undefined,
        absoluteFilePath: AbsoluteFilePath.of("/fern"),
        absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/fern/docs.yml"),
        config: { instances: [], navigation: [], check }
    };
}

describe("runRulesOnDocsWorkspace", () => {
    it("does not create rules configured as off", async () => {
        const created: string[] = [];
        await runRulesOnDocsWorkspace({
            workspace: workspaceWithCheck({
                rules: { missingRedirects: "off", validDocsEndpoints: "warn" }
            }),
            rules: [trackedRule(MissingRedirectsRule.name, created), trackedRule(ValidDocsEndpoints.name, created)],
            context: createMockTaskContext(),
            apiWorkspaces: [],
            ossWorkspaces: []
        });

        expect(created).toEqual([ValidDocsEndpoints.name]);
    });
});
