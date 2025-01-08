import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateExampleNamesRule } from "../no-duplicate-example-names";

describe("no-duplicate-example-names", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateExampleNamesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                message: "Duplicate example name: Example2",
                nodePath: ["types", "MyObject"],
                relativeFilepath: RelativeFilePath.of("1.yml"),
                severity: "error"
            },
            {
                message: "Duplicate example name: Example2",
                nodePath: ["service", "endpoints", "get"],
                relativeFilepath: RelativeFilePath.of("1.yml"),
                severity: "error"
            }
        ]);
    });
});
