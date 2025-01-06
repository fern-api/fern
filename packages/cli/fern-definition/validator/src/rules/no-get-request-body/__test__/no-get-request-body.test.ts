import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoGetRequestBodyRule } from "../no-get-request-body";

describe("no-get-request-body", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoGetRequestBodyRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        });

        expect(violations).toEqual([
            {
                message: "Endpoint is a GET, so it cannot have a request body.",
                nodePath: ["service", "endpoints", "baz"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            },
            {
                message: "Endpoint is a GET, so it cannot have a request body.",
                nodePath: ["service", "endpoints", "bing"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "error"
            }
        ]);
    });
});
