import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "@fern-api/fern-definition-validator";
import { ValidTypeNameRule } from "@fern-api/fern-definition-validator";

describe("valid-type-name", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidTypeNameRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: "Type name must begin with a letter",
                nodePath: ["types", "_InvalidType"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
