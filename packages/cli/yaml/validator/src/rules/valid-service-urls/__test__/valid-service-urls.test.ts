import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { ValidServiceUrlsRule } from "../valid-service-url";

describe("valid-service-urls", () => {
    it("single-environment-url", async () => {
        const violations = await getViolationsForRule({
            rule: ValidServiceUrlsRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "single-environment-url"),
        });
        const expectedViolations: ValidationViolation[] = [
            {
                message: '"url" cannot be configured unless you specify multiple URLs for each environment in api.yml',
                nodePath: ["services", "http", "ServiceWithUrl"],
                relativeFilepath: "service.yml",
                severity: "error",
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });

    it("multiple-environment-urls", async () => {
        const violations = await getViolationsForRule({
            rule: ValidServiceUrlsRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "multiple-environment-urls"),
        });

        const expectedViolations: ValidationViolation[] = [
            {
                message: `"url" is missing. Please specify one of the configured environment URLs:
  - A
  - B
  - C`,
                nodePath: ["services", "http", "ServiceWithoutUrl"],
                relativeFilepath: "service.yml",
                severity: "error",
            },
            {
                message: `URL InvalidUrl is not recognized. Please add it to your environments in api.yml or specify one of the configured environment URLs:
  - A
  - B
  - C`,
                nodePath: ["services", "http", "ServiceWithInvalidUrl"],
                relativeFilepath: "service.yml",
                severity: "error",
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
