import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ValidErrorStatusCodeRule } from "../valid-error-status-code.js";

describe("valid-error-status-code", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidErrorStatusCodeRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });
        expect(violations).toEqual([
            {
                name: "valid-error-status-code",
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("1.yml"),
                nodePath: ["errors", "Invalid"],
                message: 'Error Invalid has an invalid status-code "4XY". Expected an integer, "4XX", or "5XX".'
            }
        ]);
    });
});
