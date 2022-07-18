import path from "path";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateEnumValuesRule } from "../no-duplicate-enum-values";

describe("no-duplicate-enum-values", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateEnumValuesRule,
            absolutePathToDefinition: path.join(__dirname, "fixtures", "simple"),
        });

        expect(violations).toMatchObject([
            {
                message: expect.stringMatching(/Duplicated enum value: .*A.*/),
                nodePath: ["types", "MyEnum"],
                relativeFilePath: "src/simple.yml",
                severity: "error",
            },
        ]);
    });
});
