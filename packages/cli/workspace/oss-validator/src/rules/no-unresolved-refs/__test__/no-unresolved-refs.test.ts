import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { NoUnresolvedRefsRule } from "../no-unresolved-refs";

function fixture(name: string): AbsoluteFilePath {
    return join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"), RelativeFilePath.of(name));
}

describe("no-unresolved-refs", () => {
    it("should not report violations when every $ref resolves", async () => {
        const violations = await getViolationsForRule({
            rule: NoUnresolvedRefsRule,
            absolutePathToWorkspace: fixture("valid-refs")
        });

        expect(violations).toEqual([]);
    }, 10_000);

    it("should detect a local pointer that does not exist", async () => {
        const violations = await getViolationsForRule({
            rule: NoUnresolvedRefsRule,
            absolutePathToWorkspace: fixture("unresolved-pointer")
        });

        expect(violations.length).toBe(1);
        expect(violations[0]?.severity).toBe("warning");
        expect(violations[0]?.message).toContain("PlantErrorResponse");
    }, 10_000);

    it("should not report violations when the overlay targets a parent node that exists", async () => {
        const violations = await getViolationsForRule({
            rule: NoUnresolvedRefsRule,
            absolutePathToWorkspace: fixture("overlay-targets-parent")
        });

        expect(violations).toEqual([]);
    }, 10_000);

    it("should detect a $ref to a file that does not exist", async () => {
        const violations = await getViolationsForRule({
            rule: NoUnresolvedRefsRule,
            absolutePathToWorkspace: fixture("missing-external-file")
        });

        expect(violations.length).toBe(1);
        expect(violations[0]?.severity).toBe("warning");
        expect(violations[0]?.message).toContain("schemas.yaml");
    }, 10_000);
});
