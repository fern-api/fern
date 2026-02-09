import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ValidationViolation } from "../../../ValidationViolation.js";
import { ValidVersionRule } from "../valid-version.js";

describe("valid-version", () => {
    it("valid", async () => {
        const violations = await getViolationsForRule({
            rule: ValidVersionRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("valid")
            )
        });
        expect(violations).toEqual([]);
    });

    it("invalid", async () => {
        const violations = await getViolationsForRule({
            rule: ValidVersionRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid")
            )
        });
        const expectedViolations: ValidationViolation[] = [
            {
                message: 'Default version "1.0" not found in version values',
                severity: "fatal",
                nodePath: [],
                relativeFilepath: RelativeFilePath.of("api.yml")
            }
        ];
        expect(violations).toEqual(expectedViolations);
    });
});
