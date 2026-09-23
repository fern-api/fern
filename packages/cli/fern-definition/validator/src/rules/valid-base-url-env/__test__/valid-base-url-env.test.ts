import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ValidBaseUrlEnvRule } from "../valid-base-url-env.js";

describe("valid-base-url-env", () => {
    it("base-url-env-no-environments", async () => {
        const violations = await getViolationsForRule({
            rule: ValidBaseUrlEnvRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("base-url-env-no-environments")
            )
        });
        expect(violations).toEqual([
            {
                message:
                    "base-url-env MY_API_BASE_URL has no effect because no environments are declared. " +
                    "The environment variable overrides the default environment, so it is only read " +
                    "when at least one environment exists. Add an environments block, or remove base-url-env.",
                nodePath: ["base-url-env"],
                relativeFilepath: RelativeFilePath.of("api.yml"),
                name: "valid-base-url-env",
                severity: "warning"
            }
        ]);
    });

    it("base-url-env-with-environments", async () => {
        const violations = await getViolationsForRule({
            rule: ValidBaseUrlEnvRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("base-url-env-with-environments")
            )
        });
        expect(violations).toEqual([]);
    });

    it("base-url-env-absent", async () => {
        const violations = await getViolationsForRule({
            rule: ValidBaseUrlEnvRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("base-url-env-absent")
            )
        });
        expect(violations).toEqual([]);
    });
});
