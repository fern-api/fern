import { LogLevel } from "@fern-api/logger";
import { afterEach, describe, expect, it } from "vitest";

import {
    areLoggerAnnotationsSuppressed,
    renderGithubAnnotation,
    renderGithubAnnotationFromLog,
    shouldEmitGithubAnnotations,
    withSuppressedLoggerAnnotations
} from "../githubAnnotations.js";
import { Log } from "../Log.js";

function makeLog(level: LogLevel, parts: string[], extras: Partial<Log> = {}): Log {
    return { level, parts, time: new Date(0), ...extras };
}

describe("shouldEmitGithubAnnotations", () => {
    const original = process.env.GITHUB_ACTIONS;
    afterEach(() => {
        if (original === undefined) {
            delete process.env.GITHUB_ACTIONS;
        } else {
            process.env.GITHUB_ACTIONS = original;
        }
    });

    it("returns true when GITHUB_ACTIONS=true", () => {
        process.env.GITHUB_ACTIONS = "true";
        expect(shouldEmitGithubAnnotations()).toBe(true);
    });

    it("returns false when GITHUB_ACTIONS is unset", () => {
        delete process.env.GITHUB_ACTIONS;
        expect(shouldEmitGithubAnnotations()).toBe(false);
    });

    it("returns false for any value other than the literal string 'true'", () => {
        // GitHub Actions sets the value to the literal string "true"; other CI providers may
        // set similarly named vars to "1" or "yes", and we don't want to misinterpret those.
        process.env.GITHUB_ACTIONS = "1";
        expect(shouldEmitGithubAnnotations()).toBe(false);
    });
});

describe("withSuppressedLoggerAnnotations", () => {
    it("suppresses annotations during the body and restores afterward", async () => {
        expect(areLoggerAnnotationsSuppressed()).toBe(false);
        await withSuppressedLoggerAnnotations(async () => {
            expect(areLoggerAnnotationsSuppressed()).toBe(true);
        });
        expect(areLoggerAnnotationsSuppressed()).toBe(false);
    });

    it("restores the previous state even if the body throws", async () => {
        // The whole reason this is a scoped runner instead of a `set(true)` / `set(false)` pair
        // is that automations generate's body can throw (e.g. an unexpected error escapes
        // `runTask`); the flag must not leak into subsequent commands or tests.
        expect(areLoggerAnnotationsSuppressed()).toBe(false);
        await expect(
            withSuppressedLoggerAnnotations(async () => {
                expect(areLoggerAnnotationsSuppressed()).toBe(true);
                throw new Error("body failed");
            })
        ).rejects.toThrow("body failed");
        expect(areLoggerAnnotationsSuppressed()).toBe(false);
    });

    it("preserves the previous suppressed state on nested usage (re-entrant safety)", async () => {
        // If two automations runs are layered (unlikely in production but possible in tests
        // sharing a process), the inner restoration must not flip the outer's state to false.
        await withSuppressedLoggerAnnotations(async () => {
            expect(areLoggerAnnotationsSuppressed()).toBe(true);
            await withSuppressedLoggerAnnotations(async () => {
                expect(areLoggerAnnotationsSuppressed()).toBe(true);
            });
            // Inner finally should restore to the outer's state (true), not the original (false).
            expect(areLoggerAnnotationsSuppressed()).toBe(true);
        });
        expect(areLoggerAnnotationsSuppressed()).toBe(false);
    });
});

