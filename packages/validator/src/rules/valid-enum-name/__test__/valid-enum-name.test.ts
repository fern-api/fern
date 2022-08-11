import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidEnumNameRule } from "../valid-enum-name";

describe("valid-enum-name", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidEnumNameRule,
            absolutePathToWorkspace: path.join(__dirname, "fixtures", "simple"),
        });

        expect(violations).toEqual([
            {
                severity: "error",
                relativeFilePath: "simple.yml",
                nodePath: ["types", "ValidAndInvalidEnum"],
                message:
                    'Enum value 523_Invalid requires a "name" property that starts with a letter and contains only letters, numbers, and underscores. This is used for code generation.',
            },
            {
                severity: "error",
                relativeFilePath: "simple.yml",
                nodePath: ["types", "ValidAndInvalidEnum"],
                message:
                    'Enum value bla.bla requires a "name" property that starts with a letter and contains only letters, numbers, and underscores. This is used for code generation.',
            },
            {
                severity: "error",
                relativeFilePath: "simple.yml",
                nodePath: ["types", "ValidAndInvalidEnum"],
                message:
                    'Enum value 23-Invalid requires a "name" property that starts with a letter and contains only letters, numbers, and underscores. This is used for code generation.',
            },
            {
                severity: "error",
                relativeFilePath: "simple.yml",
                nodePath: ["types", "ValidAndInvalidEnum"],
                message:
                    "Enum name _invalidName is invalid. It must start with a letter and only contain letters, numbers, and underscores.",
            },
        ]);
    });
});
