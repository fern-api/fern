import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ValidationViolation } from "../../../ValidationViolation";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidServiceUrlsRule } from "../valid-service-url";

describe("valid-service-urls", () => {
    it("single-environment-url", async () => {
        const violations = await getViolationsForRule({
            rule: ValidServiceUrlsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("single-environment-url")
            )
        });
        const expectedViolations: ValidationViolation[] = [
            {
                message: '"url" cannot be configured unless you specify multiple URLs for each environment in api.yml',
                nodePath: ["service", "url"],
                relativeFilepath: RelativeFilePath.of("with-url.yml"),
                severity: "error"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });

    it("multiple-environment-urls", async () => {
        const violations = await getViolationsForRule({
            rule: ValidServiceUrlsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("multiple-environment-urls")
            )
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: `URL InvalidUrl is not recognized. Please add it to your environments in api.yml or specify one of the configured environment URLs:
  - A
  - B
  - C`,
                nodePath: ["service", "url"],
                relativeFilepath: RelativeFilePath.of("with-invalid-url.yml"),
                severity: "error"
            },
            {
                message: `"url" is missing. Please specify one of the configured environment URLs:
  - A
  - B
  - C`,
                nodePath: ["service", "endpoints", "test", "url"],
                relativeFilepath: RelativeFilePath.of("without-url.yml"),
                severity: "error"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
