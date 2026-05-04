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

describe("OpenAPI 3.1 -> IR: generators.yml auth override respects endpoint-level security: [] opt-out", () => {
    it("keeps auth=false and security=[] on a public endpoint that opts out via security: []", async () => {
        const ir = await getIRForFixture("auth-overrides-respect-endpoint-security-opt-out");

        const endpoint = findEndpointByOperationId(ir, "listPublicPlants");
        expect(endpoint).toBeDefined();
        expect(endpoint?.auth).toBe(false);
        expect(endpoint?.security).toEqual([]);
    }, 90_000);

    it("keeps auth=false and security=[] on the OAuth token endpoint that opts out via security: []", async () => {
        const ir = await getIRForFixture("auth-overrides-respect-endpoint-security-opt-out");

        const endpoint = findEndpointByOperationId(ir, "getToken");
        expect(endpoint).toBeDefined();
        expect(endpoint?.auth).toBe(false);
        expect(endpoint?.security).toEqual([]);
    }, 90_000);

    it("inherits the generators.yml auth override on an endpoint with no security field", async () => {
        const ir = await getIRForFixture("auth-overrides-respect-endpoint-security-opt-out");

        const endpoint = findEndpointByOperationId(ir, "getPlant");
        expect(endpoint).toBeDefined();
        expect(endpoint?.auth).toBe(true);
        expect(endpoint?.security).toEqual([{ PlantOAuth: [] }]);
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
