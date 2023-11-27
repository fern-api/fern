import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { NoMaybeStreamingRule } from "../no-maybe-streaming";

describe("no-maybe-streaming", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoMaybeStreamingRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: "You cannot specify both response and response-stream",
                nodePath: ["service", "endpoints", "both"],
                relativeFilepath: RelativeFilePath.of("service.yml"),
                severity: "error"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
