import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ValidGenericRule } from "../valid-generic.js";

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
                name: "valid-generic",
                severity: "fatal",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericApplicationObject", "properties", "foo"],
                message: "Cannot reference generic GenericUsedType<string> from object"
            },
            {
                name: "valid-generic",
                severity: "fatal",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericApplicationDiscriminatedUnion", "union", "foo"],
                message: "Cannot reference generic GenericUsedType<string> from union"
            },
            {
                name: "valid-generic",
                severity: "fatal",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericApplicationEnum"],
                message: "Cannot reference generic GenericUsedType<string> from enum"
            },
            {
                name: "valid-generic",
                severity: "fatal",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericApplicationUndiscriminatedUnion"],
                message: "Cannot reference generic GenericUsedType<string> from union"
            },
            {
                name: "valid-generic",
                severity: "fatal",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericUsedTypeAlias<T>"],
                message: "Generics are only supported for object declarations"
            },
            {
                name: "valid-generic",
                severity: "fatal",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericUsedTypeEnum<T>"],
                message: "Generics are only supported for object declarations"
            },
            {
                name: "valid-generic",
                severity: "fatal",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericUsedTypeUndiscriminatedUnion<T>"],
                message: "Generics are only supported for object declarations"
            },
            {
                name: "valid-generic",
                severity: "fatal",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericUsedDiscriminatedUnion<T>"],
                message: "Generics are only supported for object declarations"
            },
            {
                name: "valid-generic",
                severity: "fatal",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericWrongNumberOfArgumentsApplied"],
                message: "Generic GenericWrongNumberOfArguments expects 6 arguments, but received 2 <string,string>"
            },
            {
                name: "valid-generic",
                severity: "fatal",
                relativeFilepath: "1.yml",
                nodePath: ["types", "GenericWrongNumberOfArgumentsNoArgumentsApplied"],
                message: "Generic GenericWrongNumberOfArguments expects 6 arguments, but received none"
            }
        ]);
    });
});
