import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ValidationViolation } from "../../../ValidationViolation.js";
import { NoObjectSinglePropertyKeyRule } from "../no-missing-union-variant-key.js";

describe("valid-field-names", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoObjectSinglePropertyKeyRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: 'Union variant e has no type, so "key" cannot be defined',
                nodePath: ["types", "MyUnion"],
                relativeFilepath: RelativeFilePath.of("posts.yml"),
                severity: "fatal"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
