import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loadProjectFromDirectory, type Project } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { vi } from "vitest";
import YAML from "yaml";

import type { CliContext } from "../../../cli-context/CliContext.js";

export const LEGACY_GENERATORS_YML = {
    api: { specs: [{ openapi: "./openapi.yml" }] },
    groups: {
        "python-sdk": {
            generators: [
                {
                    name: "fernapi/fern-python-sdk",
                    version: "4.3.10",
                    output: { location: "local-file-system", path: "../sdks/python" }
                }
            ]
        },
        "java-sdk": {
            generators: [
                {
                    name: "fernapi/fern-java-sdk",
                    version: "4.8.12",
                    output: { location: "local-file-system", path: "../sdks/java" }
                }
            ]
        }
    }
};

export function sdkConfig(targets: unknown[]): Record<string, unknown> {
    return {
        schemaVersion: "sdk-config/v1",
        sdkName: "acme",
        source: { specs: [{ id: "acme", type: "openapi", path: "./openapi.yml" }] },
        targets
    };
}

export interface FernProjectFixture {
    project: Project;
    cliContext: CliContext;
    directory: string;
}

/** Writes a single-API fern/ directory and loads it the way `fern generator list|get` does. */
export async function createFernProject({
    generatorsYml,
    legacyGeneratorsYml,
    sdkConfigYml,
    temporaryDirectories
}: {
    generatorsYml?: unknown;
    legacyGeneratorsYml?: unknown;
    sdkConfigYml?: unknown;
    temporaryDirectories: string[];
}): Promise<FernProjectFixture> {
    const directory = await mkdtemp(path.join(tmpdir(), "fern-generator-inspect-"));
    temporaryDirectories.push(directory);
    await writeFile(path.join(directory, "fern.config.json"), '{"organization":"test","version":"*"}\n');
    await writeFile(
        path.join(directory, "openapi.yml"),
        "openapi: 3.0.0\ninfo:\n  title: Acme\n  version: 1.0.0\npaths: {}\n"
    );
    if (generatorsYml != null) {
        await writeFile(path.join(directory, "generators.yml"), YAML.stringify(generatorsYml));
    }
    if (legacyGeneratorsYml != null) {
        await writeFile(path.join(directory, "generators.legacy.yml"), YAML.stringify(legacyGeneratorsYml));
    }
    if (sdkConfigYml != null) {
        await writeFile(path.join(directory, "sdk-config.yml"), YAML.stringify(sdkConfigYml));
    }

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

export async function removeTemporaryDirectories(temporaryDirectories: string[]): Promise<void> {
    await Promise.all(
        temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
    );
}
