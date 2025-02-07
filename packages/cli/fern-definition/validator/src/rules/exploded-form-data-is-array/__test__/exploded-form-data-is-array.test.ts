import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ExplodedFormDataIsArrayRule } from "../exploded-form-data-is-array";

describe("exploded-form-data-is-array", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ExplodedFormDataIsArrayRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toMatchInlineSnapshot(`
          [
            {
              "message": "invalid-exploded is exploded and must be a list. Did you mean list<string>?",
              "nodePath": [
                "service",
                "endpoints",
                "uploadDocument",
              ],
              "relativeFilepath": "1.yml",
              "severity": "error",
            },
          ]
        `);
    });
});
