import type { OpenAPISpec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it, vi } from "vitest";

import { OSSWorkspace } from "../OSSWorkspace.js";
import { createMockTaskContext } from "./helpers/createMockTaskContext.js";

const USERS_API = join(
    AbsoluteFilePath.of(path.dirname(fileURLToPath(import.meta.url))),
    RelativeFilePath.of("fixtures/composed-workspace/users-api")
);
const USERS_SPEC = join(USERS_API, RelativeFilePath.of("users-openapi.json"));

function createWorkspace(): OSSWorkspace {
    const spec: OpenAPISpec = {
        type: "openapi",
        absoluteFilepath: USERS_SPEC,
        absoluteFilepathToOverrides: undefined,
        absoluteFilepathToOverlays: undefined,
        source: { type: "openapi", file: USERS_SPEC }
    };
    return new OSSWorkspace({
        absoluteFilePath: USERS_API,
        allSpecs: [spec],
        specs: [spec],
        generatorsConfiguration: undefined,
        workspaceName: undefined,
        cliVersion: "0.0.0"
    });
}

interface Internals {
    buildIntermediateRepresentation: OSSWorkspace["getIntermediateRepresentation"];
    buildFernWorkspace: OSSWorkspace["toFernWorkspace"];
}

function internals(workspace: OSSWorkspace): Internals {
    return workspace as unknown as Internals;
}

const IR_ARGS = {
    context: createMockTaskContext(),
    audiences: { type: "all" as const },
    enableUniqueErrorsPerEndpoint: true,
    generateV1Examples: false,
    logWarnings: false,
    cacheResult: true
};

describe("OSSWorkspace.enableResultCaching", () => {
    it("rebuilds the IR on every call when caching is off", async () => {
        const workspace = createWorkspace();
        const build = vi.spyOn(internals(workspace), "buildIntermediateRepresentation");

        await workspace.getIntermediateRepresentation(IR_ARGS);
        await workspace.getIntermediateRepresentation(IR_ARGS);

        expect(build).toHaveBeenCalledTimes(2);
    });

    it("builds the IR once per argument set and hands each caller its own copy", async () => {
        const workspace = createWorkspace();
        workspace.enableResultCaching();
        const build = vi.spyOn(internals(workspace), "buildIntermediateRepresentation");

        const [first, second] = await Promise.all([
            workspace.getIntermediateRepresentation(IR_ARGS),
            workspace.getIntermediateRepresentation({ ...IR_ARGS, context: createMockTaskContext() })
        ]);
        expect(build).toHaveBeenCalledTimes(1);
        expect(second).toEqual(first);
        expect(second).not.toBe(first);

        first.apiDisplayName = "mutated";
        const third = await workspace.getIntermediateRepresentation(IR_ARGS);
        expect(third.apiDisplayName).toEqual(second.apiDisplayName);
        expect(build).toHaveBeenCalledTimes(1);

        await workspace.getIntermediateRepresentation(IR_ARGS, { docsVisibility: "public" });
        await workspace.getIntermediateRepresentation({
            ...IR_ARGS,
            audiences: { type: "select", audiences: ["external"] }
        });
        expect(build).toHaveBeenCalledTimes(3);
    });

    it("rebuilds the IR for calls that don't ask for caching", async () => {
        const workspace = createWorkspace();
        workspace.enableResultCaching();
        const build = vi.spyOn(internals(workspace), "buildIntermediateRepresentation");

        await workspace.getIntermediateRepresentation({ ...IR_ARGS, cacheResult: undefined });
        await workspace.getIntermediateRepresentation({ ...IR_ARGS, cacheResult: undefined });
        await workspace.getIntermediateRepresentation(IR_ARGS);
        await workspace.getIntermediateRepresentation(IR_ARGS);
        expect(build).toHaveBeenCalledTimes(3);
    });

    it("does not cache a failed build", async () => {
        const workspace = createWorkspace();
        workspace.enableResultCaching();
        const build = vi
            .spyOn(internals(workspace), "buildIntermediateRepresentation")
            .mockRejectedValueOnce(new Error("boom"));

        await expect(workspace.getIntermediateRepresentation(IR_ARGS)).rejects.toThrow("boom");
        await expect(workspace.getIntermediateRepresentation(IR_ARGS)).resolves.toBeDefined();
        expect(build).toHaveBeenCalledTimes(2);
    });

    it("drops cached results and stops caching once disabled", async () => {
        const workspace = createWorkspace();
        workspace.enableResultCaching();
        const buildIr = vi.spyOn(internals(workspace), "buildIntermediateRepresentation");
        const buildWorkspace = vi.spyOn(internals(workspace), "buildFernWorkspace");

        await workspace.getIntermediateRepresentation(IR_ARGS);
        await workspace.toFernWorkspace({ context: createMockTaskContext() });
        workspace.disableResultCaching();
        await workspace.getIntermediateRepresentation(IR_ARGS);
        await workspace.getIntermediateRepresentation(IR_ARGS);
        await workspace.toFernWorkspace({ context: createMockTaskContext() });

        expect(buildIr).toHaveBeenCalledTimes(3);
        expect(buildWorkspace).toHaveBeenCalledTimes(2);
    });

    it("builds the Fern workspace once per settings", async () => {
        const workspace = createWorkspace();
        workspace.enableResultCaching();
        const build = vi.spyOn(internals(workspace), "buildFernWorkspace");
        const settings = { enableUniqueErrorsPerEndpoint: true, detectGlobalHeaders: false };

        const first = await workspace.toFernWorkspace({ context: createMockTaskContext() }, settings);
        const second = await workspace.toFernWorkspace({ context: createMockTaskContext() }, { ...settings });
        expect(second).toBe(first);
        expect(build).toHaveBeenCalledTimes(1);

        await workspace.toFernWorkspace({ context: createMockTaskContext() });
        expect(build).toHaveBeenCalledTimes(2);
    });
});
