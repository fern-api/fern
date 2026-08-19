import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ContentTypeOnlyForMultipartRule } from "../content-type-only-for-multipart.js";

describe("compatible-ir-versions", () => {
    it("simple failure", async () => {
        const violations = await getViolationsForRule({
            rule: ContentTypeOnlyForMultipartRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toMatchSnapshot();
    });
});
