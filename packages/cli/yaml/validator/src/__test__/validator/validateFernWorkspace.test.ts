import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { validateFernWorkspace } from "../../validateFernWorkspace";
import { ValidationViolation } from "../../ValidationViolation";

interface Fixture {
    name: string;
    expectedViolations: ValidationViolation[];
}

const FIXTURES: Fixture[] = [
    {
        name: "simple",
        expectedViolations: []
    }
];

describe("validateFernWorkspace", () => {
    for (const fixture of FIXTURES) {
        // eslint-disable-next-line jest/valid-title
        it(fixture.name, async () => {
            const parseResult = await loadAPIWorkspace({
                absolutePathToWorkspace: join(
                    AbsoluteFilePath.of(__dirname),
                    RelativeFilePath.of(`fixtures/${fixture.name}/fern/api`)
                ),
                context: createMockTaskContext(),
                cliVersion: "0.0.0",
                workspaceName: undefined
            });
            if (!parseResult.didSucceed) {
                throw new Error("Failed to parse workspace: " + JSON.stringify(parseResult));
            }
            if (parseResult.workspace.type === "openapi") {
                throw new Error("Expected fern workspace, but received openapi");
            }

            const violations = await validateFernWorkspace(parseResult.workspace, CONSOLE_LOGGER);
            expect(violations).toEqual(fixture.expectedViolations);
        });
    }
});
