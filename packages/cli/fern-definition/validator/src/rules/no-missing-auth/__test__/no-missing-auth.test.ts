import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoMissingAuthRule } from "../no-missing-auth";

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
                severity: "error",
                relativeFilepath: RelativeFilePath.of("a.yml"),
                nodePath: ["service", "endpoints", "foo"],
                message: "Endpoint requires auth, but no auth is defined."
            },
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("b.yml"),
                nodePath: ["service"],
                message: "Service requires auth, but no auth is defined."
            }
        ]);
    });
});
