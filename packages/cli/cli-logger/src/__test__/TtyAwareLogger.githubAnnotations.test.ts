import { PassThrough } from "node:stream";
import { LogLevel } from "@fern-api/logger";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { withSuppressedLoggerAnnotations } from "../githubAnnotations.js";
import { TtyAwareLogger } from "../TtyAwareLogger.js";

const ENV_KEYS = ["GITHUB_ACTIONS"] as const;

/**
 * Integration tests for the GHA annotation hook in `TtyAwareLogger.log`. The hook lives in the
 * hot path of every CLI log line, so we want explicit coverage of the env-var gate, the
 * suppression flag, the level filter, and the omit-on-TTY filter.
 */
describe("TtyAwareLogger GitHub Actions annotations", () => {
    const saved: Record<(typeof ENV_KEYS)[number], string | undefined> = { GITHUB_ACTIONS: undefined };

    let stdout: TestStream;
    let stderr: TestStream;
    let logger: TtyAwareLogger;

    beforeEach(() => {
        for (const key of ENV_KEYS) {
            saved[key] = process.env[key];
            delete process.env[key];
        }
        stdout = makeStream();
        stderr = makeStream();
        logger = new TtyAwareLogger(stdout.stream, stderr.stream);
    });

    afterEach(() => {
        logger.finish();
        for (const key of ENV_KEYS) {
            if (saved[key] == null) {
                delete process.env[key];
            } else {
                process.env[key] = saved[key];
            }
        }
    });

    it("emits no annotation lines when GITHUB_ACTIONS is unset", () => {
        delete process.env.GITHUB_ACTIONS;
        logger.log([{ level: LogLevel.Error, parts: ["boom"], time: new Date() }]);
        expect(stdout.read()).not.toContain("::error::");
        expect(stderr.read()).not.toContain("::error::");
    });

    it("emits ::error:: on stdout when GITHUB_ACTIONS=true and level is Error", () => {
        process.env.GITHUB_ACTIONS = "true";
        logger.log([{ level: LogLevel.Error, parts: ["boom"], time: new Date() }]);
        expect(stdout.read()).toContain("::error::boom\n");
    });

    it("emits ::warning:: on stdout for warn-level logs", () => {
        process.env.GITHUB_ACTIONS = "true";
        logger.log([{ level: LogLevel.Warn, parts: ["careful"], time: new Date() }]);
        expect(stdout.read()).toContain("::warning::careful\n");
    });

    it("does not emit annotations for info / debug / trace levels", () => {
        process.env.GITHUB_ACTIONS = "true";
        logger.log([
            { level: LogLevel.Info, parts: ["x"], time: new Date() },
            { level: LogLevel.Debug, parts: ["y"], time: new Date() },
            { level: LogLevel.Trace, parts: ["z"], time: new Date() }
        ]);
        const out = stdout.read();
        expect(out).not.toContain("::error");
        expect(out).not.toContain("::warning");
    });

    it("suppresses annotations inside withSuppressedLoggerAnnotations(...)", async () => {
        // `fern automations generate` runs its body inside `withSuppressedLoggerAnnotations` while
        // it emits its own structured annotations from the GeneratorRunCollector; the generic
        // logger hook must stay quiet so the user doesn't see two annotations per failure.
        process.env.GITHUB_ACTIONS = "true";
        await withSuppressedLoggerAnnotations(async () => {
            logger.log([{ level: LogLevel.Error, parts: ["boom"], time: new Date() }]);
        });
        expect(stdout.read()).not.toContain("::error::");
    });

    it("re-emits annotations after the suppression scope exits", async () => {
        process.env.GITHUB_ACTIONS = "true";
        await withSuppressedLoggerAnnotations(async () => {
            logger.log([{ level: LogLevel.Error, parts: ["first"], time: new Date() }]);
        });
        logger.log([{ level: LogLevel.Error, parts: ["second"], time: new Date() }]);
        const out = stdout.read();
        expect(out).not.toContain("::error::first");
        expect(out).toContain("::error::second\n");
    });

    it("skips annotations for omitOnTTY: true logs even at error level", () => {
        // The CLI uses `omitOnTTY: true` for status-only lines like "Failed." that exist for
        // non-TTY readability. They aren't the actual error and shouldn't burn an annotation.
        process.env.GITHUB_ACTIONS = "true";
        logger.log([{ level: LogLevel.Error, parts: ["Failed."], time: new Date(), omitOnTTY: true }]);
        expect(stdout.read()).not.toContain("::error::");
    });

    it("uses the log prefix as the annotation title (with ANSI stripped)", () => {
        process.env.GITHUB_ACTIONS = "true";
        // Hardcoded ANSI escapes so the test doesn't depend on chalk's TTY-detection behavior.
        const prefix = `[34m[workspace-foo][39m   `;
        logger.log([{ level: LogLevel.Error, parts: ["boom"], time: new Date(), prefix }]);
        expect(stdout.read()).toContain("::error title=[workspace-foo]::boom\n");
    });
});

interface TestStream {
    stream: NodeJS.WriteStream;
    read: () => string;
}

function makeStream(): TestStream {
    const buffers: Buffer[] = [];
    const passthrough = new PassThrough();
    passthrough.on("data", (chunk: Buffer) => buffers.push(chunk));
    // The TtyAwareLogger only reads `isTTY` and `write`; cast is enough for our purposes.
    const stream = passthrough as unknown as NodeJS.WriteStream;
    (stream as { isTTY?: boolean }).isTTY = false;
    return {
        stream,
        read: () => Buffer.concat(buffers).toString("utf8")
    };
}
