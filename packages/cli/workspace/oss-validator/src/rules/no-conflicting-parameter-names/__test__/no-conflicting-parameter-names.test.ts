import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoConflictingParameterNamesRule } from "../no-conflicting-parameter-names";

describe("no-conflicting-parameter-names", () => {
    it("should detect header vs query parameter name collision", async () => {
        const violations = await getViolationsForRule({
            rule: NoConflictingParameterNamesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("header-query-collision")
            )
        });

        expect(violations.length).toBe(1);
        expect(violations[0]?.severity).toBe("error");
        expect(violations[0]?.message).toContain("organizationId");
        expect(violations[0]?.message).toContain("Organization-Id");
        expect(violations[0]?.message).toContain("organization_id");
        expect(violations[0]?.nodePath).toEqual(["paths", "/plants/{plantId}", "get"]);
    }, 10_000);

    it("should detect header vs path parameter name collision", async () => {
        const violations = await getViolationsForRule({
            rule: NoConflictingParameterNamesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("header-path-collision")
            )
        });

        expect(violations.length).toBe(1);
        expect(violations[0]?.severity).toBe("error");
        expect(violations[0]?.message).toContain("plantId");
        expect(violations[0]?.message).toContain("Plant-Id");
        expect(violations[0]?.message).toContain("plant_id");
        expect(violations[0]?.nodePath).toEqual(["paths", "/plants/{plant_id}", "get"]);
    }, 10_000);

    it("should not report violations when parameters have different normalized names", async () => {
        const violations = await getViolationsForRule({
            rule: NoConflictingParameterNamesRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("no-collision")
            )
        });

        expect(violations).toEqual([]);
    }, 10_000);
});
