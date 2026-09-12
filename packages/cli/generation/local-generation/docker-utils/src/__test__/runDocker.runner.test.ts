import { CONSOLE_LOGGER } from "@fern-api/logger";

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: vi.fn()
}));

import { loggingExeca } from "@fern-api/logging-execa";
import { runContainer } from "../runDocker.js";

function lastRunnerBinary(): string {
    return ((loggingExeca as Mock).mock.calls[0]?.[1] ?? "") as string;
}

describe("runContainer container engine selection", () => {
    beforeEach(() => {
        (loggingExeca as Mock).mockReset();
        (loggingExeca as Mock).mockResolvedValue({ stdout: "", stderr: "", exitCode: 0, all: "" });
    });

    it("defaults to `docker` when no runner is provided", async () => {
        await runContainer({
            logger: CONSOLE_LOGGER,
            imageName: "img:latest",
            binds: [],
            writeLogsToFile: false
        });

        expect(lastRunnerBinary()).toBe("docker");
    });

    it("invokes `podman` when runner is `podman`", async () => {
        await runContainer({
            logger: CONSOLE_LOGGER,
            imageName: "img:latest",
            binds: [],
            runner: "podman",
            writeLogsToFile: false
        });

        expect(lastRunnerBinary()).toBe("podman");
    });

    it("invokes Apple `container` when runner is `container`", async () => {
        await runContainer({
            logger: CONSOLE_LOGGER,
            imageName: "img:latest",
            binds: [],
            runner: "container",
            writeLogsToFile: false
        });

        expect(lastRunnerBinary()).toBe("container");
    });
});
