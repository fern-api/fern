import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { ValidEndpointPathRule } from "../valid-endpoint-path";

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
                message: 'Path cannot be /. Use "" instead.',
                nodePath: ["service", "endpoints", "slash"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: "Path must be the empty string, or start with a slash.",
                nodePath: ["service", "endpoints", "noLeadingSlash"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
