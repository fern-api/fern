import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUndefinedErrorReferenceRule } from "../no-undefined-error-reference";

describe("no-undefined-error-reference", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoUndefinedErrorReferenceRule,
            absolutePathToWorkspace: path.join(__dirname, "fixtures", "simple"),
        });
        expect(violations).toMatchObject([
            {
                severity: "error",
                relativeFilePath: "simple.yml",
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
                relativeFilePath: "simple.yml",
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
