import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoSchemaTitleCollisionsRule } from "../no-schema-title-collisions";

describe("no-schema-title-collisions", () => {
    it("should detect title collisions when title-as-schema-name is true and resolve-schema-collisions is false", async () => {
        const violations = await getViolationsForRule({
            rule: NoSchemaTitleCollisionsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("title-collision-strict")
            ),
            cliVersion: "0.1.3-rc0"
        });

        expect(violations.length).toBe(1);
        expect(violations[0]?.severity).toBe("error");
        expect(violations[0]?.message).toContain("Schema title collision detected");
        expect(violations[0]?.message).toContain("User");
        expect(violations[0]?.message).toContain("UserSchema2");
        expect(violations[0]?.message).toContain("UserSchema1");
    }, 10_000);

    it("should not report violations when resolve-schema-collisions is true", async () => {
        const violations = await getViolationsForRule({
            rule: NoSchemaTitleCollisionsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("title-collision-resolved")
            ),
            cliVersion: "0.1.3-rc0"
        });

        expect(violations).toEqual([]);
    }, 10_000);

    it("should not report violations when title-as-schema-name is false", async () => {
        const violations = await getViolationsForRule({
            rule: NoSchemaTitleCollisionsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("no-titles-enabled")
            ),
            cliVersion: "0.1.3-rc0"
        });

        expect(violations).toEqual([]);
    }, 10_000);
});
