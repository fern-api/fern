import { execFileSync } from "child_process";
import { Eta } from "eta";
import { mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { beforeAll, describe, expect, it } from "vitest";

// ──────────────────────────────────────────────────────────────────────────────
// This suite exercises the *runtime behavior* of the self-contained
// `RawClient.append_app_info` helper that the ruby-v2 `raw_client.Template.rb`
// emits into the generated SDK (only when `allowUserAgentAppInfo` is enabled).
// Because the helper is emitted as Ruby source (not imported from a shared
// runtime), we render exactly that emitted Ruby, execute it, and assert against
// the code SDK consumers actually receive. It runs the Ruby with a local `ruby`
// binary when the version is 3.x, else the `ruby:3.3-slim` Docker image, and is
// `describe.skip`ped when neither is available.
// ──────────────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = join(__dirname, "..", "asIs", "internal", "http", "raw_client.Template.rb");

const eta = new Eta({ autoEscape: false, useWith: true, autoTrim: false });

/**
 * Renders the Eta template with `allowUserAgentAppInfo` enabled and extracts the
 * contiguous block of appInfo helper source (constants + methods) it emits.
 */
function extractEmittedHelperSource(): string {
    const template = readFileSync(TEMPLATE_PATH).toString();
    const rendered = eta
        .renderString(template, {
            gem_namespace: "Seed",
            sdkName: "seed",
            rootFolderName: "seed",
            custom_pager_class_name: "CustomPager",
            omitFernHeaders: false,
            includePlatformHeaders: false,
            allowUserAgentAppInfo: true,
            defaultMaxRetries: 2,
            endpointSecurity: false,
            requestLevelMaxRetries: false
        })
        .replace(/\{\{RETRY_STATUS_CODES_ARRAY\}\}/g, "[].freeze");

    const startMarker = "# RFC 7230 token characters (tchar).";
    const startIndex = rendered.indexOf(startMarker);
    if (startIndex === -1) {
        throw new Error("appInfo helper block was not emitted by the template");
    }
    // The `percent_encode_user_agent` method is the last method in the gated block.
    const endMarker = "def self.percent_encode_user_agent(char)";
    const endMethodIndex = rendered.indexOf(endMarker, startIndex);
    if (endMethodIndex === -1) {
        throw new Error("percent_encode_user_agent method was not emitted by the template");
    }
    // Slice to the `end` that closes the last method.
    const afterEndMethod = rendered.indexOf("\n", rendered.indexOf("join", endMethodIndex));
    const closingEnd = rendered.indexOf("end", afterEndMethod);
    const blockEnd = rendered.indexOf("\n", closingEnd);
    return rendered.slice(startIndex, blockEnd);
}

type RubyInvoke = (dir: string, script: string, arg: string) => string;

function resolveRubyRunner(): RubyInvoke | undefined {
    try {
        const version = execFileSync("ruby", ["--version"], { encoding: "utf8" });
        if (/ruby 3\./.test(version)) {
            return (dir, script, arg) => execFileSync("ruby", [script, arg], { cwd: dir, encoding: "utf8" });
        }
    } catch {
        // no local ruby 3.x; try docker below
    }
    try {
        execFileSync("docker", ["image", "inspect", "ruby:3.3-slim"], { stdio: "ignore" });
        return (dir, script, arg) =>
            execFileSync(
                "docker",
                ["run", "--rm", "-v", `${dir}:/app`, "-w", "/app", "ruby:3.3-slim", "ruby", script, arg],
                { encoding: "utf8" }
            );
    } catch {
        return undefined;
    }
}

const rubyRunner = resolveRubyRunner();
const runtimeDescribe = rubyRunner != null ? describe : describe.skip;

runtimeDescribe("emitted RawClient.append_app_info (Ruby runtime behavior)", () => {
    // This suite is `describe.skip` when rubyRunner is unavailable; the guard also
    // narrows the type so no non-null assertion is needed.
    if (rubyRunner == null) {
        return;
    }
    const runner = rubyRunner;
    const BASE = "seed/1.0.0";

    let dir: string;
    const append = (appInfo: Record<string, string> | null): string => {
        const arg = appInfo == null ? "null" : JSON.stringify(appInfo);
        return runner(dir, "harness.rb", arg);
    };

    beforeAll(() => {
        const helper = extractEmittedHelperSource();
        // A single script reads a JSON appInfo argument on ARGV and prints the result,
        // so each case is a cheap Ruby invocation of the actual emitted helper.
        const script = `require "json"
class AppInfoHarness
${helper
    .split("\n")
    .map((line) => (line.length > 0 ? `  ${line}` : line))
    .join("\n")}
end

raw = ARGV[0] || "null"
decoded = JSON.parse(raw)
app_info = decoded.is_a?(Hash) ? decoded : nil
print AppInfoHarness.append_app_info(${JSON.stringify(BASE)}, app_info)
`;
        dir = mkdtempSync(join(tmpdir(), "ruby-appinfo-"));
        writeFileSync(join(dir, "harness.rb"), script);
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

describe("emitted RawClient.append_app_info (source-level guarantees)", () => {
    const source = extractEmittedHelperSource();

    it("trims each value before encoding (blank => absent), matching the TS reference ordering", () => {
        expect(source).toContain('encode_user_agent_token((app_info[:name] || app_info["name"]).to_s.strip)');
        expect(source).toContain('encode_user_agent_token((app_info[:version] || app_info["version"]).to_s.strip)');
        expect(source).toContain('encode_user_agent_comment((app_info[:comment] || app_info["comment"]).to_s.strip)');
    });

    it("percent-encodes every non-RFC-7230 tchar in name/version", () => {
        expect(source).toContain("USER_AGENT_TCHAR = /[^!#$%&'*+\\-.^_`|~0-9A-Za-z]/");
    });

    it("escapes the comment delimiters and control characters", () => {
        expect(source).toContain("USER_AGENT_COMMENT_UNSAFE = /[()\\\\\\x00-\\x1f\\x7f]/");
    });
});

// ──────────────────────────────────────────────────────────────────────────────
// When appInfo is enabled the base User-Agent value is emitted as *raw* Ruby via
// `ruby.codeblock(...)` (so it can be wrapped by `RawClient.append_app_info`),
// rather than as a `ruby.TypeLiteral.string(...)` literal. A raw double-quoted
// Ruby string performs interpolation, so a configured `userAgentTemplate` value
// containing `#{...}` (or `#@ivar` / `#$global`) would otherwise be evaluated by
// Ruby at SDK-init time — producing a broken/unintended User-Agent or arbitrary
// code execution. RootClientGenerator escapes these markers with the same
// `.replace(/#(?=[{$@])/g, "\\#")` transform it already applies to auth-header
// prefixes. This suite pins that transform (the exact string emitted into the
// generated `client.rb`).
// ──────────────────────────────────────────────────────────────────────────────
describe("user-agent codeblock interpolation escaping", () => {
    const escapeUserAgentValue = (value: string): string => JSON.stringify(value).replace(/#(?=[{$@])/g, "\\#");

    it("escapes `#{...}` interpolation markers so Ruby does not evaluate them", () => {
        expect(escapeUserAgentValue("my-app/#{RUBY_VERSION}")).toBe('"my-app/\\#{RUBY_VERSION}"');
    });

    it("escapes `#@ivar` and `#$global` interpolation markers", () => {
        expect(escapeUserAgentValue("a#@ivar b#$global")).toBe('"a\\#@ivar b\\#$global"');
    });

    it("leaves a `#` not followed by an interpolation sigil untouched", () => {
        expect(escapeUserAgentValue("build#123")).toBe('"build#123"');
    });

    it("is a no-op for a plain value with no interpolation markers", () => {
        expect(escapeUserAgentValue("seed/1.0.0")).toBe('"seed/1.0.0"');
    });
});
