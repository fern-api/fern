import { describe, expect, it } from "vitest";

import { getInvokedCommandName, isVersionRedirectionExempt } from "../versionRedirection.js";

// argv mimics process.argv: [node, script, ...args]
function argv(...args: string[]): string[] {
    return ["node", "cli.cjs", ...args];
}

describe("getInvokedCommandName", () => {
    it("returns the top-level command", () => {
        expect(getInvokedCommandName(argv("org", "get"))).toBe("org");
        expect(getInvokedCommandName(argv("check"))).toBe("check");
    });

    it("skips global flags", () => {
        expect(getInvokedCommandName(argv("--local", "generate"))).toBe("generate");
    });

    it("skips the value consumed by --log-level", () => {
        expect(getInvokedCommandName(argv("--log-level", "debug", "org", "set", "cli-version", "5.40.0"))).toBe("org");
    });

    it("handles --log-level=value form", () => {
        expect(getInvokedCommandName(argv("--log-level=debug", "org", "get"))).toBe("org");
    });

    it("returns undefined when no command is present", () => {
        expect(getInvokedCommandName(argv())).toBeUndefined();
        expect(getInvokedCommandName(argv("--local"))).toBeUndefined();
    });
});

describe("isVersionRedirectionExempt", () => {
    it("exempts the org command family", () => {
        expect(isVersionRedirectionExempt(argv("org", "get"))).toBe(true);
        expect(isVersionRedirectionExempt(argv("org", "unset", "cli-version", "--min"))).toBe(true);
        expect(isVersionRedirectionExempt(argv("--log-level", "debug", "org", "set", "cli-version", "5.40.0"))).toBe(
            true
        );
    });

    it("does not exempt other commands", () => {
        expect(isVersionRedirectionExempt(argv("check"))).toBe(false);
        expect(isVersionRedirectionExempt(argv("generate"))).toBe(false);
        expect(isVersionRedirectionExempt(argv())).toBe(false);
    });
});
