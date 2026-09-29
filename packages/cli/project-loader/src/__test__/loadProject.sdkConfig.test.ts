import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
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

    it("accepts a root SDK Config-only project for caller-owned workspace creation", async () => {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-only-project-"));
        temporaryDirectories.push(fernDirectory);
        await writeFile(path.join(fernDirectory, "fern.config.json"), '{"organization":"test","version":"*"}\n');
        await writeFile(path.join(fernDirectory, "sdk-config.yml"), "schemaVersion: sdk-config/v1\n");

        const project = await loadProjectFromDirectory({
            absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory),
            cliName: "fern",
            cliVersion: "0.0.0",
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: false,
            context: createMockTaskContext()
        });

        expect(project.apiWorkspaces).toEqual([]);
        expect(project.sdkConfigWorkspaces).toEqual([
            { absoluteFilePath: AbsoluteFilePath.of(fernDirectory), workspaceName: undefined }
        ]);
        expect(project.config.organization).toBe("test");
    });

    it("discovers an SDK Config-only named API workspace", async () => {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-sdk-config-named-project-"));
        temporaryDirectories.push(fernDirectory);
        const apiDirectory = path.join(fernDirectory, "apis", "payments");
        await mkdir(apiDirectory, { recursive: true });
        await writeFile(path.join(fernDirectory, "fern.config.json"), '{"organization":"test","version":"*"}\n');
        await writeFile(path.join(apiDirectory, "sdk-config.yml"), "schemaVersion: sdk-config/v1\n");

        const project = await loadProjectFromDirectory({
            absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory),
            cliName: "fern",
            cliVersion: "0.0.0",
            commandLineApiWorkspace: "payments",
            defaultToAllApiWorkspaces: false,
            context: createMockTaskContext()
        });

        expect(project.apiWorkspaces).toEqual([]);
        expect(project.sdkConfigWorkspaces).toEqual([
            { absoluteFilePath: AbsoluteFilePath.of(apiDirectory), workspaceName: "payments" }
        ]);
    });
});
