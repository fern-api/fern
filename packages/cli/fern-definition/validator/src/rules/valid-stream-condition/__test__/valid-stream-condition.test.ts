import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ValidStreamConditionRule } from "../valid-stream-condition.js";

describe("valid-stream-condition", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidStreamConditionRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toMatchSnapshot();
    });
});
