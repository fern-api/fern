import { describe, expect, it } from "vitest";

import { buildOrgTokensCsv, type OrgTokenRow } from "../orgTokens.js";

function token(overrides: Partial<OrgTokenRow> = {}): OrgTokenRow {
    return {
        tokenId: "tok_01",
        status: "active",
        createdTime: "2026-07-15T12:00:00.000Z",
        description: "CI/CD pipeline",
        ...overrides
    };
}

const tokens: OrgTokenRow[] = [
    token(),
    token({
        tokenId: "tok_02",
        status: "revoked",
        createdTime: "2026-07-20T12:00:00.000Z",
        description: null
    })
];

describe("buildOrgTokensCsv", () => {
    it("emits a header row and one row per token", () => {
        const csv = buildOrgTokensCsv(tokens);

        expect(csv).toMatchInlineSnapshot(`
          "Name,Token ID,Status,Created at
          CI/CD pipeline,tok_01,active,2026-07-15T12:00:00.000Z
          ,tok_02,revoked,2026-07-20T12:00:00.000Z"
        `);
    });

    it("escapes names that contain commas or quotes", () => {
        const csv = buildOrgTokensCsv([token({ description: 'key "one", primary' })]);

        expect(csv).toContain('"key ""one"", primary"');
    });

    it("neutralizes names a spreadsheet would read as a formula", () => {
        const csv = buildOrgTokensCsv([token({ description: "=cmd|' /C calc'!A0" })]);

        expect(csv).toContain("'=cmd");
    });

    it("preserves multiline names verbatim inside a quoted cell", () => {
        const csv = buildOrgTokensCsv([token({ description: "line one\nline two" })]);

        expect(csv).toContain('"line one\nline two"');
    });

    it("leaves signed numbers as values rather than neutralizing them", () => {
        const csv = buildOrgTokensCsv([token({ description: "-12.5" })]);

        expect(csv).toContain("\n-12.5,");
    });
});
