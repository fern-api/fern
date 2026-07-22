import { SdkGeneratorCli } from "./SdkGeneratorCli.js";
import { mergeShardOutputs } from "./sharding/mergeShardOutputs.js";
import { runShardedGeneration } from "./sharding/runShardedGeneration.js";

async function main(): Promise<void> {
    if (process.argv[2] === "--internal-sharded-generation") {
        const [configPath, countValue, heapValue] = process.argv.slice(3);
        if (configPath == null || countValue == null) {
            throw new Error("--internal-sharded-generation requires a config path and shard count");
        }
        await runShardedGeneration({
            configPath,
            shardCount: Number(countValue),
            maxOldSpaceSizeMb: heapValue == null ? undefined : Number(heapValue)
        });
    } else if (process.argv[2] === "--internal-shard-worker") {
        const [configPath, countValue, indexValue] = process.argv.slice(3);
        if (configPath == null || countValue == null || indexValue == null) {
            throw new Error("--internal-shard-worker requires a config path, shard count, and shard index");
        }
        await new SdkGeneratorCli({ generationShard: { count: Number(countValue), index: Number(indexValue) } }).run(
            configPath,
            {
                disableNotifications: true,
                unzipOutput: true
            }
        );
    } else if (process.argv[2] === "--internal-merge-shards") {
        const [outputDirectory, ...shardDirectories] = process.argv.slice(3);
        if (outputDirectory == null || shardDirectories.length === 0) {
            throw new Error("--internal-merge-shards requires an output directory and at least one shard directory");
        }
        await mergeShardOutputs({ outputDirectory, shardDirectories });
    } else {
        await new SdkGeneratorCli().runCli();
    }
}

void main().catch((error) => {
    // biome-ignore lint/suspicious/noConsole: report fatal CLI errors
    console.error(error);
    process.exitCode = 1;
});
