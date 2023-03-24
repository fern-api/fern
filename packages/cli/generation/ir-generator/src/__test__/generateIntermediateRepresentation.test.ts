import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GenerationLanguage, GeneratorAudiences } from "@fern-api/generators-configuration";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { generateIntermediateRepresentation } from "../generateIntermediateRepresentation";

const FIXTURES: Fixture[] = [
    {
        name: "audiences",
        generationLanguage: undefined,
        audiences: { type: "select", audiences: ["public"] },
    },
    {
        name: "packages",
        generationLanguage: undefined,
        audiences: { type: "all" },
    },
    {
        name: "undiscriminated-union-examples",
        generationLanguage: undefined,
        audiences: { type: "all" },
    },
];

interface Fixture {
    name: string;
    generationLanguage: GenerationLanguage | undefined;
    audiences: GeneratorAudiences;
}

describe("generateIntermediateRepresentation", () => {
    for (const fixture of FIXTURES) {
        // eslint-disable-next-line jest/valid-title
        it(fixture.name, async () => {
            const workspace = await loadWorkspace({
                absolutePathToWorkspace: join(
                    AbsoluteFilePath.of(__dirname),
                    "fixtures/fern",
                    RelativeFilePath.of(fixture.name)
                ),
                context: createMockTaskContext(),
                cliVersion: "0.0.0",
            });
            if (!workspace.didSucceed) {
                throw new Error("Failed to load workspace: " + JSON.stringify(workspace.failures, undefined, 4));
            }

            if (workspace.workspace.type === "openapi") {
                throw new Error("Convert openapi workspace to fern before generating IR");
            }

            const intermediateRepresentation = await generateIntermediateRepresentation({
                workspace: workspace.workspace,
                generationLanguage: fixture.generationLanguage,
                audiences: fixture.audiences,
            });
            expect(intermediateRepresentation).toMatchSnapshot();
        });
    }
});
