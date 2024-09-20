import { createMockTaskContext } from "@fern-api/task-context";
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
        const context = createMockTaskContext();
        // eslint-disable-next-line jest/valid-title
        it(fixture.name, async () => {
            throw new Error();
        });
    }
});
