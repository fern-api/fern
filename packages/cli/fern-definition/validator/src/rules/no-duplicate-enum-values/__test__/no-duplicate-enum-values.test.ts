import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateEnumValuesRule } from "../no-duplicate-enum-values";

describe("no-duplicate-enum-values", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateEnumValuesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                message: "Duplicated enum value: A.",
                nodePath: ["types", "MyEnum"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            }
        ]);
    });
});
