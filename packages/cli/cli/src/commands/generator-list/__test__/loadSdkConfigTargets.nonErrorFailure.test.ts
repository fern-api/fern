import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Project } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { loadSdkConfigTargets } from "../loadSdkConfigTargets.js";

vi.mock("../../generate/loadSdkConfigV1.js", () => ({
    // A non-Error rejection: characterizes how it is reported
    loadSdkConfigV1: vi.fn(() => Promise.reject("not an Error instance"))
}));

describe("loadSdkConfigTargets with a loader that rejects with a non-Error", () => {
    let directory: string | undefined;

    afterEach(async () => {
        if (directory != null) {
            await rm(directory, { recursive: true, force: true });
        }
    });

    it("reports the stringified rejection as a config error", async () => {
        directory = await mkdtemp(path.join(tmpdir(), "fern-load-sdk-config-targets-non-error-"));
        await writeFile(path.join(directory, "sdk-config.yml"), "ignored: true\n");
        const failAndThrow = vi.fn((message?: string) => {
            throw new Error(message);
        });
        const project = {
            apiWorkspaces: [{ absoluteFilePath: AbsoluteFilePath.of(directory), workspaceName: "api" }],
            sdkConfigWorkspaces: []
        } as unknown as Project;

        await expect(
            loadSdkConfigTargets({
                project,
                cliContext: { failAndThrow } as unknown as CliContext,
                isSelectedApi: () => true
            })
        ).rejects.toThrow("not an Error instance");
        expect(failAndThrow).toHaveBeenCalledWith("not an Error instance", undefined, {
            code: CliError.Code.ConfigError
        });
    });
});
