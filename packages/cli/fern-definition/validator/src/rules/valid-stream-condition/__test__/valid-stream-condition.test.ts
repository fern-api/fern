import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidStreamConditionRule } from "../valid-stream-condition";

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
