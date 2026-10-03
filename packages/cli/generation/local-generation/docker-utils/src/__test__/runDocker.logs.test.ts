import { existsSync } from "fs";
import { mkdir, readFile, utimes, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: vi.fn()
}));

import { loggingExeca } from "@fern-api/logging-execa";
import tmp from "tmp-promise";

import { runContainer } from "../runDocker.js";

const messages: string[] = [];

const LOG_DIR = path.join(tmpdir(), "fern-generator-logs");

const LOGGER = {
    trace: () => undefined,
    debug: () => undefined,
    info: (...args: string[]) => messages.push(args.join(" ")),
    warn: () => undefined,
    error: () => undefined,
    log: () => undefined,
    disable: () => undefined,
    enable: () => undefined
};

async function runAndGetLogPath(): Promise<string> {
    messages.length = 0;
    await runContainer({ logger: LOGGER, imageName: "img:1.0.0", binds: [] });
    const message = messages.find((m) => m.startsWith("Generator logs here: "));
    if (message == null) {
        throw new Error(`No log path was printed. Messages: ${messages.join(", ")}`);
    }
    return message.replace("Generator logs here: ", "");
}

describe("runContainer log file", () => {
    beforeEach(async () => {
        await mkdir(LOG_DIR, { recursive: true });
        // Other modules in the CLI bundle call this, and it applies globally to `tmp`.
        tmp.setGracefulCleanup();
        (loggingExeca as Mock).mockReset();
        (loggingExeca as Mock).mockResolvedValue({ stdout: "container stdout", stderr: "", exitCode: 0, all: "" });
    });

    it("survives tmp's graceful cleanup on process exit", async () => {
        const logPath = await runAndGetLogPath();
        expect(await readFile(logPath, "utf-8")).toBe("container stdout");

        process.emit("exit", 0);

        expect(existsSync(logPath)).toBe(true);
    });

    it("prunes logs older than the retention period", async () => {
        const staleLog = path.join(LOG_DIR, "stale.log");
        await writeFile(staleLog, "old logs");
        const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
        await utimes(staleLog, eightDaysAgo, eightDaysAgo);

        const freshLog = await runAndGetLogPath();

        expect(existsSync(staleLog)).toBe(false);
        expect(existsSync(freshLog)).toBe(true);
    });
});
