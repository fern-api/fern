import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUndefinedErrorReferenceRule } from "../no-undefined-error-reference";

describe("no-undefined-type-reference", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoUndefinedErrorReferenceRule,
            absolutePathToDefinition: path.join(__dirname, "fixtures", "simple"),
        });
        expect(violations).toMatchObject([
            {
                severity: "error",
                relativeFilePath: "src/simple.yml",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "referenceNonExistentError",
                    "errors",
                    "NonExistentError",
                ],
                message: "Error \x1B[1mNonExistentError\x1B[22m is not defined.",
            },
            {
                severity: "error",
                relativeFilePath: "src/simple.yml",
                nodePath: [
                    "services",
                    "http",
                    "MyService",
                    "endpoints",
                    "ferenceNonExisttentImportedError",
                    "errors",
                    "other.NonExistentError",
                ],
                message: "Error \x1B[1mother.NonExistentError\x1B[22m is not defined.",
            },
        ]);
    });
});
