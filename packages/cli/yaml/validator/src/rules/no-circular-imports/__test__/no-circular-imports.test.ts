import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoCircularImportsRule } from "../no-circular-imports";

describe("no-circular-imports", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoCircularImportsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            ),
        });

        expect(violations).toMatchObject([
            {
                message: "A file cannot import itself",
                nodePath: ["imports", "b"],
                relativeFilePath: "b.yml",
                severity: "error",
            },
            {
                message: "Circular import detected: c/c.yml -> d/d.yml -> e.yml -> c/c.yml",
                nodePath: ["imports", "d"],
                relativeFilePath: "c/c.yml",
                severity: "error",
            },
            {
                message: "Circular import detected: d/d.yml -> e.yml -> d/d.yml",
                nodePath: ["imports", "e"],
                relativeFilePath: "d/d.yml",
                severity: "error",
            },
        ]);
    });
});
