import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUndefinedErrorReferenceRule } from "../no-undefined-error-reference";

describe("no-undefined-error-reference", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoUndefinedErrorReferenceRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });
        expect(violations).toEqual([
            {
                severity: "error",
                relativeFilepath: "simple.yml",
                nodePath: ["service", "endpoints", "referenceNonExistentError", "errors", "NonExistentError"],
                message: "Error is not defined.",
            },
            {
                severity: "error",
                relativeFilepath: "simple.yml",
                nodePath: [
                    "service",
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
