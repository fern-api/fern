import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoDuplicateTypesRule } from "../no-duplicate-types";

describe("no-duplicate-types", () => {
    it("collision without namespace - should fail", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateTypesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("collision-no-namespace")
            ),
            cliVersion: "0.1.3-rc0"
        });

        expect(violations.length).toBeGreaterThan(0);
        expect(violations[0]?.message).toContain('Type "Team" is defined in multiple specs');
        expect(violations[0]?.message).toContain('Add "namespace" to your specs in generators.yml');
        expect(violations).toMatchSnapshot();
    }, 10_000);

    it("no collision with different namespaces - should pass", async () => {
        const violations = await getViolationsForRule({
            rule: NoDuplicateTypesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("no-collision-with-namespace")
            ),
            cliVersion: "0.1.3-rc0"
        });

        expect(violations).toEqual([]);
    }, 10_000);
});
