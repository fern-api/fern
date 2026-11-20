import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
const FIXTURE_NAME = "text-plain-error-responses";

async function getIR() {
    const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(FIXTURE_NAME), RelativeFilePath.of("fern"));
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: fixturePath,
        context,
        cliVersion: "0.0.0",
        workspaceName: FIXTURE_NAME
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load OpenAPI fixture ${FIXTURE_NAME}\n${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error(`Expected OSSWorkspace for fixture ${FIXTURE_NAME}`);
    }
    return workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: true,
        generateV1Examples: false,
        logWarnings: false
    });
}

describe("OpenAPI error responses with only non-JSON content", () => {
    it("keeps text/plain-only error responses alongside JSON and bodyless errors", async () => {
        const ir = await getIR();

        const endpoints = Object.values(ir.services).flatMap((service) => service.endpoints);
        expect(endpoints).toHaveLength(1);
        const endpoint = endpoints[0];

        const statusCodes = (endpoint?.errors ?? [])
            .map((responseError) => ir.errors[responseError.error.errorId]?.statusCode)
            .sort();
        expect(statusCodes).toEqual([400, 401, 404, 409, 500]);

        const unauthorized = Object.values(ir.errors).find((error) => error.statusCode === 401);
        expect(unauthorized?.type?.type).toBe("unknown");
    }, 90_000);
});
