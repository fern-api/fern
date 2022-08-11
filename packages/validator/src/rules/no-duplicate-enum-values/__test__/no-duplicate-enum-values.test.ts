import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateEnumValuesRule } from "../no-duplicate-enum-values";

describe("no-duplicate-enum-values", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateEnumValuesRule,
            absolutePathToWorkspace: path.join(__dirname, "fixtures", "simple"),
        });

        expect(violations).toMatchObject([
            {
                message: "Duplicated enum value: A.",
                nodePath: ["types", "MyEnum"],
                relativeFilePath: "simple.yml",
                severity: "error",
            },
        ]);
    });
});
