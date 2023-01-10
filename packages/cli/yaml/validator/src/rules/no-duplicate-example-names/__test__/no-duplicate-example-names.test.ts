import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateExampleNamesRule } from "../no-duplicate-example-names";

describe("no-duplicate-example-names", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateExampleNamesRule,
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), "fixtures", "simple"),
        });

        expect(violations).toEqual([
            {
                message: "Duplicate example name: Example2",
                nodePath: ["types", "MyObject"],
                relativeFilepath: "1.yml",
                severity: "error",
            },
            {
                message: "Duplicate example name: Example2",
                nodePath: ["services", "http", "MyService", "endpoints", "get"],
                relativeFilepath: "1.yml",
                severity: "error",
            },
        ]);
    });
});
