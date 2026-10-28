import { describe, expect, it } from "vitest";

import { ProjectConfigSchema } from "../schema/ProjectConfigSchema.js";

function isValidVersion(version: string): boolean {
    return ProjectConfigSchema.safeParse({ organization: "acme", version }).success;
}

describe("ProjectConfigSchema version", () => {
    it.each(["*", "latest", "0.0.0", "5.40.0", "1.2.3-rc.0"])("accepts %s", (version) => {
        expect(isValidVersion(version)).toBe(true);
    });

    it.each([
        "file:skills/evil",
        "./skills/evil",
        "/tmp/evil",
        "npm:evil-pkg",
        "npm:fern-api@5.40.0",
        "https://example.com/fern-api.tgz",
        "git+https://github.com/acme/fern.git",
        "github:acme/fern",
        "acme/fern",
        "^5.40.0",
        ">=5.0.0",
        "5.x",
        "v5.40.0",
        " 5.40.0",
        "5.40.0 --foo",
        "next",
        ""
    ])("rejects %s", (version) => {
        expect(isValidVersion(version)).toBe(false);
    });
});
