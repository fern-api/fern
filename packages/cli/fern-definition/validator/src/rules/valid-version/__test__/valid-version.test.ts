import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ValidationViolation } from "../../../ValidationViolation";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidVersionRule } from "../valid-version";

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
                severity: "error",
                nodePath: [],
                relativeFilepath: RelativeFilePath.of("api.yml")
            }
        ];
        expect(violations).toEqual(expectedViolations);
    });
});
