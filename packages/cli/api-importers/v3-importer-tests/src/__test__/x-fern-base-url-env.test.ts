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

describe("x-fern-base-url-env", () => {
    it("populates environments.baseUrlEnvVar from the root-level extension", async () => {
        const ir = await getIRForFixture("x-fern-base-url-env");
        expect(ir.environments?.baseUrlEnvVar).toBe("ACME_BASE_URL");
        expect(ir.environments?.environments.type).toBe("singleBaseUrl");
    }, 90_000);

    it("leaves baseUrlEnvVar undefined when the extension is absent", async () => {
        const ir = await getIRForFixture("no-content-response-preserves-status-code");
        expect(ir.environments?.baseUrlEnvVar).toBeUndefined();
    }, 90_000);
});
