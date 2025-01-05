import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidPathParametersConfigurationRule } from "../valid-path-parameters-configuration";

describe("valid-path-parameters-configuration", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidPathParametersConfigurationRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                message: "path-parameters cannot be defined in both endpoint and request.",
                nodePath: ["service", "endpoints", "conflict"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            }
        ]);
    });
});
