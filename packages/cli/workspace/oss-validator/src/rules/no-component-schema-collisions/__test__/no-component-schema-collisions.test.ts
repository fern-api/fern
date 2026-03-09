import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoComponentSchemaCollisionsRule } from "../no-component-schema-collisions";

describe("no-component-schema-collisions", () => {
    it("should detect schema ID collisions across multiple specs", async () => {
        const violations = await getViolationsForRule({
            rule: NoComponentSchemaCollisionsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("multi-spec-collision")
            ),
            cliVersion: "0.1.3-rc0"
        });

        expect(violations.length).toBe(1);
        expect(violations[0]?.severity).toBe("warning");
        expect(violations[0]?.message).toContain("Component schema collision detected");
        expect(violations[0]?.message).toContain("User");
        expect(violations[0]?.message).toContain("api1.yml");
        expect(violations[0]?.message).toContain("api2.yml");
    }, 10_000);

    it("should not report violations when specs have different schema names", async () => {
        const violations = await getViolationsForRule({
            rule: NoComponentSchemaCollisionsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("multi-spec-no-collision")
            ),
            cliVersion: "0.1.3-rc0"
        });

        expect(violations).toEqual([]);
    }, 10_000);

    it("should not report violations when resolve-schema-collisions is true", async () => {
        const violations = await getViolationsForRule({
            rule: NoComponentSchemaCollisionsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("multi-spec-collision-resolved")
            ),
            cliVersion: "0.1.3-rc0"
        });

        expect(violations).toEqual([]);
    }, 10_000);

    it("should not report violations for a single spec", async () => {
        const violations = await getViolationsForRule({
            rule: NoComponentSchemaCollisionsRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("single-spec-no-collision")
            ),
            cliVersion: "0.1.3-rc0"
        });

        expect(violations).toEqual([]);
    }, 10_000);
});
