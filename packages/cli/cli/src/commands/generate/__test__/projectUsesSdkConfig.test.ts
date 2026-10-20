import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Project } from "@fern-api/project-loader";
import type { DocsWorkspace } from "@fern-api/workspace-loader";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { projectUsesSdkConfig } from "../generateDocsWorkspace.js";

describe("projectUsesSdkConfig", () => {
    let root: string;

    beforeEach(async () => {
        root = await mkdtemp(path.join(tmpdir(), "fern-project-uses-sdk-config-"));
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    async function directory(...segments: string[]): Promise<string> {
        const absolutePath = path.join(root, ...segments);
        await mkdir(absolutePath, { recursive: true });
        return absolutePath;
    }

    function docsWorkspaceAt(directoryPath: string): DocsWorkspace {
        return { absoluteFilePath: AbsoluteFilePath.of(directoryPath) } as unknown as DocsWorkspace;
    }

    function apiWorkspaceAt(directoryPath: string): AbstractAPIWorkspace<unknown> {
        return { absoluteFilePath: AbsoluteFilePath.of(directoryPath) } as unknown as AbstractAPIWorkspace<unknown>;
    }

    function projectWith({
        apiDirectories = [],
        sdkConfigWorkspaces
    }: {
        apiDirectories?: string[];
        sdkConfigWorkspaces?: Project["sdkConfigWorkspaces"];
    }): Project {
        return {
            apiWorkspaces: apiDirectories.map(apiWorkspaceAt),
            sdkConfigWorkspaces
        } as unknown as Project;
    }

    describe("when project.sdkConfigWorkspaces is non-empty", () => {
        it("is true without probing the file system", async () => {
            const docs = await directory("fern");
            const project = projectWith({
                sdkConfigWorkspaces: [{ absoluteFilePath: AbsoluteFilePath.of(root), workspaceName: "payments" }]
            });

            expect(await projectUsesSdkConfig({ project, docsWorkspace: docsWorkspaceAt(docs) })).toBe(true);
        });
    });

    describe("when project.sdkConfigWorkspaces is empty or missing", () => {
        it.each([
            { name: "undefined", sdkConfigWorkspaces: undefined },
            { name: "an empty list", sdkConfigWorkspaces: [] }
        ])("is false when $name and no directory has an sdk-config.yml", async ({ sdkConfigWorkspaces }) => {
            const docs = await directory("fern");
            const api = await directory("fern", "apis", "payments");
            await writeFile(path.join(api, "generators.yml"), "groups: {}\n");

            const project = projectWith({ apiDirectories: [api], sdkConfigWorkspaces });

            expect(await projectUsesSdkConfig({ project, docsWorkspace: docsWorkspaceAt(docs) })).toBe(false);
        });

        it("is false for a project without API workspaces and without an sdk-config.yml", async () => {
            const docs = await directory("fern");

            expect(await projectUsesSdkConfig({ project: projectWith({}), docsWorkspace: docsWorkspaceAt(docs) })).toBe(
                false
            );
        });

        it("is true when the sdk-config.yml sits only beside the docs directory", async () => {
            const docs = await directory("fern");
            const api = await directory("fern", "apis", "payments");
            await writeFile(path.join(docs, "sdk-config.yml"), "schemaVersion: sdk-config/v1\n");

            const project = projectWith({ apiDirectories: [api], sdkConfigWorkspaces: [] });

            expect(await projectUsesSdkConfig({ project, docsWorkspace: docsWorkspaceAt(docs) })).toBe(true);
        });

        it("is true when the sdk-config.yml sits only beside an API workspace", async () => {
            const docs = await directory("fern");
            const api = await directory("fern", "apis", "payments");
            await writeFile(path.join(api, "sdk-config.yml"), "schemaVersion: sdk-config/v1\n");

            const project = projectWith({ apiDirectories: [api], sdkConfigWorkspaces: [] });

            expect(await projectUsesSdkConfig({ project, docsWorkspace: docsWorkspaceAt(docs) })).toBe(true);
        });

        it("checks every API workspace, not just the first", async () => {
            const docs = await directory("fern");
            const first = await directory("fern", "apis", "billing");
            const second = await directory("fern", "apis", "payments");
            await writeFile(path.join(second, "sdk-config.yml"), "schemaVersion: sdk-config/v1\n");

            const project = projectWith({ apiDirectories: [first, second] });

            expect(await projectUsesSdkConfig({ project, docsWorkspace: docsWorkspaceAt(docs) })).toBe(true);
        });

        it.each([
            { generatorsFile: "generators.yml" },
            { generatorsFile: "generators.legacy.yml" }
        ])("is true when sdk-config.yml sits beside $generatorsFile (mixed workspace)", async ({ generatorsFile }) => {
            const docs = await directory("fern");
            const api = await directory("fern", "apis", "payments");
            await writeFile(path.join(api, generatorsFile), "groups: {}\n");
            await writeFile(path.join(api, "sdk-config.yml"), "schemaVersion: sdk-config/v1\n");

            const project = projectWith({ apiDirectories: [api] });

            expect(await projectUsesSdkConfig({ project, docsWorkspace: docsWorkspaceAt(docs) })).toBe(true);
        });

        it("does not look in a parent or sibling directory of the API workspace", async () => {
            const docs = await directory("fern");
            const api = await directory("fern", "apis", "payments");
            await directory("fern", "apis", "unrelated");
            await writeFile(path.join(root, "fern", "apis", "unrelated", "sdk-config.yml"), "x: 1\n");
            await writeFile(path.join(root, "fern", "apis", "sdk-config.yml"), "x: 1\n");

            const project = projectWith({ apiDirectories: [api] });

            // The docs directory here is `fern/`, which has no sdk-config.yml itself
            expect(await projectUsesSdkConfig({ project, docsWorkspace: docsWorkspaceAt(docs) })).toBe(false);
        });

        it("ignores the .yaml extension (only sdk-config.yml is probed)", async () => {
            const docs = await directory("fern");
            const api = await directory("fern", "apis", "payments");
            await writeFile(path.join(docs, "sdk-config.yaml"), "schemaVersion: sdk-config/v1\n");
            await writeFile(path.join(api, "sdk-config.yaml"), "schemaVersion: sdk-config/v1\n");

            const project = projectWith({ apiDirectories: [api] });

            expect(await projectUsesSdkConfig({ project, docsWorkspace: docsWorkspaceAt(docs) })).toBe(false);
        });

        it("counts a directory named sdk-config.yml, because the probe does not require a regular file", async () => {
            const docs = await directory("fern");
            await directory("fern", "sdk-config.yml");

            expect(await projectUsesSdkConfig({ project: projectWith({}), docsWorkspace: docsWorkspaceAt(docs) })).toBe(
                true
            );
        });
    });
});
