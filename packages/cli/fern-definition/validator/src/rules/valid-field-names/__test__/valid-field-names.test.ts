import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ValidationViolation } from "../../../ValidationViolation";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidFieldNamesRule } from "../valid-field-names";

describe("valid-field-names", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidFieldNamesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        const expectedViolations: ValidationViolation[] = [
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("enum.yml"),
                nodePath: ["types", "ValidAndInvalidEnum"],
                message:
                    'Enum value 523_Invalid is not suitable for code generation. Add a "name" property that starts with a letter and contains only letters, numbers, and underscores.'
            },
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("enum.yml"),
                nodePath: ["types", "ValidAndInvalidEnum"],
                message:
                    'Enum value bla.bla is not suitable for code generation. Add a "name" property that starts with a letter and contains only letters, numbers, and underscores.'
            },
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("enum.yml"),
                nodePath: ["types", "ValidAndInvalidEnum"],
                message:
                    'Enum value 23-Invalid is not suitable for code generation. Add a "name" property that starts with a letter and contains only letters, numbers, and underscores.'
            },
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("enum.yml"),
                nodePath: ["types", "ValidAndInvalidEnum"],
                message:
                    "Enum name _invalidName is not suitable for code generation. It must start with a letter and only contain letters, numbers, and underscores."
            },
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("union.yml"),
                nodePath: ["types", "UnionWithInvalidDiscriminant"],
                message:
                    'Discriminant value _type is not suitable for code generation. Add a "name" property that starts with a letter and contains only letters, numbers, and underscores.'
            },
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("union.yml"),
                nodePath: ["types", "UnionWithInvalidName"],
                message:
                    "Discriminant name _type is not suitable for code generation. It must start with a letter and only contain letters, numbers, and underscores."
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
