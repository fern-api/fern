import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildOrgTokensCsv, buildOrgTokensTable, formatTimestamp, type OrgTokenRow } from "../orgTokens.js";

function token(overrides: Partial<OrgTokenRow> = {}): OrgTokenRow {
    return {
        tokenId: "tok_01",
        status: "active",
        createdTime: "2026-07-15T12:00:00.000Z",
        createdBy: "google-oauth2|1234",
        createdByEmail: null,
        lastUsedAt: "2026-10-01T12:00:00.000Z",
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
          "Name,Token ID,Status,Created by,Created at,Last used at
          CI/CD pipeline,tok_01,active,google-oauth2|1234,2026-07-15T12:00:00.000Z,2026-10-01T12:00:00.000Z
          ,tok_02,revoked,google-oauth2|1234,2026-07-20T12:00:00.000Z,2026-10-01T12:00:00.000Z"
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

describe("buildOrgTokensTable", () => {
    const originalTz = process.env.TZ;
    beforeAll(() => {
        process.env.TZ = "UTC";
    });
    afterAll(() => {
        process.env.TZ = originalTz;
    });

    it("labels every column and carries the same fields as the CSV export", () => {
        const lines = buildOrgTokensTable(tokens);

        expect(lines).toMatchInlineSnapshot(`
          [
            "Name            Token ID  Status   Created by          Created at        Last used at",
            "CI/CD pipeline  tok_01    active   google-oauth2|1234  2026-07-15 12:00  2026-10-01 12:00",
            "(no name)       tok_02    revoked  google-oauth2|1234  2026-07-20 12:00  2026-10-01 12:00",
          ]
        `);
    });

    it("shows placeholders for missing names, creators and last-used times", () => {
        const [, row] = buildOrgTokensTable([token({ description: null, createdBy: null, lastUsedAt: null })]);

        expect(row).toContain("(no name)");
        expect(row).toContain("-");
        expect(row).toContain("never");
    });

    it("shows the creator's email when Venus resolved it, else the user ID", () => {
        const [, withEmail] = buildOrgTokensTable([token({ createdByEmail: "jane@acme.com" })]);
        const [, withoutEmail] = buildOrgTokensTable([token()]);

        expect(withEmail).toContain("jane@acme.com");
        expect(withEmail).not.toContain("google-oauth2|1234");
        expect(withoutEmail).toContain("google-oauth2|1234");
        expect(buildOrgTokensCsv([token({ createdByEmail: "jane@acme.com" })])).toContain(",jane@acme.com,");
    });

    it("collapses multiline names onto one line", () => {
        const [, row] = buildOrgTokensTable([token({ description: "line one\nline two" })]);

        expect(row).toContain("line one line two");
    });
});

describe("formatTimestamp", () => {
    const originalTz = process.env.TZ;
    afterAll(() => {
        process.env.TZ = originalTz;
    });

    it("shows minutes in local time and drops seconds and fractions", () => {
        process.env.TZ = "America/Los_Angeles";

        expect(formatTimestamp("2026-06-12T21:24:07.610Z")).toBe("2026-06-12 14:24");
        expect(formatTimestamp("2026-06-12T22:52:08.582869Z")).toBe("2026-06-12 15:52");
    });

    it("returns unparseable values unchanged", () => {
        expect(formatTimestamp("not a date")).toBe("not a date");
    });
});
