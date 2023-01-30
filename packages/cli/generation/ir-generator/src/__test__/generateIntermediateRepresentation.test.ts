import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { generateIntermediateRepresentation } from "../generateIntermediateRepresentation";
import { Language } from "../language";

const FIXTURES: Fixture[] = [
    {
        name: "audiences",
        generationLanguage: undefined,
        audiences: ["public"],
    },
    {
        name: "packages",
        generationLanguage: undefined,
        audiences: undefined,
    },
];

interface Fixture {
    name: string;
    generationLanguage: Language | undefined;
    audiences: string[] | undefined;
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

            const intermediateRepresentation = await generateIntermediateRepresentation({
                workspace: workspace.workspace,
                generationLanguage: fixture.generationLanguage,
                audiences: fixture.audiences,
            });
            expect(intermediateRepresentation).toMatchSnapshot();
        });
    }
});
