import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ValidationViolation } from "../../../ValidationViolation";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateOverridesRule } from "../no-duplicate-overrides";

describe("compatible-ir-versions", () => {
    it("simple failure", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateOverridesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            ),
            cliVersion: "0.1.3-rc0"
        });

        const expectedViolations: ValidationViolation[] = [
            {
                severity: "error",
                relativeFilepath: RelativeFilePath.of("openapi/openapi.yml"),
                nodePath: ["paths", "/a/b", "get"],
                message: "Duplicate SDK method found: group 'a' with method 'b'"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    }, 10_000);
});
