import { Audiences } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
const FIXTURE = "environments-override-audiences";
const DECLARED_FIXTURE = "environments-override-declared-audiences";

async function getIR(audiences: Audiences, fixture: string = FIXTURE) {
    const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixture), RelativeFilePath.of("fern"));
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: fixturePath,
        context,
        cliVersion: "0.0.0",
        workspaceName: fixture
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load fixture ${fixture}\n${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error(`Expected OSSWorkspace for fixture ${fixture}`);
    }
    return workspace.workspace.getIntermediateRepresentation({
        context,
        audiences,
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        logWarnings: false
    });
}

describe("generators.yml environments under audience filtering", () => {
    it("keeps environments without declared audiences when filtering by audience", async () => {
        const ir = await getIR({ type: "select", audiences: ["public"] });
        expect(ir.environments?.environments.environments.map((env) => env.id)).toEqual(["Production", "Sandbox"]);
        expect(ir.environments?.defaultEnvironment).toBe("Production");
        const endpoints = Object.values(ir.services).flatMap((service) => service.endpoints);
        expect(endpoints).toHaveLength(1);
        expect(endpoints[0]?.baseUrl).toBe("rest");
    }, 90_000);

    it("keeps environments for a non-default audience", async () => {
        const ir = await getIR({ type: "select", audiences: ["scim"] });
        expect(ir.environments?.environments.environments.map((env) => env.id)).toEqual(["Production", "Sandbox"]);
        const endpoints = Object.values(ir.services).flatMap((service) => service.endpoints);
        expect(endpoints).toHaveLength(1);
        expect(endpoints[0]?.baseUrl).toBe("scim");
    }, 90_000);

    it("filters environments once any environment declares audiences (explicit [] is a declaration)", async () => {
        const ir = await getIR({ type: "select", audiences: ["public"] }, DECLARED_FIXTURE);
        expect(ir.environments?.environments.environments.map((env) => env.id)).toEqual(["Production"]);
    }, 90_000);
});
