import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "@fern-api/fern-definition-validator";
import { ValidEndpointPathRule } from "@fern-api/fern-definition-validator";

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
                severity: "error"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
