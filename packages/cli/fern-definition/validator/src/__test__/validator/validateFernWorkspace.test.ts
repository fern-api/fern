import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { LazyFernWorkspace } from "@fern-api/lazy-fern-workspace";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { createMockTaskContext } from "@fern-api/task-context";

import { ValidationViolation } from "../../ValidationViolation";
import { validateFernWorkspace } from "../../validateFernWorkspace";

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
        const context = createMockTaskContext();
        // eslint-disable-next-line jest/valid-title
        it(fixture.name, async () => {
            const lazyWorkspace = new LazyFernWorkspace({
                absoluteFilePath: join(
                    AbsoluteFilePath.of(__dirname),
                    RelativeFilePath.of(`fixtures/${fixture.name}/fern/api`)
                ),
                generatorsConfiguration: undefined,
                context,
                cliVersion: "0.0.0",
                workspaceName: undefined
            });
            const fernWorkspace = await lazyWorkspace.toFernWorkspace({ context });

            const violations = validateFernWorkspace(fernWorkspace, CONSOLE_LOGGER);
            expect(violations).toEqual(fixture.expectedViolations);
        });
    }
});
