import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils"

import { ValidationViolation } from "../../../ValidationViolation"
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule"
import { ValidNavigationRule } from "../valid-navigation"

describe("valid-navigation", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidNavigationRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            )
        })

        const expectedViolations: ValidationViolation[] = [
            {
                message: "Unexpected item: ./b.yml",
                nodePath: ["navigation"],
                relativeFilepath: RelativeFilePath.of("invalid-folder-list/__package__.yml"),
                severity: "fatal"
            },
            {
                message: "Unexpected item: d.yml",
                nodePath: ["navigation"],
                relativeFilepath: RelativeFilePath.of("invalid-folder-list/__package__.yml"),
                severity: "fatal"
            },
            {
                message: "__package__.yml cannot be specified in navigation.",
                nodePath: ["navigation"],
                relativeFilepath: RelativeFilePath.of("invalid-folder-list/__package__.yml"),
                severity: "fatal"
            },
            {
                message: "a.yml is specified more than once.",
                nodePath: ["navigation"],
                relativeFilepath: RelativeFilePath.of("invalid-folder-list/__package__.yml"),
                severity: "fatal"
            },
            {
                message: "Missing b.yml",
                nodePath: ["navigation"],
                relativeFilepath: RelativeFilePath.of("invalid-folder-list/__package__.yml"),
                severity: "fatal"
            },
            {
                message: "Missing c.yml",
                nodePath: ["navigation"],
                relativeFilepath: RelativeFilePath.of("invalid-folder-list/__package__.yml"),
                severity: "fatal"
            },
            {
                message: "./foo does not exist.",
                nodePath: ["navigation"],
                relativeFilepath: RelativeFilePath.of("invalid-folder-string/__package__.yml"),
                severity: "fatal"
            }
        ]

        expect(violations).toEqual(expectedViolations)
    })
})
