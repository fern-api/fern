import { describe, expect, it } from "vitest";

import { getInvokedCommandName, isBareInit, isVersionRedirectionExempt } from "../versionRedirection.js";

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
        expect(isVersionRedirectionExempt(argv("claim", "--org", "acme"))).toBe(true);
        expect(isVersionRedirectionExempt(argv("whoami", "--json"))).toBe(true);
        expect(isVersionRedirectionExempt(argv("org", "unset", "cli-version", "--min"))).toBe(true);
        expect(isVersionRedirectionExempt(argv("--log-level", "debug", "org", "set", "cli-version", "5.40.0"))).toBe(
            true
        );
    });

    it("exempts a bare `fern init`, which starts the setup wizard, but not `fern init` with flags", () => {
        expect(isVersionRedirectionExempt(argv("init"))).toBe(true);
        expect(isVersionRedirectionExempt(argv("--log-level", "debug", "init"))).toBe(true);
        expect(isVersionRedirectionExempt(argv("init", "--openapi", "openapi.yaml"))).toBe(false);
        expect(isVersionRedirectionExempt(argv("init", "--docs"))).toBe(false);
    });

    it("does not exempt other commands", () => {
        expect(isVersionRedirectionExempt(argv("check"))).toBe(false);
        expect(isVersionRedirectionExempt(argv("generate"))).toBe(false);
        expect(isVersionRedirectionExempt(argv())).toBe(false);
    });
});

describe("isBareInit", () => {
    it("is true only for `fern init` with nothing but global options", () => {
        expect(isBareInit(argv("init"))).toBe(true);
        expect(isBareInit(argv("--log-level=debug", "init"))).toBe(true);
        expect(isBareInit(argv("init", "--org", "acme"))).toBe(false);
        expect(isBareInit(argv("init", "--api"))).toBe(false);
        expect(isBareInit(argv("check"))).toBe(false);
    });
});
