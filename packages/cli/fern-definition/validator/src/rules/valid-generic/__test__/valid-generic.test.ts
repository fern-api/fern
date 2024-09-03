import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidGenericRule } from "../valid-generic";

describe("valid-generic", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidGenericRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericApplicationObject"],
                message: 'Generic values in object properties are not supported: "foo: GenericUsedType<string>".'
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericApplicationDiscriminatedUnion"],
                message: 'Generic values in discriminated unions are not supported: "foo: GenericUsedType<string>".'
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericApplicationEnum"],
                message: 'Generic values in enums are not supported: "GenericUsedType<string>".'
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericApplicationUndiscriminatedUnion"],
                message: 'Generic values in unions are not supported: "GenericUsedType<string>".'
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericUsedTypeAlias<T>"],
                message: "Generic declarations are only supported with objects."
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericUsedTypeEnum<T>"],
                message: "Generic declarations are only supported with objects."
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericUsedTypeUndiscriminatedUnion<T>"],
                message: "Generic declarations are only supported with objects."
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericUsedDiscriminatedUnion<T>"],
                message: "Generic declarations are only supported with objects."
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericWrongNumberOfArgumentsApplied"],
                message:
                    'Generic "GenericWrongNumberOfArguments" expects 6 arguments but was instantiated with 2 arguments.'
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericWrongNumberOfArgumentsNoArgumentsApplied"],
                message: "Generic value is supplied, but no arguments are defined."
            }
        ]);
    });
});
