import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";
import { getAllRulesForTest } from "../../getAllRules";
import { runRulesOnDocsWorkspace } from "../../validateDocsWorkspace";
import { ValidationViolation } from "../../ValidationViolation";

interface Fixture {
    name: string;
    expectedViolations: ValidationViolation[];
}

const FIXTURES: Fixture[] = [
    {
        name: "simple",
        expectedViolations: [],
    },
];

describe("validateFernWorkspace", () => {
    for (const fixture of FIXTURES) {
        // eslint-disable-next-line jest/valid-title, jest/no-disabled-tests
        it.skip(fixture.name, async () => {
            const docsWorkspace = await loadDocsWorkspace({
                fernDirectory: join(
                    AbsoluteFilePath.of(__dirname),
                    RelativeFilePath.of(`fixtures/${fixture.name}/fern`)
                ),
                context: createMockTaskContext(),
            });
            if (docsWorkspace == null) {
                throw new Error(`Failed to load docs workspace in fixture ${fixture.name}`);
            }
            const violations = await runRulesOnDocsWorkspace({
                workspace: docsWorkspace,
                rules: getAllRulesForTest(),
                logger: CONSOLE_LOGGER,
            });
            expect(violations).toEqual(fixture.expectedViolations);
        });
    }
});
