import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { NoExtensionsWithFileUploadRule } from "../no-extensions-with-file-upload";

describe("no-extensions-with-file-upload", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoExtensionsWithFileUploadRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: "Request body extensions are not supported for file-upload requests.",
                nodePath: ["service", "endpoints", "extendsAndFile"],
                relativeFilepath: "file-upload.yml",
                severity: "error",
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
