import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils"

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule"
import { NoHeadResponseBodyRule } from "../no-head-response-body"

describe("no-head-response-body", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: NoHeadResponseBodyRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        })

        expect(violations).toEqual([
            {
                message: "Endpoint is a HEAD, so it cannot have a response body.",
                nodePath: ["service", "endpoints", "qux"],
                relativeFilepath: RelativeFilePath.of("a.yml"),
                severity: "fatal"
            }
        ])
    })
})
