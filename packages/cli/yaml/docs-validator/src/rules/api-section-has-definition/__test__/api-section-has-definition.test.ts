import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule.js";
import { ApiSectionHasDefinitionRule } from "../api-section-has-definition.js";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

function fixture(name: string): AbsoluteFilePath {
    return join(FIXTURES_DIR, RelativeFilePath.of(name), RelativeFilePath.of("fern"));
}

describe("api-section-has-definition", () => {
    it("flags an api navigation item when the fern folder has no API definition", async () => {
        const violations = await getViolationsForRule({
            rule: ApiSectionHasDefinitionRule,
            absolutePathToFernDirectory: fixture("no-api")
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.severity).toBe("error");
        expect(violations[0]?.message).toContain("does not resolve to an API definition");
        expect(violations[0]?.message).toContain("fern init --openapi");
    });

    it("flags an api navigation item whose api-name matches no workspace", async () => {
        const violations = await getViolationsForRule({
            rule: ApiSectionHasDefinitionRule,
            absolutePathToFernDirectory: fixture("wrong-api-name")
        });
        expect(violations).toHaveLength(1);
        expect(violations[0]?.message).toContain("No API definition named 'bar'");
        expect(violations[0]?.message).toContain("Available APIs: foo");
    });

    it("passes when a single API definition exists", async () => {
        const violations = await getViolationsForRule({
            rule: ApiSectionHasDefinitionRule,
            absolutePathToFernDirectory: fixture("with-api")
        });
        expect(violations).toEqual([]);
    });
});
