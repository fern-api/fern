import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUndefinedErrorReferenceRule } from "../no-undefined-error-reference";

describe("no-undefined-error-reference", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoUndefinedErrorReferenceRule,
            pathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            ),
        });
        expect(violations).toEqual([
            {
                severity: "error",
                relativeFilepath: "simple.yml",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "referenceNonExistentError",
                    "errors",
                    "NonExistentError",
                ],
                message: "Error is not defined.",
            },
            {
                severity: "error",
                relativeFilepath: "simple.yml",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "referenceNonExistentImportedError",
                    "errors",
                    "other.NonExistentError",
                ],
                message: "Error is not defined.",
            },
        ]);
    });
});
