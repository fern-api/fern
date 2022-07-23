import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUndefinedTypeReferenceRule } from "../no-undefined-type-reference";

describe("no-undefined-type-reference", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoUndefinedTypeReferenceRule,
            absolutePathToDefinition: path.join(__dirname, "fixtures", "simple"),
        });

        expect(violations).toMatchObject([
            {
                message: "Type MissingType is not defined.",
                nodePath: ["types", "MyType"],
                relativeFilePath: "src/simple.yml",
                severity: "error",
            },
            {
                message: "Type MissingType is not defined.",
                nodePath: ["types", "MyListType"],
                relativeFilePath: "src/simple.yml",
                severity: "error",
            },
            {
                message: "Type commons.MissingType is not defined.",
                nodePath: ["types", "MyListType2"],
                relativeFilePath: "src/simple.yml",
                severity: "error",
            },
            {
                message: "Type nonExistentFile.MissingType is not defined.",
                nodePath: ["types", "MyListType3"],
                relativeFilePath: "src/simple.yml",
                severity: "error",
            },
            {
                message: "Type commons.DoesNotExist is not defined.",
                nodePath: ["types", "ImportedType"],
                relativeFilePath: "src/simple.yml",
                severity: "error",
            },
        ]);
    });
});
