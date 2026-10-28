import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

async function getEndpointsForFixture(fixtureName: string) {
    const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixtureName), RelativeFilePath.of("fern"));
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: fixturePath,
        context,
        cliVersion: "0.0.0",
        workspaceName: fixtureName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load OpenRPC fixture ${fixtureName}\n${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error(`Expected OSSWorkspace for fixture ${fixtureName}`);
    }
    const ir = await workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        logWarnings: false
    });
    return Object.values(ir.services).flatMap((service) => service.endpoints);
}

function getResponseBodyValue(
    example: { response?: { body?: { type: string; value?: unknown } } } | undefined
): unknown {
    const body = example?.response?.body;
    return body?.type === "json" ? body.value : undefined;
}

describe("openrpc scalar examples", () => {
    it("converts methods whose schemas and examples are single values", async () => {
        const endpoints = await getEndpointsForFixture("openrpc-scalar-examples");
        expect(endpoints).toHaveLength(2);

        const getStatus = endpoints.find((endpoint) => endpoint.id.includes("getStatus"));
        const statusExample = getStatus?.v2Examples?.userSpecifiedExamples["getStatus example"];
        expect(statusExample?.request?.requestBody).toEqual(["abc-123", true]);
        expect(getResponseBodyValue(statusExample)).toEqual({ jsonrpc: "2.0", id: "1", result: "active" });

        const getCount = endpoints.find((endpoint) => endpoint.id.includes("getCount"));
        const countExample = getCount?.v2Examples?.userSpecifiedExamples["getCount example"];
        expect(getResponseBodyValue(countExample)).toEqual({ jsonrpc: "2.0", id: "1", result: 0 });
    }, 90_000);
});
