import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ValidationViolation } from "../../../ValidationViolation";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
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
                message: "Path must start with a slash.",
                nodePath: ["service", "endpoints", "noLeadingSlash"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
