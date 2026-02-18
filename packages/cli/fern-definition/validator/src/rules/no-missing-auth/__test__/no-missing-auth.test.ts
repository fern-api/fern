import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { NoMissingAuthRule } from "../no-missing-auth.js";

describe("no-missing-auth", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoMissingAuthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("a.yml"),
                nodePath: ["service", "endpoints", "foo"],
                message: "Endpoint requires auth, but no auth is defined."
            },
            {
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("b.yml"),
                nodePath: ["service"],
                message: "Service requires auth, but no auth is defined."
            }
        ]);
    });
});
