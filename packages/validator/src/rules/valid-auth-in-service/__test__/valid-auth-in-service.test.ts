import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidAuthInServiceRule } from "../valid-auth-in-service";

describe("valid-auth-in-service", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidAuthInServiceRule,
            absolutePathToDefinition: path.join(__dirname, "fixtures", "simple"),
        });

        expect(violations).toMatchObject([
            {
                severity: "error",
                relativeFilePath: "src/simple.yml",
                nodePath: ["services", "http", "InvalidService"],
                message: expect.stringMatching(
                    "Service InvalidService has endpoints with both bearer and basic auth. Only one of the two can be used."
                ),
            },
        ]);
    });
});
