import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidEnumNameRule } from "../valid-enum-name";

describe("valid-enum-name", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidEnumNameRule,
            absolutePathToDefinition: path.join(__dirname, "fixtures", "simple"),
        });

        expect(violations).toEqual([
            {
                severity: "error",
                relativeFilePath: "src/simple.yml",
                nodePath: ["types", "ValidAndInvalidEnum"],
                message:
                    "Please add an enum name for the folliwng enum: \x1B[1m523_Invalid\x1B[22m. Make sure the name starts with a letter and only contains alphanumeric and underscore characters.",
            },
            {
                severity: "error",
                relativeFilePath: "src/simple.yml",
                nodePath: ["types", "ValidAndInvalidEnum"],
                message:
                    "Please add an enum name for the folliwng enum: \x1B[1mbla.bla\x1B[22m. Make sure the name starts with a letter and only contains alphanumeric and underscore characters.",
            },
            {
                severity: "error",
                relativeFilePath: "src/simple.yml",
                nodePath: ["types", "ValidAndInvalidEnum"],
                message:
                    "Please add an enum name for the folliwng enum: \x1B[1m23-Invalid\x1B[22m. Make sure the name starts with a letter and only contains alphanumeric and underscore characters.",
            },
            {
                severity: "error",
                relativeFilePath: "src/simple.yml",
                nodePath: ["types", "ValidAndInvalidEnum"],
                message:
                    "Found illegal enum name: \x1B[1m_invalidName\x1B[22m. Please make sure name starts with a letter and only contains alphanumeric and underscore characters.",
            },
        ]);
    });
});
