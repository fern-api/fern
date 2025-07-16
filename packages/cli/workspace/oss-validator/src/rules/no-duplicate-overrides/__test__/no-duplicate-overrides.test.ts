import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils"

import { ValidationViolation } from "../../../ValidationViolation"
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule"
import { NoDuplicateOverridesRule } from "../no-duplicate-overrides"

describe("no-duplicate-overrides", () => {
    it("simple failure", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateOverridesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            ),
            cliVersion: "0.1.3-rc0"
        })

        const expectedViolations: ValidationViolation[] = [
            {
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("openapi/openapi.yml"),
                nodePath: ["paths", "/a/b", "get"],
                message: "SDK method a.b already exists (x-fern-sdk-group-name: a, x-fern-sdk-method-name: b)"
            }
        ]

        expect(violations).toMatchSnapshot()
    }, 10_000)

    it("complex failure", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateOverridesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("complex")
            ),
            cliVersion: "0.1.3-rc0"
        })

        const expectedViolations: ValidationViolation[] = [
            {
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("openapi/openapi.yml"),
                nodePath: ["paths", "/a/b", "get"],
                message: "SDK method a.b.c.d already exists (x-fern-sdk-group-name: a.b.c, x-fern-sdk-method-name: d)"
            }
        ]

        expect(violations).toMatchSnapshot()
    }, 10_000)

    it("inlined failure", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateOverridesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("in-lined")
            ),
            cliVersion: "0.1.3-rc0"
        })

        const expectedViolations: ValidationViolation[] = [
            {
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("openapi/openapi.yml"),
                nodePath: ["paths", "/a/b", "get"],
                message: "SDK method a.b.c.d already exists (x-fern-sdk-group-name: a.b.c, x-fern-sdk-method-name: d)"
            }
        ]

        expect(violations).toMatchSnapshot()
    }, 10_000)
})
