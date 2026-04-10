import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoInvalidTagNamesOrFrontmatterRule } from "../no-invalid-tag-names-or-frontmatter";

describe("no-invalid-tag-names-or-frontmatter", () => {
    it("should detect emoji tag names", async () => {
        const violations = await getViolationsForRule({
            rule: NoInvalidTagNamesOrFrontmatterRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("emoji-tags")
            )
        });

        expect(violations.length).toBe(2);
        expect(violations.every((v) => v.severity === "error")).toBe(true);
        expect(violations.every((v) => v.message.includes("non-ASCII"))).toBe(true);
    }, 30_000);

    it("should detect frontmatter delimiters in descriptions", async () => {
        const violations = await getViolationsForRule({
            rule: NoInvalidTagNamesOrFrontmatterRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("frontmatter-description")
            )
        });

        expect(violations.length).toBe(1);
        expect(violations[0]?.severity).toBe("error");
        expect(violations[0]?.message).toContain("---");
        expect(violations[0]?.message).toContain("YAML frontmatter");
    }, 30_000);

    it("should not report violations for valid specs", async () => {
        const violations = await getViolationsForRule({
            rule: NoInvalidTagNamesOrFrontmatterRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("valid-spec")
            )
        });

        expect(violations).toEqual([]);
    }, 30_000);
});
