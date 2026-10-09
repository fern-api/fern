import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

async function getRootApiFileForFixture(fixtureName: string) {
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
    const definition = await workspace.workspace.getDefinition({
        context,
        absoluteFilePath: AbsoluteFilePath.of("/DUMMY_PATH")
    });
    return definition.rootApiFile.contents;
}

describe("base-url-env (openapi-ir-to-fern)", () => {
    it("populates base-url-env from the spec's x-fern-base-url-env", async () => {
        const rootApiFile = await getRootApiFileForFixture("x-fern-base-url-env");
        expect(rootApiFile["base-url-env"]).toBe("ACME_BASE_URL");
    }, 90_000);

    it("prefers base-url-env from generators.yml over the spec extension", async () => {
        const rootApiFile = await getRootApiFileForFixture("base-url-env-generators-override");
        expect(rootApiFile["base-url-env"]).toBe("FROM_GENERATORS_YML");
    }, 90_000);

    it("keeps the spec extension when generators.yml overrides environments without base-url-env", async () => {
        const rootApiFile = await getRootApiFileForFixture("base-url-env-environments-override");
        expect(rootApiFile["base-url-env"]).toBe("FROM_SPEC");
        // The environments themselves still come from the override.
        expect(rootApiFile["default-environment"]).toBe("Production");
    }, 90_000);
});
