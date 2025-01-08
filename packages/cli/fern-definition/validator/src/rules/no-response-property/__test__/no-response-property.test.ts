import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoResponsePropertyRule } from "../no-response-property";

describe("no-response-property", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoResponsePropertyRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                message: "Response does not have a property named id.",
                nodePath: ["service", "endpoints", "getMovie"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            }
        ]);
    });
});
