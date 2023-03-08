import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUndefinedTypeReferenceRule } from "../no-undefined-type-reference";

describe("no-undefined-type-reference", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoUndefinedTypeReferenceRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        expect(violations).toEqual([
            {
                message: "The file type can only be used as properties in inlined requests.",
                nodePath: ["types", "FileAlias"],
                relativeFilepath: "file-upload.yml",
                severity: "error",
            },
            {
                message: "The file type can only be used as properties in inlined requests.",
                nodePath: ["service", "endpoints", "noProperties", "request", "body"],
                relativeFilepath: "file-upload.yml",
                severity: "error",
            },
            {
                message: "The file type can only be used as properties in inlined requests.",
                nodePath: ["service", "endpoints", "listOfFiles", "request", "body", "properties", "file"],
                relativeFilepath: "file-upload.yml",
                severity: "error",
            },
            {
                message: "Type MissingType is not defined.",
                nodePath: ["types", "MyType"],
                relativeFilepath: "simple.yml",
                severity: "error",
            },
            {
                message: "Type MissingType is not defined.",
                nodePath: ["types", "MyListType"],
                relativeFilepath: "simple.yml",
                severity: "error",
            },
            {
                message: "Type commons.MissingType is not defined.",
                nodePath: ["types", "MyListType2"],
                relativeFilepath: "simple.yml",
                severity: "error",
            },
            {
                message: "Type nonExistentFile.MissingType is not defined.",
                nodePath: ["types", "MyListType3"],
                relativeFilepath: "simple.yml",
                severity: "error",
            },
            {
                message: "Type commons.DoesNotExist is not defined.",
                nodePath: ["types", "ImportedType"],
                relativeFilepath: "simple.yml",
                severity: "error",
            },
        ]);
    });
});
