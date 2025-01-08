import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ValidationViolation } from "../../../ValidationViolation";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { CompatibleIrVersionsRule } from "../compatible-ir-versions";

describe("compatible-ir-versions", () => {
    it("simple failure", async () => {
        process.env.DEFAULT_FDR_ORIGIN = "https://registry-dev2.buildwithfern.com";
        const violations = await getViolationsForRule({
            rule: CompatibleIrVersionsRule,
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
                relativeFilepath: RelativeFilePath.of("generators.yml"),
                nodePath: ["groups", "python-sdk", "generators", "0", "fernapi/fern-python-sdk"],
                message:
                    "The generator fernapi/fern-python-sdk requires CLI version 0.23.0-rc4 or later (current version: 0.1.3-rc0). Please run `fern upgrade` to upgrade your CLI version and use this generator."
            }
        ];

        expect(violations).toEqual(expectedViolations);
    }, 10_000);

    it("simple success", async () => {
        process.env.DEFAULT_FDR_ORIGIN = "https://registry-dev2.buildwithfern.com";
        const violations = await getViolationsForRule({
            rule: CompatibleIrVersionsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            ),
            // Latest CLI at the time of writing, so should definitely work
            cliVersion: "0.41.10"
        });

        const expectedViolations: ValidationViolation[] = [];

        expect(violations).toEqual(expectedViolations);
    }, 10_000);
});
