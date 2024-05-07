import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { ValidExampleErrorRule } from "../valid-example-error";

describe("valid-example-error", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidExampleErrorRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        const expectedViolations: ValidationViolation[] = [];

        expect(violations).toEqual(expectedViolations);
    });
});
