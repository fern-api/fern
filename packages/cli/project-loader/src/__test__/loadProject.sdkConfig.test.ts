import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { afterEach, describe, expect, it } from "vitest";

import { loadProjectFromDirectory } from "../loadProject.js";

describe("loadProjectFromDirectory — caller-owned SDK Config workspace", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    it("skips generators.yml discovery and allows the caller to provide the API workspace", async () => {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-project-"));
        temporaryDirectories.push(fernDirectory);
        await writeFile(path.join(fernDirectory, "fern.config.json"), '{"organization":"test","version":"*"}\n');
        await writeFile(path.join(fernDirectory, "generators.yml"), "this is intentionally invalid: [\n");

        const project = await loadProjectFromDirectory({
            absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory),
            cliName: "fern",
            cliVersion: "0.0.0",
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: false,
            skipApiWorkspaces: true,
            context: createMockTaskContext()
        });

        expect(project.apiWorkspaces).toEqual([]);
        expect(project.config.organization).toBe("test");
    });
});