describe("renderGithubAnnotation", () => {
    it("renders a bare ::error:: command with no properties", () => {
        expect(renderGithubAnnotation("error", "boom")).toBe("::error::boom\n");
    });

    it("renders ::warning:: level", () => {
        expect(renderGithubAnnotation("warning", "deprecated")).toBe("::warning::deprecated\n");
    });

    it("formats file/line/title properties in reading order (file, line, title)", () => {
        const out = renderGithubAnnotation("error", "boom", {
            file: "fern/generators.yml",
            line: 42,
            title: "python-sdk failed"
        });
        expect(out).toBe("::error file=fern/generators.yml,line=42,title=python-sdk failed::boom\n");
    });

    it("escapes commas, colons, and CR/LF in property values", () => {
        // Property syntax uses `,` to separate properties and `:` to terminate the property list,
        // so any property value containing them would corrupt the parse. GHA's escape is `%XX`.
        // (The `=` between key and value is not ambiguous in values — GHA parses property strings
        // by splitting on the first `=` per pair, so `=` does not need escaping.)
        const out = renderGithubAnnotation("error", "boom", {
            title: "url=http://x:8080/a,b\r\nnext"
        });
        expect(out).toBe("::error title=url=http%3A//x%3A8080/a%2Cb%0D%0Anext::boom\n");
    });

    it("escapes a literal '%' to '%25' before applying other escapes", () => {
        // If we didn't escape `%` first, a value containing `%0A` literally would survive
        // round-tripping (the `%` would stay raw and produce `%0A`), making the value
        // ambiguous with our newline encoding. Escaping `%` to `%25` first prevents that.
        expect(renderGithubAnnotation("error", "boom", { title: "100%" })).toBe("::error title=100%25::boom\n");
    });

    it("strips ANSI from property values", () => {
        // chalk-colored prefixes shouldn't appear as escape codes in property values either.
        const titleWithColor = `[31mworkspace-a[39m`;
        const out = renderGithubAnnotation("error", "boom", { title: titleWithColor });
        expect(out).toBe("::error title=workspace-a::boom\n");
    });

    it("omits empty title and file properties (an empty title= would render blank)", () => {
        expect(renderGithubAnnotation("error", "boom", { title: "", file: "" })).toBe("::error::boom\n");
    });

    it("returns undefined when the body is empty after sanitization", () => {
        expect(renderGithubAnnotation("error", "")).toBeUndefined();
        expect(renderGithubAnnotation("error", "\n\n")).toBeUndefined();
    });

    it("encodes newlines in the body as %0A so multi-line errors stay one workflow command", () => {
        expect(renderGithubAnnotation("error", "line one\nline two")).toBe("::error::line one%0Aline two\n");
    });

    it("escapes a literal '%' in the body to '%25' before encoding newlines", () => {
        // If we didn't escape `%` first, a body containing the literal text `%0A` (e.g. a URL-
        // encoded string the user logged) would round-trip through the runner as a real newline
        // and split the annotation visually. Escaping `%` first preserves the literal text.
        expect(renderGithubAnnotation("error", "value%0Ainjected")).toBe("::error::value%250Ainjected\n");
        // Real newlines still encode correctly after the % pre-escape.
        expect(renderGithubAnnotation("error", "100% done\nthen failed")).toBe("::error::100%25 done%0Athen failed\n");
    });

    it("trims trailing newlines from the body before encoding", () => {
        expect(renderGithubAnnotation("error", "boom\n\n")).toBe("::error::boom\n");
    });

    it("normalizes CRLF and drops bare CRs", () => {
        expect(renderGithubAnnotation("error", "line one\r\nline two\rstill line two")).toBe(
            "::error::line one%0Aline twostill line two\n"
        );
    });

    it("strips ANSI escape sequences from the body", () => {
        // Hardcoded ANSI bytes — we can't rely on chalk's runtime detection in the test env, since
        // chalk strips colors when stdout isn't a TTY (which it isn't under vitest).
        const body = `[31mboom[39m`;
        expect(renderGithubAnnotation("error", body)).toBe("::error::boom\n");
    });
});

describe("renderGithubAnnotationFromLog", () => {
    it("renders an ::error:: annotation for an error log", () => {
        const log = makeLog(LogLevel.Error, ["generator failed:", "boom"]);
        expect(renderGithubAnnotationFromLog(log)).toBe("::error::generator failed: boom\n");
    });

    it("renders a ::warning:: annotation for a warn log", () => {
        const log = makeLog(LogLevel.Warn, ["deprecated config option"]);
        expect(renderGithubAnnotationFromLog(log)).toBe("::warning::deprecated config option\n");
    });

    it("returns undefined for info / debug / trace levels", () => {
        for (const level of [LogLevel.Info, LogLevel.Debug, LogLevel.Trace]) {
            expect(renderGithubAnnotationFromLog(makeLog(level, ["noisy"]))).toBeUndefined();
        }
    });

    it("returns undefined when omitOnTTY is true (status-only logs that aren't real failures)", () => {
        // The CLI emits per-task status lines like LogLevel.Error "Failed." with omitOnTTY: true
        // for non-TTY readability. Those aren't real errors and shouldn't burn an annotation slot.
        const log = makeLog(LogLevel.Error, ["Failed."], { omitOnTTY: true });
        expect(renderGithubAnnotationFromLog(log)).toBeUndefined();
    });

    it("uses log.prefix as the annotation title (with ANSI stripped and whitespace trimmed)", () => {
        // Logger prefixes look like `[34m[workspace-foo][39m  ` (color + padding).
        const log = makeLog(LogLevel.Error, ["boom"], { prefix: `[34m[workspace-foo][39m   ` });
        expect(renderGithubAnnotationFromLog(log)).toBe("::error title=[workspace-foo]::boom\n");
    });

    it("omits the title when prefix is empty after sanitization", () => {
        const log = makeLog(LogLevel.Error, ["boom"], { prefix: "   " });
        expect(renderGithubAnnotationFromLog(log)).toBe("::error::boom\n");
    });

    it("returns undefined when the body is empty", () => {
        expect(renderGithubAnnotationFromLog(makeLog(LogLevel.Error, []))).toBeUndefined();
        expect(renderGithubAnnotationFromLog(makeLog(LogLevel.Error, ["", ""]))).toBeUndefined();
    });
});
