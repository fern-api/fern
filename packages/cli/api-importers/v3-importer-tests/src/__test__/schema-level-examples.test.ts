import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

async function getEndpointExamplesForFixture(fixtureName: string) {
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
    const ir = await workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        logWarnings: false
    });
    const endpoint = Object.values(ir.services)[0]?.endpoints[0];
    if (endpoint == null) {
        throw new Error(`Expected an endpoint in fixture ${fixtureName}`);
    }
    return endpoint.v2Examples;
}

function getResponseBodyValue(
    example: { response?: { body?: { type: string; value?: unknown } } } | undefined
): unknown {
    const body = example?.response?.body;
    return body?.type === "json" ? body.value : undefined;
}

describe("schema-level examples", () => {
    it("surfaces every schema-level example as a selectable endpoint example", async () => {
        const v2Examples = await getEndpointExamplesForFixture("schema-level-examples");

        const userExamples = v2Examples?.userSpecifiedExamples ?? {};
        const exampleNames = Object.keys(userExamples);
        expect(exampleNames).toHaveLength(2);
        expect(exampleNames.map((name) => userExamples[name]?.displayName)).toEqual(["Example 1", "Example 2"]);

        const responseBodies = exampleNames.map((name) => getResponseBodyValue(userExamples[name]));
        expect(responseBodies[0]).toMatchObject({ tag: "async_job_id", async_job_id: "34g93hh34h04y384084" });
        expect(responseBodies[1]).toMatchObject({ tag: "complete", entries: ["Prime_Numbers.txt"] });

        for (const name of exampleNames) {
            expect(userExamples[name]?.request?.requestBody).toEqual({
                from_path: "/Homework/math",
                to_path: "/Homework/algebra"
            });
        }
    }, 90_000);
});
