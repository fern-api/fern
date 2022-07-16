import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidAuthInServiceRule } from "../valid-auth-in-service";

describe("valid-auth-in-service", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidAuthInServiceRule,
            absolutePathToDefinition: path.join(__dirname, "fixtures", "simple"),
        });

        expect(violations).toMatchSnapshot();
    });
});
