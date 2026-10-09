import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

const FIXTURE_NAME = "endpoint-security-global-security";
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

/**
 * endpoint-security suppresses the generators.yml-derived default only. A `security`
 * block declared by the spec itself is ordinary OpenAPI inheritance and still applies,
 * and `auth` must agree with `security` on every endpoint — an endpoint must never end
 * up with a non-empty requirement list while reporting no auth.
 */
describe("OpenAPI 3.1 -> IR: endpoint-security with spec-level global security", () => {
    it("inherits the spec's global requirement when an operation declares no security", async () => {
        const ir = await getIRForFixture(FIXTURE_NAME);

        const endpoint = findEndpointByOperationId(ir, "listPlants");
        expect(endpoint?.auth).toBe(true);
        expect(endpoint?.security).toEqual([{ PlantOAuth: [] }]);
    }, 90_000);

    it("prefers an operation's own security over the global requirement", async () => {
        const ir = await getIRForFixture(FIXTURE_NAME);

        const endpoint = findEndpointByOperationId(ir, "getPlant");
        expect(endpoint?.auth).toBe(true);
        expect(endpoint?.security).toEqual([{ PlantApiKey: [] }]);
    }, 90_000);

    it("honors an explicit security: [] opt-out over the global requirement", async () => {
        const ir = await getIRForFixture(FIXTURE_NAME);

        const endpoint = findEndpointByOperationId(ir, "health");
        expect(endpoint?.auth).toBe(false);
        expect(endpoint?.security).toEqual([]);
    }, 90_000);

    it("keeps auth and security consistent on every endpoint", async () => {
        const ir = await getIRForFixture(FIXTURE_NAME);

        for (const service of Object.values(ir.services)) {
            for (const endpoint of service.endpoints) {
                const hasRequirements = endpoint.security != null && endpoint.security.length > 0;
                expect(endpoint.auth).toBe(hasRequirements);
            }
        }
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
