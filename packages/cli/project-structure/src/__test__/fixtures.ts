import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { afterEach } from "vitest";

import { ProjectDir, WorkspaceDir } from "../workspace/index.js";

const FIXTURE_PATH = AbsoluteFilePath.of("/fern");

/** A workspace folder with nothing in it. Pass only what the test is about. */
export function workspaceDir(overrides: Partial<WorkspaceDir> = {}): WorkspaceDir {
    return {
        path: FIXTURE_PATH,
        generatorsFile: { type: "none" },
        sdkConfigFile: undefined,
        hasDefinitionDirectory: false,
        hasOpenapiDirectory: false,
        hasAsyncapiDirectory: false,
        ...overrides
    };
}

export function projectDir({
    root,
    apis
}: {
    root?: Partial<WorkspaceDir>;
    apis?: ProjectDir["apis"];
} = {}): ProjectDir {
    return { path: FIXTURE_PATH, root: workspaceDir(root), apis };
}

export const GENERATORS_YML_FOUND: WorkspaceDir["generatorsFile"] = {
    type: "found",
    path: AbsoluteFilePath.of("/fern/generators.yml"),
    name: "generators.yml"
};

export const SDK_CONFIG_FILE = AbsoluteFilePath.of("/fern/sdk-config.yml");

/** Creates temporary directories filled from `{ "relative/path": "content" }` and removes them after each test. */
export function useTemporaryDirectories(): (files: Record<string, string>) => Promise<AbsoluteFilePath> {
    const directories: string[] = [];

    afterEach(async () => {
        await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    return async (files) => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-project-structure-"));
        directories.push(directory);
        for (const [file, content] of Object.entries(files)) {
            const absolutePath = path.join(directory, file);
            await mkdir(path.dirname(absolutePath), { recursive: true });
            await writeFile(absolutePath, content);
        }
        return AbsoluteFilePath.of(directory);
    };
}
