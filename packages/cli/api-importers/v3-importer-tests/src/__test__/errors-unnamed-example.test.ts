import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

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

describe("unnamed error response examples", () => {
    it("names error examples after the response description, summary, or a generated fallback", async () => {
        const ir = await getIRForFixture("errors-unnamed-example");

        const exampleNamesByStatusCode = Object.fromEntries(
            Object.values(ir.errors).map((error) => [
                error.statusCode,
                Object.keys(error.v2Examples?.userSpecifiedExamples ?? {})
            ])
        );

        expect(exampleNamesByStatusCode[400]).toEqual(["Bad Request - The request was missing required parameters."]);
        expect(exampleNamesByStatusCode[404]).toEqual(["Plant does not exist"]);
        expect(exampleNamesByStatusCode[500]).toEqual(["Plants_getPlant_error_example"]);
    }, 90_000);
});
