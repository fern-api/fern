import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { createMockTaskContext } from "@fern-api/task-context";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NativeExecutionEnvironment } from "../NativeExecutionEnvironment.js";

vi.mock("@fern-api/logging-execa", () => ({ loggingExeca: vi.fn() }));

describe("NativeExecutionEnvironment", () => {
    beforeEach(() => {
        vi.mocked(loggingExeca).mockReset();
        vi.mocked(loggingExeca).mockResolvedValue({ failed: false, stdout: "", stderr: "" } as never);
    });

    it("passes argv without shell parsing", async () => {
        const environment = NativeExecutionEnvironment.fromArgv({
            executable: "node",
            args: ["generator.cjs", "argument with spaces", "; touch /tmp/pwned"],
            workingDirectory: AbsoluteFilePath.of("/workspace")
        });

        await environment.execute({
            generatorName: "example/generator",
            irPath: AbsoluteFilePath.of("/tmp/ir.json"),
            configPath: AbsoluteFilePath.of("/tmp/config with spaces.json"),
            outputPath: AbsoluteFilePath.of("/tmp/output"),
            licenseFilePath: AbsoluteFilePath.of("/workspace/LICENSE"),
            context: createMockTaskContext(),
            inspect: false,
            runner: undefined
        });

        expect(loggingExeca).toHaveBeenCalledWith(
            expect.anything(),
            "node",
            ["generator.cjs", "argument with spaces", "; touch /tmp/pwned", "/tmp/config with spaces.json"],
            expect.objectContaining({
                cwd: "/workspace",
                shell: false,
                env: expect.objectContaining({ FERN_LICENSE_PATH: "/workspace/LICENSE" })
            })
        );
    });

    it("reports native command failures", async () => {
        vi.mocked(loggingExeca).mockResolvedValue({ failed: true, stdout: "", stderr: "failure" } as never);
        const environment = NativeExecutionEnvironment.fromArgv({ executable: "generator", args: [] });

        await expect(
            environment.execute({
                generatorName: "example/generator",
                irPath: AbsoluteFilePath.of("/tmp/ir.json"),
                configPath: AbsoluteFilePath.of("/tmp/config.json"),
                outputPath: AbsoluteFilePath.of("/tmp/output"),
                context: createMockTaskContext(),
                inspect: false,
                runner: undefined
            })
        ).rejects.toThrow("Command failed: generator");
    });
});
