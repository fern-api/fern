import { AbsoluteFilePath, join, moveFolder, RelativeFilePath } from "@fern-api/fs-utils";
import { CONSOLE_LOGGER } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { readFile, rm, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { LocalBuildInfo } from "../../../config/api";
import { runScript } from "../../../runScript";
import { INPUTS_DIRECTORY_NAME } from "../../../utils/constants";
import { TestRunner } from "./TestRunner";

export class LocalTestRunner extends TestRunner {
    async build(): Promise<void> {
        const localConfig = await this.getLocalConfigOrthrow();
        const workingDir = AbsoluteFilePath.of(
            path.join(__dirname, RelativeFilePath.of("../../.."), RelativeFilePath.of(localConfig.workingDirectory))
        );
        const result = await runScript({
            commands: localConfig.buildCommand,
            doNotPipeOutput: false,
            logger: CONSOLE_LOGGER,
            workingDir: workingDir
        });
        if (result.exitCode !== 0) {
            throw new Error(`Failed to locally build ${this.generator.workspaceName}.`);
        }
    }

    async runGenerator({ outputDir, taskContext }: TestRunner.DoRunArgs): Promise<void> {
        const localConfig = await this.getLocalConfigOrthrow();
        const localOutputDirectory = await tmp.dir();
        const localGeneratorConfigFile = await tmp.file();
        const generatorConfig = await this.getLocalGeneratorConfig({
            outputDir,
            localOutputDir: AbsoluteFilePath.of(localOutputDirectory.path)
        });
        await writeFile(localGeneratorConfigFile.path, JSON.stringify(generatorConfig, undefined, 2));
        taskContext.logger.info(`Wrote generator config to ${localGeneratorConfigFile.path}`);

        const workingDir = AbsoluteFilePath.of(
            path.join(__dirname, RelativeFilePath.of("../../.."), RelativeFilePath.of(localConfig.workingDirectory))
        );
        const result = await runScript({
            commands: [`${localConfig.runCommand} ${localGeneratorConfigFile.path}`],
            doNotPipeOutput: false,
            logger: taskContext.logger,
            workingDir: workingDir
        });
        if (result.exitCode !== 0) {
            taskContext.logger.info(`Failed to generate files for ${this.generator.workspaceName}.`);
        } else {
            taskContext.logger.info(`Wrote generated files to ${localOutputDirectory.path}`);
            await rm(outputDir, { recursive: true, force: true });
            await moveFolder({
                src: AbsoluteFilePath.of(localOutputDirectory.path),
                dest: outputDir
            });
        }
    }

    /**
     * A local generator config is written with modified paths to
     * the IR and output directories to match the user's machine.
     *
     * For example, instead of the ir living at `/fern/input/ir.json` it may live at
     * `/Users/<username>/fern/seed/csharp/imdb/.inputs/ir.json`.
     */
    private async getLocalGeneratorConfig({
        outputDir,
        localOutputDir
    }: {
        outputDir: AbsoluteFilePath;
        localOutputDir: AbsoluteFilePath;
    }): Promise<FernGeneratorExec.GeneratorConfig> {
        const absoluteFilepathToGeneratorConfig = join(
            outputDir,
            RelativeFilePath.of(INPUTS_DIRECTORY_NAME),
            RelativeFilePath.of("config.json")
        );
        const rawContents = await readFile(absoluteFilepathToGeneratorConfig, "utf8");
        const generatorConfig = JSON.parse(rawContents) as FernGeneratorExec.GeneratorConfig;
        return {
            ...generatorConfig,
            irFilepath: join(outputDir, RelativeFilePath.of(INPUTS_DIRECTORY_NAME), RelativeFilePath.of("ir.json")),
            output: {
                ...generatorConfig.output,
                path: localOutputDir
            }
        };
    }

    private async getLocalConfigOrthrow(): Promise<LocalBuildInfo> {
        if (this.generator.workspaceConfig.local == null) {
            throw new Error(
                `Attempted to run ${this.generator.workspaceName} locally. No local configuration in seed.yml found.`
            );
        }
        return this.generator.workspaceConfig.local;
    }
}
