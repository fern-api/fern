import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace, loadDocsWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it, vi } from "vitest";
import { DocsDefinitionResolver } from "../DocsDefinitionResolver.js";

const FIXTURE_DIR = resolve(AbsoluteFilePath.of(__dirname), "fixtures/openapi-latest/fern");

async function resolveDocs(includeApiWorkspaceInRegistration: boolean, duplicateApiWorkspace = false) {
    const context = createMockTaskContext();
    const docsWorkspace = await loadDocsWorkspace({
        fernDirectory: FIXTURE_DIR,
        context
    });
    if (docsWorkspace == null) {
        throw new Error("Docs workspace failed to load");
    }

    const result = await loadAPIWorkspace({
        absolutePathToWorkspace: FIXTURE_DIR,
        context,
        cliVersion: "0.0.0",
        workspaceName: undefined
    });
    if (!result.didSucceed || !(result.workspace instanceof OSSWorkspace)) {
        throw new Error("OpenAPI workspace failed to load");
    }

    const toFernWorkspace = vi.spyOn(result.workspace, "toFernWorkspace");
    const registerApi = vi.fn().mockReturnValue("api-definition-id");
    const resolver = new DocsDefinitionResolver({
        domain: "example.docs.buildwithfern.com",
        docsWorkspace,
        ossWorkspaces: [result.workspace],
        apiWorkspaces: duplicateApiWorkspace ? [result.workspace, result.workspace] : [result.workspace],
        taskContext: context,
        registerApi,
        includeApiWorkspaceInRegistration
    });

    return {
        definition: await resolver.resolve(),
        registerApi,
        toFernWorkspace
    };
}

describe("API workspace registration", () => {
    it("preserves the rendered definition when the registration callback does not need a Fern workspace", async () => {
        const withWorkspace = await resolveDocs(true);
        const withoutWorkspace = await resolveDocs(false);

        expect(withWorkspace.toFernWorkspace).toHaveBeenCalledTimes(1);
        expect(withWorkspace.registerApi.mock.calls[0]?.[0].workspace).toBeDefined();
        expect(withoutWorkspace.toFernWorkspace).not.toHaveBeenCalled();
        expect(withoutWorkspace.registerApi.mock.calls[0]?.[0].workspace).toBeUndefined();
        expect(withoutWorkspace.definition).toEqual(withWorkspace.definition);
    });

    it("does not require a uniquely resolved Fern workspace when the OpenAPI workspace is available", async () => {
        const result = await resolveDocs(false, true);

        expect(result.toFernWorkspace).not.toHaveBeenCalled();
        expect(result.definition).toBeDefined();
    });
});
