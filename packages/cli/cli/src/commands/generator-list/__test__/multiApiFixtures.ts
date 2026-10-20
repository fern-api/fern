import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loadProjectFromDirectory } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { vi } from "vitest";
import YAML from "yaml";

import type { CliContext } from "../../../cli-context/CliContext.js";
import type { FernProjectFixture } from "./sdkConfigFixtures.js";

const OPENAPI_YML = "openapi: 3.0.0\ninfo:\n  title: Acme\n  version: 1.0.0\npaths: {}\n";

/** Which configuration files a fixture API directory holds. Values are written with YAML.stringify unless a string. */
export interface ApiDirectorySpec {
    generatorsYml?: unknown;
    legacyGeneratorsYml?: unknown;
    sdkConfigYml?: unknown;
    /** Extra files by path relative to the directory (e.g. `definition/api.yml`). */
    extraFiles?: Record<string, string>;
}

function toYaml(value: unknown): string {
    return typeof value === "string" ? value : YAML.stringify(value);
}

async function writeConfigurationFiles(directory: string, spec: ApiDirectorySpec): Promise<void> {
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "openapi.yml"), OPENAPI_YML);
    if (spec.generatorsYml != null) {
        await writeFile(path.join(directory, "generators.yml"), toYaml(spec.generatorsYml));
    }
    if (spec.legacyGeneratorsYml != null) {
        await writeFile(path.join(directory, "generators.legacy.yml"), toYaml(spec.legacyGeneratorsYml));
    }
    if (spec.sdkConfigYml != null) {
        await writeFile(path.join(directory, "sdk-config.yml"), toYaml(spec.sdkConfigYml));
    }
    for (const [relativePath, contents] of Object.entries(spec.extraFiles ?? {})) {
        await mkdir(path.dirname(path.join(directory, relativePath)), { recursive: true });
        await writeFile(path.join(directory, relativePath), contents);
    }
}

/**
 * Writes `fern/apis/<name>/` per entry with exactly the given files and loads the project the way
 * `fern generator list|get` does. Which owner list an API lands in (`apiWorkspaces` or `sdkConfigWorkspaces`)
 * is decided by the project loader from the files present.
 */
export async function createApisProject({
    apis,
    temporaryDirectories
}: {
    apis: Record<string, ApiDirectorySpec>;
    temporaryDirectories: string[];
}): Promise<FernProjectFixture> {
    const directory = await mkdtemp(path.join(tmpdir(), "fern-generator-multi-api-"));
    temporaryDirectories.push(directory);
    await writeFile(path.join(directory, "fern.config.json"), '{"organization":"test","version":"*"}\n');
    for (const [apiName, spec] of Object.entries(apis)) {
        await writeConfigurationFiles(path.join(directory, "apis", apiName), spec);
    }
    return await loadFixture(directory);
}

/** Writes the files directly in `fern/` (a single, nameless API) and loads the project. */
export async function createRootProject({
    root,
    temporaryDirectories
}: {
    root: ApiDirectorySpec;
    temporaryDirectories: string[];
}): Promise<FernProjectFixture> {
    const directory = await mkdtemp(path.join(tmpdir(), "fern-generator-root-api-"));
    temporaryDirectories.push(directory);
    await writeFile(path.join(directory, "fern.config.json"), '{"organization":"test","version":"*"}\n');
    await writeConfigurationFiles(directory, root);
    return await loadFixture(directory);
}

async function loadFixture(directory: string): Promise<FernProjectFixture> {
    const taskContext = createMockTaskContext();
    const project = await loadProjectFromDirectory({
        absolutePathToFernDirectory: AbsoluteFilePath.of(directory),
        cliName: "fern",
        cliVersion: "0.0.0",
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true,
        context: taskContext
    });
    const cliContext = {
        // Surface the message so tests can assert the actionable error text
        failAndThrow: vi.fn((message?: string) => {
            throw new Error(message);
        }),
        logger: taskContext.logger,
        runTaskForWorkspace: vi.fn(async (_workspace, task) => task(taskContext))
    } as unknown as CliContext;
    return { project, cliContext, directory };
}
