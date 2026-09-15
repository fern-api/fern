import { describe, expect, it, vi } from "vitest";

const loggingExeca = vi.hoisted(() => vi.fn());

vi.mock("@fern-api/logging-execa", () => ({ loggingExeca }));
vi.mock("tmp-promise", () => ({ default: { file: async () => ({ path: "/tmp/logs" }) } }));
vi.mock("fs/promises", () => ({ writeFile: async () => undefined }));

import { runContainer } from "../runDocker.js";

const logger = { info: vi.fn(), debug: vi.fn(), warn: vi.fn(), error: vi.fn(), log: vi.fn() };

async function capturedArgs(args: Partial<Parameters<typeof runContainer>[0]> = {}): Promise<string[]> {
    loggingExeca.mockReset();
    loggingExeca.mockResolvedValue({ stdout: "", stderr: "", exitCode: 0 });
    await runContainer({
        // biome-ignore lint/suspicious/noExplicitAny: test logger stub
        logger: logger as any,
        imageName: "fernapi/fern-python-sdk:4.0.0",
        writeLogsToFile: false,
        ...args
    });
    return loggingExeca.mock.calls[0]?.[2] as string[];
}

describe("runContainer network passthrough", () => {
    it("passes --network when a mode is supplied", async () => {
        const argv = await capturedArgs({ network: "none" });

        expect(argv).toContain("--network");
        expect(argv[argv.indexOf("--network") + 1]).toBe("none");
    });

    // The flag must never appear unless asked for: adding it unconditionally would change the
    // networking of every existing generator.
    it("omits --network entirely by default", async () => {
        const argv = await capturedArgs();

        expect(argv).not.toContain("--network");
    });

    it("keeps the network flag ahead of the image and its arguments", async () => {
        const argv = await capturedArgs({ network: "none", args: ["/fern/config.json"] });

        expect(argv.indexOf("--network")).toBeLessThan(argv.indexOf("fernapi/fern-python-sdk:4.0.0"));
        expect(argv[argv.length - 1]).toBe("/fern/config.json");
    });
});
