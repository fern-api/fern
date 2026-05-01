import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

async function getIRForFixture(fixtureName: string) {
    const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixtureName), RelativeFilePath.of("fern"));
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: fixturePath,
        context,
        cliVersion: "0.0.0",
        workspaceName: fixtureName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load OpenAPI fixture ${fixtureName}\n${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error(`Expected OSSWorkspace for fixture ${fixtureName}`);
    }
    return workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: true,
        logWarnings: false
    });
}

describe("OpenAPI 2xx no-content response preserves status code", () => {
    it("preserves 204 status code on an endpoint whose only response is 204 No Content", async () => {
        const ir = await getIRForFixture("no-content-response-preserves-status-code");

        const endpoint = findEndpointByOperationId(ir, "deletePlant");
        expect(endpoint).toBeDefined();
        expect(endpoint?.response?.body).toBeUndefined();
        // This is the core regression check — without the fix the status code
        // gets dropped here and downstream consumers fall back to 200.
        expect(endpoint?.response?.statusCode).toBe(204);
    }, 90_000);

    it("lets a body-bearing 200 response win over a sibling 204 no-content response", async () => {
        const ir = await getIRForFixture("no-content-response-preserves-status-code");

        const endpoint = findEndpointByOperationId(ir, "renamePlant");
        expect(endpoint).toBeDefined();
        expect(endpoint?.response?.statusCode).toBe(200);
        expect(endpoint?.response?.body).toBeDefined();
    }, 90_000);
});

function findEndpointByOperationId(
    ir: Awaited<ReturnType<typeof getIRForFixture>>,
    operationId: string
): (typeof ir.services)[string]["endpoints"][number] | undefined {
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            const originalName = typeof endpoint.name === "string" ? endpoint.name : endpoint.name.originalName;
            if (originalName === operationId) {
                return endpoint;
            }
        }
    }
    return undefined;
}
