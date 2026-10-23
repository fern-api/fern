import { describe, expect, it } from "vitest";
import { CLI_OPTIONS, HELP_TEXT } from "../cli-options";

describe("--help", () => {
    const documented = [...HELP_TEXT.matchAll(/^ {2}(?:-\w, )?--([a-z-]+)/gm)].map((match) => match[1]);

    it("documents every option, and only real ones", () => {
        const visible = Object.entries(CLI_OPTIONS)
            .filter(([, option]) => !("hidden" in option && option.hidden))
            .map(([name]) => name);
        expect([...documented].sort()).toEqual([...visible, "version"].sort());
    });

    it("fits in an 80-column terminal", () => {
        for (const line of HELP_TEXT.split("\n")) {
            expect(line.length).toBeLessThanOrEqual(80);
        }
    });
});
