import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ValidationViolation } from "../../../ValidationViolation.js";
import { ValidEndpointPathRule } from "../valid-endpoint-path.js";

describe("valid-endpoint-path", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidEndpointPathRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: "Path must start with a slash.",
                nodePath: ["service", "endpoints", "noLeadingSlash"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "fatal"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
