import { createLogger, LogLevel } from "@fern-api/logger";
import { mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { createTimedFileReader } from "../fileReadTimer.js";

function collectDebugLogs(): { logger: ReturnType<typeof createLogger>; lines: string[] } {
    const lines: string[] = [];
    const logger = createLogger((level: LogLevel, ...args: string[]) => {
        if (level === LogLevel.Debug) {
            lines.push(args.join(" "));
        }
    });
    return { logger, lines };
}

describe("createTimedFileReader", () => {
    it("returns file contents and logs a single summary for concurrent reads", async () => {
        const dir = await mkdtemp(join(tmpdir(), "file-read-timer-"));
        const paths = await Promise.all(
            Array.from({ length: 50 }, async (_, i) => {
                const path = join(dir, `plants-${i}.mdx`);
                await writeFile(path, `# Plant ${i}\n`);
                return path;
            })
        );

        const { readFile, logSummary } = createTimedFileReader();
        const contents = await Promise.all(paths.map((path) => readFile(path)));
        expect(contents[7]).toBe("# Plant 7\n");

        const { logger, lines } = collectDebugLogs();
        logSummary(logger, "markdown");

        expect(lines).toHaveLength(1);
        expect(lines[0]).toMatch(/^Read 50 markdown files \(0\.00 MB\) in \d+ms; median per-file wait \d+ms$/);
        expect(lines.some((line) => line.startsWith("Slow file read"))).toBe(false);
    });

    it("logs nothing when no files were read", () => {
        const { logger, lines } = collectDebugLogs();
        createTimedFileReader().logSummary(logger, "markdown");
        expect(lines).toHaveLength(0);
    });
});
