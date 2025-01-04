import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

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
                message: "Default value 'BOOLEAN' is not a valid enum value",
                nodePath: ["types", "Primitive"],
                relativeFilepath: "__package__.yml",
                severity: "error"
            },
            {
                message: 'Validation rules \'{"min":26.2,"max":26.2}\' are not compatible with the boolean type',
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
                message: 'Validation rules \'{"min":42,"max":42}\' are not compatible with the long type',
                nodePath: ["types", "Object", "properties", "longNumber", "type"],
                relativeFilepath: "__package__.yml",
                severity: "error"
            },
            {
                message: 'Validation rules \'{"min":42,"max":42}\' are not compatible with the bigint type',
                nodePath: ["types", "Object", "properties", "bigInteger", "type"],
                relativeFilepath: "__package__.yml",
                severity: "error"
            },
            {
                message: "Default value 'hello' is not a valid bigint",
                nodePath: ["types", "Object", "properties", "bigIntegerWithInvalidDefault", "type"],
                relativeFilepath: "__package__.yml",
                severity: "error"
            },
            {
                message: "Default value 'INVALID' is not a valid enum value",
                nodePath: ["types", "Object", "properties", "enumWithInvalidDefault", "type"],
                relativeFilepath: "__package__.yml",
                severity: "error"
            }
        ]);
    });
});
