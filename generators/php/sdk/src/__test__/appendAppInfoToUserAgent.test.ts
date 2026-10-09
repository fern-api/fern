import { execFileSync } from "child_process";
import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { beforeAll, describe, expect, it } from "vitest";

import { buildAppendAppInfoToUserAgentMethod } from "../root-client/RootClientGenerator.js";

// ──────────────────────────────────────────────────────────────────────────────
// This suite exercises the *runtime behavior* of the self-contained
// `appendAppInfoToUserAgent` helper that RootClientGenerator emits into the
// generated root client (only when `allowUserAgentAppInfo` is enabled). Because the
// helper is emitted as PHP source (not imported from the shared core-utilities), we
// render exactly that emitted PHP, execute it, and assert against the code SDK
// consumers actually receive. It runs the PHP with a local `php` binary when
// available, else the `php:8.2-cli` Docker image, and is `describe.skip`ped when
// neither is available.
// ──────────────────────────────────────────────────────────────────────────────

function renderEmittedMethod(): string {
    // Rendered as `private static function ...`; expose it publicly so the test
    // harness can invoke it statically without reflection.
    return buildAppendAppInfoToUserAgentMethod()
        .toString({
            namespace: "Seed",
            rootNamespace: "Seed",
            customConfig: {},
            skipImports: true
        })
        .replace("private static function", "public static function");
}

type PhpInvoke = (dir: string, script: string, arg: string) => string;

function resolvePhpRunner(): PhpInvoke | undefined {
    try {
        execFileSync("php", ["--version"], { stdio: "ignore" });
        return (dir, script, arg) => execFileSync("php", [script, arg], { cwd: dir, encoding: "utf8" });
    } catch {
        // no local php; try docker below
    }
    try {
        execFileSync("docker", ["image", "inspect", "php:8.2-cli"], { stdio: "ignore" });
        return (dir, script, arg) =>
            execFileSync(
                "docker",
                ["run", "--rm", "-v", `${dir}:/app`, "-w", "/app", "php:8.2-cli", "php", script, arg],
                { encoding: "utf8" }
            );
    } catch {
        return undefined;
    }
}

const phpRunner = resolvePhpRunner();
const runtimeDescribe = phpRunner != null ? describe : describe.skip;

