import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseGeneratorConfig } from "@fern-api/base-generator";
import { mergeShardOutputs } from "./mergeShardOutputs.js";

export interface RunShardedGenerationArgs {
    configPath: string;
    shardCount: number;
    maxOldSpaceSizeMb?: number;
    cliPath?: string;
}

export async function runShardedGeneration({
    configPath,
    shardCount,
    maxOldSpaceSizeMb,
    cliPath = process.argv[1]
}: RunShardedGenerationArgs): Promise<void> {
    if (!Number.isSafeInteger(shardCount) || shardCount < 1) {
        throw new Error("Shard count must be a positive integer");
    }
    if (maxOldSpaceSizeMb != null && (!Number.isSafeInteger(maxOldSpaceSizeMb) || maxOldSpaceSizeMb < 1)) {
        throw new Error("Maximum old space size must be a positive integer");
    }
    if (cliPath == null) {
        throw new Error("Unable to determine the generator CLI path");
    }

    const resolvedConfigPath = resolve(configPath);
    const config = await parseGeneratorConfig(resolvedConfigPath);
    if (config.output.mode.type !== "downloadFiles") {
        throw new Error("Sharded generation requires downloadFiles output");
    }
    const customConfig = config.customConfig as { outputSourceFiles?: unknown; outputSrcOnly?: unknown } | undefined;
    const outputSourceFiles = customConfig?.outputSourceFiles ?? true;
    const outputSrcOnly = customConfig?.outputSrcOnly ?? false;
    if (outputSourceFiles !== true && outputSrcOnly !== true) {
        throw new Error("Sharded generation requires source output");
    }

    const outputDirectory = resolve(config.output.path);
    const workDirectory = await mkdtemp(join(tmpdir(), "fern-typescript-shards-"));
    const controllers = Array.from({ length: shardCount }, () => new AbortController());
    const abortWorkers = () => {
        for (const controller of controllers) {
            controller.abort();
        }
    };
    process.once("SIGINT", abortWorkers);
    process.once("SIGTERM", abortWorkers);
    try {
        const sourceConfig = JSON.parse(await readFile(resolvedConfigPath, "utf8")) as Record<string, unknown>;
        const shardDirectories = await Promise.all(
            Array.from({ length: shardCount }, async (_, index) => {
                const shardDirectory = join(workDirectory, "output", String(index));
                const workerDirectory = join(workDirectory, "input", String(index));
                const workerConfigPath = join(workerDirectory, "config.json");
                await mkdir(workerDirectory, { recursive: true });
                await writeFile(
                    workerConfigPath,
                    JSON.stringify({
                        ...sourceConfig,
                        irFilepath: resolve(dirname(resolvedConfigPath), config.irFilepath),
                        output: { ...(sourceConfig.output as Record<string, unknown>), path: shardDirectory }
                    })
                );
                return { index, shardDirectory, workerConfigPath };
            })
        );

        const workers = shardDirectories.map(({ index, workerConfigPath }) =>
            runWorker({
                cliPath,
                configPath: workerConfigPath,
                shardCount,
                shardIndex: index,
                maxOldSpaceSizeMb,
                signal: controllers[index]?.signal
            })
        );
        try {
            await Promise.all(workers);
        } catch (error) {
            abortWorkers();
            await Promise.allSettled(workers);
            throw error;
        }

        await mergeShardOutputs({
            outputDirectory,
            shardDirectories: shardDirectories.map(({ shardDirectory }) => shardDirectory)
        });
    } finally {
        process.removeListener("SIGINT", abortWorkers);
        process.removeListener("SIGTERM", abortWorkers);
        await rm(workDirectory, { recursive: true, force: true });
    }
}

async function runWorker({
    cliPath,
    configPath,
    shardCount,
    shardIndex,
    maxOldSpaceSizeMb,
    signal
}: {
    cliPath: string;
    configPath: string;
    shardCount: number;
    shardIndex: number;
    maxOldSpaceSizeMb: number | undefined;
    signal: AbortSignal | undefined;
}): Promise<void> {
    const nodeOptions = withMaxOldSpaceSize(process.env.NODE_OPTIONS, maxOldSpaceSizeMb);
    await new Promise<void>((resolvePromise, reject) => {
        const child = spawn(
            process.execPath,
            [
                "--stack-size=8192",
                cliPath,
                "--internal-shard-worker",
                configPath,
                String(shardCount),
                String(shardIndex)
            ],
            {
                env: { ...process.env, NODE_OPTIONS: nodeOptions },
                stdio: "inherit",
                signal
            }
        );
        child.once("error", reject);
        child.once("exit", (code, childSignal) => {
            if (code === 0) {
                resolvePromise();
            } else {
                reject(new Error(`TypeScript shard ${shardIndex + 1}/${shardCount} failed (${childSignal ?? code})`));
            }
        });
    });
}

function withMaxOldSpaceSize(
    nodeOptions: string | undefined,
    maxOldSpaceSizeMb: number | undefined
): string | undefined {
    if (maxOldSpaceSizeMb == null) {
        return nodeOptions;
    }
    return [nodeOptions, `--max-old-space-size=${maxOldSpaceSizeMb}`].filter(Boolean).join(" ");
}
