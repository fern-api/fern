import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUndefinedTypeReferenceRule } from "../no-undefined-type-reference";

describe("no-undefined-type-reference", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoUndefinedTypeReferenceRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                message: "File response cannot be optional",
                nodePath: ["service", "endpoints", "downloadFileOptional", "response"],
                relativeFilepath: RelativeFilePath.of("file-download.yml"),
                severity: "error"
            },
            {
                message: "The file type can only be used as properties in inlined requests.",
                nodePath: ["types", "FileAlias"],
                relativeFilepath: RelativeFilePath.of("file-upload.yml"),
                severity: "error"
            },
            {
                message: "The file type can only be used as properties in inlined requests.",
                nodePath: ["service", "endpoints", "noProperties", "request", "body"],
                relativeFilepath: RelativeFilePath.of("file-upload.yml"),
                severity: "error"
            },
            {
                message: "Type MissingType is not defined.",
                nodePath: ["types", "MyType"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message: "Type MissingType is not defined.",
                nodePath: ["types", "MyListType"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message: "Type commons.MissingType is not defined.",
                nodePath: ["types", "MyListType2"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message: "Type nonExistentFile.MissingType is not defined.",
                nodePath: ["types", "MyListType3"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message: "Type commons.DoesNotExist is not defined.",
                nodePath: ["types", "ImportedType"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message: "The text type can only be used as a response-stream or response.",
                nodePath: ["types", "ListOfText"],
                relativeFilepath: RelativeFilePath.of("text.yml"),
                severity: "error"
            }
        ]);
    });
});