runtimeDescribe("emitted appendAppInfoToUserAgent (PHP runtime behavior)", () => {
    // This suite is `describe.skip` when phpRunner is unavailable; the guard also
    // narrows the type so no non-null assertion is needed.
    if (phpRunner == null) {
        return;
    }
    const runner = phpRunner;
    const BASE = "@test/sdk/1.0.0";

    let dir: string;
    const append = (appInfo: Record<string, string> | null): string => {
        const arg = appInfo == null ? "null" : JSON.stringify(appInfo);
        return runner(dir, "harness.php", arg);
    };

    beforeAll(() => {
        const method = renderEmittedMethod();
        // A single script reads a JSON appInfo argument on argv and prints the result,
        // so each case is a cheap PHP invocation of the actual emitted helper.
        const script = `<?php
class AppInfoHarness {
${method
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n")}
}

$raw = $argv[1] ?? 'null';
$decoded = json_decode($raw, true);
$appInfo = is_array($decoded) ? $decoded : null;
echo AppInfoHarness::appendAppInfoToUserAgent(${JSON.stringify(BASE)}, $appInfo);
`;
        dir = mkdtempSync(join(tmpdir(), "php-appinfo-"));
        writeFileSync(join(dir, "harness.php"), script);
    });

    it("returns the User-Agent unchanged when appInfo is null", () => {
        expect(append(null)).toBe(BASE);
    });

    it("returns the User-Agent unchanged when name is empty", () => {
        expect(append({ name: "" })).toBe(BASE);
    });

    it("returns the User-Agent unchanged when name is whitespace-only", () => {
        expect(append({ name: "   " })).toBe(BASE);
        expect(append({ name: "\t\n " })).toBe(BASE);
    });

    it("appends name only when version and comment are absent", () => {
        expect(append({ name: "partner-app" })).toBe(`${BASE} partner-app`);
    });

    it("appends name/version when version is present", () => {
        expect(append({ name: "partner-app", version: "3.1.0" })).toBe(`${BASE} partner-app/3.1.0`);
    });

    it("appends name/version (comment) when all present", () => {
        expect(append({ name: "partner-app", version: "3.1.0", comment: "+https://partner.example" })).toBe(
            `${BASE} partner-app/3.1.0 (+https://partner.example)`
        );
    });

    it("omits the version segment when version is blank / whitespace-only", () => {
        expect(append({ name: "partner-app", version: "" })).toBe(`${BASE} partner-app`);
        expect(append({ name: "partner-app", version: "   " })).toBe(`${BASE} partner-app`);
    });

    it("trims surrounding whitespace rather than encoding it into the product token", () => {
        expect(append({ name: " partner-app ", version: " 3.1.0 ", comment: " a comment " })).toBe(
            `${BASE} partner-app/3.1.0 (a comment)`
        );
    });

    it("omits the comment group when comment is blank / whitespace-only", () => {
        expect(append({ name: "partner-app", comment: "   " })).toBe(`${BASE} partner-app`);
    });

    it("token-encodes spaces in the name (prevents injection)", () => {
        const result = append({ name: "evil app" });
        expect(result).toBe(`${BASE} evil%20app`);
        expect(result).not.toContain("evil app");
    });

    it("prevents CRLF injection via the name", () => {
        const result = append({ name: "x\r\nX-Injected: 1" });
        expect(result).not.toContain("\r");
        expect(result).not.toContain("\n");
        expect(result).toContain("%0D%0A");
    });

    it("prevents CRLF injection via the version", () => {
        const result = append({ name: "app", version: "1.0\r\nEvil: 1" });
        expect(result).not.toContain("\r");
        expect(result).not.toContain("\n");
        expect(result).toContain("%0D%0A");
    });

    it("prevents CRLF injection via the comment", () => {
        const result = append({ name: "app", comment: "ok\r\nEvil: 1" });
        expect(result).not.toContain("\r");
        expect(result).not.toContain("\n");
        expect(result).toContain("%0D%0A");
    });

    it("escapes parentheses and backslash in the comment so it cannot terminate the group", () => {
        const result = append({ name: "app", comment: "a)b(c\\d" });
        expect(result).toBe(`${BASE} app (a%29b%28c%5Cd)`);
        // No raw comment delimiters leak inside the emitted comment.
        expect(result.slice(`${BASE} app (`.length, -1)).not.toMatch(/[()\\]/);
    });

    it("keeps normal printable comment characters (e.g. a URL) human-readable", () => {
        expect(append({ name: "app", comment: "+https://partner.example/path?q=1" })).toBe(
            `${BASE} app (+https://partner.example/path?q=1)`
        );
    });
});

describe("emitted appendAppInfoToUserAgent (source-level guarantees)", () => {
    const source = renderEmittedMethod();

    it("trims each value before encoding (blank => absent), matching the TS reference ordering", () => {
        expect(source).toContain("$name = $encodeToken(trim($appInfo['name']))");
        expect(source).toContain("$version = $encodeToken(trim($appInfo['version'] ?? ''))");
        expect(source).toContain("$comment = $encodeComment(trim($appInfo['comment'] ?? ''))");
    });

    it("percent-encodes every non-RFC-7230 tchar in name/version", () => {
        expect(source).toContain("preg_replace_callback('/[^!#$%&\\'*+\\-.^_`|~0-9A-Za-z]/'");
        expect(source).toContain("bin2hex($char)");
    });

    it("escapes the comment delimiters and control characters", () => {
        expect(source).toContain("preg_replace_callback('/[()\\\\\\\\\\x00-\\x1f\\x7f]/'");
    });
});
