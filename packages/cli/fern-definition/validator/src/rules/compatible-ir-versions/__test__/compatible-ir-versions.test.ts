import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { CompatibleIrVersionsRule } from "../compatible-ir-versions";

describe("compatible-ir-versions", () => {
    it("simple", async () => {
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
                    "The generator fernapi/fern-python-sdk requires CLI version 0.1.3-rc0 or later (current version: 0.1.3-rc0)."
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
