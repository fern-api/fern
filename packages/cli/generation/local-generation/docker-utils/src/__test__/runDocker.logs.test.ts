import { existsSync } from "fs";

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: vi.fn()
}));

import { loggingExeca } from "@fern-api/logging-execa";
import tmp from "tmp-promise";

import { runContainer } from "../runDocker.js";

function loggedLogPath(messages: string[]): string {
    const message = messages.find((m) => m.startsWith("Generator logs here: "));
    if (message == null) {
        throw new Error(`No log path was printed. Messages: ${messages.join(", ")}`);
    }
    return message.replace("Generator logs here: ", "");
}

describe("runContainer log file", () => {
    beforeEach(() => {
        (loggingExeca as Mock).mockReset();
        (loggingExeca as Mock).mockResolvedValue({ stdout: "container stdout", stderr: "", exitCode: 0, all: "" });
    });

    it("survives tmp's graceful cleanup on process exit", async () => {
        const messages: string[] = [];
        // Other modules in the CLI bundle call this, and it applies globally to `tmp`.
        tmp.setGracefulCleanup();

        await runContainer({
            logger: {
                trace: () => undefined,
                debug: () => undefined,
                info: (...args: string[]) => messages.push(args.join(" ")),
                warn: () => undefined,
                error: () => undefined,
                log: () => undefined,
                disable: () => undefined,
                enable: () => undefined
            },
            imageName: "img:1.0.0",
            binds: []
        });

        const logPath = loggedLogPath(messages);
        expect(existsSync(logPath)).toBe(true);

        process.emit("exit", 0);

        expect(existsSync(logPath)).toBe(true);
    });
});
