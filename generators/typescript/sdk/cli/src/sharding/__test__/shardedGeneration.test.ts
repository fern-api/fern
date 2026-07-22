import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { AsIsManager, CoreUtilitiesManager } from "@fern-typescript/commons";
import { afterEach, describe, expect, it } from "vitest";
import { SdkGeneratorCli } from "../../SdkGeneratorCli.js";
import { mergeShardOutputs } from "../mergeShardOutputs.js";
import { runShardedGeneration } from "../runShardedGeneration.js";

const temporaryDirectories: string[] = [];

afterEach(async () => {
    await Promise.all(
        temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
    );
});

describe("sharded generation", () => {
    it.each([false, "true"])("rejects non-source output configuration %j", async (outputSourceFiles) => {
        const root = await mkdtemp(join(tmpdir(), "fern-sharded-generation-"));
        temporaryDirectories.push(root);
        const configPath = await writeConfig(root, "invalid", "unused-ir.json", join(root, "output"), {
            outputSourceFiles,
            outputSrcOnly: false
        });

        await expect(runShardedGeneration({ configPath, shardCount: 2 })).rejects.toThrow(
            "Sharded generation requires source output"
        );
    });

    it("matches unsharded source output", async () => {
        const addToTsProject = AsIsManager.prototype.addToTsProject;
        const copyCoreUtilities = CoreUtilitiesManager.prototype.copyCoreUtilities;
        AsIsManager.prototype.addToTsProject = async ({ project }) => {
            for (const path of ["/src/core/headers.ts", "/src/core/requestBody.ts", "/src/core/json.ts"]) {
                project.createSourceFile(path, "export {};\n", { overwrite: true });
            }
        };
        CoreUtilitiesManager.prototype.copyCoreUtilities = async ({ pathToSrc }) => {
            for (const path of [
                "auth/index.ts",
                "base64.ts",
                "fetcher/index.ts",
                "logging/index.ts",
                "runtime/index.ts",
                "url/index.ts"
            ]) {
                const destination = join(pathToSrc, "core", path);
                await mkdir(dirname(destination), { recursive: true });
                await writeFile(destination, "export {};\n");
            }
        };
        const root = await mkdtemp(join(tmpdir(), "fern-sharded-generation-"));
        temporaryDirectories.push(root);
        const irFilepath = resolve(
            import.meta.dirname,
            "../../../../../../../packages/commons/mock-utils/test/fixtures/imdb/ir.json"
        );
        const unshardedOutput = join(root, "unsharded");
        const mergedOutput = join(root, "merged");
        const unshardedConfig = await writeConfig(root, "unsharded", irFilepath, unshardedOutput);

        try {
            await new SdkGeneratorCli().run(unshardedConfig, {
                disableNotifications: true,
                unzipOutput: true
            });

            const shardDirectories = await Promise.all(
                [0, 1].map(async (index) => {
                    const output = join(root, "shards", String(index));
                    const config = await writeConfig(root, `shard-${index}`, irFilepath, output);
                    await new SdkGeneratorCli({ generationShard: { count: 2, index } }).run(config, {
                        disableNotifications: true,
                        unzipOutput: true
                    });
                    return output;
                })
            );

            await mergeShardOutputs({ outputDirectory: mergedOutput, shardDirectories });

            expect(normalizeAggregateOrder(await readTree(mergedOutput))).toEqual(
                normalizeAggregateOrder(await readTree(unshardedOutput))
            );
        } finally {
            AsIsManager.prototype.addToTsProject = addToTsProject;
            CoreUtilitiesManager.prototype.copyCoreUtilities = copyCoreUtilities;
        }
    }, 60_000);
});

async function writeConfig(
    root: string,
    name: string,
    irFilepath: string,
    outputPath: string,
    customConfig: Record<string, unknown> = {
        outputSrcOnly: true,
        noScripts: true,
        formatter: "none",
        linter: "none",
        writeUnitTests: false,
        generateWireTests: false
    }
): Promise<string> {
    const directory = join(root, "configs", name);
    const configPath = join(directory, "config.json");
    await mkdir(directory, { recursive: true });
    await writeFile(
        configPath,
        JSON.stringify({
            irFilepath,
            output: { mode: { type: "downloadFiles" }, path: outputPath },
            customConfig,
            workspaceName: "imdb",
            organization: "fern",
            environment: { _type: "local" },
            dryRun: false,
            whitelabel: false,
            writeUnitTests: false,
            generateOauthClients: false
        })
    );
    return configPath;
}

async function readTree(root: string, current = root): Promise<Record<string, string>> {
    const files: Record<string, string> = {};
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
        const path = join(current, entry.name);
        if (entry.isDirectory()) {
            Object.assign(files, await readTree(root, path));
        } else if (entry.isFile()) {
            files[relative(root, path).split(sep).join("/")] = await readFile(path, "utf8");
        }
    }
    return files;
}

function normalizeAggregateOrder(files: Record<string, string>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(files).map(([path, source]) => [
            path,
            /(?:^|\/)(?:index|exports)\.ts$/.test(path)
                ? `${source.replaceAll("\r\n", "\n").trim().split("\n").filter(Boolean).sort().join("\n")}\n`
                : source
        ])
    );
}
