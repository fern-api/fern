import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoErrorStatusCodeConflictRule } from "../no-error-status-code-conflict";

describe("no-duplicate-declarations", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoErrorStatusCodeConflictRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });
        expect(violations).toEqual([
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["services", "http", "OneService", "endpoints", "get"],
                message: "Multiple errors have status-code 401: D, D",
            },
            {
                severity: "error",
                relativeFilepath: "1.yml",
                nodePath: ["services", "http", "OneService", "endpoints", "update"],
                message: "Multiple errors have status-code 403: E, F",
            },
        ]);
    });
});
