import { AbsoluteFilePath } from "@fern-api/core-utils";
import { GeneratorConfig } from "@fern-fern/generator-exec-client/model/config";
import { writeVolumeToDisk } from "@fern-typescript/commons";
import { Logger } from "@fern-typescript/commons-v2";
import { GeneratorContext } from "@fern-typescript/sdk-declaration-handler";
import { PackageJsonScript, SdkGenerator } from "@fern-typescript/sdk-generator";
import execa from "execa";
import { camelCase, upperFirst } from "lodash-es";
import { Volume } from "memfs/lib/volume";
import { NpmPackage } from "./npm-package/NpmPackage";
import { loadIntermediateRepresentation } from "./utils/loadIntermediateRepresentation";

export async function generateFiles({
    config,
    logger,
    npmPackage,
}: {
    config: GeneratorConfig;
    logger: Logger;
    npmPackage: NpmPackage;
}): Promise<{ writtenTo: AbsoluteFilePath }> {
    const directoyOnDiskToWriteTo = AbsoluteFilePath.of(config.output.path);
    const generatorContext = new GeneratorContextImpl(logger);
    const volume = new Volume();

    const sdkGenerator = new SdkGenerator({
        apiName: upperFirst(camelCase(config.workspaceName)),
        intermediateRepresentation: await loadIntermediateRepresentation(config.irFilepath),
        context: generatorContext,
        volume,
        packageName: npmPackage.packageName,
        packageVersion: npmPackage.publishInfo?.packageCoordinate.version,
    });

    await sdkGenerator.generate();

    if (!generatorContext.didSucceed()) {
        throw new Error("Failed to generate TypeScript project.");
    }

    await writeVolumeToDisk(volume, directoyOnDiskToWriteTo);
    await sdkGenerator.copyCoreUtilities({ pathToPackage: directoyOnDiskToWriteTo });

    const runYarnCommand = async (args: string[], env?: Record<string, string>) => {
        logger.debug(`+ ${["yarn", ...args].join(" ")}`);
        const command = execa("yarn", args, {
            cwd: directoyOnDiskToWriteTo,
            env,
        });
        command.stdout?.pipe(process.stdout);
        command.stderr?.pipe(process.stderr);
        await command;
    };

    await runYarnCommand(["set", "version", "berry"]);
    await runYarnCommand(["config", "set", "nodeLinker", "pnp"]);
    await runYarnCommand(["install"], {
        // set enableImmutableInstalls=false so we can modify yarn.lock, even when in CI
        YARN_ENABLE_IMMUTABLE_INSTALLS: "false",
    });
    await runYarnCommand(["run", PackageJsonScript.FORMAT]);
    await runYarnCommand(["run", PackageJsonScript.BUILD]);

    return { writtenTo: directoyOnDiskToWriteTo };
}

class GeneratorContextImpl implements GeneratorContext {
    private isSuccess = true;

    constructor(public readonly logger: Logger) {}

    public fail(): void {
        this.isSuccess = false;
    }

    public didSucceed(): boolean {
        return this.isSuccess;
    }
}
