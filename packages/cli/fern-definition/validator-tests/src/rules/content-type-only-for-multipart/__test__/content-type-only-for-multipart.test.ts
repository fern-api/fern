import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ContentTypeOnlyForMultipartRule } from "@fern-api/fern-definition-validator";

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
