import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { ValidEndpointPathRule } from "../valid-endpoint-path";

describe("valid-endpoint-path", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidEndpointPathRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: 'Path cannot be /. Use "" instead.',
                nodePath: ["service", "endpoints", "slash"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
            {
                message: "Path must be the empty string, or start with a slash.",
                nodePath: ["service", "endpoints", "noLeadingSlash"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
            {
                message: "Path cannot end with a slash.",
                nodePath: ["service", "endpoints", "trailingSlash"],
                relativeFilepath: "a.yml",
                severity: "error",
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
