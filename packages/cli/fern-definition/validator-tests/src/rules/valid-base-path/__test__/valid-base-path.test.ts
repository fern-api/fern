import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "@fern-api/fern-definition-validator";
import { ValidBasePathRule } from "@fern-api/fern-definition-validator";

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
                severity: "error"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
