import { NOOP_LOGGER } from "@fern-api/logger";

import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@fern-api/logging-execa", () => ({
    loggingExeca: vi.fn()
}));

import { loggingExeca } from "@fern-api/logging-execa";
import { runContainer } from "../runDocker.js";

function lastRunnerBinary(): string {
    return ((loggingExeca as Mock).mock.calls.at(-1)?.[1] ?? "") as string;
}

function invocations(): { binary: string; args: string[] }[] {
    return (loggingExeca as Mock).mock.calls.map((call) => ({
        binary: call[1] as string,
        args: call[2] as string[]
    }));
}

describe("runContainer container engine selection", () => {
    beforeEach(() => {
        (loggingExeca as Mock).mockReset();
        (loggingExeca as Mock).mockResolvedValue({ stdout: "", stderr: "", exitCode: 0, all: "" });
    });

    it("defaults to `docker` when no runner is provided", async () => {
        await runContainer({
            logger: NOOP_LOGGER,
            imageName: "img:latest",
            binds: [],
            writeLogsToFile: false
        });

        expect(lastRunnerBinary()).toBe("docker");
    });

    it("invokes `podman` when runner is `podman`", async () => {
        await runContainer({
            logger: NOOP_LOGGER,
            imageName: "img:latest",
            binds: [],
            runner: "podman",
            writeLogsToFile: false
        });

        expect(lastRunnerBinary()).toBe("podman");
    });

    it("invokes Apple `container` when runner is `container`", async () => {
        await runContainer({
            logger: NOOP_LOGGER,
            imageName: "img:latest",
            binds: [],
            runner: "container",
            writeLogsToFile: false
        });

        expect(lastRunnerBinary()).toBe("container");
    });

    it("pulls via `container image pull` instead of `run --pull always` for Apple `container`", async () => {
        await runContainer({
            logger: NOOP_LOGGER,
            imageName: "img:latest",
            binds: [],
            runner: "container",
            pull: true,
            writeLogsToFile: false
        });

        const [pull, run] = invocations();
        expect(pull).toEqual({ binary: "container", args: ["image", "pull", "img:latest"] });
        expect(run?.args).not.toContain("--pull");
    });

    it("pulls a missing image via `container image pull` on retry", async () => {
        (loggingExeca as Mock).mockResolvedValueOnce({
            stdout: "",
            stderr: "Error: No such image: img:latest",
            exitCode: 1,
            all: ""
        });

        await runContainer({
            logger: NOOP_LOGGER,
            imageName: "img:latest",
            binds: [],
            runner: "container",
            writeLogsToFile: false
        });

        expect(invocations().map(({ args }) => args)).toEqual([
            expect.arrayContaining(["run"]),
            ["image", "pull", "img:latest"],
            expect.arrayContaining(["run"])
        ]);
    });

    it("pulls a missing image via `docker pull` on retry", async () => {
        (loggingExeca as Mock).mockResolvedValueOnce({
            stdout: "",
            stderr: "Error: No such image: img:latest",
            exitCode: 1,
            all: ""
        });

        await runContainer({
            logger: NOOP_LOGGER,
            imageName: "img:latest",
            binds: [],
            writeLogsToFile: false
        });

        expect(invocations()[1]).toEqual({ binary: "docker", args: ["pull", "img:latest"] });
    });
});
