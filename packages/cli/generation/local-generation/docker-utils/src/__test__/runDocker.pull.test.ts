import { CONSOLE_LOGGER } from "@fern-api/logger";

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: vi.fn()
}));

import { loggingExeca } from "@fern-api/logging-execa";
import { runContainer } from "../runDocker.js";

function lastContainerArgs(): string[] {
    return ((loggingExeca as Mock).mock.calls[0]?.[2] ?? []) as string[];
}

describe("runContainer pull policy", () => {
    beforeEach(() => {
        (loggingExeca as Mock).mockReset();
        (loggingExeca as Mock).mockResolvedValue({ stdout: "", stderr: "", exitCode: 0, all: "" });
    });

    it("injects `--pull always` before the image when pull is true", async () => {
        await runContainer({
            logger: CONSOLE_LOGGER,
            imageName: "img:latest",
            binds: [],
            pull: true,
            writeLogsToFile: false
        });

        const args = lastContainerArgs();
        expect(args).toContain("--pull");
        expect(args[args.indexOf("--pull") + 1]).toBe("always");
        // Must be a `docker run` option, i.e. before the image name.
        expect(args.indexOf("--pull")).toBeLessThan(args.indexOf("img:latest"));
    });

    it("does not pass `--pull` by default (pull-when-missing preserved)", async () => {
        await runContainer({
            logger: CONSOLE_LOGGER,
            imageName: "img:1.0.0",
            binds: [],
            writeLogsToFile: false
        });

        expect(lastContainerArgs()).not.toContain("--pull");
    });

    it("injects `--platform <value>` before the image when platform is set", async () => {
        await runContainer({
            logger: CONSOLE_LOGGER,
            imageName: "img:latest",
            binds: [],
            platform: "linux/amd64",
            writeLogsToFile: false
        });

        const args = lastContainerArgs();
        expect(args[args.indexOf("--platform") + 1]).toBe("linux/amd64");
        expect(args.indexOf("--platform")).toBeLessThan(args.indexOf("img:latest"));
    });

    it("does not pass `--platform` by default (host-native platform)", async () => {
        await runContainer({
            logger: CONSOLE_LOGGER,
            imageName: "img:1.0.0",
            binds: [],
            writeLogsToFile: false
        });

        expect(lastContainerArgs()).not.toContain("--platform");
    });
});
