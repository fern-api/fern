import { filterOssWorkspaces } from "@fern-api/docs-resolver";
import { validateDocsWorkspace } from "@fern-api/docs-validator";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadProjectFromDirectory } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { getDocsDevExcludeRules } from "../getDocsDevExcludeRules.js";

const NAMED_APIS_FIXTURE = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/named-apis/fern"));

async function getUnresolvedApiSectionMessages(excludeRules: string[]): Promise<string[]> {
    const context = createMockTaskContext();
    const project = await loadProjectFromDirectory({
        absolutePathToFernDirectory: NAMED_APIS_FIXTURE,
        context,
        cliVersion: "0.0.0",
        defaultToAllApiWorkspaces: true,
        commandLineApiWorkspace: undefined,
        cliName: "fern"
    });
    if (project.docsWorkspaces == null) {
        throw new Error("Expected fixture to have a docs workspace");
    }
    const workspaceNames = project.apiWorkspaces.map((workspace) => workspace.workspaceName).sort();
    if (workspaceNames.join(",") !== "gardens,plants") {
        throw new Error(`Expected named API workspaces in fixture, found: ${workspaceNames.join(", ")}`);
    }

    // Mirrors the v3 `fern docs dev` path, which validates without API workspaces.
    const violations = await validateDocsWorkspace(
        project.docsWorkspaces,
        context,
        [],
        await filterOssWorkspaces(project),
        false,
        [...excludeRules, "missing-redirects"]
    );
    return violations
        .map((violation) => violation.message)
        .filter((message) => message.includes("does not resolve to an API definition"));
}

describe("getDocsDevExcludeRules", () => {
    it("excludes api-section-has-definition when API workspaces are not loaded", () => {
        expect(getDocsDevExcludeRules({ brokenLinks: true, apiWorkspacesLoaded: false })).toEqual([
            "api-section-has-definition"
        ]);
        expect(getDocsDevExcludeRules({ brokenLinks: false, apiWorkspacesLoaded: false })).toEqual([
            "valid-markdown-links",
            "api-section-has-definition"
        ]);
    });

    it("keeps api-section-has-definition when API workspaces are loaded", () => {
        expect(getDocsDevExcludeRules({ brokenLinks: true, apiWorkspacesLoaded: true })).toEqual([]);
        expect(getDocsDevExcludeRules({ brokenLinks: false, apiWorkspacesLoaded: true })).toEqual([
            "valid-markdown-links"
        ]);
    });

    it("excludes rules that rebuild API references or read API specs when API references are skipped", () => {
        const expected = [
            "missing-redirects",
            "no-non-component-refs",
            "no-openapi-v2-in-docs",
            "valid-local-references",
            "valid-markdown-links",
            "valid-openapi-examples"
        ];
        expect(getDocsDevExcludeRules({ brokenLinks: true, apiWorkspacesLoaded: true, skipApi: true }).sort()).toEqual(
            expected
        );
        expect(getDocsDevExcludeRules({ brokenLinks: false, apiWorkspacesLoaded: true, skipApi: true }).sort()).toEqual(
            expected
        );
    });

    it("keeps missing-redirects when API references are not skipped", () => {
        expect(getDocsDevExcludeRules({ brokenLinks: true, apiWorkspacesLoaded: true, skipApi: false })).toEqual([]);
    });

    it("does not report named API sections as unresolved during docs dev validation", async () => {
        const messages = await getUnresolvedApiSectionMessages(
            getDocsDevExcludeRules({ brokenLinks: true, apiWorkspacesLoaded: false })
        );
        expect(messages).toEqual([]);
    });

    it("reports every named API section as unresolved without the exclusion", async () => {
        const messages = await getUnresolvedApiSectionMessages([]);
        expect(messages).toHaveLength(2);
    });
});
