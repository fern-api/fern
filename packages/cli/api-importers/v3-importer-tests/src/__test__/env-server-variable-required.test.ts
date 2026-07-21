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

describe("OpenAPI 3.x -> IR: x-fern-require-server-var", () => {
    it("marks a server variable required while preserving its default, and leaves others optional", async () => {
        const ir = await getIRForFixture("env-server-variable-required");

        const environments = ir.environments?.environments;
        expect(environments?.type).toBe("singleBaseUrl");
        if (environments?.type !== "singleBaseUrl") {
            throw new Error("Expected a single base URL environment");
        }

        const environment = environments.environments[0];
        const variables = environment?.urlVariables ?? [];

        const tenantDomain = variables.find((variable) => variable.id === "tenantDomain");
        expect(tenantDomain).toBeDefined();
        expect(tenantDomain?.required).toBe(true);
        expect(tenantDomain?.default).toBe("{TENANT}");

        const version = variables.find((variable) => variable.id === "version");
        expect(version).toBeDefined();
        expect(version?.required).toBeUndefined();
        expect(version?.default).toBe("v2");
    }, 90_000);
});
