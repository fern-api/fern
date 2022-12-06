import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { ValidExampleShapeRule } from "../valid-example-shape";

describe("valid-example-shape", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidExampleShapeRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        const expectedViolations: ValidationViolation[] = [
            {
                severity: "error",
                relativeFilepath: "enum.yml",
                message: '"Blue" is not a valid example for this enum. Enum values are: "Red", "BLUE", "purple".',
                nodePath: ["types", "Color", { key: "examples", arrayIndex: 1 }],
            },
            {
                severity: "error",
                relativeFilepath: "enum.yml",
                message: '"PURPLE" is not a valid example for this enum. Enum values are: "Red", "BLUE", "purple".',
                nodePath: ["types", "Color", { key: "examples", arrayIndex: 3 }],
            },
            {
                severity: "error",
                relativeFilepath: "enum.yml",
                message: 'This example is not valid. Enum values are: "Red", "BLUE", "purple".',
                nodePath: ["types", "Color", { key: "examples", arrayIndex: 4 }],
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
