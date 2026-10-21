/**
 * `respect-per-spec-base-path` + `respect-per-spec-base-path-v3` with multiple specs: each spec's plain
 * `x-fern-base-path` must apply to its own endpoints instead of being dropped when the specs are merged.
 * Without `respect-per-spec-base-path-v3` the v3 parser keeps its previous behavior.
 */

import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

interface IR {
    basePath?: { head: string } | null;
    services: Record<string, { endpoints: { fullPath: { head: string } }[] }>;
}

async function loadIr(fixtureName: string): Promise<IR> {
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: join(
            AbsoluteFilePath.of(__dirname),
            RelativeFilePath.of(`fixtures/${fixtureName}/fern`)
        ),
        context,
        cliVersion: "0.0.0",
        workspaceName: fixtureName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load fixture: ${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error("Expected OSSWorkspace (V3 importer) but got a different workspace type");
    }
    const intermediateRepresentation = await workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        logWarnings: false
    });
    return JSON.parse(
        JSON.stringify(intermediateRepresentation, (_key, value) => {
            if (value && typeof value === "object" && "_visit" in value && "type" in value) {
                const { type, _visit, ...rest } = value;
                return { _type: type, ...rest };
            }
            return value;
        })
    ) as IR;
}

function getEndpointPaths(ir: IR): string[] {
    return Object.values(ir.services)
        .flatMap((service) => service.endpoints.map((endpoint) => endpoint.fullPath.head))
        .sort();
}

describe("respect-per-spec-base-path", () => {
    it("with respect-per-spec-base-path-v3, keeps each spec's base path on its own endpoints", async () => {
        const ir = await loadIr("per-spec-base-path");

        expect(getEndpointPaths(ir)).toEqual(["/api/v1/plants", "/oauth/token"]);
        expect(ir.basePath ?? undefined).toBeUndefined();
    }, 60_000);

    it("keeps the previous behavior without respect-per-spec-base-path-v3", async () => {
        const ir = await loadIr("per-spec-base-path-v3-off");

        expect(getEndpointPaths(ir)).toEqual(["/plants", "/token"]);
        // Only one spec's base path survives the merge as the API-wide base path.
        expect(ir.basePath?.head).toBe("/oauth");
    }, 60_000);
});
