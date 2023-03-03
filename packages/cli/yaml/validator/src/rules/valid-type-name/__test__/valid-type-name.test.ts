import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { ValidTypeNameRule } from "../valid-type-name";

describe("valid-type-name", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidTypeNameRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: "type name must begin with a letter",
                nodePath: ["types", "_InvalidType"],
                relativeFilepath: "simple.yml",
                severity: "error",
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
