import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ValidationViolation } from "../../../ValidationViolation.js";
import { ValidBasePathRule } from "../valid-base-path.js";

describe("valid-base-path", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidBasePathRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: "base-path must be empty or start with a slash.",
                nodePath: ["service"],
                relativeFilepath: RelativeFilePath.of("no-leading-slash.yml"),
                severity: "fatal"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
