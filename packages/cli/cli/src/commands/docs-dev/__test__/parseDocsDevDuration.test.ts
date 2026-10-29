import { CliError } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsDevDuration } from "../parseDocsDevDuration.js";

describe("parseDocsDevDuration", () => {
    it.each([
        ["30s", 30_000],
        ["10m", 600_000],
        ["1h", 3_600_000],
        ["1.5m", 90_000],
        ["2H", 7_200_000],
        [" 45s ", 45_000],
        ["90", 90_000],
        [20, 20_000]
    ])("parses %j", (value, expected) => {
        expect(parseDocsDevDuration("timeout", value)).toBe(expected);
    });

    it.each(["", "0", "0s", "-5s", "abc", "10x", "1h30m", "10 minutes", "25d", "600h"])("rejects %j", (value) => {
        expect(() => parseDocsDevDuration("idle-timeout", value)).toThrow(CliError);
    });

    it("names the flag in the error", () => {
        expect(() => parseDocsDevDuration("idle-timeout", "soon")).toThrow(/--idle-timeout "soon"/);
    });
});
