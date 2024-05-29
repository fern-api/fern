import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidTypeReferenceWithDefaultAndValidationRule } from "../valid-type-reference-with-default-and-validation";

describe("valid-default-and-validation-type-reference", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidTypeReferenceWithDefaultAndValidationRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([]);
    });

    it("invalid", async () => {
        const violations = await getViolationsForRule({
            rule: ValidTypeReferenceWithDefaultAndValidationRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid")
            )
        });

        expect(violations).toEqual([
            {
                message: "Default values are not supported for the boolean type",
                nodePath: ["types", "Object", "properties", "enabled", "type"],
                relativeFilepath: "__package__.yml",
                severity: "error"
            },
            {
                message: "Validation rules are not supported for the uuid type",
                nodePath: ["types", "Object", "properties", "id", "type"],
                relativeFilepath: "__package__.yml",
                severity: "error"
            },
            {
                message: "Default value '26.2' is not a valid integer",
                nodePath: ["types", "Object", "properties", "value", "type"],
                relativeFilepath: "__package__.yml",
                severity: "error"
            },
            {
                message: "Validation for 'min' must be an integer, but found '26.2'",
                nodePath: ["types", "Object", "properties", "value", "type"],
                relativeFilepath: "__package__.yml",
                severity: "error"
            },
            {
                message: "Validation for 'max' must be an integer, but found '26.2'",
                nodePath: ["types", "Object", "properties", "value", "type"],
                relativeFilepath: "__package__.yml",
                severity: "error"
            },
            {
                message: "Default values are not supported for the boolean type",
                nodePath: ["service", "endpoints", "create", "request", "body", "properties", "decimal", "type"],
                relativeFilepath: "__package__.yml",
                severity: "error"
            }
        ]);
    });
});
