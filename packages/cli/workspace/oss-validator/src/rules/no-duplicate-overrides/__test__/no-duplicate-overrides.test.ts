import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { NoDuplicateOverridesRule } from "../no-duplicate-overrides";

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
        });

        const expectedViolations: ValidationViolation[] = [
            {
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("openapi/openapi.yml"),
                nodePath: ["paths", "/a/b", "get"],
                message: "SDK method a.b already exists (x-fern-sdk-group-name: a, x-fern-sdk-method-name: b)"
            }
        ];

        expect(violations).toMatchSnapshot();
    }, 10_000);

    it("complex failure", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateOverridesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("complex")
            ),
            cliVersion: "0.1.3-rc0"
        });

        const expectedViolations: ValidationViolation[] = [
            {
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("openapi/openapi.yml"),
                nodePath: ["paths", "/a/b", "get"],
                message: "SDK method a.b.c.d already exists (x-fern-sdk-group-name: a.b.c, x-fern-sdk-method-name: d)"
            }
        ];

        expect(violations).toMatchSnapshot();
    }, 10_000);

    it("inlined failure", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateOverridesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("in-lined")
            ),
            cliVersion: "0.1.3-rc0"
        });

        const expectedViolations: ValidationViolation[] = [
            {
                severity: "fatal",
                relativeFilepath: RelativeFilePath.of("openapi/openapi.yml"),
                nodePath: ["paths", "/a/b", "get"],
                message: "SDK method a.b.c.d already exists (x-fern-sdk-group-name: a.b.c, x-fern-sdk-method-name: d)"
            }
        ];

        expect(violations).toMatchSnapshot();
    }, 10_000);

    it("disjoint audiences - no conflict", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateOverridesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("disjoint-audiences")
            ),
            cliVersion: "0.1.3-rc0"
        });

        expect(violations).toEqual([]);
    }, 10_000);

    it("overlapping audiences - conflict", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateOverridesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("overlapping-audiences")
            ),
            cliVersion: "0.1.3-rc0"
        });

        expect(violations.length).toBeGreaterThan(0);
        expect(violations[0]?.message).toContain("SDK method members.add already exists");
    }, 10_000);

    it("wildcard audiences - conflict", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateOverridesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("wildcard-audiences")
            ),
            cliVersion: "0.1.3-rc0"
        });

        expect(violations.length).toBeGreaterThan(0);
        expect(violations[0]?.message).toContain("SDK method members.add already exists");
    }, 10_000);
});
